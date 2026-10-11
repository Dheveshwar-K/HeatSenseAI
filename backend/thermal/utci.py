"""
Apparent Temperature & Thermal Discomfort Indices
================================================
Calculates Australian Apparent Temperature (AT) and Humidex.
"""

import math
from .wbgt import calculate_vapor_pressure


def calculate_apparent_temperature(temp_c: float, rh: float, wind_speed_ms: float = 1.0) -> float:
    """
    Australian Bureau of Meteorology Apparent Temperature formula:
    AT = Ta + 0.33 * e - 0.70 * v - 4.00
    where Ta is dry bulb temp (°C), e is vapor pressure (hPa), v is wind speed at 10m (m/s).
    """
    e = calculate_vapor_pressure(temp_c, rh)
    at = temp_c + (0.33 * e) - (0.70 * wind_speed_ms) - 4.00
    return round(at, 2)


def calculate_humidex(temp_c: float, rh: float) -> float:
    """
    Canadian Humidex formula:
    Humidex = Ta + (5/9) * (e - 10)
    """
    e = calculate_vapor_pressure(temp_c, rh)
    h = temp_c + (5.0 / 9.0) * (e - 10.0)
    return round(h, 2)
