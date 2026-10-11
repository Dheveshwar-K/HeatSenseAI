"""
Emergency Service & State Machine
=================================
Implements the multi-tiered Emergency State Machine:
NORMAL -> WATCH -> WARNING -> DANGER -> EXTREME -> EMERGENCY

Enforces:
- Persistence duration verification (prevents single noisy sensor spikes)
- Audible alarm activation
- Dual contact escalation sequence
- Timeline logging & audit records
"""

import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.config import settings
from .call_manager import call_manager

logger = logging.getLogger(__name__)


class EmergencyStateMachine:
    STATES = ["NORMAL", "WATCH", "WARNING", "DANGER", "EXTREME", "EMERGENCY"]

    def __init__(self):
        self.current_state: str = "NORMAL"
        self.previous_state: str = "NORMAL"
        self.state_entered_time: float = time.time()
        self.extreme_condition_start: Optional[float] = None
        self.consecutive_extreme_count: int = 0
        self.is_alarm_active: bool = False
        self.is_acknowledged: bool = False
        self.acknowledged_at: Optional[str] = None
        self.timeline: List[Dict[str, Any]] = []
        self.active_event: Optional[Dict[str, Any]] = None
        self.event_counter: int = 0

    def log_timeline_event(self, description: str, category: str = "INFO"):
        event = {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "description": description,
            "category": category
        }
        self.timeline.insert(0, event)
        # Keep latest 50 events
        if len(self.timeline) > 50:
            self.timeline.pop()
        logger.info(f"[TIMELINE] {description}")

    def evaluate(self, prediction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates incoming thermal telemetry against the state machine rules.
        - Emergency Threshold: thermal_stress_score >= 90.0
        - Recovery Threshold: thermal_stress_score < 85.0
        - Anti-Chatter: Triggers alarm/call events ONCE on state transition.
        """
        score = float(prediction_data.get("thermal_stress_score", 0.0))
        now = time.time()

        # Step 1: Preliminary state mapping based on score
        if score >= settings.THERMAL_EMERGENCY_THRESHOLD:
            provisional_state = "EMERGENCY"
        elif score >= settings.THERMAL_EXTREME_THRESHOLD:
            provisional_state = "EXTREME"
        elif score >= settings.THERMAL_WARNING_THRESHOLD:
            provisional_state = "WARNING"
        elif score >= settings.THERMAL_WATCH_THRESHOLD:
            provisional_state = "WATCH"
        else:
            provisional_state = "NORMAL"

        # Step 2: Handle Emergency Threshold & Transitions
        if score >= settings.THERMAL_EMERGENCY_THRESHOLD:
            self.consecutive_extreme_count += 1
            if self.extreme_condition_start is None:
                self.extreme_condition_start = now
                self.log_timeline_event(f"Extreme risk condition detected (Score: {score:.1f}/100)", "ALERT")

            elapsed_persistence = now - self.extreme_condition_start

            # If persistence satisfied or persistence set to 0 (immediate)
            if elapsed_persistence >= settings.EMERGENCY_PERSISTENCE_SECONDS or settings.EMERGENCY_PERSISTENCE_SECONDS == 0:
                if self.current_state != "EMERGENCY":
                    self._transition_to_emergency(score, prediction_data)
                else:
                    # Already in emergency: maintain siren and state without duplicate dispatch
                    self.is_alarm_active = True
            else:
                self.current_state = "EXTREME"
                self.is_alarm_active = True

        elif score >= settings.THERMAL_RECOVERY_THRESHOLD:
            # Hysteresis band [85.0, 90.0): If already in EMERGENCY, hold EMERGENCY state
            if self.current_state == "EMERGENCY":
                self.is_alarm_active = True
                # Keep current_state as EMERGENCY (anti-oscillation)
            else:
                self.extreme_condition_start = None
                self.consecutive_extreme_count = 0
                if self.current_state != "EXTREME":
                    self.current_state = "EXTREME"
                    self.is_alarm_active = True
                    self.log_timeline_event(f"State transitioned to EXTREME (Score: {score:.1f})", "WARNING")

        else:
            # Subsided strictly below Recovery Threshold (< 85.0)
            self.extreme_condition_start = None
            self.consecutive_extreme_count = 0
            if self.current_state == "EMERGENCY":
                self.log_timeline_event(
                    f"Thermal stress recovered below threshold (Score: {score:.1f} < {settings.THERMAL_RECOVERY_THRESHOLD}). Siren OFF.",
                    "RECOVER"
                )
                self.current_state = provisional_state
                self.is_alarm_active = False
                self.active_event = None
            else:
                self.current_state = provisional_state
                if self.current_state in ["NORMAL", "WATCH"]:
                    self.is_alarm_active = False

        # Query call progress if active
        call_seq = call_manager.get_active_sequence_status()

        return self.get_status_payload(prediction_data, call_seq)

    def _transition_to_emergency(self, score: float, prediction_data: Dict[str, Any]):
        self.previous_state = self.current_state
        self.current_state = "EMERGENCY"
        self.is_alarm_active = True
        self.is_acknowledged = False
        self.event_counter += 1
        event_id = f"EH-2026-{self.event_counter:04d}"

        scenario_mode = prediction_data.get("scenario", "LIVE")
        is_jury_demo = (scenario_mode != "LIVE") or settings.SIMULATION_MODE

        self.log_timeline_event(f"🚨 EXTREME HEAT EMERGENCY [{event_id}] CONFIRMED - Thermal stress score: {score:.1f}/100", "EMERGENCY")
        self.log_timeline_event("Acoustic siren & visual emergency alarms activated (SIREN ON)", "ALARM")

        # Create active emergency event record matching Section 14
        self.active_event = {
            "event_id": event_id,
            "id": event_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": "JURY_DEMO" if is_jury_demo else "LIVE",
            "thermal_stress_index": round(score, 1),
            "score": round(score, 1),
            "temperature_c": prediction_data.get("temperature"),
            "humidity_pct": prediction_data.get("relative_humidity"),
            "wind_speed_ms": prediction_data.get("wind_speed"),
            "solar_radiation_wm2": prediction_data.get("solar_radiation"),
            "risk_level": "EXTREME",
            "emergency_state": "EXTREME_HEAT_EMERGENCY",
            "alarm_triggered": True,
            "telephony_triggered": settings.TELEPHONY_ENABLED or settings.EMERGENCY_CALL_ENABLED
        }

        # Trigger automatic call escalation
        telephony_active = settings.TELEPHONY_ENABLED or settings.EMERGENCY_CALL_ENABLED
        if telephony_active:
            self.log_timeline_event(f"Initiating automated dual-contact escalation [{event_id}]", "CALL")
        else:
            self.log_timeline_event(f"Simulating dual-contact escalation dispatch [{event_id}] (TELEPHONY_ENABLED=false)", "CALL")

        call_res = call_manager.trigger_dual_escalation(prediction_data, is_manual=False)

        if call_res.get("success"):
            status_desc = "CALL DISPATCHED" if telephony_active else "SIMULATED CALL"
            self.log_timeline_event(f"Primary Contact ({settings.EMERGENCY_CONTACT_1_NAME}): {status_desc}", "CALL")
            self.log_timeline_event(f"Secondary Contact ({settings.EMERGENCY_CONTACT_2_NAME}): {status_desc}", "CALL")
        else:
            self.log_timeline_event(f"Call dispatch status: {call_res.get('reason')}", "WARNING")

    def manual_trigger(self, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Manually triggers emergency sequence upon operator confirmation."""
        ctx = context or {
            "temperature": 41.5,
            "relative_humidity": 72.0,
            "thermal_stress_score": 93.0
        }
        self.current_state = "EMERGENCY"
        self.is_alarm_active = True
        self.is_acknowledged = False
        self.log_timeline_event("🚨 Manual Emergency Call initiated by operator", "MANUAL")
        res = call_manager.trigger_dual_escalation(ctx, is_manual=True, bypass_cooldown=True)
        return res

    def acknowledge_alarm(self) -> Dict[str, Any]:
        self.is_acknowledged = True
        self.is_alarm_active = False
        self.acknowledged_at = datetime.now().strftime("%H:%M:%S")
        self.log_timeline_event(f"Operator acknowledged emergency alarm at {self.acknowledged_at}", "ACK")
        return {"acknowledged": True, "acknowledged_at": self.acknowledged_at}

    def resolve_emergency(self) -> Dict[str, Any]:
        self.current_state = "NORMAL"
        self.is_alarm_active = False
        self.is_acknowledged = False
        self.extreme_condition_start = None
        self.active_event = None
        self.log_timeline_event("Emergency cleared and marked RESOLVED by operator", "RESOLVE")
        return {"resolved": True, "current_state": "NORMAL"}

    def get_status_payload(self, telemetry: Optional[Dict[str, Any]] = None, call_seq: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        cooldown_remaining = call_manager.get_cooldown_remaining()
        persistence_remaining = 0
        if self.extreme_condition_start:
            elapsed = time.time() - self.extreme_condition_start
            persistence_remaining = max(0, int(settings.EMERGENCY_PERSISTENCE_SECONDS - elapsed))

        return {
            "state": self.current_state,
            "alarm_active": self.is_alarm_active,
            "acknowledged": self.is_acknowledged,
            "acknowledged_at": self.acknowledged_at,
            "cooldown_remaining_seconds": cooldown_remaining,
            "persistence_remaining_seconds": persistence_remaining,
            "simulation_mode": settings.SIMULATION_MODE,
            "active_call_sequence": call_seq or call_manager.get_active_sequence_status(),
            "timeline": self.timeline[:15],
            "active_event": self.active_event,
            "contacts": {
                "contact_1": {
                    "name": settings.EMERGENCY_CONTACT_1_NAME,
                    "masked": settings.EMERGENCY_CONTACT_1[:3] + "******" + settings.EMERGENCY_CONTACT_1[-3:] if len(settings.EMERGENCY_CONTACT_1) > 6 else "***"
                },
                "contact_2": {
                    "name": settings.EMERGENCY_CONTACT_2_NAME,
                    "masked": settings.EMERGENCY_CONTACT_2[:3] + "******" + settings.EMERGENCY_CONTACT_2[-3:] if len(settings.EMERGENCY_CONTACT_2) > 6 else "***"
                }
            }
        }


emergency_service = EmergencyStateMachine()
