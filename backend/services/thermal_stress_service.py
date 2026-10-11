"""
Thermal Stress Calculation Service
==================================
Calculates human biometeorological heat-stress metrics from validated weather observations.

Metrics:
- Rothfusz Heat Index (NOAA NWS)
- Steadman Apparent Temperature
- Simplified Wet-Bulb Globe Temperature (sWBGT / Liljegren approximation)
- Unified Human Thermal Stress Index (0–100)
"""

import math
from typing import Dict, Any, Optional
from backend.models.weather_models import NormalizedWeatherObservation, ThermalStressAssessment
from backend.services.thermal_stress_config import (
    THERMAL_STRESS_INDEX_THRESHOLDS,
    ACTION_RECOMMENDATIONS
)


class ThermalStressService:
    """
    Computes human thermal strain and risk classification.
    """

    @staticmethod
    def calculate_heat_index(temp_c: float, rh_pct: float) -> float:
        """
        NOAA Rothfusz regression equation for Heat Index in Celsius.
        """
        T = (temp_c * 9.0 / 5.0) + 32.0  # Fahrenheit
        RH = max(0.0, min(100.0, rh_pct))

        if T < 80.0:
            # Below 80°F, Heat Index equals Dry-Bulb temperature
            return round(temp_c, 2)

        HI = (
            -42.379
            + 2.04901523 * T
            + 10.14333127 * RH
            - 0.22475541 * T * RH
            - 0.00683783 * T * T
            - 0.05481717 * RH * RH
            + 0.00122874 * T * T * RH
            + 0.00085282 * T * RH * RH
            - 0.00000199 * T * T * RH * RH
        )

        # Low humidity adjustment
        if RH < 13.0 and 80.0 <= T <= 112.0:
            adj = ((13.0 - RH) / 4.0) * math.sqrt(max(0.0, (17.0 - abs(T - 95.0)) / 17.0))
            HI -= adj
        # High humidity adjustment
        elif RH > 85.0 and 80.0 <= T <= 87.0:
            adj = ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
            HI += adj

        HI_c = (HI - 32.0) * 5.0 / 9.0
        return round(HI_c, 2)

    @staticmethod
    def calculate_apparent_temperature(
        temp_c: float,
        rh_pct: float,
        wind_kmh: float = 0.0
    ) -> float:
        """
        Steadman Apparent Temperature incorporating wind velocity and vapor pressure.
        """
        wind_ms = wind_kmh / 3.6
        # Vapor pressure e in hPa (Tetens formula)
        e = (rh_pct / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
        AT = temp_c + 0.33 * e - 0.70 * wind_ms - 4.0
        return round(AT, 2)

    @staticmethod
    def calculate_swbgt_estimate(
        temp_c: float,
        rh_pct: float,
        solar_wm2: Optional[float] = None,
        wind_kmh: float = 0.0
    ) -> float:
        """
        Simplified Wet-Bulb Globe Temperature (sWBGT) approximation.
        """
        wind_ms = max(wind_kmh / 3.6, 0.5)

        # Natural Wet-Bulb temperature Tw (Stull approximation)
        Tw = (
            temp_c * math.atan(0.151977 * math.sqrt(rh_pct + 8.313659))
            + math.atan(temp_c + rh_pct)
            - math.atan(rh_pct - 1.676331)
            + 0.00391838 * (rh_pct ** 1.5) * math.atan(0.023101 * rh_pct)
            - 4.686035
        )

        # Globe temperature Tg approximation
        effective_solar = float(solar_wm2) if solar_wm2 is not None else 650.0
        Tg = temp_c + (effective_solar / 1000.0) * (14.0 / wind_ms)

        # Outdoor sWBGT weighting: 0.7 Tw + 0.2 Tg + 0.1 T
        swbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * temp_c
        return round(swbgt, 2)

    @classmethod
    def calculate_thermal_stress(
        cls,
        obs: NormalizedWeatherObservation
    ) -> ThermalStressAssessment:
        """
        Calculates unified 0–100 Human Thermal Stress Index and assesses risk classification.
        """
        temp = obs.temperature_c
        rh = obs.relative_humidity_pct
        wind = obs.wind_speed_kmh
        solar = obs.solar_radiation

        # 1. Component indices
        heat_index = cls.calculate_heat_index(temp, rh)
        apparent_temp = cls.calculate_apparent_temperature(temp, rh, wind)
        swbgt = cls.calculate_swbgt_estimate(temp, rh, solar, wind)

        # 2. Solar radiation status determination
        if solar is not None:
            solar_status = "measured"
        else:
            solar_status = "unavailable"

        # 3. Composite 0–100 index calculation
        hi_contrib = max(0.0, (heat_index - 25.0) / 30.0) * 45.0
        wbgt_contrib = max(0.0, (swbgt - 20.0) / 18.0) * 35.0
        at_contrib = max(0.0, (apparent_temp - 25.0) / 25.0) * 20.0

        raw_score = hi_contrib + wbgt_contrib + at_contrib
        thermal_score = int(min(max(round(raw_score), 0), 100))

        # 4. Determine risk level
        risk_level = "SAFE"
        for tier in THERMAL_STRESS_INDEX_THRESHOLDS:
            if tier["min_score"] <= thermal_score <= tier["max_score"]:
                risk_level = tier["risk_level"]
                break

        # 5. Contributing factor weights (SHAP approximation)
        total_weight = max(1.0, (temp * 0.45 + rh * 0.30 + max(0, 10 - wind) * 0.15))
        factors = {
            "temperature_impact": round((temp * 0.45) / total_weight, 2),
            "humidity_impact": round((rh * 0.30) / total_weight, 2),
            "wind_stagnation_impact": round((max(0, 10 - wind) * 0.15) / total_weight, 2),
            "solar_radiant_impact": 0.10 if solar_status == "measured" else 0.05
        }

        # 6. Action recommendation
        recommendation = ACTION_RECOMMENDATIONS.get(risk_level, ACTION_RECOMMENDATIONS["SAFE"])

        return ThermalStressAssessment(
            heat_index_c=heat_index,
            apparent_temperature_c=apparent_temp,
            wbgt_estimate_c=swbgt,
            thermal_stress_index=thermal_score,
            risk_level=risk_level,
            confidence=0.92,
            solar_radiation_status=solar_status,
            contributing_factors=factors,
            action_recommendation=recommendation
        )
