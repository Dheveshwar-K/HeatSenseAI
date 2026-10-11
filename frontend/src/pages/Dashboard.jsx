import React from 'react';
import Thermal3DScene from '../components/Thermal3DScene';
import ThermalGauge from '../components/ThermalGauge';
import EnvironmentCards from '../components/EnvironmentCards';
import LiveThermalChart from '../components/LiveThermalChart';
import HeatwaveStatus from '../components/HeatwaveStatus';
import HeatwaveDynamicsPanel from '../components/HeatwaveDynamicsPanel';
import SensorDiagnosticsPanel from '../components/SensorDiagnosticsPanel';
import ForecastPanel from '../components/ForecastPanel';
import RiskContributors from '../components/RiskContributors';
import EmergencyPanel from '../components/EmergencyPanel';
import EmergencyTimeline from '../components/EmergencyTimeline';
import PresentationMode from '../components/PresentationMode';
import { Shield, Activity, Flame, ShieldAlert, Cpu } from 'lucide-react';

export default function Dashboard({ liveState }) {
  const { data, chartHistory, isAudioMuted, toggleAudio, setScenario, connectionStatus } = liveState;

  const env = data?.environmental || {};
  const assessment = data?.thermal_assessment || {};
  const emergencySystem = data?.emergency_system || {};
  const forecast = data?.forecast || {};
  const heatwaveDynamics = data?.heatwave_dynamics || {};
  const diagnostics = data?.sensor_diagnostics || {};

  const score = assessment.score ?? 88;
  const category = assessment.risk_category ?? 'EXTREME';
  const probability = assessment.probability ?? 0.94;
  const hwStatus = assessment.heatwave_status ?? 'SEVERE';
  const isEmergency = emergencySystem.state === 'EMERGENCY';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 10-Scenario Presentation Stepper */}
      <PresentationMode
        currentScenario={data?.scenario || 'EXTREME'}
        onSelectScenario={setScenario}
      />

      {/* Emergency Alert Banner (Active during Emergency or Warning) */}
      <EmergencyPanel
        emergencySystem={emergencySystem}
        assessment={assessment}
        isMuted={isAudioMuted}
        onToggleMute={toggleAudio}
      />

      {/* 3D Atmosphere + Central Thermal Gauge + Heatwave Tactical Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* 3D Atmospheric Hero Digital Twin */}
        <div className="glass-panel" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
              3D ATMOSPHERIC DIGITAL TWIN
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
              WebGL / Three.js
            </span>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Thermal3DScene score={score} windSpeed={env.wind_speed} isEmergency={isEmergency} />
          </div>
        </div>

        {/* Central Thermal Stress Core Gauge */}
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <ThermalGauge
            score={score}
            category={category}
            probability={probability}
            heatwaveStatus={hwStatus}
            isEmergency={isEmergency}
          />
        </div>

        {/* Heatwave Status Panel */}
        <HeatwaveStatus
          status={hwStatus}
          maxTemp={heatwaveDynamics.day_peak_temperature || 42.5}
          minNightTemp={heatwaveDynamics.night_min_temperature || 29.5}
          durationHours={heatwaveDynamics.consecutive_hot_hours || 36}
        />
      </div>

      {/* Multi-Horizon Forecasting & Predictive Weather Table */}
      <ForecastPanel
        forecast={forecast}
        current={{
          temperature: env.temperature,
          relative_humidity: env.relative_humidity,
          dew_point: env.dew_point,
          score,
          risk_category: category
        }}
      />

      {/* Environmental Telemetry 8-Card Grid */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-hud)',
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          marginBottom: '10px'
        }}>
          ENVIRONMENTAL SENSOR SUITE
        </h3>
        <EnvironmentCards environmental={env} />
      </div>

      {/* Live Chart + Risk Contributors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        <LiveThermalChart data={chartHistory} />
        <RiskContributors
          contributors={assessment.contributors || {}}
          riskReasons={assessment.risk_reasons || []}
        />
      </div>

      {/* Cumulative Heat Dynamics & Sensor Diagnostics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        <HeatwaveDynamicsPanel heatwave={heatwaveDynamics} />
        <SensorDiagnosticsPanel diagnostics={diagnostics} />
      </div>

      {/* Timeline & Safety Protocols */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        <EmergencyTimeline timeline={emergencySystem.timeline || []} />

        {/* Safety Recommendation Protocol Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--color-green)" />
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff', letterSpacing: '0.04em' }}>
              SAFETY ACTION PROTOCOLS
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>01.</span>
              <span><strong>Relocate to cooling centers:</strong> Cease direct outdoor physical exertion and seek air-conditioned shelter immediately.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>02.</span>
              <span><strong>Hydration & Electrolytes:</strong> Continuously consume cool fluids even in absence of thirst. Avoid dehydrating stimulants.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>03.</span>
              <span><strong>Active Evaporative Cooling:</strong> Apply cool wet towels, fans, or tepid water immersion to accelerate sensible heat loss.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--color-red)', fontWeight: 700 }}>04.</span>
              <span><strong>Medical Escalation:</strong> If confusion, altered consciousness, hot dry skin, or vomiting occurs, contact emergency medical emergency services immediately.</span>
            </div>
          </div>

          <div style={{
            marginTop: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '12px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            DISCLAIMER: This system provides algorithmic estimation of environmental human thermal-stress risk and does NOT provide medical diagnostic confirmation of heat illness.
          </div>
        </div>
      </div>
    </div>
  );
}
