"""
Thermal Stress Scientific Configuration & Thresholds
====================================================
Formal biometeorological boundaries and citations for human heat risk classification.

References:
- NOAA National Weather Service (NWS) Heat Index Equation (Rothfusz, 1990)
- ISO 7243:2017 Ergonomics of the thermal environment — Assessment of heat stress using WBGT
- Steadman, R.G. (1979) The Assessment of Sultriness. Part I & II. J. Appl. Meteor.
- Liljegren et al. (2008) Modeling the Wet Bulb Globe Temperature Using Standard Meteorological Observations
"""

from typing import Dict, Any

# NOAA Heat Index Risk Classification (in Celsius)
HEAT_INDEX_THRESHOLDS = {
    "NORMAL": {"min": -50.0, "max": 27.0, "label": "Normal / No Risk"},
    "CAUTION": {"min": 27.0, "max": 32.0, "label": "Caution — Fatigue possible with prolonged exposure"},
    "EXTREME_CAUTION": {"min": 32.0, "max": 39.0, "label": "Extreme Caution — Heat cramps and heat exhaustion possible"},
    "DANGER": {"min": 39.0, "max": 51.0, "label": "Danger — Heat cramps or exhaustion likely; heat stroke possible"},
    "EXTREME_DANGER": {"min": 51.0, "max": 100.0, "label": "Extreme Danger — Heat stroke imminent with continued exposure"}
}

# ISO 7243 Wet-Bulb Globe Temperature (WBGT in °C) for Standard Occupational Activity
WBGT_THRESHOLDS = {
    "LOW": {"max": 27.9, "label": "Low Risk — Normal physical work permitted"},
    "MODERATE": {"min": 28.0, "max": 29.9, "label": "Moderate Risk — 45 min work / 15 min rest per hour"},
    "HIGH": {"min": 30.0, "max": 31.9, "label": "High Risk — 30 min work / 30 min rest per hour"},
    "VERY_HIGH": {"min": 32.0, "max": 33.9, "label": "Very High Risk — 15 min work / 45 min rest per hour"},
    "EXTREME": {"min": 34.0, "max": 60.0, "label": "Extreme Danger — Cease non-essential physical exertion"}
}

# Project Human Thermal Stress Index (0–100 Scale)
THERMAL_STRESS_INDEX_THRESHOLDS = [
    {"min_score": 0, "max_score": 39, "risk_level": "SAFE", "color": "#00e676", "badge": "badge-low"},
    {"min_score": 40, "max_score": 59, "risk_level": "MODERATE", "color": "#ffab00", "badge": "badge-moderate"},
    {"min_score": 60, "max_score": 79, "risk_level": "HIGH", "color": "#ff6d00", "badge": "badge-high"},
    {"min_score": 80, "max_score": 89, "risk_level": "VERY_HIGH", "color": "#ff3d00", "badge": "badge-very-high"},
    {"min_score": 90, "max_score": 100, "risk_level": "EXTREME", "color": "#ff1744", "badge": "badge-extreme"}
]

# Action Recommendations by Risk Level
ACTION_RECOMMENDATIONS = {
    "SAFE": "Atmospheric conditions are within normal biological thermoregulatory tolerance. Standard hydration is sufficient.",
    "MODERATE": "Elevated apparent warmth. Hydrate with 250 mL water per hour during active outdoor work. Seek periodic shade.",
    "HIGH": "Significant human thermal load. Implement mandatory 15-min shaded rest breaks per hour. Enforce electrolyte replenishment.",
    "VERY_HIGH": "Severe heat strain. Reduce outdoor exposure by 50%. Check vulnerable populations (elderly, children). Prepare emergency cooling stations.",
    "EXTREME": "CRITICAL LIFE-SAFETY ALERT. Imminent risk of heat syncope and cellular heat stroke. Suspend outdoor labor, relocate to air-conditioned shelter, and initiate emergency monitoring."
}
