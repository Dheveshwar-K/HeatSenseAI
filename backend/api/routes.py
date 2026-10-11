"""
Core API Routes (HEATGUARD AI)
==============================
REST endpoints for:
- Current readings & physics assessments
- Multi-horizon forecasting (15m, 30m, 60m, 120m, 6h)
- Time-To-Danger early warning
- Heatwave dynamics & nighttime recovery
- Sensor health, anomaly detection, & data quality score
- Model benchmarks, feature importances, & model health
- Historical observations & heatwave calendar
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from backend.ml.predict import predictor
from backend.ml.forecasting import forecast_engine
from backend.ml.anomaly_detection import anomaly_monitor
from backend.thermal.heatwave_engine import heatwave_engine
from backend.emergency.emergency_service import emergency_service
from backend.config import settings

router = APIRouter(prefix="/api", tags=["HeatGuard Intelligence"])

# In-memory latest telemetry state
current_telemetry: Dict[str, Any] = {
    "timestamp": datetime.now().isoformat(),
    "temperature": 23.0,
    "relative_humidity": 60.0,
    "dew_point": 14.8,
    "wind_speed": 1.8,
    "solar_radiation": 420.0,
    "cloud_cover": 25.0,
    "location_name": settings.LOCATION_NAME,
    "latitude": settings.LATITUDE,
    "longitude": settings.LONGITUDE,
    "source": "The Weather Company",
    "quality_status": "FRESH"
}


class PredictRequest(BaseModel):
    temperature: float = Field(..., ge=-20.0, le=65.0, description="Ambient temperature in °C")
    relative_humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in %")
    dew_point: Optional[float] = Field(None, description="Dew point in °C")
    wind_speed: float = Field(1.5, ge=0.0, le=80.0, description="Wind speed in m/s")
    solar_radiation: float = Field(0.0, ge=0.0, le=1400.0, description="Solar irradiance in W/m²")
    rolling_temp_24h: Optional[float] = Field(None, description="24-hour mean temperature in °C")


@router.get("/status")
def get_system_status():
    """Returns general backend system status, location, data quality, and model health."""
    quality_report = anomaly_monitor.evaluate_observation(
        temperature=current_telemetry["temperature"],
        relative_humidity=current_telemetry["relative_humidity"],
        dew_point=current_telemetry["dew_point"],
        wind_speed=current_telemetry["wind_speed"],
        solar_radiation=current_telemetry["solar_radiation"]
    )
    return {
        "status": "ONLINE",
        "system_name": settings.APP_NAME,
        "time": datetime.now().isoformat(),
        "location": {
            "name": settings.LOCATION_NAME,
            "latitude": settings.LATITUDE,
            "longitude": settings.LONGITUDE
        },
        "simulation_mode": settings.SIMULATION_MODE,
        "model_loaded": predictor.model is not None,
        "champion_model": predictor.metadata.get("champion_model", "RandomForest"),
        "data_quality_score": quality_report["data_quality_score"],
        "sensor_health": quality_report["sensor_health"]
    }


@router.get("/current")
def get_current_reading():
    """Returns the latest evaluated environmental readings and risk index."""
    pred = predictor.predict(
        temperature=current_telemetry["temperature"],
        relative_humidity=current_telemetry["relative_humidity"],
        dew_point=current_telemetry["dew_point"],
        wind_speed=current_telemetry["wind_speed"],
        solar_radiation=current_telemetry["solar_radiation"]
    )
    state = emergency_service.evaluate({**current_telemetry, **pred})
    return {
        "telemetry": current_telemetry,
        "assessment": pred,
        "emergency_state": state
    }


@router.post("/predict")
def predict_thermal_risk(req: PredictRequest):
    """Executes physics engine calculations and ML classification for arbitrary inputs."""
    dp = req.dew_point
    if dp is None:
        a, b = 17.27, 237.7
        alpha = ((a * req.temperature) / (b + req.temperature)) + (
            (req.relative_humidity / 100.0) if req.relative_humidity > 0 else 0.01
        )
        dp = round((b * alpha) / (a - alpha), 2)

    r24 = req.rolling_temp_24h if req.rolling_temp_24h is not None else req.temperature
    return predictor.predict(
        temperature=req.temperature,
        relative_humidity=req.relative_humidity,
        dew_point=dp,
        wind_speed=req.wind_speed,
        solar_radiation=req.solar_radiation,
        rolling_temp_24h=r24
    )


@router.get("/forecast")
def get_full_forecast():
    """Returns full multi-horizon forecasts for 15m, 30m, 60m, 120m, 6h and Time-To-Danger."""
    return forecast_engine.forecast_trajectory(
        current_temp=current_telemetry["temperature"],
        current_rh=current_telemetry["relative_humidity"],
        current_dp=current_telemetry["dew_point"],
        current_wind=current_telemetry["wind_speed"],
        current_solar=current_telemetry["solar_radiation"]
    )


@router.get("/forecast/15m")
def get_forecast_15m():
    full = get_full_forecast()
    return full["forecast_15m"]


@router.get("/forecast/30m")
def get_forecast_30m():
    full = get_full_forecast()
    return full["forecast_30m"]


@router.get("/forecast/60m")
def get_forecast_60m():
    full = get_full_forecast()
    return full["forecast_60m"]


@router.get("/forecast/120m")
def get_forecast_120m():
    full = get_full_forecast()
    return full["forecast_120m"]


@router.get("/forecast/6h")
def get_forecast_6h():
    full = get_full_forecast()
    return full["forecast_6h"]


@router.get("/time-to-danger")
def get_time_to_danger():
    full = get_full_forecast()
    return full["time_to_danger"]


@router.get("/heatwave")
def get_heatwave_metrics():
    """Returns meteorological heatwave severity, cumulative heat load, and nighttime recovery metrics."""
    pred = predictor.predict(
        temperature=current_telemetry["temperature"],
        relative_humidity=current_telemetry["relative_humidity"],
        dew_point=current_telemetry["dew_point"],
        wind_speed=current_telemetry["wind_speed"],
        solar_radiation=current_telemetry["solar_radiation"]
    )
    return heatwave_engine.analyze_heatwave_dynamics(
        current_temp=current_telemetry["temperature"],
        current_rh=current_telemetry["relative_humidity"],
        current_score=pred["thermal_stress_score"]
    )


@router.get("/anomalies")
def get_anomaly_status():
    """Returns real-time anomaly status, sensor health, and data quality grading."""
    return anomaly_monitor.evaluate_observation(
        temperature=current_telemetry["temperature"],
        relative_humidity=current_telemetry["relative_humidity"],
        dew_point=current_telemetry["dew_point"],
        wind_speed=current_telemetry["wind_speed"],
        solar_radiation=current_telemetry["solar_radiation"]
    )


@router.get("/data-quality")
def get_data_quality():
    res = get_anomaly_status()
    return {
        "data_quality_score": res["data_quality_score"],
        "grade": res["data_quality_grade"],
        "sensor_health": res["sensor_health"]
    }


@router.get("/model-health")
def get_model_health():
    """Returns model health, champion parameters, and drift detection status."""
    res = get_anomaly_status()
    return {
        "champion_model": predictor.metadata.get("champion_model", "RandomForest"),
        "trained_at": predictor.metadata.get("trained_at"),
        "sample_count": predictor.metadata.get("dataset_split", {}).get("total_samples", 1960),
        "model_status": "READY",
        "drift": res["model_drift"]
    }


@router.get("/calendar")
def get_heatwave_calendar():
    """Returns 14-day heatwave calendar records for analytics."""
    return {"calendar": heatwave_engine.generate_calendar_history()}


@router.get("/model-info")
def get_model_info():
    return predictor.metadata


@router.get("/feature-importance")
def get_feature_importance():
    importances = predictor.metadata.get("feature_importances", {})
    return {
        "champion_model": predictor.metadata.get("champion_model", "RandomForest"),
        "feature_importances": importances
    }


@router.get("/alerts")
def get_alerts():
    alerts = []
    current_pred = predictor.predict(
        temperature=current_telemetry["temperature"],
        relative_humidity=current_telemetry["relative_humidity"],
        dew_point=current_telemetry["dew_point"],
        wind_speed=current_telemetry["wind_speed"],
        solar_radiation=current_telemetry["solar_radiation"]
    )
    if current_pred["thermal_stress_score"] >= settings.THERMAL_WARNING_THRESHOLD:
        alerts.append({
            "id": "ALT_LIVE",
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "risk_category": current_pred["risk_category"],
            "score": current_pred["thermal_stress_score"],
            "heatwave_status": current_pred["heatwave_status"],
            "message": f"Extreme thermal stress condition detected: {current_pred['thermal_stress_score']}/100. {current_pred['risk_category']} risk.",
            "status": "ACTIVE"
        })

    for t in emergency_service.timeline:
        if t["category"] in ["ALERT", "EMERGENCY", "WARNING"]:
            alerts.append({
                "id": f"ALT_{t['timestamp']}",
                "timestamp": t["timestamp"],
                "risk_category": "EXTREME" if t["category"] == "EMERGENCY" else "HIGH",
                "score": current_pred["thermal_stress_score"],
                "heatwave_status": current_pred["heatwave_status"],
                "message": t["description"],
                "status": "RECORDED"
            })
    return {"alerts": alerts[:20]}


@router.get("/historical")
def get_historical_dataset_records(limit: int = 100):
    from backend.ml.preprocessing import parse_raw_open_meteo_csv, preprocess_hourly_data
    from backend.ml.feature_engineering import generate_features

    raw_path = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")
    meta, df_h, _ = parse_raw_open_meteo_csv(raw_path)
    df_clean = preprocess_hourly_data(df_h)
    lat = float(meta.get("latitude", 52.55))
    df_feat = generate_features(df_clean, lat=lat)

    records = df_feat.tail(limit).to_dict(orient="records")
    for r in records:
        if "timestamp" in r:
            r["timestamp"] = str(r["timestamp"])
    return {"records": records, "total_records": len(df_feat)}
