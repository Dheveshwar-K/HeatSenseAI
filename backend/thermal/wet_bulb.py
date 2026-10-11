"""
Wet-Bulb Temperature Calculation
===============================
Calculates the thermodynamic wet-bulb temperature (Tw in °C) using Stull's (2011)
accurate empirical psychrometric formula.
Reference: Stull, R. (2011). Wet-Bulb Temperature from Relative Humidity and Air Temperature.
Journal of Applied Meteorology and Climatology, 50(11), 2267-2269.
"""

import math


def calculate_wet_bulb_temperature(temp_c: float, rh: float) -> float:
    """
    Computes Tw (°C) given dry bulb temperature T (°C) and relative humidity RH (%).
    Accurate to within 1°C over range: -20°C to 50°C and 5% to 99% RH.
    """
    t = float(temp_c)
    rh = max(1.0, min(100.0, float(rh)))

    term1 = t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
    term2 = math.atan(t + rh)
    term3 = -math.atan(rh - 1.676331)
    term4 = 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
    term5 = -4.686035

    tw = term1 + term2 + term3 + term4 + term5
    return round(tw, 2)
