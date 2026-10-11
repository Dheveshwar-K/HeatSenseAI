"""
Comprehensive Human Thermal Stress Index & Explainability Engine
================================================================
Calculates:
1. Explainable Thermal Stress Score (0 - 100)
2. Risk Categories: LOW, MODERATE, HIGH, VERY HIGH, EXTREME
3. Factor contributions breakdown (temperature, humidity, dew point, solar, wind)
4. Dynamic "Why am I at risk?" human-readable reasoning
5. Heatwave Status detection (NORMAL, WATCH, WARNING, SEVERE)
"""

from typing import Dict, Any, List
from .heat_index import calculate_heat_index
from .wet_bulb import calculate_wet_bulb_temperature
from .wbgt import calculate_simplified_wbgt
from .utci import calculate_apparent_temperature


def get_risk_category(score: float) -> str:
    """
    Standard engineering category thresholds:
    0-20: LOW
    21-40: MODERATE
    41-60: HIGH
    61-80: VERY HIGH
    81-100: EXTREME
    """
    if score <= 20.0:
        return "LOW"
    elif score <= 40.0:
        return "MODERATE"
    elif score <= 60.0:
        return "HIGH"
    elif score <= 80.0:
        return "VERY HIGH"
    else:
        return "EXTREME"


def compute_thermal_stress_score(
    temp_c: float,
    rh: float,
    dew_point_c: float,
    wind_speed_ms: float = 1.5,
    solar_radiation_wm2: float = 0.0,
    rolling_24h_mean_temp: float = 20.0
) -> Dict[str, Any]:
    """
    Calculates a multi-factorial 0-100 human thermal stress score based on
    ambient temperature, humidity load, wet-bulb evaporative limit, solar flux,
    and wind convective cooling.
    """
    hi = calculate_heat_index(temp_c, rh)
    tw = calculate_wet_bulb_temperature(temp_c, rh)
    swbgt = calculate_simplified_wbgt(temp_c, rh, wind_speed_ms)
    at = calculate_apparent_temperature(temp_c, rh, wind_speed_ms)

    # 1. Base thermal load component (45% weight)
    # Temperature scale: 15°C -> 0 score, 45°C -> 100 score
    temp_load = max(0.0, min(100.0, (temp_c - 15.0) / (45.0 - 15.0) * 100.0))

    # 2. Humidity & Dew Point load component (25% weight)
    # Dew point > 18°C is oppressive; 28°C is near physiological evaporative failure
    dp_load = max(0.0, min(100.0, (dew_point_c - 10.0) / (28.0 - 10.0) * 100.0))

    # 3. Wet-bulb physiological threshold component (20% weight)
    # Tw > 28°C is dangerous; Tw >= 35°C is theoretical human survival limit
    tw_load = max(0.0, min(100.0, (tw - 16.0) / (32.0 - 16.0) * 100.0))

    # 4. Solar radiation load component (10% weight)
    # 0 to 1000 W/m²
    solar_load = max(0.0, min(100.0, (solar_radiation_wm2 / 1000.0) * 100.0))

    # 5. Wind convective cooling attenuation (negative modifier, up to -15 points)
    # High wind helps sweat evaporation below skin temp (~35°C)
    if temp_c < 35.0:
        wind_cooling = min(15.0, wind_speed_ms * 3.0)
    else:
        # Above skin temperature, strong dry wind can actually add convective heat
        wind_cooling = -min(5.0, wind_speed_ms * 1.0)

    # 6. Nighttime heatwave stagnation bonus (+5 to +10 if rolling 24h temp is high)
    night_stagnation_bonus = 0.0
    if rolling_24h_mean_temp >= 25.0:
        night_stagnation_bonus = min(10.0, (rolling_24h_mean_temp - 25.0) * 2.0)

    raw_score = (
        (0.40 * temp_load)
        + (0.25 * dp_load)
        + (0.25 * tw_load)
        + (0.10 * solar_load)
        - wind_cooling
        + night_stagnation_bonus
    )

    score = round(max(0.0, min(100.0, raw_score)), 1)
    category = get_risk_category(score)

    # Risk Contributors breakdown (relative percentages / points)
    contributors = {
        "temperature": {
            "score_points": round(0.40 * temp_load, 1),
            "percentage": 40,
            "status": "CRITICAL" if temp_c >= 40 else "HIGH" if temp_c >= 35 else "MODERATE" if temp_c >= 28 else "NORMAL",
            "current_value": f"{temp_c:.1f} °C",
            "explanation": "High ambient temperature increases sensible heat transfer to the body."
        },
        "humidity": {
            "score_points": round(0.25 * dp_load, 1),
            "percentage": 25,
            "status": "CRITICAL" if rh >= 75 and temp_c >= 30 else "ELEVATED" if rh >= 60 else "NORMAL",
            "current_value": f"{rh:.0f} %",
            "explanation": "High humidity inhibits perspiration and reduces the body's natural evaporative cooling."
        },
        "dew_point": {
            "score_points": round(0.25 * tw_load, 1),
            "percentage": 20,
            "status": "DANGEROUS" if dew_point_c >= 24 else "OPPRESSIVE" if dew_point_c >= 20 else "NORMAL",
            "current_value": f"{dew_point_c:.1f} °C",
            "explanation": "Dew point directly measures atmospheric moisture content and physiological mugginess."
        },
        "solar_radiation": {
            "score_points": round(0.10 * solar_load, 1),
            "percentage": 10,
            "status": "INTENSE" if solar_radiation_wm2 >= 700 else "MODERATE" if solar_radiation_wm2 >= 300 else "LOW",
            "current_value": f"{solar_radiation_wm2:.0f} W/m²",
            "explanation": "Shortwave solar radiation adds direct radiative heat flux to exposed skin."
        },
        "wind_cooling": {
            "score_points": round(-wind_cooling, 1),
            "percentage": 5,
            "status": "STAGNANT" if wind_speed_ms < 1.0 else "FAVORABLE" if wind_speed_ms >= 3.0 else "LIGHT",
            "current_value": f"{wind_speed_ms:.1f} m/s",
            "explanation": "Air movement facilitates evaporative heat loss when air is below skin temperature."
        }
    }

    # "Why am I at risk?" explanations
    reasons: List[str] = []
    if temp_c >= 38.0:
        reasons.append("Air temperature is extremely elevated (>38°C).")
    elif temp_c >= 32.0:
        reasons.append("Air temperature is elevated (>32°C).")

    if rh >= 65.0:
        reasons.append("Relative humidity is high, severely restricting evaporative sweat cooling.")

    if dew_point_c >= 20.0:
        reasons.append(f"Dew point is high ({dew_point_c:.1f}°C), causing heavy atmospheric moisture load.")

    if wind_speed_ms < 1.5:
        reasons.append("Wind is nearly stagnant (<1.5 m/s), reducing convective heat dissipation.")

    if solar_radiation_wm2 >= 500.0:
        reasons.append(f"Strong solar irradiance ({solar_radiation_wm2:.0f} W/m²) increases radiant heat absorption.")

    if tw >= 26.0:
        reasons.append(f"Wet-bulb temperature is elevated ({tw:.1f}°C), reducing the temperature differential for heat loss.")

    if not reasons:
        reasons.append("Environmental parameters are currently within normal baseline thermal comfort ranges.")

    # Heatwave status assessment
    # Standard meteorological criteria:
    # NORMAL: max < 30°C
    # WATCH: max >= 32°C or 24h mean >= 24°C
    # WARNING: max >= 36°C or 24h mean >= 27°C
    # SEVERE: max >= 40°C or 24h mean >= 30°C
    if temp_c >= 40.0 or rolling_24h_mean_temp >= 30.0:
        hw_status = "SEVERE"
    elif temp_c >= 36.0 or rolling_24h_mean_temp >= 27.0:
        hw_status = "WARNING"
    elif temp_c >= 31.0 or rolling_24h_mean_temp >= 24.0:
        hw_status = "WATCH"
    else:
        hw_status = "NORMAL"

    return {
        "thermal_stress_score": score,
        "risk_category": category,
        "heat_index": hi,
        "wet_bulb_temperature": tw,
        "simplified_wbgt": swbgt,
        "apparent_temperature": at,
        "heatwave_status": hw_status,
        "contributors": contributors,
        "risk_reasons": reasons,
        "is_warning": score >= 60.0,
        "is_extreme": score >= 80.0,
        "is_emergency": score >= 90.0
    }
