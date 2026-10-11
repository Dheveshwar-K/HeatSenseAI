"""
Simplified Wet Bulb Globe Temperature (sWBGT) Calculation
=========================================================
Calculates the simplified WBGT developed by the Australian Bureau of Meteorology (BOM)
and endorsed by the American College of Sports Medicine (ACSM).
Reference: Bureau of Meteorology (BOM) Thermal Comfort Guidance.
"""

import math


def calculate_vapor_pressure(temp_c: float, rh: float) -> float:
    """
    Computes ambient water vapor pressure (e) in hPa (millibars) using the Magnus-Tetens formula.
    """
    rh_frac = max(0.0, min(100.0, float(rh))) / 100.0
    es = 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    e = rh_frac * es
    return round(e, 3)


def calculate_simplified_wbgt(temp_c: float, rh: float, wind_speed_ms: float = 1.0) -> float:
    """
    Calculates sWBGT in °C:
    sWBGT = 0.567 * Ta + 0.393 * e + 3.94

    A slight convective wind ventilation adjustment can also be applied:
    Higher wind speeds accelerate evaporative cooling, attenuating thermal stress.
    """
    e = calculate_vapor_pressure(temp_c, rh)
    swbgt = 0.567 * temp_c + 0.393 * e + 3.94

    # Wind ventilation attenuation: small reduction for breezy conditions (wind > 1.5 m/s)
    if wind_speed_ms > 1.5:
        wind_cooling = min(2.5, 0.45 * math.log(wind_speed_ms))
        swbgt -= wind_cooling

    return round(swbgt, 2)
