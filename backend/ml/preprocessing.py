"""
Dataset Preprocessing & Validation Module
=========================================
Project: EXTREME HEATWAVE EARLY WARNING & HUMAN THERMAL STRESS INDEX
Phase: PHASE 1 & 2 - Data Ingestion, Inspection, and Preprocessing

Responsibilities:
1. Parse Open-Meteo multi-section CSV (metadata header, hourly records, daily aggregates).
2. Validate ranges, missing values, duplicates, and strict timestamp continuity.
3. Normalize units (e.g. wind speed km/h -> m/s).
4. Save clean structured dataset ready for feature engineering and thermal indices.
"""

import os
import io
import json
import logging
from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def parse_raw_open_meteo_csv(file_path: str) -> Tuple[Dict[str, Any], pd.DataFrame, pd.DataFrame]:
    """
    Parses Open-Meteo CSV file containing metadata header, hourly block, and daily block.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at: {file_path}")

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    if len(lines) < 4:
        raise ValueError("CSV file has insufficient lines to contain Open-Meteo data.")

    # 1. Parse metadata (rows 0 and 1)
    meta_keys = [k.strip() for k in lines[0].strip().split(",")]
    meta_vals = [v.strip() for v in lines[1].strip().split(",")]
    metadata = dict(zip(meta_keys, meta_vals))

    # 2. Locate boundary between hourly table and daily table
    daily_header_idx = -1
    for i, line in enumerate(lines):
        if "temperature_2m_max" in line:
            daily_header_idx = i
            break

    # 3. Extract hourly lines
    if daily_header_idx != -1:
        hourly_lines = lines[3:daily_header_idx]
        # Remove trailing empty lines
        while hourly_lines and not hourly_lines[-1].strip():
            hourly_lines.pop()
    else:
        hourly_lines = lines[3:]

    hourly_csv_str = "".join(hourly_lines)
    df_hourly = pd.read_csv(io.StringIO(hourly_csv_str))

    # Clean hourly column names
    clean_hourly_cols = {}
    for col in df_hourly.columns:
        clean_name = col.split("(")[0].strip().lower().replace(" ", "_")
        clean_hourly_cols[col] = clean_name
    df_hourly.rename(columns=clean_hourly_cols, inplace=True)

    # 4. Extract daily lines if available
    df_daily = pd.DataFrame()
    if daily_header_idx != -1:
        daily_lines = lines[daily_header_idx:]
        daily_csv_str = "".join(daily_lines)
        df_daily = pd.read_csv(io.StringIO(daily_csv_str))
        clean_daily_cols = {}
        for col in df_daily.columns:
            clean_name = col.split("(")[0].strip().lower().replace(" ", "_")
            clean_daily_cols[col] = clean_name
        df_daily.rename(columns=clean_daily_cols, inplace=True)

    return metadata, df_hourly, df_daily


def preprocess_hourly_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validates, cleans, and standardizes hourly environmental observations.
    """
    logger.info("Starting hourly data preprocessing...")
    df_clean = df.copy()

    # 1. Validate and convert timestamp
    df_clean["timestamp"] = pd.to_datetime(df_clean["time"])
    df_clean.sort_values("timestamp", inplace=True)
    df_clean.reset_index(drop=True, inplace=True)

    # 2. Check duplicates
    dup_count = df_clean.duplicated(subset=["timestamp"]).sum()
    if dup_count > 0:
        logger.warning(f"Found {dup_count} duplicate timestamps. Dropping duplicates.")
        df_clean.drop_duplicates(subset=["timestamp"], keep="first", inplace=True)

    # 3. Check time continuity
    time_diffs = df_clean["timestamp"].diff().dropna().unique()
    expected_step = pd.Timedelta(1, unit="h")
    if any(diff != expected_step for diff in time_diffs):
        logger.warning(f"Time steps are non-uniform: {time_diffs}")
    else:
        logger.info("Timestamp verification passed: continuous 1-hour intervals.")

    # 4. Standardize variable names
    # Map raw Open-Meteo columns to canonical names:
    col_mapping = {
        "temperature_2m": "temperature",
        "relative_humidity_2m": "relative_humidity",
        "wind_speed_10m": "wind_speed_kmh",
        "dew_point_2m": "dew_point",
        "cloud_cover": "cloud_cover"
    }
    df_clean.rename(columns=col_mapping, inplace=True)

    # 5. Unit normalization: convert wind speed from km/h to m/s
    if "wind_speed_kmh" in df_clean.columns:
        df_clean["wind_speed"] = (df_clean["wind_speed_kmh"] / 3.6).round(2)

    # 6. Physical validity range checks
    # Temperature (°C): -40 to 60
    # Relative humidity (%): 0 to 100
    # Dew point (°C): -40 to 45 (must be <= temperature)
    # Wind speed (m/s): 0 to 75
    validations = {
        "temperature": (-40.0, 60.0),
        "relative_humidity": (0.0, 100.0),
        "dew_point": (-40.0, 45.0),
        "wind_speed": (0.0, 75.0),
        "cloud_cover": (0.0, 100.0)
    }

    anomalies = {}
    for col, (vmin, vmax) in validations.items():
        if col in df_clean.columns:
            out_of_bounds = df_clean[(df_clean[col] < vmin) | (df_clean[col] > vmax)]
            if len(out_of_bounds) > 0:
                anomalies[col] = len(out_of_bounds)
                logger.warning(f"Sensor anomaly detected: {len(out_of_bounds)} rows out of bounds for {col}")

    # Dew point physical consistency check: Dew point should not exceed air temperature
    dp_inconsistency = df_clean[df_clean["dew_point"] > df_clean["temperature"] + 0.5]
    if len(dp_inconsistency) > 0:
        logger.warning(f"Physical inconsistency: dew point exceeds temperature in {len(dp_inconsistency)} rows.")

    logger.info("Physical range validation completed successfully.")
    return df_clean


