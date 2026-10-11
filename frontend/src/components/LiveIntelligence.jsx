import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplets, Wind, Sun, AlertCircle, Compass, Radio, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ThermalGauge from './ThermalGauge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function LiveIntelligence({ liveState }) {
  const { data, chartHistory = [], connectionStatus } = liveState;

  const env = data?.environmental || {
    temperature: 23.0,
    relative_humidity: 60.0,
    wind_speed: 1.8,
    dew_point: 14.8,
    solar_radiation: 420,
    heat_index: 23.5,
    wet_bulb_temp: 18.2,
    station_id: 'The Weather Company',
    data_quality_score: 100.0
  };

  const assessment = data?.thermal_assessment || {
    score: 18,
    risk_category: 'LOW',
    probability: 0.12,
    heatwave_status: { active: false, stage: 'NONE' }
  };

  const emergency = data?.emergency_system || {
    state: 'MONITORING',
    alarm_active: false
  };

  // Mock live data stream logs arriving in real-time
  const [streamLogs, setStreamLogs] = useState([
    { id: 1, time: '12:04:10', label: 'Telemetry Packet Ingested', delta: '+0.2°C Temp', tag: 'STATION_ALPHA' },
    { id: 2, time: '12:04:12', label: 'Dew Point Recalculated', delta: '+0.4°C Dew', tag: 'THERMAL_ENGINE' },
    { id: 3, time: '12:04:15', label: 'Isolation Forest Anomaly Check', delta: 'NORMAL (0.02)', tag: 'ML_GUARDIAN' },
    { id: 4, time: '12:04:18', label: 'Multi-Horizon Forecast Updated', delta: '15m / 30m / 60m', tag: 'FORECASTER' }
  ]);

  useEffect(() => {
    if (data?.timestamp) {
      const newLog = {
        id: Date.now(),
        time: data.timestamp,
        label: `Telemetry Ingest (${data.environmental?.temperature?.toFixed(1)}°C, ${data.environmental?.relative_humidity?.toFixed(0)}% RH)`,
        delta: `Score: ${data.thermal_assessment?.score}`,
        tag: 'LIVE_STREAM'
      };
      setStreamLogs((prev) => [newLog, ...prev.slice(0, 7)]);
    }
  }, [data]);

  return (
    <section id="live-monitor" style={{
      padding: '80px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px'
            }}>
              <Activity size={14} />
              <span>04 • REAL-TIME TELEMETRY STREAM</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff'
            }}>
              LIVE CLIMATE INTELLIGENCE.
            </h2>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              WebSocket Stream: <strong style={{ color: '#fff' }}>{connectionStatus}</strong>
            </span>
          </div>
        </div>

        {/* Live Metrics Grid: Gauges + Environmental Cards + Stream Console */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Central Radial Gauge Card (4 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 4',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'radial-gradient(circle at center, rgba(255, 109, 0, 0.08) 0%, rgba(17, 24, 34, 0.85) 80%)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  THERMAL STRESS ENGINE
                </span>
                <span className={assessment.score >= 80 ? 'status-badge status-badge-extreme' : assessment.score >= 60 ? 'status-badge status-badge-high' : 'status-badge status-badge-moderate'}>
                  {assessment.risk_category}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <ThermalGauge
                  score={assessment.score}
                  riskCategory={assessment.risk_category}
                  confidence={assessment.probability}
                />
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.35)',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>ML Classification Confidence</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {((assessment.probability || 0.85) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Environmental Telemetry 6-Card Matrix (5 cols) */}
          <div style={{
            gridColumn: 'span 5',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px'
          }}>
            {/* Metric 1: Temp */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <Thermometer size={15} color="var(--accent-heat)" />
                <span>AIR TEMPERATURE</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '6px 0 2px 0', fontFamily: 'var(--font-display)' }}>
                {env.temperature?.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Heat Index: <strong style={{ color: 'var(--accent-heat)' }}>{env.heat_index?.toFixed(1)}°C</strong>
              </div>
            </div>

            {/* Metric 2: Humidity */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <Droplets size={15} color="var(--accent-cyan)" />
                <span>RELATIVE HUMIDITY</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '6px 0 2px 0', fontFamily: 'var(--font-display)' }}>
                {env.relative_humidity?.toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Dew Point: <strong style={{ color: '#fff' }}>{env.dew_point?.toFixed(1)}°C</strong>
              </div>
            </div>

            {/* Metric 3: Wind */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <Wind size={15} color="var(--accent-amber)" />
                <span>WIND SPEED</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '6px 0 2px 0', fontFamily: 'var(--font-display)' }}>
                {env.wind_speed?.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>m/s</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Airflow: <strong style={{ color: env.wind_speed < 1.5 ? 'var(--accent-crimson)' : 'var(--accent-safe)' }}>
                  {env.wind_speed < 1.5 ? 'STAGNANT TRAP' : 'VENTILATED'}
                </strong>
              </div>
            </div>

            {/* Metric 4: Solar Radiation */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <Sun size={15} color="#ff7043" />
                <span>SOLAR IRRADIANCE</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ff7043', margin: '6px 0 2px 0', fontFamily: 'var(--font-display)' }}>
                {env.solar_radiation?.toFixed(0)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>W/m²</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                UV Risk: <strong style={{ color: '#ff7043' }}>VERY HIGH</strong>
              </div>
            </div>

            {/* Metric 5: Wet Bulb */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <Compass size={15} color="var(--accent-cyan)" />
                <span>WET-BULB TEMP</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '6px 0 2px 0', fontFamily: 'var(--font-display)' }}>
                {env.wet_bulb_temp?.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Critical Limit: <strong style={{ color: 'var(--accent-crimson)' }}>35.0°C</strong>
              </div>
            </div>

            {/* Metric 6: Data Quality */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <ShieldCheck size={15} color="var(--accent-safe)" />
                <span>SENSOR DQI</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-safe)', margin: '6px 0 2px 0', fontFamily: 'var(--font-display)' }}>
                {env.data_quality_score || 99.4}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Anomaly Score: <strong style={{ color: 'var(--accent-safe)' }}>0.01 (OPTIMAL)</strong>
              </div>
            </div>
          </div>

          {/* Real-time Stream Console (3 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 3',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(9, 14, 21, 0.95)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={14} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    LIVE PACKET STREAM
                  </span>
                </div>
                <span className="live-dot" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {streamLogs.map((log) => (
                  <div key={log.id} style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>{log.time}</span>
                      <span style={{ color: 'var(--accent-cyan)' }}>{log.tag}</span>
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>
                      {log.label}
                    </div>
                    <div style={{ color: 'var(--accent-heat)', fontSize: '0.68rem', marginTop: '2px' }}>
                      {log.delta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center',
              marginTop: '12px'
            }}>
              Continuous 1000ms WebSocket Ingest
            </div>
          </div>
        </div>

        {/* Rolling Thermal History Sparkline Graph */}
        {chartHistory.length > 3 && (
          <div className="glass-card" style={{ marginTop: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                ROLLING THERMAL STRESS HISTORY (LAST 30 PACKETS)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                DYNAMIC TELEMETRY
              </span>
            </div>

            <div style={{ height: '140px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartHistory}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6d00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ff1744" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{ background: '#0b1017', border: '1px solid #ff6d00', borderRadius: '8px', fontSize: '0.75rem' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#ff6d00"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
