"""
Configuration Management
========================
Loads system settings, security credentials, thresholds, and contact information.
Sensitive phone numbers and credentials are kept strictly server-side.
"""

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    # App Settings
    APP_NAME: str = "EXTREME HEATWAVE EARLY WARNING & HUMAN THERMAL STRESS INDEX"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./heatwave_system.db")

    # The Weather Company (TWC) API Configuration
    WEATHER_COMPANY_API_KEY: str = os.getenv("WEATHER_COMPANY_API_KEY", "")
    WEATHER_REQUEST_TIMEOUT: int = int(os.getenv("WEATHER_REQUEST_TIMEOUT", "10"))
    WEATHER_REFRESH_SECONDS: int = int(os.getenv("WEATHER_REFRESH_SECONDS", "60"))
    WEATHER_MAX_DATA_AGE_SECONDS: int = int(os.getenv("WEATHER_MAX_DATA_AGE_SECONDS", "900"))  # 15 minutes
    TWC_BASE_URL: str = os.getenv("TWC_BASE_URL", "https://api.weather.com")
    MOCK_WEATHER: bool = os.getenv("MOCK_WEATHER", "false").lower() == "true"

    # Default Reference Location (Coimbatore Microclimate Hub)
    LOCATION_NAME: str = "Central Heat Monitoring Station - Urban Zone Alpha"
    LATITUDE: float = float(os.getenv("LATITUDE", "11.0168"))
    LONGITUDE: float = float(os.getenv("LONGITUDE", "76.9558"))

    # Emergency State Machine Thresholds (Configurable)
    THERMAL_WATCH_THRESHOLD: float = 40.0
    THERMAL_WARNING_THRESHOLD: float = 60.0
    THERMAL_EXTREME_THRESHOLD: float = 80.0
    THERMAL_RECOVERY_THRESHOLD: float = 85.0
    THERMAL_EMERGENCY_THRESHOLD: float = 90.0
    EMERGENCY_THRESHOLD: float = 90.0
    RECOVERY_THRESHOLD: float = 85.0

    # Persistence requirements to prevent noisy sensor false alarms
    EMERGENCY_PERSISTENCE_SECONDS: int = 60
    EMERGENCY_COOLDOWN_SECONDS: int = 600  # 10 minutes

    # Telephony & Contacts (Stored strictly in backend .env)
    EMERGENCY_CONTACT_1: str = os.getenv("EMERGENCY_CONTACT_1", "+919876543210")
    EMERGENCY_CONTACT_1_NAME: str = os.getenv("EMERGENCY_CONTACT_1_NAME", "Dr. A. Sharma (On-Duty Clinician)")
    EMERGENCY_CONTACT_2: str = os.getenv("EMERGENCY_CONTACT_2", "+919876543211")
    EMERGENCY_CONTACT_2_NAME: str = os.getenv("EMERGENCY_CONTACT_2_NAME", "Emergency Response Team Dispatch")

    # Telephony Provider Options: 'mock', 'twilio'
    TELEPHONY_PROVIDER: str = os.getenv("TELEPHONY_PROVIDER", "mock")
    TELEPHONY_ACCOUNT_SID: str = os.getenv("TELEPHONY_ACCOUNT_SID", "")
    TELEPHONY_AUTH_TOKEN: str = os.getenv("TELEPHONY_AUTH_TOKEN", "")
    TELEPHONY_FROM_NUMBER: str = os.getenv("TELEPHONY_FROM_NUMBER", "")

    # Enable automated calling (set to false by default for safety until explicitly confirmed)
    TELEPHONY_ENABLED: bool = os.getenv("TELEPHONY_ENABLED", "false").lower() == "true"
    EMERGENCY_CALL_ENABLED: bool = os.getenv("EMERGENCY_CALL_ENABLED", os.getenv("TELEPHONY_ENABLED", "false")).lower() == "true"
    MAX_CALL_RETRIES: int = 2

    # Simulation / Safe Test Mode
    SIMULATION_MODE: bool = os.getenv("SIMULATION_MODE", "true").lower() == "true"


settings = Settings()
