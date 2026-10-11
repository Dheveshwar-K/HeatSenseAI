import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function LiveThermalChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState('score');

  const metricConfigs = {
    score: { label: 'Thermal Stress Score', key: 'score', color: '#ff1744', unit: '/100' },
    temp: { label: 'Temperature', key: 'temperature', color: '#ff3d00', unit: '°C' },
    humidity: { label: 'Humidity', key: 'humidity', color: '#00e5ff', unit: '%' },
    dewPoint: { label: 'Dew Point', key: 'dewPoint', color: '#b388ff', unit: '°C' },
    wind: { label: 'Wind Speed', key: 'wind', color: '#ffd600', unit: 'm/s' }
  };

  const currentCfg = metricConfigs[activeMetric];

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff', letterSpacing: '0.04em' }}>
            REAL-TIME THERMAL TELEMETRY STREAM
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            High-frequency WebSocket continuous time series monitoring
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 0, 0, 0.35)', padding: '4px', borderRadius: '8px' }}>
          {Object.entries(metricConfigs).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              style={{
                background: activeMetric === key ? `${cfg.color}25` : 'transparent',
                border: activeMetric === key ? `1px solid ${cfg.color}` : '1px solid transparent',
                color: activeMetric === key ? cfg.color : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-hud)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: activeMetric === key ? 700 : 500
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentCfg.color} stopOpacity={0.65} />
                <stop offset="95%" stopColor={currentCfg.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="time"
              stroke="#57657e"
              tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            />
            <YAxis
              stroke="#57657e"
              tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(7, 10, 19, 0.92)',
                border: `1px solid ${currentCfg.color}`,
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
            />
            <Area
              type="monotone"
              dataKey={currentCfg.key}
              name={currentCfg.label}
              stroke={currentCfg.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#chartGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
