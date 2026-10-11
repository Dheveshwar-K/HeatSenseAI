"""
FastAPI Thermal Stress Calculation Endpoints
============================================
Exposes human thermal stress index computation, thermodynamic multi-metric models,
and risk classification algorithms.
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter

from backend.services.thermal_stress_service import ThermalStressService
from backend.models.weather_models import NormalizedWeatherObservation, ThermalStressAssessment

router = APIRouter(prefix="/api/thermal-stress", tags=["Thermal Stress Engine"])


class ThermalStressCalculationRequest(BaseModel):
    temperature_c: float = Field(..., description="Dry-bulb air temperature in °C", ge=-30.0, le=65.0)
    relative_humidity_pct: float = Field(..., description="Relative humidity %", ge=0.0, le=100.0)
    wind_speed_kmh: float = Field(0.0, description="Wind velocity in km/h", ge=0.0, le=250.0)
    solar_radiation: Optional[float] = Field(None, description="Solar irradiance in W/m² (null if unmeasured)", ge=0.0, le=1500.0)
    pressure_hpa: float = Field(1013.25, description="Surface barometric pressure in hPa")


@router.post("/calculate", response_model=ThermalStressAssessment)
def calculate_thermal_stress_index(payload: ThermalStressCalculationRequest):
    """
    Computes NOAA Heat Index, Steadman Apparent Temp, Liljegren sWBGT, and
    unified 0-100 Human Thermal Stress Index from user or sensor inputs.
    """
    # Create temporary normalized observation for unified calculation
    obs = NormalizedWeatherObservation(
        timestamp_utc="",
        timestamp_local="",
        latitude=0.0,
        longitude=0.0,
        temperature_c=payload.temperature_c,
        relative_humidity_pct=payload.relative_humidity_pct,
        dew_point_c=payload.temperature_c - ((100.0 - payload.relative_humidity_pct) / 5.0),
        wind_speed_kmh=payload.wind_speed_kmh,
        pressure_hpa=payload.pressure_hpa,
        solar_radiation=payload.solar_radiation,
        weather_description="Calculated Input"
    )

    return ThermalStressService.calculate_thermal_stress(obs)
