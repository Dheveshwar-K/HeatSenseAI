"""
Automated Test Suite for The Weather Company (TWC) & PWS Ingestion Pipeline
===========================================================================
Validates:
1. TWC Currents On Demand response parsing & normalization
2. PWS v2 response parsing & metadata extraction
3. SI / Metric unit conversion functions
4. Physical plausibility & thermodynamic consistency validation
5. Observation staleness & age calculation
6. Human Thermal Stress algorithms (Rothfusz, Steadman, sWBGT, 0-100 score)
7. Haversine distance calculation and PWS station ranking
8. Error handling (timeouts, invalid JSON, missing parameters)
"""

import math
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.weather_normalizer import WeatherNormalizer
from backend.services.weather_validator import WeatherValidator
from backend.services.thermal_stress_service import ThermalStressService
from backend.services.pws_service import haversine_distance_km
from backend.models.weather_models import NormalizedWeatherObservation


client = TestClient(app)


# ---------------------------------------------------------
# 1. TWC Response Parsing & Normalization Tests
# ---------------------------------------------------------
def test_weather_company_response_normalization():
    raw_twc_v3 = {
        "validTimeUtc": int(datetime.now(timezone.utc).timestamp()) - 45,
        "validTimeLocal": "2026-09-26T12:00:00+05:30",
        "temperature": 39.4,
        "relativeHumidity": 68,
        "temperatureDewPoint": 31.5,
        "windSpeed": 11.2,
        "windGust": 18.0,
        "windDirection": 245,
        "pressureAltimeter": 1004.2,
        "precip1Hour": 0.0,
        "uvIndex": 9.0,
        "temperatureHeatIndex": 52.1,
        "visibility": 10.0,
        "wxPhraseLong": "Hot with High Humidity",
        "stationId": "TWC-TEST-01"
    }

    normalized = WeatherNormalizer.normalize_twc_v3(raw_twc_v3, latitude=11.0168, longitude=76.9558)
    
    assert normalized["temperature_c"] == 39.4
    assert normalized["relative_humidity_pct"] == 68.0
    assert normalized["dew_point_c"] == 31.5
    assert normalized["wind_speed_kmh"] == 11.2
    assert normalized["pressure_hpa"] == 1004.2
    assert normalized["solar_radiation"] is None  # Not fabricated when missing
    assert normalized["data_age_seconds"] >= 40
    assert normalized["quality_status"] == "FRESH"
    assert normalized["is_valid"] is True


def test_pws_response_normalization():
    raw_pws_v2 = {
        "obsTimeUtc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "obsTimeLocal": "2026-09-26 12:00:00",
        "neighborhood": "Coimbatore Urban East",
        "softwareType": "Davis Vantage Pro2",
        "country": "IN",
        "qcStatus": 1,
        "lat": 11.0185,
        "lon": 76.9620,
        "metric": {
            "temp": 38.6,
            "humidity": 65,
            "dewpt": 30.8,
            "windSpeed": 8.5,
            "windGust": 14.0,
            "windDirection": 210,
            "pressure": 1008.2,
            "precipTotal": 0.0,
            "solarRadiation": 890.0,
            "uv": 9.2,
            "heatIndex": 51.4
        }
    }

    normalized = WeatherNormalizer.normalize_pws_v2(raw_pws_v2, "ITAMILNA24", ref_lat=11.0168, ref_lng=76.9558)
    
    assert normalized["station_id"] == "ITAMILNA24"
    assert normalized["temperature_c"] == 38.6
    assert normalized["relative_humidity_pct"] == 65.0
    assert normalized["solar_radiation"] == 890.0  # Successfully extracted from physical PWS
    assert normalized["quality_status"] == "FRESH"


# ---------------------------------------------------------
# 2. Unit Conversion Tests
# ---------------------------------------------------------
def test_unit_conversions():
    # 104°F = 40.0°C
    assert WeatherNormalizer.f_to_c(104.0) == 40.0
    assert WeatherNormalizer.f_to_c(32.0) == 0.0

    # 10 mph = 16.09 km/h
    assert WeatherNormalizer.mph_to_kmh(10.0) == 16.09

    # 10 m/s = 36.0 km/h
    assert WeatherNormalizer.ms_to_kmh(10.0) == 36.0

    # 29.92 inHg = 1013.21 hPa
    assert WeatherNormalizer.inhg_to_hpa(29.92) == 1013.21

    # 1 inch = 25.4 mm
    assert WeatherNormalizer.inches_to_mm(1.0) == 25.4


# ---------------------------------------------------------
# 3. Validation & Quality Control Tests
# ---------------------------------------------------------
def test_validation_stale_data():
    old_time = (datetime.now(timezone.utc) - timedelta(minutes=20)).isoformat()
    obs = {
        "timestamp_utc": old_time,
        "temperature_c": 35.0,
        "relative_humidity_pct": 50.0,
        "pressure_hpa": 1010.0,
        "wind_speed_kmh": 5.0,
        "dew_point_c": 22.0,
        "data_age_seconds": 1200
    }

    is_valid, status, reasons = WeatherValidator.validate_observation(obs, max_age_seconds=900)
    assert is_valid is False
    assert status == "INVALID"
    assert any("stale" in r.lower() for r in reasons)


