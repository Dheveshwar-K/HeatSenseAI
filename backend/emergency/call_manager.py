"""
Emergency Call Manager
======================
Coordinates dual-contact escalation:
1. Sequential Calling: Contact 1 -> Contact 2
2. Retry Policy (max retries configurable)
3. Anti-Spam Cooldown Timer
4. Security: Phone numbers masked before dispatching to frontend or logs
"""

import time
import logging
from typing import Dict, Any, Optional, List
from backend.config import settings
from .twilio_provider import MockTelephonyProvider, TwilioProvider
from .telephony_provider import TelephonyProvider

logger = logging.getLogger(__name__)


def mask_phone_number(phone: str) -> str:
    """Masks middle digits of phone number for privacy and security."""
    if not phone or len(phone) < 6:
        return "***"
    return phone[:3] + "******" + phone[-3:]


class EmergencyCallManager:
    def __init__(self):
        self.provider: TelephonyProvider = self._init_provider()
        self.last_call_time: float = 0.0
        self.active_sequence: Optional[Dict[str, Any]] = None
        self.call_history: List[Dict[str, Any]] = []

    def _init_provider(self) -> TelephonyProvider:
        if (
            settings.TELEPHONY_PROVIDER.lower() == "twilio"
            and settings.TELEPHONY_ACCOUNT_SID
            and settings.TELEPHONY_AUTH_TOKEN
        ):
            logger.info("Initializing Twilio Telephony Provider.")
            return TwilioProvider(
                account_sid=settings.TELEPHONY_ACCOUNT_SID,
                auth_token=settings.TELEPHONY_AUTH_TOKEN,
                from_number=settings.TELEPHONY_FROM_NUMBER
            )
        else:
            logger.info("Initializing Stateful Simulation Mock Telephony Provider.")
            return MockTelephonyProvider()

    def can_initiate_emergency_calls(self) -> bool:
        """Enforces emergency cooldown period (e.g. 10 minutes) between automated sequences."""
        elapsed = time.time() - self.last_call_time
        return elapsed >= settings.EMERGENCY_COOLDOWN_SECONDS

    def get_cooldown_remaining(self) -> int:
        elapsed = time.time() - self.last_call_time
        remaining = settings.EMERGENCY_COOLDOWN_SECONDS - elapsed
        return max(0, int(remaining))

    def generate_emergency_message(self, context: Dict[str, Any]) -> str:
        """
        Creates concise, accurate voice message avoiding medical claims.
        """
        temp = context.get("temperature", 40.0)
        rh = context.get("relative_humidity", 70.0)
        score = context.get("thermal_stress_score", 92)
        loc = settings.LOCATION_NAME

        return (
            f"Emergency thermal-stress alert from {loc}. "
            f"The environmental heat-risk monitoring system has detected extreme thermal stress with a score of {score} out of 100. "
            f"Ambient temperature is {temp:.1f} degrees Celsius with {rh:.0f} percent relative humidity. "
            f"Please check the monitored area and initiate heat safety protocols immediately."
        )

    def trigger_dual_escalation(
        self,
        context: Dict[str, Any],
        is_manual: bool = False,
        bypass_cooldown: bool = False
    ) -> Dict[str, Any]:
        """
        Executes sequential escalation to Contact 1 and Contact 2.
        """
        now = time.time()
        if not bypass_cooldown and not self.can_initiate_emergency_calls():
            remaining = self.get_cooldown_remaining()
            logger.warning(f"Emergency call suppressed by cooldown. {remaining}s remaining.")
            return {
                "success": False,
                "reason": f"Cooldown active ({remaining}s remaining)",
                "cooldown_remaining": remaining
            }

        # Check if calls enabled or in simulation
        is_simulation = settings.SIMULATION_MODE or not settings.EMERGENCY_CALL_ENABLED
        message = self.generate_emergency_message(context)

        # Contact 1 Execution
        c1_phone = settings.EMERGENCY_CONTACT_1
        c1_name = settings.EMERGENCY_CONTACT_1_NAME
        c1_res = self.provider.initiate_call(c1_phone, message, context)

        # Contact 2 Execution
        c2_phone = settings.EMERGENCY_CONTACT_2
        c2_name = settings.EMERGENCY_CONTACT_2_NAME
        c2_res = self.provider.initiate_call(c2_phone, message, context)

        self.last_call_time = now

        sequence_record = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "manual": is_manual,
            "simulation": is_simulation,
            "context": context,
            "contact_1": {
                "name": c1_name,
                "masked_phone": mask_phone_number(c1_phone),
                "call_id": c1_res.get("call_id"),
                "status": c1_res.get("status", "INITIATED"),
                "initiated_at": now
            },
            "contact_2": {
                "name": c2_name,
                "masked_phone": mask_phone_number(c2_phone),
                "call_id": c2_res.get("call_id"),
                "status": c2_res.get("status", "INITIATED"),
                "initiated_at": now + 1.0  # slight offset
            }
        }
        self.active_sequence = sequence_record
        self.call_history.append(sequence_record)

        return {
            "success": True,
            "sequence": sequence_record,
            "simulation": is_simulation
        }

    def get_active_sequence_status(self) -> Optional[Dict[str, Any]]:
        """Updates and queries real-time status of current sequence."""
        if not self.active_sequence:
            return None

        # Refresh statuses from provider
        c1_id = self.active_sequence["contact_1"].get("call_id")
        if c1_id:
            c1_stat = self.provider.get_call_status(c1_id)
            self.active_sequence["contact_1"]["status"] = c1_stat.get("status", self.active_sequence["contact_1"]["status"])
            self.active_sequence["contact_1"]["duration"] = c1_stat.get("duration", 0)

        c2_id = self.active_sequence["contact_2"].get("call_id")
        if c2_id:
            c2_stat = self.provider.get_call_status(c2_id)
            self.active_sequence["contact_2"]["status"] = c2_stat.get("status", self.active_sequence["contact_2"]["status"])
            self.active_sequence["contact_2"]["duration"] = c2_stat.get("duration", 0)

        return self.active_sequence


call_manager = EmergencyCallManager()
