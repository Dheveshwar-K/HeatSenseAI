"""
Database Repositories
=====================
CRUD helpers for weather observations, predictions, alerts, and emergency calls.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from .models import WeatherObservation, ThermalPrediction, Alert, EmergencyEvent, CallAttempt


def create_weather_observation(db: Session, data: Dict[str, Any]) -> WeatherObservation:
    obs = WeatherObservation(
        temperature=data["temperature"],
        relative_humidity=data["relative_humidity"],
        dew_point=data["dew_point"],
        wind_speed=data["wind_speed"],
        solar_radiation=data.get("solar_radiation", 0.0),
        cloud_cover=data.get("cloud_cover", 0.0),
        location_name=data.get("location_name", "Monitoring Station Alpha")
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return obs


def create_thermal_prediction(db: Session, data: Dict[str, Any]) -> ThermalPrediction:
    pred = ThermalPrediction(
        thermal_stress_score=data["thermal_stress_score"],
        risk_category=data["risk_category"],
        heatwave_status=data.get("heatwave_status", "NORMAL"),
        probability=data.get("probability", 0.0),
        heat_index=data["heat_index"],
        wet_bulb_temp=data["wet_bulb_temperature"],
        simplified_wbgt=data["simplified_wbgt"],
        apparent_temp=data["apparent_temperature"],
        warning_flag=data.get("warning", False),
        emergency_flag=data.get("emergency", False)
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


def create_alert(db: Session, category: str, score: float, hw_status: str, msg: str) -> Alert:
    alert = Alert(
        risk_category=category,
        thermal_score=score,
        heatwave_status=hw_status,
        message=msg
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def create_emergency_event(db: Session, event_data: Dict[str, Any]) -> EmergencyEvent:
    event = EmergencyEvent(
        thermal_score=event_data["thermal_score"],
        risk_category=event_data["risk_category"],
        temperature=event_data["temperature"],
        humidity=event_data["humidity"],
        dew_point=event_data["dew_point"],
        wind_speed=event_data["wind_speed"],
        heatwave_status=event_data["heatwave_status"],
        contact_1=event_data["contact_1"],
        contact_1_status=event_data.get("contact_1_status", "INITIATED"),
        contact_2=event_data["contact_2"],
        contact_2_status=event_data.get("contact_2_status", "PENDING")
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def record_call_attempt(db: Session, attempt_data: Dict[str, Any]) -> CallAttempt:
    attempt = CallAttempt(
        emergency_event_id=attempt_data.get("emergency_event_id"),
        contact_index=attempt_data["contact_index"],
        contact_name=attempt_data["contact_name"],
        phone_masked=attempt_data["phone_masked"],
        provider=attempt_data.get("provider", "mock"),
        call_sid=attempt_data.get("call_sid"),
        status=attempt_data["status"],
        error_message=attempt_data.get("error_message"),
        duration_seconds=attempt_data.get("duration_seconds", 0)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


def get_recent_alerts(db: Session, limit: int = 50) -> List[Alert]:
    return db.query(Alert).order_by(Alert.timestamp.desc()).limit(limit).all()


def get_recent_emergency_events(db: Session, limit: int = 20) -> List[EmergencyEvent]:
    return db.query(EmergencyEvent).order_by(EmergencyEvent.timestamp.desc()).limit(limit).all()