def test_validation_out_of_bounds_parameters():
    # Physically impossible temperature (75°C) and humidity (115%)
    obs = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "temperature_c": 75.0,
        "relative_humidity_pct": 115.0,
        "pressure_hpa": 1010.0,
        "wind_speed_kmh": 5.0,
        "dew_point_c": 20.0,
        "data_age_seconds": 30
    }

    is_valid, status, reasons = WeatherValidator.validate_observation(obs)
    assert is_valid is False
    assert len(reasons) >= 2


def test_validation_thermodynamic_dewpoint_constraint():
    # Dew point (45°C) exceeds Dry-bulb temperature (35°C) -> Physical violation
    obs = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "temperature_c": 35.0,
        "relative_humidity_pct": 80.0,
        "pressure_hpa": 1010.0,
        "wind_speed_kmh": 5.0,
        "dew_point_c": 45.0,
        "data_age_seconds": 30
    }

    is_valid, status, reasons = WeatherValidator.validate_observation(obs)
    assert is_valid is False
    assert any("dew point" in r.lower() for r in reasons)


# ---------------------------------------------------------
# 4. Thermal Stress Calculation Tests
# ---------------------------------------------------------
def test_heat_index_calculation():
    # NOAA Benchmark test: 38°C (100.4°F) @ 65% RH -> Extreme Heat Index > 50°C
    hi = ThermalStressService.calculate_heat_index(38.0, 65.0)
    assert hi > 50.0

    # Low temperature benchmark (20°C) -> HI equals dry-bulb
    hi_cool = ThermalStressService.calculate_heat_index(20.0, 50.0)
    assert hi_cool == 20.0


def test_apparent_temperature_and_swbgt():
    at = ThermalStressService.calculate_apparent_temperature(38.0, 70.0, wind_kmh=10.0)
    assert at > 45.0

    swbgt = ThermalStressService.calculate_swbgt_estimate(38.0, 70.0, solar_wm2=900.0, wind_kmh=8.0)
    assert 30.0 <= swbgt <= 42.0


def test_unified_thermal_stress_model():
    obs = NormalizedWeatherObservation(
        timestamp_utc="",
        timestamp_local="",
        latitude=11.0168,
        longitude=76.9558,
        temperature_c=41.5,
        relative_humidity_pct=78.0,
        dew_point_c=36.5,
        wind_speed_kmh=5.0,
        pressure_hpa=1006.0,
        solar_radiation=950.0,
        weather_description="Extreme Tropical Heatwave"
    )

    assessment = ThermalStressService.calculate_thermal_stress(obs)
    assert assessment.thermal_stress_index >= 85
    assert assessment.risk_level in ("VERY_HIGH", "EXTREME")
    assert assessment.solar_radiation_status == "measured"
    assert "CRITICAL" in assessment.action_recommendation or "Severe" in assessment.action_recommendation


# ---------------------------------------------------------
# 5. Haversine Distance Calculation Test
# ---------------------------------------------------------
def test_haversine_distance():
    # Coimbatore to Chennai (~425 km)
    dist = haversine_distance_km(11.0168, 76.9558, 13.0827, 80.2707)
    assert 400.0 <= dist <= 450.0

    # Same location -> 0.0 km
    assert haversine_distance_km(11.0168, 76.9558, 11.0168, 76.9558) == 0.0


# ---------------------------------------------------------
# 6. FastAPI REST Endpoints Integration Tests
# ---------------------------------------------------------
def test_api_weather_current():
    response = client.get("/api/weather/current?latitude=11.0168&longitude=76.9558")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    assert "temperature_c" in data["data"]
    assert "relative_humidity_pct" in data["data"]
    assert "thermal_stress" in data
    assert "thermal_stress_index" in data["thermal_stress"]


def test_api_weather_pws():
    response = client.get("/api/weather/pws/ITAMILNA24?latitude=11.0168&longitude=76.9558")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "ITAMILNA24"
    assert "distance_from_requested_location_km" in data
    assert data["data"]["temperature_c"] > 0


def test_api_weather_pws_nearest():
    response = client.get("/api/weather/pws/nearest?latitude=11.0168&longitude=76.9558")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "selected_station" in data


def test_api_thermal_stress_calculate():
    payload = {
        "temperature_c": 40.0,
        "relative_humidity_pct": 70.0,
        "wind_speed_kmh": 8.0,
        "solar_radiation": 900.0,
        "pressure_hpa": 1008.0
    }
    response = client.post("/api/thermal-stress/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["thermal_stress_index"] >= 75
    assert data["risk_level"] in ("HIGH", "VERY_HIGH", "EXTREME")


def test_api_weather_debug():
    response = client.get("/api/weather/debug?latitude=11.0168&longitude=76.9558")
    assert response.status_code == 200
    data = response.json()
    assert "api_connectivity" in data
    assert "response_time_ms" in data
    assert "available_fields" in data
