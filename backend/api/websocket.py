"""
Real-Time Telemetry WebSocket Server (HEATGUARD AI)
===================================================
Broadcasts live environmental readings, thermal indices, ML risk predictions,
multi-horizon forecasting (15m, 30m, 60m, 120m, 6h), Time-To-Danger,
heatwave cumulative load, sensor health, and emergency state machine updates at 1.5s intervals.

Supports 10 Deterministic Scenarios & Presentation Event Stepper.
"""

import asyncio
import json
import logging
import random
from datetime import datetime
from typing import Set, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.ml.predict import predictor
from backend.ml.forecasting import forecast_engine
from backend.ml.anomaly_detection import anomaly_monitor
from backend.thermal.heatwave_engine import heatwave_engine
from backend.emergency.emergency_service import emergency_service
from backend.emergency.call_manager import call_manager
from backend.config import settings

from backend.services.weather_company_service import weather_company_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.live_telemetry: Dict[str, Any] = {
            "temperature": 23.0,
            "relative_humidity": 60.0,
            "dew_point": 14.8,
            "wind_speed": 1.8,
            "solar_radiation": 420.0,
            "cloud_cover": 25.0,
            "scenario": "LIVE",
            "source": "The Weather Company",
            "station_id": None,
            "data_age_seconds": 38,
            "quality_status": "FRESH",
            "is_sensor_fault": False,
            "is_network_offline": False
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        dead = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead.append(connection)
        for d in dead:
            if d in self.active_connections:
                self.active_connections.remove(d)

    def set_scenario(self, scenario_name: str):
        """Allows instant switching of deterministic demonstration scenarios."""
        self.live_telemetry["is_sensor_fault"] = False
        self.live_telemetry["is_network_offline"] = False

        if scenario_name == "LIVE":
            self.live_telemetry.update({
                "scenario": "LIVE"
            })
        elif scenario_name == "NORMAL" or scenario_name == "LOW":
            self.live_telemetry.update({
                "temperature": 21.0, "relative_humidity": 55.0, "dew_point": 11.5,
                "wind_speed": 3.5, "solar_radiation": 350.0, "cloud_cover": 40.0,
                "scenario": "NORMAL"
            })
        elif scenario_name == "MODERATE":
            self.live_telemetry.update({
                "temperature": 29.5, "relative_humidity": 50.0, "dew_point": 18.0,
                "wind_speed": 2.2, "solar_radiation": 600.0, "cloud_cover": 20.0,
                "scenario": "MODERATE"
            })
        elif scenario_name == "HIGH":
            self.live_telemetry.update({
                "temperature": 35.0, "relative_humidity": 65.0, "dew_point": 26.0,
                "wind_speed": 1.5, "solar_radiation": 750.0, "cloud_cover": 10.0,
                "scenario": "HIGH"
            })
        elif scenario_name == "VERY_HIGH":
            self.live_telemetry.update({
                "temperature": 39.0, "relative_humidity": 68.0, "dew_point": 30.0,
                "wind_speed": 1.2, "solar_radiation": 820.0, "cloud_cover": 5.0,
                "scenario": "VERY_HIGH"
            })
        elif scenario_name in ["EXTREME_HEAT_TEST", "JURY_DEMO_EMERGENCY", "EXTREME_HEAT_EMERGENCY"] or "EXTREME HEAT TEST" in scenario_name or "03 •" in scenario_name or "09 •" in scenario_name:
            self.live_telemetry.update({
                "temperature": 48.5,
                "relative_humidity": 73.0,
                "dew_point": 42.0,
                "wind_speed": 0.5,
                "solar_radiation": 950.0,
                "cloud_cover": 0.0,
                "scenario": "JURY_DEMO"
            })
        elif scenario_name == "EXTREME":
            self.live_telemetry.update({
                "temperature": 42.5, "relative_humidity": 75.0, "dew_point": 33.5,
                "wind_speed": 0.8, "solar_radiation": 920.0, "cloud_cover": 0.0,
                "scenario": "EXTREME"
            })
        elif scenario_name == "EMERGENCY":
            self.live_telemetry.update({
                "temperature": 48.5, "relative_humidity": 73.0, "dew_point": 42.0,
                "wind_speed": 0.5, "solar_radiation": 950.0, "cloud_cover": 0.0,
                "scenario": "JURY_DEMO"
            })
        elif scenario_name == "RECOVERY":
            self.live_telemetry.update({
                "temperature": 23.0, "relative_humidity": 50.0, "dew_point": 12.0,
                "wind_speed": 4.2, "solar_radiation": 250.0, "cloud_cover": 60.0,
                "scenario": "RECOVERY"
            })
            emergency_service.resolve_emergency()
        elif scenario_name == "SENSOR_FAILURE":
            self.live_telemetry.update({
                "temperature": 89.9, "relative_humidity": 120.0, "dew_point": 95.0,
                "wind_speed": -5.0, "solar_radiation": 1600.0, "cloud_cover": 0.0,
                "scenario": "SENSOR_FAILURE",
                "is_sensor_fault": True
            })
        elif scenario_name == "NETWORK_FAILURE":
            self.live_telemetry["scenario"] = "NETWORK_FAILURE"
            self.live_telemetry["is_network_offline"] = True
        elif scenario_name == "CALL_FAILURE":
            self.live_telemetry["scenario"] = "CALL_FAILURE"


manager = ConnectionManager()


@router.websocket("/ws/live")
async def websocket_live_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Check for incoming client messages / commands
            try:
                data_text = await asyncio.wait_for(websocket.receive_text(), timeout=1.5)
                data = json.loads(data_text)
                action = data.get("action")
                if action == "SET_SCENARIO":
                    manager.set_scenario(data.get("scenario", "EXTREME"))
                elif action == "SET_TELEMETRY":
                    manager.live_telemetry["scenario"] = "JURY_DEMO"
                    for k in ["temperature", "relative_humidity", "dew_point", "wind_speed", "solar_radiation"]:
                        if k in data:
                            manager.live_telemetry[k] = float(data[k])
                elif action == "ACKNOWLEDGE":
                    emergency_service.acknowledge_alarm()
                elif action == "RESOLVE":
                    emergency_service.resolve_emergency()
                elif action == "MANUAL_CALL":
                    emergency_service.manual_trigger(manager.live_telemetry)
            except asyncio.TimeoutError:
                pass

            # If in LIVE scenario, synchronize with TWC/PWS canonical service
            if manager.live_telemetry.get("scenario") == "LIVE":
                try:
                    success, obs, _ = await weather_company_service.fetch_current_conditions(
                        settings.LATITUDE, settings.LONGITUDE
                    )
                    if success and obs:
                        manager.live_telemetry["temperature"] = obs.temperature_c
                        manager.live_telemetry["relative_humidity"] = obs.relative_humidity_pct
                        manager.live_telemetry["dew_point"] = obs.dew_point_c
                        manager.live_telemetry["wind_speed"] = obs.wind_speed_ms
                        if obs.solar_radiation is not None:
                            manager.live_telemetry["solar_radiation"] = obs.solar_radiation
                        manager.live_telemetry["source"] = obs.source
                        manager.live_telemetry["station_id"] = obs.station_id
                        manager.live_telemetry["data_age_seconds"] = obs.data_age_seconds
                        manager.live_telemetry["quality_status"] = obs.quality_status
                except Exception as e:
                    logger.debug(f"Live weather poll fallback: {e}")

            # Subtle natural micro-fluctuations (unless in sensor failure mode or static scenario)
            if not manager.live_telemetry["is_sensor_fault"]:
                t = round(manager.live_telemetry["temperature"] + random.uniform(-0.05, 0.05), 1)
                rh = round(max(10.0, min(100.0, manager.live_telemetry["relative_humidity"] + random.uniform(-0.1, 0.1))), 1)
                dp = round(manager.live_telemetry["dew_point"] + random.uniform(-0.05, 0.05), 1)
                w = round(max(0.1, manager.live_telemetry["wind_speed"] + random.uniform(-0.05, 0.05)), 1)
                sol = round(max(0.0, manager.live_telemetry["solar_radiation"] + random.uniform(-2.0, 2.0)), 0)
            else:
                t = manager.live_telemetry["temperature"]
                rh = manager.live_telemetry["relative_humidity"]
                dp = manager.live_telemetry["dew_point"]
                w = manager.live_telemetry["wind_speed"]
                sol = manager.live_telemetry["solar_radiation"]

            # 1. Physics & ML Risk Assessment
            pred = predictor.predict(
                temperature=t,
                relative_humidity=rh,
                dew_point=dp,
                wind_speed=w,
                solar_radiation=sol
            )

            # 2. Multi-Horizon Time-Series Forecasting
            forecasts = forecast_engine.forecast_trajectory(
                current_temp=t,
                current_rh=rh,
                current_dp=dp,
                current_wind=w,
                current_solar=sol
            )

            # 3. Anomaly & Sensor Health Evaluation
            anomaly_data = anomaly_monitor.evaluate_observation(
                temperature=t,
                relative_humidity=rh,
                dew_point=dp,
                wind_speed=w,
                solar_radiation=sol,
                is_stale=manager.live_telemetry["is_sensor_fault"]
            )

            # 4. Meteorological Heatwave & Nighttime Cooling Dynamics
            heatwave_data = heatwave_engine.analyze_heatwave_dynamics(
                current_temp=t,
                current_rh=rh,
                current_score=pred["thermal_stress_score"]
            )

            # 5. Evaluate Emergency State Machine
            emergency_state = emergency_service.evaluate({
                "temperature": t,
                "relative_humidity": rh,
                "dew_point": dp,
                "wind_speed": w,
                "solar_radiation": sol,
                **pred
            })

            # Special Demo handling for CALL_FAILURE
            if manager.live_telemetry.get("scenario") == "CALL_FAILURE" and emergency_state.get("active_call_sequence"):
                emergency_state["active_call_sequence"]["contact_1"]["status"] = "FAILED"
                emergency_state["active_call_sequence"]["contact_2"]["status"] = "CONNECTED"

            payload = {
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "date": datetime.now().strftime("%Y-%m-%d"),
                "scenario": manager.live_telemetry.get("scenario", "LIVE"),
                "is_offline_mode": manager.live_telemetry.get("is_network_offline", False),
                "environmental": {
                    "temperature": t,
                    "relative_humidity": rh,
                    "dew_point": dp,
                    "wind_speed": w,
                    "solar_radiation": sol,
                    "pressure": 1008.7,
                    "heat_index": pred["heat_index"],
                    "wet_bulb": pred["wet_bulb_temperature"],
                    "simplified_wbgt": pred["simplified_wbgt"],
                    "apparent_temperature": pred["apparent_temperature"],
                    "location": settings.LOCATION_NAME
                },
                "thermal_assessment": {
                    "score": pred["thermal_stress_score"],
                    "risk_category": pred["risk_category"],
                    "probability": pred["probability"],
                    "heatwave_status": heatwave_data["heatwave_status"],
                    "contributors": pred["contributors"],
                    "risk_reasons": pred["risk_reasons"],
                    "is_warning": pred["warning"],
                    "is_extreme": pred["extreme"],
                    "is_emergency": pred["emergency"]
                },
                "forecast": {
                    "forecast_15m": forecasts["forecast_15m"],
                    "forecast_30m": forecasts["forecast_30m"],
                    "forecast_60m": forecasts["forecast_60m"],
                    "forecast_120m": forecasts["forecast_120m"],
                    "forecast_6h": forecasts["forecast_6h"],
                    "time_to_danger": forecasts["time_to_danger"]
                },
                "heatwave_dynamics": heatwave_data,
                "sensor_diagnostics": {
                    "data_quality_score": anomaly_data["data_quality_score"],
                    "data_quality_grade": anomaly_data["data_quality_grade"],
                    "has_anomaly": anomaly_data["has_anomaly"],
                    "anomalies": anomaly_data["anomalies"],
                    "sensor_health": anomaly_data["sensor_health"],
                    "model_drift": anomaly_data["model_drift"]
                },
                "emergency_system": emergency_state
            }

            await websocket.send_text(json.dumps(payload))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket broadcast error: {e}")
        manager.disconnect(websocket)
