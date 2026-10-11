import { useState, useEffect, useRef } from 'react';
import { wsClient } from '../services/websocket';
import { fetchCurrentTelemetry } from '../services/api';
import { audioAlarm } from '../services/AudioAlarm';

export function useLiveThermalData() {
  const [data, setData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const [chartHistory, setChartHistory] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const prevAlarmState = useRef(false);

  useEffect(() => {
    // Initial fetch fallback
    fetchCurrentTelemetry()
      .then((initial) => {
        if (!data) {
          setData({
            timestamp: new Date().toLocaleTimeString(),
            scenario: 'LIVE',
            environmental: initial.telemetry,
            thermal_assessment: {
              score: initial.assessment.thermal_stress_score,
              risk_category: initial.assessment.risk_category,
              probability: initial.assessment.probability,
              heatwave_status: initial.assessment.heatwave_status,
              contributors: initial.assessment.contributors,
              risk_reasons: initial.assessment.risk_reasons,
              is_warning: initial.assessment.warning,
              is_extreme: initial.assessment.extreme,
              is_emergency: initial.assessment.emergency
            },
            emergency_system: initial.emergency_state
          });
        }
      })
      .catch((err) => console.log('Initial fetch waiting for backend:', err));

    // Connect WebSocket
    wsClient.connect();

    const unsubData = wsClient.subscribe((payload) => {
      setData(payload);

      // Append to rolling chart history (max 30 points)
      setChartHistory((prev) => {
        const point = {
          time: payload.timestamp,
          score: payload.thermal_assessment.score,
          temperature: payload.environmental.temperature,
          humidity: payload.environmental.relative_humidity,
          dewPoint: payload.environmental.dew_point,
          wind: payload.environmental.wind_speed,
          solar: payload.environmental.solar_radiation / 10.0 // scaled for visibility
        };
        const next = [...prev, point];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });

      // Synchronize audio alarm with emergency state
      const shouldAlarm = payload.emergency_system?.alarm_active && !payload.emergency_system?.acknowledged;
      if (shouldAlarm && !prevAlarmState.current) {
        audioAlarm.startAlarm();
      } else if (!shouldAlarm && prevAlarmState.current) {
        audioAlarm.stopAlarm();
      }
      prevAlarmState.current = shouldAlarm;
    });

    const unsubStatus = wsClient.subscribeStatus((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubData();
      unsubStatus();
      audioAlarm.stopAlarm();
    };
  }, []);

  const toggleAudio = () => {
    const muted = audioAlarm.toggleMute();
    setIsAudioMuted(muted);
  };

  const setScenario = (name) => {
    wsClient.setScenario(name);
  };

  const setTelemetry = (telemetryObj) => {
    wsClient.setTelemetry(telemetryObj);
  };

  const acknowledgeAlarm = () => {
    wsClient.acknowledgeAlarm();
  };

  const resolveEmergency = () => {
    wsClient.resolveEmergency();
  };

  const triggerManualCall = () => {
    wsClient.triggerManualCall();
  };

  return {
    data,
    connectionStatus,
    chartHistory,
    isAudioMuted,
    toggleAudio,
    setScenario,
    setTelemetry,
    acknowledgeAlarm,
    resolveEmergency,
    triggerManualCall
  };
}
