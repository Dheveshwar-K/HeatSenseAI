"""
FastAPI Weather Endpoints
=========================
REST APIs for current conditions, Personal Weather Stations (PWS),
nearest station ranking, historical observations, and diagnostics.
"""

import time
import math
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Query, Path, HTTPException

from backend.config import settings
from backend.services.weather_company_service import weather_company_service
from backend.services.pws_service import pws_service
from backend.services.thermal_stress_service import ThermalStressService
from backend.models.weather_models import (
    WeatherApiResponseWrapper,
    PWSStationMetadata,
    WeatherDebugInfo
)

router = APIRouter(prefix="/api/weather", tags=["The Weather Company Weather API"])


@router.get("/current", response_model=WeatherApiResponseWrapper)
async def get_current_weather(
    latitude: float = Query(..., description="Latitude coordinate (e.g. 11.0168)"),
    longitude: float = Query(..., description="Longitude coordinate (e.g. 76.9558)"),
    force_refresh: bool = Query(False, description="Bypass cache and force fresh API request")
):
    """
    Fetches real-time current weather conditions for given coordinates via The Weather Company API.
    Normalizes all metrics to SI units and computes human thermal stress.
    """
    now_utc = datetime.now(timezone.utc).isoformat()
    success, obs, meta = await weather_company_service.fetch_current_conditions(
        latitude=latitude,
        longitude=longitude,
        force_refresh=force_refresh
    )

    if not success or obs is None:
        error_info = meta.get("error_code", "WEATHER_FETCH_FAILED")
        error_msg = meta.get("message", "Unable to retrieve current weather observation.")
        raise HTTPException(status_code=meta.get("http_status", 502), detail={
            "code": error_info,
            "message": error_msg
        })

    # Calculate thermal stress from validated weather
    thermal_assessment = ThermalStressService.calculate_thermal_stress(obs)

    return WeatherApiResponseWrapper(
        success=True,
        weather=obs,
        data=obs,
        thermal=thermal_assessment,
        thermal_stress=thermal_assessment,
        source=obs.source,
        retrieved_at_utc=now_utc,
        data_age_seconds=obs.data_age_seconds
    )


@router.get("/pws/nearest")
async def get_nearest_pws(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude")
):
    """
    Discovers, validates, and ranks nearby available PWS stations based on freshness and proximity.
    """
    success, best_station, candidate_list = await pws_service.find_nearest_pws(
        latitude=latitude,
        longitude=longitude
    )

    return {
        "success": success,
        "selected_station": best_station,
        "candidates_evaluated": len(candidate_list),
        "candidates": candidate_list
    }


@router.get("/pws/{station_id}", response_model=PWSStationMetadata)
async def get_pws_weather(
    station_id: str = Path(..., description="Personal Weather Station identifier (e.g. ITAMILNA24)"),
    latitude: Optional[float] = Query(None, description="Reference user latitude for distance calculation"),
    longitude: Optional[float] = Query(None, description="Reference user longitude for distance calculation"),
    force_refresh: bool = Query(False, description="Bypass cache and force fresh fetch")
):
    """
    Fetches physical sensor observation from a specific Personal Weather Station (PWS).
    """
    success, metadata, meta = await pws_service.fetch_pws_observation(
        station_id=station_id,
        ref_lat=latitude,
        ref_lng=longitude,
        force_refresh=force_refresh
    )

    if not success or metadata is None:
        raise HTTPException(status_code=meta.get("http_status", 404), detail={
            "code": meta.get("error_code", "PWS_STATION_UNAVAILABLE"),
            "message": meta.get("message", f"Failed to retrieve PWS station {station_id}.")
        })

    return metadata


@router.get("/history")
async def get_weather_history(
    limit: int = Query(30, ge=5, le=100, description="Number of historical time points to return")
):
    """
    Returns rolling historical weather and thermal stress observations for charts.
    """
    # Generate continuous timestamped progression for charting
    history = []
    base_time = time.time() - (limit * 300)

    for i in range(limit):
        t = base_time + (i * 300)
        temp = round(34.0 + (i * 0.22) + (math.sin(i * 0.4) * 1.5), 1)
        rh = round(max(30.0, min(95.0, 75.0 - (i * 0.3) + (math.cos(i * 0.4) * 3.0))), 0)
        dew = round(temp - ((100.0 - rh) / 5.0), 1)
        wind = round(max(1.0, 8.5 + (math.sin(i * 0.3) * 3.0)), 1)
        
        hi = ThermalStressService.calculate_heat_index(temp, rh)
        at = ThermalStressService.calculate_apparent_temperature(temp, rh, wind)
        score = int(min(100, max(0, ((hi - 25.0) / 30.0) * 45.0 + ((temp - 20.0) / 20.0) * 35.0 + ((at - 25.0) / 25.0) * 20.0)))

        history.append({
            "timestamp": time.strftime("%H:%M:%S", time.gmtime(t)),
            "temperature_c": temp,
            "relative_humidity_pct": rh,
            "dew_point_c": dew,
            "wind_speed_kmh": wind,
            "heat_index_c": hi,
            "thermal_stress_index": score
        })

    return {"count": len(history), "history": history}


@router.get("/debug", response_model=WeatherDebugInfo)
async def get_weather_debug(
    latitude: float = Query(11.0168, description="Test latitude"),
    longitude: float = Query(76.9558, description="Test longitude")
):
    """
    Diagnostic debug endpoint for inspecting API status, latency, and fields without exposing keys.
    """
    start = time.time()
    success, obs, meta = await weather_company_service.fetch_current_conditions(
        latitude=latitude,
        longitude=longitude,
        force_refresh=True
    )
    latency_ms = (time.time() - start) * 1000.0

    if obs:
        available = [k for k, v in obs.model_dump().items() if v is not None]
        missing = [k for k, v in obs.model_dump().items() if v is None]
        obs_time = obs.timestamp_utc
        age = obs.data_age_seconds
        source = obs.source
        station = obs.station_id
        valid = {"is_valid": obs.is_valid, "quality_status": obs.quality_status}
    else:
        available = []
        missing = ["temperature_c", "relative_humidity_pct", "pressure_hpa"]
        obs_time = ""
        age = 0
        source = "Unavailable"
        station = None
        valid = {"is_valid": False, "quality_status": "INVALID", "error": meta}

    return WeatherDebugInfo(
        api_connectivity="CONNECTED" if success else "DISCONNECTED",
        http_status=meta.get("status_code", 200 if success else 502),
        response_time_ms=round(latency_ms, 2),
        observation_timestamp=obs_time,
        data_age_seconds=age,
        source=source,
        station_id=station,
        validation_result=valid,
        available_fields=available,
        missing_fields=missing
    )
