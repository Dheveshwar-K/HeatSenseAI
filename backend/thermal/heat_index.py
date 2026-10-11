"""
NOAA Steadman / Rothfusz Heat Index Calculation
==============================================
Calculates the apparent temperature (Heat Index in °C) felt by the human body
by combining dry-bulb ambient temperature and relative humidity.
Formula reference: National Weather Service (NWS) Technical Attachment (SR 90-23).
"""

import math
from typing import Union
import numpy as np


def celsius_to_fahrenheit(tc: Union[float, np.ndarray]) -> Union[float, np.ndarray]:
    return (tc * 9.0 / 5.0) + 32.0


def fahrenheit_to_celsius(tf: Union[float, np.ndarray]) -> Union[float, np.ndarray]:
    return (tf - 32.0) * 5.0 / 9.0


def calculate_heat_index(temp_c: float, rh: float) -> float:
    """
    Computes Heat Index in Celsius using the full NOAA NWS equation with Rothfusz regression
    and low/high relative humidity adjustments.

    :param temp_c: Ambient dry-bulb temperature in Celsius
    :param rh: Relative humidity in percent (0 - 100)
    :return: Heat Index in Celsius
    """
    if rh < 0:
        rh = 0.0
    elif rh > 100:
        rh = 100.0

    tf = celsius_to_fahrenheit(temp_c)

    # Below 80°F (~26.7°C), Steadman's simple formula applies
    if tf < 80.0:
        hi_simple = 0.5 * (tf + 61.0 + ((tf - 68.0) * 1.2) + (rh * 0.094))
        hi_val = (hi_simple + tf) / 2.0
        return round(fahrenheit_to_celsius(hi_val), 2)

    # Full Rothfusz regression equation
    c1 = -42.379
    c2 = 2.04901523
    c3 = 10.14333127
    c4 = -0.22475541
    c5 = -0.00683783
    c6 = -0.05481717
    c7 = 0.00122874
    c8 = 0.00085282
    c9 = -0.00000199

    hi = (
        c1
        + (c2 * tf)
        + (c3 * rh)
        + (c4 * tf * rh)
        + (c5 * (tf**2))
        + (c6 * (rh**2))
        + (c7 * (tf**2) * rh)
        + (c8 * tf * (rh**2))
        + (c9 * (tf**2) * (rh**2))
    )

    # Adjustment for low humidity: RH < 13% and 80 <= tf <= 112
    if rh < 13.0 and 80.0 <= tf <= 112.0:
        adj = ((13.0 - rh) / 4.0) * math.sqrt(max(0.0, (17.0 - abs(tf - 95.0)) / 17.0))
        hi -= adj

    # Adjustment for high humidity: RH > 85% and 80 <= tf <= 87
    elif rh > 85.0 and 80.0 <= tf <= 87.0:
        adj = ((rh - 85.0) / 10.0) * ((87.0 - tf) / 5.0)
        hi += adj

    return round(fahrenheit_to_celsius(hi), 2)