def inspect_dataset_report(file_path: str) -> Dict[str, Any]:
    """
    Produces a complete statistical report of the dataset.
    """
    metadata, df_hourly, df_daily = parse_raw_open_meteo_csv(file_path)
    df_clean = preprocess_hourly_data(df_hourly)

    report = {
        "metadata": metadata,
        "hourly_record_count": len(df_clean),
        "hourly_columns_raw": list(df_hourly.columns),
        "hourly_columns_cleaned": list(df_clean.columns),
        "missing_values_per_col": df_clean.isnull().sum().to_dict(),
        "start_time": str(df_clean["timestamp"].min()),
        "end_time": str(df_clean["timestamp"].max()),
        "time_resolution_hours": 1,
        "daily_record_count": len(df_daily),
        "daily_columns": list(df_daily.columns) if not df_daily.empty else [],
        "numerical_summary": df_clean[["temperature", "relative_humidity", "dew_point", "wind_speed", "cloud_cover"]].describe().to_dict()
    }
    return report


if __name__ == "__main__":
    raw_path = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")
    report = inspect_dataset_report(raw_path)
    print("\n" + "="*60)
    print("DATASET INSPECTION & PREPROCESSING REPORT")
    print("="*60)
    print(f"Latitude: {report['metadata'].get('latitude')}, Longitude: {report['metadata'].get('longitude')}, Elevation: {report['metadata'].get('elevation')}m")
    print(f"Time Range: {report['start_time']} to {report['end_time']} ({report['hourly_record_count']} hours)")
    print("\nCleaned Columns:")
    for col in report['hourly_columns_cleaned']:
        print(f" - {col}")
    print("\nMissing Values:")
    print(report['missing_values_per_col'])
    print("\nSummary Statistics:")
    summary_df = pd.DataFrame(report['numerical_summary'])
    print(summary_df)
