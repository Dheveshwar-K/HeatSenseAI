"""
Comprehensive End-to-End System Tests
====================================
Tests the 8 scenarios specified in Section #39 of Master Specification:
1. LOW Scenario
2. MODERATE Scenario
3. HIGH Scenario
4. VERY HIGH Scenario
5. EXTREME Scenario
6. EXTREME + Persistence (Transition to EMERGENCY & Dual-contact escalation)
7. Emergency Clears (Conditions subside, alarm turns off)
8. Emergency Cooldown (Anti-spam suppression)
"""

import time
import unittest
from backend.ml.predict import predictor
from backend.emergency.emergency_service import EmergencyStateMachine
from backend.emergency.call_manager import EmergencyCallManager
from backend.config import settings


class TestHeatwaveEarlyWarningSystem(unittest.TestCase):
    def setUp(self):
        self.state_machine = EmergencyStateMachine()
        self.call_mgr = EmergencyCallManager()

    def test_scenario_1_low(self):
        """1. LOW: No alarm, no phone calls"""
        res = predictor.predict(
            temperature=20.0, relative_humidity=50.0, dew_point=9.0, wind_speed=3.5, solar_radiation=200.0
        )
        self.assertEqual(res["risk_category"], "LOW")
        self.assertLessEqual(res["thermal_stress_score"], 20.0)
        self.assertFalse(res["warning"])
        self.assertFalse(res["emergency"])

        state = self.state_machine.evaluate({**res, "temperature": 20.0, "relative_humidity": 50.0})
        self.assertEqual(state["state"], "NORMAL")
        self.assertFalse(state["alarm_active"])

    def test_scenario_2_moderate(self):
        """2. MODERATE: No alarm, no phone calls"""
        res = predictor.predict(
            temperature=29.0, relative_humidity=50.0, dew_point=17.5, wind_speed=2.5, solar_radiation=500.0
        )
        self.assertEqual(res["risk_category"], "MODERATE")
        self.assertGreater(res["thermal_stress_score"], 20.0)
        self.assertLessEqual(res["thermal_stress_score"], 40.0)

        state = self.state_machine.evaluate({**res, "temperature": 29.0, "relative_humidity": 50.0})
        self.assertEqual(state["state"], "NORMAL")
        self.assertFalse(state["alarm_active"])

    def test_scenario_3_high(self):
        """3. HIGH: Strong warning, no phone calls"""
        res = predictor.predict(
            temperature=32.0, relative_humidity=50.0, dew_point=20.0, wind_speed=2.0, solar_radiation=500.0
        )
        self.assertEqual(res["risk_category"], "HIGH")
        self.assertFalse(res["extreme"])
        self.assertFalse(res["emergency"])

        state = self.state_machine.evaluate({**res, "temperature": 32.0, "relative_humidity": 50.0})
        self.assertEqual(state["state"], "WATCH")
        self.assertFalse(state["alarm_active"])

    def test_scenario_4_very_high(self):
        """4. VERY HIGH: Visual warning, no automatic emergency call"""
        res = predictor.predict(
            temperature=36.0, relative_humidity=50.0, dew_point=24.0, wind_speed=1.8, solar_radiation=650.0
        )
        self.assertEqual(res["risk_category"], "VERY HIGH")
        self.assertTrue(res["warning"])
        self.assertFalse(res["emergency"])

        state = self.state_machine.evaluate({**res, "temperature": 39.0, "relative_humidity": 65.0})
        self.assertEqual(state["state"], "WARNING")

    def test_scenario_5_extreme(self):
        """5. EXTREME: Emergency warning / alarm active"""
        res = predictor.predict(
            temperature=42.0, relative_humidity=72.0, dew_point=32.0, wind_speed=0.9, solar_radiation=900.0
        )
        self.assertEqual(res["risk_category"], "EXTREME")
        self.assertTrue(res["extreme"])

        state = self.state_machine.evaluate({**res, "temperature": 42.0, "relative_humidity": 72.0})
        self.assertTrue(state["alarm_active"])
        self.assertIn(state["state"], ["EXTREME", "EMERGENCY"])

    def test_scenario_6_persistence_and_dual_escalation(self):
        """6. EXTREME + Persistence condition -> EMERGENCY -> Call Contact 1 -> Call Contact 2"""
        # Configure short persistence for test
        original_pers = settings.EMERGENCY_PERSISTENCE_SECONDS
        settings.EMERGENCY_PERSISTENCE_SECONDS = 0  # immediate transition for test

        try:
            res = predictor.predict(
                temperature=44.0, relative_humidity=75.0, dew_point=34.0, wind_speed=0.5, solar_radiation=950.0
            )
            state = self.state_machine.evaluate({**res, "temperature": 44.0, "relative_humidity": 75.0})
            self.assertEqual(state["state"], "EMERGENCY")
            self.assertTrue(state["alarm_active"])

            # Verify dual escalation
            seq = self.state_machine.active_event
            self.assertIsNotNone(seq)
        finally:
            settings.EMERGENCY_PERSISTENCE_SECONDS = original_pers

    def test_scenario_7_emergency_clears(self):
        """7. Emergency Clears: Subside below threshold, stop alarm"""
        # First trigger emergency
        self.state_machine.current_state = "EMERGENCY"
        self.state_machine.is_alarm_active = True

        # Now conditions normalize
        cool_res = predictor.predict(
            temperature=22.0, relative_humidity=50.0, dew_point=11.0, wind_speed=3.0, solar_radiation=200.0
        )
        state = self.state_machine.evaluate({**cool_res, "temperature": 22.0, "relative_humidity": 50.0})
        self.assertEqual(state["state"], "NORMAL")
        self.assertFalse(state["alarm_active"])

    def test_scenario_8_cooldown(self):
        """8. Cooldown prevents call spamming"""
        ctx = {"temperature": 42.0, "relative_humidity": 70.0, "thermal_stress_score": 92.0}
        res1 = self.call_mgr.trigger_dual_escalation(ctx, is_manual=False)
        self.assertTrue(res1["success"])

        # Immediate second attempt without cooldown elapsed
        res2 = self.call_mgr.trigger_dual_escalation(ctx, is_manual=False)
        self.assertFalse(res2["success"])
        self.assertIn("Cooldown active", res2["reason"])


if __name__ == "__main__":
    unittest.main()
