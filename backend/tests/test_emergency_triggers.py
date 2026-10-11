"""
Test Cases for Jury Demo Emergency Triggers & Anti-Chatter FSM
==============================================================
Validates:
1. Test Case 1: 89.9 does NOT trigger extreme heat emergency (no alarm, no telephony).
2. Test Case 2: 90.0 DOES trigger extreme heat emergency (alarm active, EH-2026-XXXX event logged).
3. Test Case 3: 95.0 remains in emergency without repeated alarm/call duplicates.
4. Test Case 4: 84.0 (below recovery threshold 85.0) recovers to non-emergency, alarm turns OFF.
5. Hysteresis Test: 88.0 after 95.0 remains in emergency until dropping below 85.0.
6. Telephony safety: Simulated call status recorded when TELEPHONY_ENABLED=false.
"""

import time
import pytest
from backend.config import settings
from backend.emergency.emergency_service import EmergencyStateMachine
from backend.emergency.call_manager import EmergencyCallManager


@pytest.fixture
def state_machine():
    sm = EmergencyStateMachine()
    # Ensure immediate transition for unit tests
    orig_pers = settings.EMERGENCY_PERSISTENCE_SECONDS
    settings.EMERGENCY_PERSISTENCE_SECONDS = 0
    yield sm
    settings.EMERGENCY_PERSISTENCE_SECONDS = orig_pers


def test_threshold_89_point_9_no_emergency(state_machine):
    """Test Case 1: 89.9 does NOT trigger extreme heat emergency."""
    payload = {
        "thermal_stress_score": 89.9,
        "temperature": 41.0,
        "relative_humidity": 68.0,
        "wind_speed": 1.2,
        "solar_radiation": 800.0,
        "scenario": "JURY_DEMO"
    }
    status = state_machine.evaluate(payload)

    assert status["state"] != "EMERGENCY"
    assert status["state"] == "EXTREME"
    assert state_machine.active_event is None
    # No emergency event ID created
    assert state_machine.event_counter == 0


def test_threshold_90_point_0_triggers_emergency(state_machine):
    """Test Case 2: 90.0 DOES trigger extreme heat emergency, creates event ID and activates alarm."""
    payload = {
        "thermal_stress_score": 90.0,
        "temperature": 48.5,
        "relative_humidity": 73.0,
        "wind_speed": 0.5,
        "solar_radiation": 950.0,
        "scenario": "JURY_DEMO"
    }
    status = state_machine.evaluate(payload)

    assert status["state"] == "EMERGENCY"
    assert status["alarm_active"] is True
    assert state_machine.active_event is not None
    assert state_machine.active_event["event_id"].startswith("EH-2026-")
    assert state_machine.active_event["thermal_stress_index"] == 90.0
    assert state_machine.active_event["mode"] == "JURY_DEMO"
    assert state_machine.active_event["risk_level"] == "EXTREME"
    assert state_machine.event_counter == 1


def test_threshold_95_point_0_anti_chatter_no_duplicate(state_machine):
    """Test Case 3: 95.0 subsequent update maintains emergency but does NOT duplicate events or calls."""
    # First trigger at 90.0
    payload_90 = {
        "thermal_stress_score": 90.0,
        "temperature": 48.0,
        "relative_humidity": 72.0,
        "wind_speed": 0.5,
        "scenario": "JURY_DEMO"
    }
    state_machine.evaluate(payload_90)
    initial_event_id = state_machine.active_event["event_id"]
    assert state_machine.event_counter == 1

    # Subsequent updates climbing: 91.2, 92.4, 95.0
    for s in [91.2, 92.4, 95.0]:
        payload_climb = {
            "thermal_stress_score": s,
            "temperature": 48.5,
            "relative_humidity": 73.0,
            "wind_speed": 0.5,
            "scenario": "JURY_DEMO"
        }
        res = state_machine.evaluate(payload_climb)
        assert res["state"] == "EMERGENCY"
        assert res["alarm_active"] is True
        # Anti-chatter: Same event record, event_counter NOT incremented
        assert state_machine.event_counter == 1
        assert state_machine.active_event["event_id"] == initial_event_id


def test_threshold_hysteresis_and_84_recovery(state_machine):
    """Test Case 4 & 5: Hysteresis holds emergency at 88.0, then recovers below 85.0 to 84.0."""
    # Trigger emergency at 95.0
    state_machine.evaluate({"thermal_stress_score": 95.0, "scenario": "JURY_DEMO"})
    assert state_machine.current_state == "EMERGENCY"
    assert state_machine.is_alarm_active is True

    # Drop to 88.0 (within [85, 90) hysteresis band)
    state_88 = state_machine.evaluate({"thermal_stress_score": 88.0, "scenario": "JURY_DEMO"})
    assert state_88["state"] == "EMERGENCY"
    assert state_88["alarm_active"] is True

    # Drop to 84.0 (strictly below recovery threshold 85.0)
    state_84 = state_machine.evaluate({"thermal_stress_score": 84.0, "scenario": "JURY_DEMO"})
    assert state_84["state"] != "EMERGENCY"
    assert state_84["alarm_active"] is False
    assert state_machine.active_event is None


def test_telephony_safety_mode():
    """Verify that when TELEPHONY_ENABLED=false, call dispatch is simulated safely without exceptions."""
    orig_tel = settings.TELEPHONY_ENABLED
    orig_call = settings.EMERGENCY_CALL_ENABLED
    settings.TELEPHONY_ENABLED = False
    settings.EMERGENCY_CALL_ENABLED = False

    call_mgr = EmergencyCallManager()
    res = call_mgr.trigger_dual_escalation(
        {"temperature": 48.5, "relative_humidity": 73.0, "thermal_stress_score": 95.0},
        is_manual=True,
        bypass_cooldown=True
    )
    assert res["success"] is True
    assert res["simulation"] is True

    settings.TELEPHONY_ENABLED = orig_tel
    settings.EMERGENCY_CALL_ENABLED = orig_call
