"""
SQLAlchemy Database Models
==========================
Tables:
- weather_observations
- thermal_predictions
- alerts
- emergency_events
- call_attempts
- model_runs
- system_settings
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False)
    relative_humidity = Column(Float, nullable=False)
    dew_point = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    solar_radiation = Column(Float, default=0.0)
    cloud_cover = Column(Float, default=0.0)
    location_name = Column(String(100), default="Monitoring Station Alpha")


class ThermalPrediction(Base):
    __tablename__ = "thermal_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    thermal_stress_score = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False)
    heatwave_status = Column(String(50), default="NORMAL")
    probability = Column(Float, default=0.0)
    heat_index = Column(Float, nullable=False)
    wet_bulb_temp = Column(Float, nullable=False)
    simplified_wbgt = Column(Float, nullable=False)
    apparent_temp = Column(Float, nullable=False)
    warning_flag = Column(Boolean, default=False)
    emergency_flag = Column(Boolean, default=False)
    explanation_json = Column(Text, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_category = Column(String(50), nullable=False)
    thermal_score = Column(Float, nullable=False)
    heatwave_status = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)


class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    thermal_score = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    dew_point = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    heatwave_status = Column(String(50), nullable=False)

    # Escalation Call Status
    contact_1 = Column(String(100), nullable=False)
    contact_1_call_id = Column(String(100), nullable=True)
    contact_1_status = Column(String(50), default="PENDING")

    contact_2 = Column(String(100), nullable=False)
    contact_2_call_id = Column(String(100), nullable=True)
    contact_2_status = Column(String(50), default="PENDING")

    status = Column(String(50), default="ACTIVE")  # ACTIVE, RESOLVED, ACKNOWLEDGED
    duration_seconds = Column(Integer, default=0)
    resolved_at = Column(DateTime, nullable=True)

    call_attempts = relationship("CallAttempt", back_populates="emergency_event")


class CallAttempt(Base):
    __tablename__ = "call_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emergency_event_id = Column(Integer, ForeignKey("emergency_events.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    contact_index = Column(Integer, nullable=False)  # 1 or 2
    contact_name = Column(String(100), nullable=False)
    phone_masked = Column(String(50), nullable=False)
    provider = Column(String(50), default="mock")
    call_sid = Column(String(100), nullable=True)
    status = Column(String(50), default="INITIATED")  # INITIATED, RINGING, CONNECTED, COMPLETED, FAILED
    error_message = Column(Text, nullable=True)
    duration_seconds = Column(Integer, default=0)

    emergency_event = relationship("EmergencyEvent", back_populates="call_attempts")


class ModelRun(Base):
    __tablename__ = "model_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    champion_model = Column(String(100), nullable=False)
    macro_f1 = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    metadata_json = Column(Text, nullable=False)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
