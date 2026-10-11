"""
Weather Validation & Quality Control Service
============================================
Enforces physical plausibility bounds, thermodynamic sanity checks,
data age calculation, and Personal Weather Station quality assurance.

Prevents sensor calibration drift, communication freezes, or corrupted packets
from silently poisoning human thermal stress early warning predictions.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Tuple, List, Optional
import math


class WeatherValidator:
    """
    Validates meteorological observations against physical limits and quality standards.
    """

    # Physical meteorological plausibility thresholds
    MIN_TEMP_C: float = -50.0
    MAX_TEMP_C: float = 60.0

    MIN_RH_PCT: float = 0.0
    MAX_RH_PCT: float = 100.0

    MIN_PRESSURE_HPA: float = 850.0
    MAX_PRESSURE_HPA: float = 1100.0

    MIN_WIND_KMH: float = 0.0
    MAX_WIND_KMH: float = 300.0

    MIN_SOLAR_WM2: float = 0.0
    MAX_SOLAR_WM2: float = 1500.0

    # Freshness boundaries in seconds
    FRESH_THRESHOLD_SECONDS: int = 300   # 5 minutes
    STALE_THRESHOLD_SECONDS: int = 900   # 15 minutes

    @classmethod
    def calculate_data_age(cls, timestamp_utc: str) -> int:
        """
        Calculates observation age in seconds relative to current UTC time.
        """
        now = datetime.now(timezone.utc)
        try:
            # Handle ISO formats with or without Z
            cleaned_ts = timestamp_utc.replace("Z", "+00:00")
            obs_dt = datetime.fromisoformat(cleaned_ts)
            if obs_dt.tzinfo is None:
                obs_dt = obs_dt.replace(tzinfo=timezone.utc)
            age = int((now - obs_dt).total_seconds())
            return max(0, age)
        except Exception:
            return 0

    @classmethod
    def determine_freshness_status(cls, data_age_seconds: int) -> str:
        """
        Returns categorical freshness grade: FRESH, AGING, or STALE.
        """
        if data_age_seconds < cls.FRESH_THRESHOLD_SECONDS:
            return "FRESH"
        elif data_age_seconds < cls.STALE_THRESHOLD_SECONDS:
            return "AGING"
        else:
            return "STALE"

    @classmethod
    def validate_observation(
        cls,
        obs: Dict[str, Any],
        max_age_seconds: int = 900
    ) -> Tuple[bool, str, List[str]]:
        """
        Validates a normalized weather observation.

        Returns:
            (is_valid: bool, quality_status: str, rejection_reasons: List[str])
        """
        rejection_reasons = []

        # 1. Missing mandatory parameter checks
        mandatory_fields = ["temperature_c", "relative_humidity_pct", "pressure_hpa"]
        for field in mandatory_fields:
            if obs.get(field) is None:
                rejection_reasons.append(f"Missing mandatory meteorological parameter: {field}")

        if rejection_reasons:
            return False, "INVALID", rejection_reasons

        temp = float(obs["temperature_c"])
        rh = float(obs["relative_humidity_pct"])
        pressure = float(obs["pressure_hpa"])
        wind = float(obs.get("wind_speed_kmh", 0.0))
        dew = obs.get("dew_point_c")
        solar = obs.get("solar_radiation")

        # 2. Temperature physical boundaries
        if not (cls.MIN_TEMP_C <= temp <= cls.MAX_TEMP_C):
            rejection_reasons.append(
                f"Air temperature ({temp}°C) exceeds physically plausible range [{cls.MIN_TEMP_C}, {cls.MAX_TEMP_C}°C]"
            )

        # 3. Relative humidity boundaries
        if not (cls.MIN_RH_PCT <= rh <= cls.MAX_RH_PCT):
            rejection_reasons.append(
                f"Relative humidity ({rh}%) exceeds physical range [{cls.MIN_RH_PCT}, {cls.MAX_RH_PCT}%]"
            )

        # 4. Barometric pressure boundaries
        if not (cls.MIN_PRESSURE_HPA <= pressure <= cls.MAX_PRESSURE_HPA):
            rejection_reasons.append(
                f"Barometric pressure ({pressure} hPa) exceeds physical range [{cls.MIN_PRESSURE_HPA}, {cls.MAX_PRESSURE_HPA} hPa]"
            )

        # 5. Wind velocity boundaries
        if not (cls.MIN_WIND_KMH <= wind <= cls.MAX_WIND_KMH):
            rejection_reasons.append(
                f"Wind speed ({wind} km/h) exceeds physical limit [{cls.MIN_WIND_KMH}, {cls.MAX_WIND_KMH} km/h]"
            )

        # 6. Solar radiation boundaries (if measured)
        if solar is not None and not (cls.MIN_SOLAR_WM2 <= float(solar) <= cls.MAX_SOLAR_WM2):
            rejection_reasons.append(
                f"Solar radiation ({solar} W/m²) exceeds terrestrial insolation limit [{cls.MIN_SOLAR_WM2}, {cls.MAX_SOLAR_WM2} W/m²]"
            )

        # 7. Thermodynamic dew point constraint: Dew point cannot exceed dry-bulb temperature (+0.5°C margin)
        if dew is not None:
            dew_val = float(dew)
            if dew_val > (temp + 0.5):
                rejection_reasons.append(
                    f"Thermodynamic violation: Dew point ({dew_val}°C) cannot exceed dry-bulb air temperature ({temp}°C)"
                )

        # 8. Observation age & staleness check
        age_seconds = obs.get("data_age_seconds", 0)
        freshness = cls.determine_freshness_status(age_seconds)

        if age_seconds > max_age_seconds:
            rejection_reasons.append(
                f"Observation is stale (Age: {age_seconds}s > configured limit: {max_age_seconds}s)"
            )

        # Final validity determination
        is_valid = len(rejection_reasons) == 0
        quality_status = freshness if is_valid else "INVALID"

        return is_valid, quality_status, rejection_reasons
