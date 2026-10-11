import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, Cpu, Wifi } from 'lucide-react';

export default function SensorDiagnosticsPanel({ diagnostics = {} }) {
  const quality = diagnostics.data_quality_score ?? 100;
  const grade = diagnostics.data_quality_grade ?? 'OPTIMAL';
  const sensors = diagnostics.sensor_health || {
    temperature_sensor: 'ONLINE',
    humidity_sensor: 'ONLINE',
    dew_point_sensor: 'ONLINE',
    anemometer: 'ONLINE',
    solar_pyranometer: 'ONLINE',
    telemetry_feed: 'ONLINE',
    ml_risk_engine: 'READY',
    forecast_engine: 'READY',
    emergency_service: 'READY'
  };
  const drift = diagnostics.model_drift || { level: 'LOW', status_message: 'MODEL DRIFT WITHIN NORMAL LIMITS' };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--color-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff' }}>
            SENSOR HEALTH & DATA QUALITY MONITOR
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>QUALITY SCORE:</span>
          <span style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: quality >= 90 ? 'var(--color-green)' : quality >= 70 ? 'var(--color-amber)' : 'var(--color-red)'
          }}>
            {quality}% ({grade})
          </span>
        </div>
      </div>

      {/* Sensor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {Object.entries(sensors).map(([key, status]) => {
          const label = key.replace(/_/g, ' ').toUpperCase();
          const isGood = status === 'ONLINE' || status === 'READY';
          const isDeg = status === 'DEGRADED';
          return (
            <div
              key={key}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isGood ? 'var(--color-green)' : isDeg ? 'var(--color-amber)' : 'var(--color-red)',
                  boxShadow: `0 0 6px ${isGood ? 'var(--color-green)' : isDeg ? 'var(--color-amber)' : 'var(--color-red)'}`
                }} />
                <span style={{
                  fontFamily: 'var(--font-hud)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: isGood ? 'var(--color-green)' : isDeg ? 'var(--color-amber)' : 'var(--color-red)'
                }}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Drift Status Bar */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '6px',
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="var(--color-cyan)" />
          <span>MODEL DRIFT LEVEL: <strong style={{ color: drift.level === 'LOW' ? 'var(--color-green)' : 'var(--color-amber)' }}>{drift.level}</strong></span>
        </div>
        <span style={{ color: 'var(--text-secondary)' }}>{drift.status_message}</span>
      </div>
    </div>
  );
}
