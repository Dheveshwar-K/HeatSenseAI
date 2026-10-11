"""
Emergency API Endpoints
=======================
REST routes for emergency controls, test simulation, call triggering,
acknowledgement, and audit history.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from backend.emergency.emergency_service import emergency_service
from backend.emergency.call_manager import call_manager
from backend.config import settings

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])


class ManualCallRequest(BaseModel):
    temperature: Optional[float] = 41.2
    relative_humidity: Optional[float] = 74.0
    thermal_stress_score: Optional[float] = 94.0
    reason: Optional[str] = "Operator initiated emergency test/escalation"


class SettingsUpdateRequest(BaseModel):
    emergency_threshold: Optional[float] = None
    persistence_seconds: Optional[int] = None
    cooldown_seconds: Optional[int] = None
    simulation_mode: Optional[bool] = None
    calls_enabled: Optional[bool] = None


@router.get("/status")
def get_emergency_status():
    """Returns current emergency state, active alarms, call progress, and timeline."""
    return emergency_service.get_status_payload()


@router.get("/history")
def get_call_history():
    """Returns historical emergency call escalation logs."""
    return {
        "call_sequences": call_manager.call_history,
        "timeline": emergency_service.timeline
    }


@router.post("/test")
def simulate_emergency_test():
    """
    Simulation mode endpoint:
    Triggers complete alarm & call workflow safely without calling real phone numbers.
    """
    test_context = {
        "temperature": 43.5,
        "relative_humidity": 78.0,
        "thermal_stress_score": 96.5,
        "simulated": True
    }
    emergency_service.log_timeline_event("--- SIMULATION TEST INITIATED ---", "SIMULATION")
    res = emergency_service.manual_trigger(test_context)
    return {
        "status": "SIMULATION_ACTIVE",
        "message": "Emergency simulation event generated. UI & audio alarms triggered.",
        "result": res
    }


@router.post("/call")
def manual_emergency_call(payload: ManualCallRequest):
    """
    Operator manual emergency call trigger. Requires client confirmation.
    """
    context = {
        "temperature": payload.temperature,
        "relative_humidity": payload.relative_humidity,
        "thermal_stress_score": payload.thermal_stress_score,
        "note": payload.reason
    }
    res = emergency_service.manual_trigger(context)
    return {
        "status": "DISPATCHED",
        "result": res
    }


@router.post("/acknowledge")
def acknowledge_alarm():
    """Acknowledge active audible alarm."""
    return emergency_service.acknowledge_alarm()


@router.post("/resolve")
def resolve_emergency():
    """Reset emergency state back to NORMAL once conditions normalize."""
    return emergency_service.resolve_emergency()


@router.get("/settings")
def get_emergency_settings():
    """Returns configurable threshold settings (excluding sensitive keys)."""
    return {
        "emergency_threshold": settings.EMERGENCY_THRESHOLD,
        "extreme_threshold": settings.THERMAL_EXTREME_THRESHOLD,
        "warning_threshold": settings.THERMAL_WARNING_THRESHOLD,
        "persistence_seconds": settings.EMERGENCY_PERSISTENCE_SECONDS,
        "cooldown_seconds": settings.EMERGENCY_COOLDOWN_SECONDS,
        "simulation_mode": settings.SIMULATION_MODE,
        "emergency_call_enabled": settings.EMERGENCY_CALL_ENABLED,
        "max_retries": settings.MAX_CALL_RETRIES,
        "telephony_provider": settings.TELEPHONY_PROVIDER,
        "contact_1": {
            "name": settings.EMERGENCY_CONTACT_1_NAME,
            "masked": settings.EMERGENCY_CONTACT_1[:3] + "******" + settings.EMERGENCY_CONTACT_1[-3:] if len(settings.EMERGENCY_CONTACT_1) > 6 else "***"
        },
        "contact_2": {
            "name": settings.EMERGENCY_CONTACT_2_NAME,
            "masked": settings.EMERGENCY_CONTACT_2[:3] + "******" + settings.EMERGENCY_CONTACT_2[-3:] if len(settings.EMERGENCY_CONTACT_2) > 6 else "***"
        }
    }


@router.post("/settings")
def update_emergency_settings(req: SettingsUpdateRequest):
    if req.emergency_threshold is not None:
        settings.EMERGENCY_THRESHOLD = req.emergency_threshold
    if req.persistence_seconds is not None:
        settings.EMERGENCY_PERSISTENCE_SECONDS = req.persistence_seconds
    if req.cooldown_seconds is not None:
        settings.EMERGENCY_COOLDOWN_SECONDS = req.cooldown_seconds
    if req.simulation_mode is not None:
        settings.SIMULATION_MODE = req.simulation_mode
    if req.calls_enabled is not None:
        settings.EMERGENCY_CALL_ENABLED = req.calls_enabled

    return {"status": "SUCCESS", "message": "Settings updated successfully."}
