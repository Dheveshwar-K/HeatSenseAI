"""
Model Inference & Risk Engine Module
====================================
Loads the trained champion model and performs real-time thermal-stress classification,
probability estimation, and multi-factor explainability.
"""

import os
import json
import logging
from typing import Dict, Any, List
import joblib
import numpy as np

from backend.thermal.thermal_score import compute_thermal_stress_score, get_risk_category

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "thermal_stress_model.pkl")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.pkl")
METADATA_PATH = os.path.join(MODELS_DIR, "metadata.json")


class ThermalRiskPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_cols = []
        self.class_names = ["LOW", "MODERATE", "HIGH", "VERY HIGH", "EXTREME"]
        self.metadata = {}
        self.load_artifacts()

    def load_artifacts(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(PREPROCESSOR_PATH):
            logger.warning("Model artifacts not yet saved. Fallback to physics engine only.")
            return

        try:
            self.model = joblib.load(MODEL_PATH)
            prep = joblib.load(PREPROCESSOR_PATH)
            self.scaler = prep["scaler"]
            self.feature_cols = prep["feature_cols"]
            self.class_names = prep.get("class_names", self.class_names)

            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            logger.info(f"Loaded ML Model: {self.metadata.get('champion_model', 'Champion')}")
        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}")

    def predict(
        self,
        temperature: float,
        relative_humidity: float,
        dew_point: float,
        wind_speed: float = 1.5,
        solar_radiation: float = 0.0,
        rolling_temp_24h: float = 20.0,
        temp_rate_of_change: float = 0.0,
        humidity_rate_of_change: float = 0.0,
        hour: int = 14
    ) -> Dict[str, Any]:
        """
        Calculates physics indices and executes ML classification inference.
        """
        # 1. Physics Engine Calculation (Ground Truth Scientific Metrics)
        physics = compute_thermal_stress_score(
            temp_c=temperature,
            rh=relative_humidity,
            dew_point_c=dew_point,
            wind_speed_ms=wind_speed,
            solar_radiation_wm2=solar_radiation,
            rolling_24h_mean_temp=rolling_temp_24h
        )

        score = physics["thermal_stress_score"]
        physics_category = physics["risk_category"]

        # Default ML output fallback to physics
        ml_category = physics_category
        probability = 0.95
        class_probabilities = {c: 0.0 for c in self.class_names}
        class_probabilities[physics_category] = 1.0

        # 2. ML Inference (if model loaded)
        if self.model is not None and self.scaler is not None:
            try:
                sin_h = np.sin(2 * np.pi * hour / 24.0)
                cos_h = np.cos(2 * np.pi * hour / 24.0)

                feature_dict = {
                    "temperature": temperature,
                    "relative_humidity": relative_humidity,
                    "dew_point": dew_point,
                    "wind_speed": wind_speed,
                    "solar_radiation": solar_radiation,
                    "heat_index": physics["heat_index"],
                    "wet_bulb_temp": physics["wet_bulb_temperature"],
                    "simplified_wbgt": physics["simplified_wbgt"],
                    "apparent_temp": physics["apparent_temperature"],
                    "temp_rate_of_change": temp_rate_of_change,
                    "humidity_rate_of_change": humidity_rate_of_change,
                    "rolling_temp_3h": temperature,
                    "rolling_temp_6h": temperature,
                    "rolling_temp_24h": rolling_temp_24h,
                    "sin_hour": sin_h,
                    "cos_hour": cos_h
                }

                input_vec = np.array([[feature_dict[col] for col in self.feature_cols]])
                scaled_vec = self.scaler.transform(input_vec)

                pred_idx = int(self.model.predict(scaled_vec)[0])
                ml_category = self.class_names[pred_idx]

                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(scaled_vec)[0]
                    # Map probs to full classes
                    if len(probs) == len(self.class_names):
                        class_probabilities = {
                            self.class_names[i]: round(float(probs[i]), 3)
                            for i in range(len(self.class_names))
                        }
                        probability = round(float(probs[pred_idx]), 3)
                    else:
                        probability = round(float(np.max(probs)), 3)
            except Exception as ex:
                logger.error(f"Inference error, reverting to physics engine: {ex}")

        # Final category fusion: physics category defines the exact 0-100 threshold,
        # with ML offering the statistical confidence probability
        return {
            "thermal_stress_score": score,
            "risk_category": physics_category,
            "ml_predicted_category": ml_category,
            "probability": probability,
            "class_probabilities": class_probabilities,
            "heat_index": physics["heat_index"],
            "wet_bulb_temperature": physics["wet_bulb_temperature"],
            "simplified_wbgt": physics["simplified_wbgt"],
            "apparent_temperature": physics["apparent_temperature"],
            "heatwave_status": physics["heatwave_status"],
            "contributors": physics["contributors"],
            "risk_reasons": physics["risk_reasons"],
            "warning": physics["is_warning"],
            "extreme": physics["is_extreme"],
            "emergency": physics["is_emergency"]
        }


# Global singleton instance
predictor = ThermalRiskPredictor()
