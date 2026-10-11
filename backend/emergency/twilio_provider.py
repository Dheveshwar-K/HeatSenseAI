"""
Telephony Provider Implementations
=================================
Includes:
1. MockTelephonyProvider: Realistic stateful telephony simulator for testing and demonstrations.
2. TwilioProvider: Production Twilio REST API client.
"""

import time
import uuid
import logging
from typing import Dict, Any, Optional
from urllib.parse import urlencode
import urllib.request
import base64
import json

from .telephony_provider import TelephonyProvider

logger = logging.getLogger(__name__)


class MockTelephonyProvider(TelephonyProvider):
    """
    Simulation provider for presentations, tests, and non-configured environments.
    Simulates realistic call progression without making unconfigured outbound telco calls.
    """
    def __init__(self):
        self.calls: Dict[str, Dict[str, Any]] = {}

    def initiate_call(self, to_number: str, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        call_id = f"CA_mock_{uuid.uuid4().hex[:12]}"
        now = time.time()
        masked = to_number[:3] + "******" + to_number[-4:] if len(to_number) > 7 else "***"

        logger.info(f"[SIMULATOR] Initiating automated call to {masked}: {message[:60]}...")
        call_record = {
            "call_id": call_id,
            "to_number_masked": masked,
            "status": "INITIATED",
            "start_time": now,
            "message": message,
            "provider": "MockTelephonyProvider (Simulation)",
            "context": context or {}
        }
        self.calls[call_id] = call_record
        return {
            "success": True,
            "call_id": call_id,
            "status": "INITIATED",
            "provider": "mock",
            "phone_masked": masked
        }

    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        if call_id not in self.calls:
            return {"call_id": call_id, "status": "UNKNOWN", "duration": 0}

        record = self.calls[call_id]
        elapsed = time.time() - record["start_time"]

        # Realistic progression:
        # 0 - 3s: INITIATED / RINGING
        # 3 - 12s: CONNECTED
        # > 12s: COMPLETED
        if elapsed < 3.0:
            status = "RINGING"
        elif elapsed < 12.0:
            status = "CONNECTED"
        else:
            status = "COMPLETED"

        record["status"] = status
        record["duration"] = int(elapsed)
        return record

    def cancel_call(self, call_id: str) -> bool:
        if call_id in self.calls:
            self.calls[call_id]["status"] = "CANCELED"
            return True
        return False


class TwilioProvider(TelephonyProvider):
    """
    Production-grade Twilio Telephony Integration.
    Uses standard HTTPS REST API to dispatch text-to-speech calls via TwiML.
    """
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Calls.json"

    def initiate_call(self, to_number: str, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.account_sid or not self.auth_token or not self.from_number:
            logger.error("Twilio credentials not configured. Cannot dispatch real call.")
            return {"success": False, "error": "Twilio credentials missing", "status": "FAILED"}

        # Construct concise TwiML say instruction
        twiml = f"<Response><Say voice='alice'>{message}</Say></Response>"
        data = {
            "To": to_number,
            "From": self.from_number,
            "Twiml": twiml
        }
        encoded_data = urlencode(data).encode("utf-8")

        auth_str = f"{self.account_sid}:{self.auth_token}"
        auth_header = "Basic " + base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

        req = urllib.request.Request(self.base_url, data=encoded_data, method="POST")
        req.add_header("Authorization", auth_header)
        req.add_header("Content-Type", "application/x-www-form-urlencoded")

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                call_id = res_body.get("sid")
                status = res_body.get("status", "queued")
                logger.info(f"Twilio call dispatched successfully: SID={call_id}")
                return {"success": True, "call_id": call_id, "status": status, "provider": "twilio"}
        except Exception as e:
            logger.error(f"Twilio call error: {e}")
            return {"success": False, "error": str(e), "status": "FAILED"}

    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Calls/{call_id}.json"
        auth_str = f"{self.account_sid}:{self.auth_token}"
        auth_header = "Basic " + base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

        req = urllib.request.Request(url, method="GET")
        req.add_header("Authorization", auth_header)

        try:
            with urllib.request.urlopen(req, timeout=8) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                return {
                    "call_id": call_id,
                    "status": res_body.get("status", "unknown").upper(),
                    "duration": int(res_body.get("duration", 0) or 0)
                }
        except Exception as e:
            return {"call_id": call_id, "status": "UNKNOWN", "error": str(e)}

    def cancel_call(self, call_id: str) -> bool:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Calls/{call_id}.json"
        auth_str = f"{self.account_sid}:{self.auth_token}"
        auth_header = "Basic " + base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
        data = urlencode({"Status": "completed"}).encode("utf-8")

        req = urllib.request.Request(url, data=data, method="POST")
        req.add_header("Authorization", auth_header)
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status == 200
        except Exception:
            return False
