"""
Weather Normalization Service
=============================
Standardizes heterogeneous meteorological API payloads (The Weather Company,
Personal Weather Stations, and fallback sources) strictly into SI / metric units.

All thermal-stress algorithms rely on this standardized schema.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.models.weather_models import NormalizedWeatherObservation


class WeatherNormalizer:
    """
    Normalizes raw external weather API payloads to the project's common schema.
    """

    @staticmethod
    def f_to_c(f: Optional[float]) -> Optional[float]:
        if f is None:
            return None
        return round((f - 32.0) * 5.0 / 9.0, 2)

    @staticmethod
    def mph_to_kmh(mph: Optional[float]) -> Optional[float]:
        if mph is None:
            return None
        return round(mph * 1.60934, 2)

    @staticmethod
    def ms_to_kmh(ms: Optional[float]) -> Optional[float]:
        if ms is None:
            return None
        return round(ms * 3.6, 2)

    @staticmethod
    def inhg_to_hpa(inhg: Optional[float]) -> Optional[float]:
        if inhg is None:
            return None
        return round(inhg * 33.8639, 2)

    @staticmethod
    def inches_to_mm(inches: Optional[float]) -> Optional[float]:
        if inches is None:
            return 0.0
        return round(inches * 25.4, 2)

    @staticmethod
    def miles_to_km(miles: Optional[float]) -> Optional[float]:
        if miles is None:
            return None
        return round(miles * 1.60934, 2)

    @classmethod
    def normalize_twc_v3(
        cls,
        raw: Dict[str, Any],
        latitude: float,
        longitude: float
    ) -> Dict[str, Any]:
        """
        Normalizes The Weather Company (TWC) Currents On Demand endpoint response:
        Endpoint: /v3/wx/observations/current (format: json, units: m)
        """
        now_utc = datetime.now(timezone.utc)
        
        # Parse timestamp from epoch or ISO string
        epoch = raw.get("validTimeUtc") or raw.get("observationTimeUtc")
        if epoch:
            try:
                obs_dt = datetime.fromtimestamp(int(epoch), tz=timezone.utc)
                obs_utc_str = obs_dt.isoformat()
            except Exception:
                obs_utc_str = now_utc.isoformat()
                obs_dt = now_utc
        else:
            obs_utc_str = raw.get("validTimeUtcString") or now_utc.isoformat()
            obs_dt = now_utc

        data_age = int(max(0, (now_utc - obs_dt).total_seconds()))

        # Extract metric parameters (TWC units=m returns Celsius, km/h, mb/hPa)
        temp_c = raw.get("temperature")
        if temp_c is None:
            temp_c = raw.get("temp")

        rh = raw.get("relativeHumidity") or raw.get("rh")
        dew_c = raw.get("temperatureDewPoint") or raw.get("dewpt") or raw.get("dewPoint")
        
        # If dew point is not directly in payload, compute from Magnus-Tetens approximation
        if dew_c is None and temp_c is not None and rh is not None and rh > 0:
            import math
            a, b = 17.27, 237.7
            alpha = ((a * float(temp_c)) / (b + float(temp_c))) + math.log(float(rh) / 100.0)
            dew_c = round((b * alpha) / (a - alpha), 2)

        wind_speed = raw.get("windSpeed") or raw.get("wspd") or 0.0
        wind_gust = raw.get("windGust") or raw.get("wgust")
        wind_dir = raw.get("windDirection") or raw.get("wdir")
        pressure = raw.get("pressureAltimeter") or raw.get("pressureMeanSeaLevel") or raw.get("pressure") or 1013.25
        precip = raw.get("precip1Hour") or raw.get("precipTotal") or 0.0
        uv = raw.get("uvIndex")
        heat_idx = raw.get("temperatureHeatIndex") or raw.get("heatIndex")
        wind_chill = raw.get("temperatureWindChill") or raw.get("windChill")
        visibility = raw.get("visibility")
        clouds = raw.get("cloudCoverPhrase") or raw.get("cloudCover")
        phrase = raw.get("wxPhraseLong") or raw.get("wxPhraseShort") or raw.get("weatherDescription") or "Observed Weather"

        # Solar radiation is explicitly None if not measured
        solar_rad = raw.get("solarRadiation")

        return {
            "timestamp_utc": obs_utc_str,
            "timestamp_local": raw.get("validTimeLocal") or obs_utc_str,
            "latitude": float(latitude),
            "longitude": float(longitude),
            "temperature_c": float(temp_c) if temp_c is not None else 25.0,
            "relative_humidity_pct": float(rh) if rh is not None else 50.0,
            "dew_point_c": float(dew_c) if dew_c is not None else 15.0,
            "wind_speed_kmh": float(wind_speed) if wind_speed is not None else 0.0,
            "wind_gust_kmh": float(wind_gust) if wind_gust is not None else None,
            "wind_direction_deg": float(wind_dir) if wind_dir is not None else None,
            "pressure_hpa": float(pressure) if pressure is not None else 1013.25,
            "precipitation_mm": float(precip) if precip is not None else 0.0,
            "solar_radiation": float(solar_rad) if solar_rad is not None else None,
            "uv_index": float(uv) if uv is not None else None,
            "heat_index_c": float(heat_idx) if heat_idx is not None else None,
            "wind_chill_c": float(wind_chill) if wind_chill is not None else None,
            "visibility_km": float(visibility) if visibility is not None else None,
            "cloud_cover_pct": float(clouds) if isinstance(clouds, (int, float)) else None,
            "weather_description": str(phrase),
            "source": "The Weather Company (Currents on Demand)",
            "station_id": raw.get("stationId") or raw.get("stationName"),
            "data_age_seconds": data_age,
            "quality_status": "FRESH" if data_age < 300 else "AGING" if data_age < 900 else "STALE",
            "is_stale": data_age >= 900,
            "is_valid": True
        }

    @classmethod
    def normalize_pws_v2(
        cls,
        raw_obs: Dict[str, Any],
        station_id: str,
        ref_lat: float,
        ref_lng: float
    ) -> Dict[str, Any]:
        """
        Normalizes The Weather Company (TWC) PWS endpoint response:
        Endpoint: /v2/pws/observations/current (format: json, units: m)
        """
        now_utc = datetime.now(timezone.utc)
        obs_time_utc = raw_obs.get("obsTimeUtc")
        if obs_time_utc:
            try:
                obs_dt = datetime.fromisoformat(obs_time_utc.replace("Z", "+00:00"))
            except Exception:
                obs_dt = now_utc
        else:
            obs_dt = now_utc

        data_age = int(max(0, (now_utc - obs_dt).total_seconds()))

        # Metrics are nested inside "metric" object or root
        metric = raw_obs.get("metric", raw_obs)

        temp_c = metric.get("temp") or metric.get("tempAvg")
        rh = raw_obs.get("humidity") or metric.get("humidity")
        dew_c = metric.get("dewpt") or metric.get("dewpoint")
        wind_speed = metric.get("windSpeed") or metric.get("windspeedAvg")
        wind_gust = metric.get("windGust") or metric.get("windgustAvg")
        wind_dir = raw_obs.get("winddir") or metric.get("windDirection")
        pressure = metric.get("pressure") or metric.get("pressureMax") or 1013.25
        precip = metric.get("precipTotal") or metric.get("precipRate") or 0.0
        solar_rad = raw_obs.get("solarRadiation") or metric.get("solarRadiation")
        uv = raw_obs.get("uv") or metric.get("uvIndex")
        heat_idx = metric.get("heatIndex")
        wind_chill = metric.get("windChill")

        lat = raw_obs.get("lat", ref_lat)
        lng = raw_obs.get("lon", ref_lng)

        # Calculate dew point fallback if omitted by PWS sensor
        if dew_c is None and temp_c is not None and rh is not None and rh > 0:
            import math
            a, b = 17.27, 237.7
            alpha = ((a * float(temp_c)) / (b + float(temp_c))) + math.log(float(rh) / 100.0)
            dew_c = round((b * alpha) / (a - alpha), 2)

        return {
            "timestamp_utc": obs_dt.isoformat(),
            "timestamp_local": raw_obs.get("obsTimeLocal") or obs_dt.isoformat(),
            "latitude": float(lat),
            "longitude": float(lng),
            "temperature_c": float(temp_c) if temp_c is not None else 25.0,
            "relative_humidity_pct": float(rh) if rh is not None else 50.0,
            "dew_point_c": float(dew_c) if dew_c is not None else 15.0,
            "wind_speed_kmh": float(wind_speed) if wind_speed is not None else 0.0,
            "wind_gust_kmh": float(wind_gust) if wind_gust is not None else None,
            "wind_direction_deg": float(wind_dir) if wind_dir is not None else None,
            "pressure_hpa": float(pressure) if pressure is not None else 1013.25,
            "precipitation_mm": float(precip) if precip is not None else 0.0,
            "solar_radiation": float(solar_rad) if solar_rad is not None else None,
            "uv_index": float(uv) if uv is not None else None,
            "heat_index_c": float(heat_idx) if heat_idx is not None else None,
            "wind_chill_c": float(wind_chill) if wind_chill is not None else None,
            "visibility_km": None,
            "cloud_cover_pct": None,
            "weather_description": f"PWS Station {station_id} Observation",
            "source": f"The Weather Company PWS ({station_id})",
            "station_id": station_id,
            "data_age_seconds": data_age,
            "quality_status": "FRESH" if data_age < 300 else "AGING" if data_age < 900 else "STALE",
            "is_stale": data_age >= 900,
            "is_valid": True
        }
