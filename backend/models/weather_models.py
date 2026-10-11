"""
Weather Data Models
===================
Pydantic schemas for The Weather Company (TWC) & PWS normalized observations,
data quality control, and human thermal stress assessments.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class NormalizedWeatherObservation(BaseModel):
    """
    Standardized common weather schema required by Extreme Heatwave Early Warning system.
    All atmospheric metrics normalized strictly to SI/metric units.
    """
    timestamp_utc: str = Field(..., description="Observation timestamp in UTC (ISO 8601)")
    timestamp_local: str = Field(..., description="Local observation timestamp")
    latitude: float = Field(..., description="Station or observation latitude")
    longitude: float = Field(..., description="Station or observation longitude")
    temperature_c: float = Field(..., description="Dry-bulb air temperature in degrees Celsius")
    relative_humidity_pct: float = Field(..., description="Relative humidity percentage (0-100)")
    dew_point_c: float = Field(..., description="Dew point temperature in degrees Celsius")
    wind_speed_ms: float = Field(0.0, description="Wind speed in m/s")
    wind_speed_kmh: float = Field(0.0, description="Wind speed in km/h")
    wind_gust_kmh: Optional[float] = Field(None, description="Wind gust speed in km/h if available")
    wind_direction_deg: Optional[float] = Field(None, description="Wind direction in degrees (0-360)")
    pressure_hpa: float = Field(..., description="Atmospheric barometric pressure in hPa/mbar")
    precipitation_mm: Optional[float] = Field(0.0, description="Precipitation accumulation in mm")
    solar_radiation_wm2: Optional[float] = Field(None, description="Solar irradiance in W/m² (null if unmeasured)")
    solar_radiation: Optional[float] = Field(None, description="Solar irradiance in W/m² (alias)")
    uv_index: Optional[float] = Field(None, description="Ultraviolet index (0-16+)")
    heat_index_c: Optional[float] = Field(None, description="Calculated Rothfusz heat index in Celsius")
    wind_chill_c: Optional[float] = Field(None, description="Calculated wind chill in Celsius")
    visibility_km: Optional[float] = Field(None, description="Atmospheric horizontal visibility in km")
    cloud_cover_pct: Optional[float] = Field(None, description="Estimated cloud cover percentage (0-100)")
    weather_description: str = Field("Clear", description="Textual weather conditions narrative")
    source: str = Field("The Weather Company", description="Specific meteorological data provider")
    station_id: Optional[str] = Field(None, description="Reporting station ID or PWS station name")
    data_age_seconds: int = Field(0, description="Age of observation in seconds since current UTC")
    quality_status: str = Field("FRESH", description="Data freshness grade: FRESH, AGING, STALE, or INVALID")
    is_stale: bool = Field(False, description="True if data_age_seconds exceeds configured staleness limit")
    is_valid: bool = Field(True, description="True if telemetry passes biometeorological validation")


class PWSStationMetadata(BaseModel):
    """
    Personal Weather Station (PWS) physical hardware attributes & distance metrics.
    """
    station_id: str
    station_latitude: float
    station_longitude: float
    neighborhood: Optional[str] = None
    country: Optional[str] = None
    software_type: Optional[str] = None
    quality_control_status: Optional[int] = None
    distance_from_requested_location_km: float = 0.0
    observation_time_utc: str
    data_age_seconds: int = 0
    quality_status: str = "FRESH"
    data: NormalizedWeatherObservation


class ThermalStressAssessment(BaseModel):
    """
    Human Biometeorological Thermal Stress calculation breakdown.
    """
    heat_index_c: Optional[float] = None
    apparent_temperature_c: Optional[float] = None
    wbgt_c: Optional[float] = None
    wbgt_estimate_c: Optional[float] = None
    thermal_stress_index: int = Field(..., ge=0, le=100, description="Normalized risk index from 0 to 100")
    risk_level: str = Field(..., description="SAFE, LOW, MODERATE, HIGH, VERY_HIGH, or EXTREME")
    confidence: Optional[float] = Field(0.92, description="Model inference confidence level")
    solar_radiation_status: str = Field("unavailable", description="measured, estimated, or unavailable")
    contributing_factors: Dict[str, float] = Field(default_factory=dict)
    action_recommendation: str = Field("", description="Recommended life-safety physiological precautions")
    calculation_timestamp: str = Field("", description="UTC timestamp of computation")


class WeatherApiResponseWrapper(BaseModel):
    """
    Standardized FastAPI response envelope for weather queries matching Section 15.
    """
    success: bool = True
    weather: Optional[NormalizedWeatherObservation] = None
    data: Optional[NormalizedWeatherObservation] = None
    thermal: Optional[ThermalStressAssessment] = None
    thermal_stress: Optional[ThermalStressAssessment] = None
    source: str = "The Weather Company"
    retrieved_at_utc: str = ""
    data_age_seconds: int = 0
    error: Optional[Dict[str, Any]] = None


class WeatherDebugInfo(BaseModel):
    """
    Diagnostic debug information without exposing credentials or internal tokens.
    """
    api_connectivity: str
    http_status: int
    response_time_ms: float
    observation_timestamp: str
    data_age_seconds: int
    source: str
    station_id: Optional[str] = None
    raw_temperature_field: str = "temperature"
    raw_temperature_value: Optional[float] = None
    normalized_temperature_c: Optional[float] = None
    validation_result: Dict[str, Any]
    available_fields: List[str]
    missing_fields: List[str]
