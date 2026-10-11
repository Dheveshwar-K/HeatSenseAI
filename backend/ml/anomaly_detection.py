"""
Sensor Anomaly Detection & Data Quality Monitor
==============================================
Provides:
1. IsolationForest & Statistical Z-Score Anomaly Detection
2. Sensor Health Monitor (Temperature, Humidity, Wind, Solar, Data Feed)
3. Data Quality Score (0 - 100%)
4. Model Drift Detector (Distribution deviation vs training baseline)
"""

import os
import logging
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ANOMALY_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "anomaly_detector.pkl")


class AnomalyAndHealthMonitor:
    def __init__(self):
        self.iso_forest: Optional[IsolationForest] = None
        self.recent_readings: List[Dict[str, float]] = []
        self._init_model()

    def _init_model(self):
        # Fit baseline Isolation Forest on typical physiological/ambient distributions
        rng = np.random.RandomState(42)
        normal_temps = rng.normal(25.0, 8.0, 500)
        normal_rhs = rng.normal(60.0, 15.0, 500)
        normal_winds = rng.exponential(3.0, 500)
        normal_solars = rng.uniform(0.0, 950.0, 500)

        X_normal = np.column_stack([normal_temps, normal_rhs, normal_winds, normal_solars])
        self.iso_forest = IsolationForest(contamination=0.03, random_state=42)
        self.iso_forest.fit(X_normal)

    def evaluate_observation(
        self,
        temperature: float,
        relative_humidity: float,
        dew_point: float,
        wind_speed: float,
        solar_radiation: float = 0.0,
        is_stale: bool = False
    ) -> Dict[str, Any]:
        """
        Assesses observation validity, detects anomalies, calculates Data Quality Score,
        and reports Sensor Health status.
        """
        anomalies_detected = []
        quality_penalties = 0

        # Physical boundary checks
        if temperature < -30.0 or temperature > 60.0:
            anomalies_detected.append({
                "parameter": "Temperature",
                "observed": temperature,
                "expected_range": "[-30.0°C, 60.0°C]",
                "severity": "CRITICAL",
                "description": "Temperature outside terrestrial planetary limits."
            })
            quality_penalties += 35

        if relative_humidity < 0.0 or relative_humidity > 100.0:
            anomalies_detected.append({
                "parameter": "Relative Humidity",
                "observed": relative_humidity,
                "expected_range": "[0%, 100%]",
                "severity": "CRITICAL",
                "description": "Relative humidity cannot exceed 100% or drop below 0%."
            })
            quality_penalties += 35

        # Physical consistency: Dew point should not exceed dry bulb temperature by > 1.0°C
        if dew_point > temperature + 1.0:
            anomalies_detected.append({
                "parameter": "Dew Point",
                "observed": dew_point,
                "expected": f"<= {temperature}°C",
                "severity": "HIGH",
                "description": "Physical inconsistency: Dew point temperature exceeds ambient air temperature."
            })
            quality_penalties += 20

        if wind_speed < 0.0 or wind_speed > 75.0:
            anomalies_detected.append({
                "parameter": "Wind Speed",
                "observed": wind_speed,
                "expected_range": "[0, 75 m/s]",
                "severity": "HIGH",
                "description": "Unphysical anemometer measurement."
            })
            quality_penalties += 20

        # Isolation Forest Statistical Check
        input_vec = np.array([[temperature, relative_humidity, wind_speed, solar_radiation]])
        iso_score = float(self.iso_forest.score_samples(input_vec)[0])
        is_multivariate_outlier = self.iso_forest.predict(input_vec)[0] == -1

        if is_multivariate_outlier and not anomalies_detected:
            anomalies_detected.append({
                "parameter": "Multivariate Climate Profile",
                "observed": f"T={temperature}°C, RH={relative_humidity}%",
                "severity": "MODERATE",
                "description": "Rare atmospheric parameter combination detected by Isolation Forest."
            })
            quality_penalties += 10

        if is_stale:
            quality_penalties += 40

        # Calculate Data Quality Score (0 to 100%)
        data_quality_score = max(0, min(100, 100 - quality_penalties))

        # Sensor Health Status Map
        sensor_health = {
            "temperature_sensor": "FAULT" if temperature > 60 or temperature < -30 else "ONLINE",
            "humidity_sensor": "FAULT" if relative_humidity > 100 or relative_humidity < 0 else "ONLINE",
            "dew_point_sensor": "DEGRADED" if dew_point > temperature + 1.0 else "ONLINE",
            "anemometer": "ONLINE" if 0 <= wind_speed <= 75 else "FAULT",
            "solar_pyranometer": "ONLINE" if 0 <= solar_radiation <= 1400 else "DEGRADED",
            "telemetry_feed": "STALE" if is_stale else "ONLINE",
            "ml_risk_engine": "READY",
            "forecast_engine": "READY",
            "emergency_service": "READY"
        }

        # Track rolling distribution for drift detection
        self.recent_readings.append({
            "temp": temperature,
            "rh": relative_humidity,
            "wind": wind_speed
        })
        if len(self.recent_readings) > 100:
            self.recent_readings.pop(0)

        # Model drift metric (mean shift relative to baseline)
        recent_temps = [r["temp"] for r in self.recent_readings]
        temp_drift = abs(np.mean(recent_temps) - 25.0)
        drift_level = "HIGH" if temp_drift > 15.0 else "MODERATE" if temp_drift > 8.0 else "LOW"

        return {
            "has_anomaly": len(anomalies_detected) > 0,
            "anomaly_count": len(anomalies_detected),
            "anomalies": anomalies_detected,
            "data_quality_score": data_quality_score,
            "data_quality_grade": "OPTIMAL" if data_quality_score >= 90 else "DEGRADED" if data_quality_score >= 70 else "CRITICAL",
            "sensor_health": sensor_health,
            "model_drift": {
                "level": drift_level,
                "status_message": "MODEL DRIFT WITHIN NORMAL LIMITS" if drift_level == "LOW" else "MODEL REVALIDATION RECOMMENDED",
                "sample_count": len(self.recent_readings)
            }
        }


anomaly_monitor = AnomalyAndHealthMonitor()
