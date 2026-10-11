"""
Telephony Provider Interface Abstraction
=======================================
Defines the abstract interface for initiating automated phone calls,
querying call status, and terminating calls.
Allows pluggable providers (Twilio, AWS Connect, Infobip, Mock).
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class TelephonyProvider(ABC):
    @abstractmethod
    def initiate_call(self, to_number: str, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Initiates an automated voice phone call to the recipient.
        :param to_number: E.164 formatted phone number.
        :param message: Voice message text to be converted to speech (TTS).
        :param context: Optional diagnostic payload.
        :return: Dict containing call_id, status ('queued' | 'initiated' | 'failed'), and provider info.
        """
        pass

    @abstractmethod
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Retrieves real-time status of an active or past call.
        """
        pass

    @abstractmethod
    def cancel_call(self, call_id: str) -> bool:
        """
        Cancels an in-progress or queued call.
        """
        pass
