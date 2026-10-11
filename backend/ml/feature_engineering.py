"""
Feature Engineering Pipeline
===========================
Generates derived meteorological and thermal features:
1. Cyclical temporal variables (hour sine/cosine, day of year)
2. Rates of change (temperature and humidity delta)
3. Backward rolling statistics (3h, 6h, 24h rolling means)
4. Solar radiation estimation proxy from solar geometry and cloud cover
5. Thermal indices (Heat Index, Wet Bulb, sWBGT, Apparent Temperature)
6. Derived target generation for proxy ML model
"""

import math
import numpy as np
import pandas as pd
from typing import Tuple
from backend.thermal.thermal_score import compute_thermal_stress_score


def estimate_solar_radiation(hour: int, day_of_year: int, cloud_cover_pct: float, lat: float = 52.55) -> float:
    """
    Estimates solar irradiance (W/m²) using solar elevation geometry modulated by cloud cover.
    """
    # Approximate solar declination
    declination = 23.45 * math.sin(math.radians(360 / 365 * (day_of_year - 81)))
    # Hour angle (12 is solar noon = 0°)
    hour_angle = 15.0 * (hour - 12.0)

    # Solar elevation angle (alpha)
    lat_rad = math.radians(lat)
    dec_rad = math.radians(declination)
    ha_rad = math.radians(hour_angle)

    sin_alpha = (math.sin(lat_rad) * math.sin(dec_rad)) + (math.cos(lat_rad) * math.cos(dec_rad) * math.cos(ha_rad))
    if sin_alpha <= 0:
        return 0.0

    # Solar constant on clear sky surface ~ 1000 W/m²
    clear_sky_g = 1000.0 * sin_alpha
    # Kasten and Czeplak cloud attenuation formula
    cloud_frac = max(0.0, min(1.0, cloud_cover_pct / 100.0))
    transmittance = 1.0 - (0.75 * (cloud_frac ** 3))
    return round(max(0.0, clear_sky_g * transmittance), 1)


def generate_features(df_clean: pd.DataFrame, lat: float = 52.55) -> pd.DataFrame:
    """
    Applies comprehensive feature engineering to hourly weather dataframe.
    """
    df = df_clean.copy()
    if not np.issubdtype(df["timestamp"].dtype, np.datetime64):
        df["timestamp"] = pd.to_datetime(df["timestamp"])

    df.sort_values("timestamp", inplace=True)
    df.reset_index(drop=True, inplace=True)

    # 1. Temporal cyclical features
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_year"] = df["timestamp"].dt.dayofyear
    df["sin_hour"] = np.sin(2 * np.pi * df["hour"] / 24.0)
    df["cos_hour"] = np.cos(2 * np.pi * df["hour"] / 24.0)

    # 2. Rate of change features (1-hour difference)
    df["temp_rate_of_change"] = df["temperature"].diff().fillna(0.0).round(2)
    df["humidity_rate_of_change"] = df["relative_humidity"].diff().fillna(0.0).round(2)

    # 3. Rolling backward statistics (no look-ahead leakage)
    df["rolling_temp_3h"] = df["temperature"].rolling(window=3, min_periods=1).mean().round(2)
    df["rolling_temp_6h"] = df["temperature"].rolling(window=6, min_periods=1).mean().round(2)
    df["rolling_temp_24h"] = df["temperature"].rolling(window=24, min_periods=1).mean().round(2)
    df["rolling_rh_6h"] = df["relative_humidity"].rolling(window=6, min_periods=1).mean().round(2)

    # 4. Estimated solar radiation proxy
    df["solar_radiation"] = [
        estimate_solar_radiation(h, doy, cc, lat)
        for h, doy, cc in zip(df["hour"], df["day_of_year"], df["cloud_cover"])
    ]

    # 5. Compute thermal indices & derived target
    thermal_scores = []
    risk_categories = []
    heat_indices = []
    wet_bulbs = []
    swbgts = []
    apparent_temps = []

    for _, row in df.iterrows():
        res = compute_thermal_stress_score(
            temp_c=row["temperature"],
            rh=row["relative_humidity"],
            dew_point_c=row["dew_point"],
            wind_speed_ms=row["wind_speed"],
            solar_radiation_wm2=row["solar_radiation"],
            rolling_24h_mean_temp=row["rolling_temp_24h"]
        )
        thermal_scores.append(res["thermal_stress_score"])
        risk_categories.append(res["risk_category"])
        heat_indices.append(res["heat_index"])
        wet_bulbs.append(res["wet_bulb_temperature"])
        swbgts.append(res["simplified_wbgt"])
        apparent_temps.append(res["apparent_temperature"])

    df["thermal_stress_score"] = thermal_scores
    df["risk_category"] = risk_categories
    df["heat_index"] = heat_indices
    df["wet_bulb_temp"] = wet_bulbs
    df["simplified_wbgt"] = swbgts
    df["apparent_temp"] = apparent_temps

    # Map category to integer label for ML classification
    category_map = {"LOW": 0, "MODERATE": 1, "HIGH": 2, "VERY HIGH": 3, "EXTREME": 4}
    df["target_class"] = df["risk_category"].map(category_map)

    return df


if __name__ == "__main__":
    import os
    from backend.ml.preprocessing import parse_raw_open_meteo_csv, preprocess_hourly_data

    raw_path = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")
    meta, df_h, _ = parse_raw_open_meteo_csv(raw_path)
    df_clean = preprocess_hourly_data(df_h)
    lat = float(meta.get("latitude", 52.55))
    df_feat = generate_features(df_clean, lat=lat)

    print("\n--- FEATURE ENGINEERING COMPLETE ---")
    print("Features shape:", df_feat.shape)
    print("Columns:", df_feat.columns.tolist())
    print("\nTarget Class Distribution:")
    print(df_feat["risk_category"].value_counts())
    print(df_feat[["temperature", "relative_humidity", "heat_index", "wet_bulb_temp", "thermal_stress_score"]].head())
