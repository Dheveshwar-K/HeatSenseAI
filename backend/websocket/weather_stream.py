"""
WebSocket Real-Time Weather Stream
==================================
Continuous live streaming of normalized weather observations, thermal stress metrics,
and data quality status to frontend subscribers.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.config import settings
from backend.services.weather_company_service import weather_company_service
from backend.services.pws_service import pws_service
from backend.services.thermal_stress_service import ThermalStressService

logger = logging.getLogger("weather_websocket")
router = APIRouter(tags=["Weather WebSocket Stream"])


class WeatherStreamManager:
    """
    Manages active WebSocket client connections for real-time weather broadcasting.
    """

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Weather WS Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Weather WS Client disconnected. Total: {len(self.active_connections)}")

    async def send_json(self, websocket: WebSocket, data: dict):
        try:
            await websocket.send_text(json.dumps(data))
        except Exception:
            pass


stream_manager = WeatherStreamManager()


@router.websocket("/ws/weather")
async def websocket_weather_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint streaming normalized TWC weather & thermal stress every refresh interval.
    """
    await stream_manager.connect(websocket)

    current_lat = settings.LATITUDE
    current_lng = settings.LONGITUDE
    current_pws: str | None = None

    try:
        while True:
            # Check for incoming client messages without blocking indefinitely
            try:
                msg_text = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                try:
                    payload = json.loads(msg_text)
                    if payload.get("type") == "SET_LOCATION":
                        current_lat = float(payload.get("latitude", current_lat))
                        current_lng = float(payload.get("longitude", current_lng))
                        current_pws = None
                    elif payload.get("type") == "SET_PWS":
                        current_pws = payload.get("station_id")
                except Exception:
                    pass
            except asyncio.TimeoutError:
                pass

            # Fetch fresh observation from PWS or TWC Currents on Demand
            if current_pws:
                success, pws_meta, _ = await pws_service.fetch_pws_observation(
                    current_pws, ref_lat=current_lat, ref_lng=current_lng
                )
                obs = pws_meta.data if (success and pws_meta) else None
            else:
                success, obs, _ = await weather_company_service.fetch_current_conditions(
                    current_lat, current_lng
                )

            if obs:
                thermal = ThermalStressService.calculate_thermal_stress(obs)
                packet = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "weather": {
                        "temperature_c": obs.temperature_c,
                        "humidity_pct": obs.relative_humidity_pct,
                        "wind_speed_kmh": obs.wind_speed_kmh,
                        "dew_point_c": obs.dew_point_c,
                        "pressure_hpa": obs.pressure_hpa,
                        "solar_radiation": obs.solar_radiation,
                        "uv_index": obs.uv_index,
                        "precipitation_mm": obs.precipitation_mm,
                        "weather_description": obs.weather_description
                    },
                    "thermal_stress": {
                        "heat_index_c": thermal.heat_index_c,
                        "apparent_temperature_c": thermal.apparent_temperature_c,
                        "wbgt_estimate_c": thermal.wbgt_estimate_c,
                        "thermal_stress_index": thermal.thermal_stress_index,
                        "risk_level": thermal.risk_level,
                        "confidence": thermal.confidence,
                        "solar_radiation_status": thermal.solar_radiation_status,
                        "action_recommendation": thermal.action_recommendation
                    },
                    "data_quality": {
                        "source": obs.source,
                        "station_id": obs.station_id,
                        "age_seconds": obs.data_age_seconds,
                        "status": obs.quality_status,
                        "is_valid": obs.is_valid,
                        "is_stale": obs.is_stale
                    },
                    "location": {
                        "latitude": obs.latitude,
                        "longitude": obs.longitude
                    }
                }
                await stream_manager.send_json(websocket, packet)

            # Stream cadence: sleep 5 seconds between packets
            await asyncio.sleep(5)

    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Weather WS Exception: {e}")
        stream_manager.disconnect(websocket)
