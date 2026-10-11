import React from 'react';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

function getTrendBadge(trend) {
  if (!trend) return <Minus size={14} color="var(--text-muted)" />;
  if (trend.arrow === 'UP') {
    return <span style={{ color: 'var(--color-red)', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}><ArrowUpRight size={14} /> +{trend.delta}°</span>;
  } else if (trend.arrow === 'DOWN') {
    return <span style={{ color: 'var(--color-cyan)', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}><ArrowDownRight size={14} /> {trend.delta}°</span>;
  }
  return <span style={{ color: 'var(--text-muted)' }}>—</span>;
}

export default function ForecastPanel({ forecast = {}, current = {} }) {
  const f15 = forecast.forecast_15m || {};
  const f30 = forecast.forecast_30m || {};
  const f60 = forecast.forecast_60m || {};
  const f120 = forecast.forecast_120m || {};
  const f6h = forecast.forecast_6h || {};
  const ttd = forecast.time_to_danger || {};

  const horizons = [
    { label: 'NOW', temp: current.temperature, rh: current.relative_humidity, dp: current.dew_point, score: current.score || 88, cat: current.risk_category || 'EXTREME', isActual: true },
    { label: '15 MIN', temp: f15.temperature, rh: f15.relative_humidity, dp: f15.dew_point, score: f15.thermal_stress_score, cat: f15.risk_category, interval: f15.temp_interval, trend: f15.trend },
    { label: '30 MIN', temp: f30.temperature, rh: f30.relative_humidity, dp: f30.dew_point, score: f30.thermal_stress_score, cat: f30.risk_category, interval: f30.temp_interval, trend: f30.trend },
    { label: '60 MIN', temp: f60.temperature, rh: f60.relative_humidity, dp: f60.dew_point, score: f60.thermal_stress_score, cat: f60.risk_category, interval: f60.temp_interval, trend: f60.trend },
    { label: '120 MIN', temp: f120.temperature, rh: f120.relative_humidity, dp: f120.dew_point, score: f120.thermal_stress_score, cat: f120.risk_category, interval: f120.temp_interval, trend: f120.trend }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      {/* Header & Time-To-Danger Alert */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--color-cyan)" />
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.1rem', color: '#fff', letterSpacing: '0.04em' }}>
              REAL-TIME MULTI-HORIZON THERMAL FORECAST
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            15m, 30m, 60m & 120m autoregressive trajectory with prediction intervals
          </p>
        </div>

        {/* Time To Danger Countdown Badge */}
        <div style={{
          background: ttd.is_approaching ? 'rgba(255,23,68,0.2)' : 'rgba(0,229,255,0.1)',
          border: `1.5px solid ${ttd.is_approaching ? 'var(--color-red)' : 'var(--color-cyan)'}`,
          padding: '6px 14px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Clock size={16} color={ttd.is_approaching ? 'var(--color-red)' : 'var(--color-cyan)'} />
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EARLY WARNING ENGINE</div>
            <div style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: ttd.is_approaching ? 'var(--color-red)' : 'var(--color-cyan)'
            }}>
              {ttd.status_message || 'CALCULATING TRAJECTORY...'}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Horizon Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {horizons.map((h, i) => (
          <div
            key={i}
            style={{
              background: h.isActual ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: h.isActual ? '1.5px solid var(--color-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: h.isActual ? 'var(--color-cyan)' : '#fff'
              }}>
                {h.label}
              </span>
              <span style={{
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                color: h.isActual ? 'var(--color-cyan)' : 'var(--text-muted)'
              }}>
                {h.isActual ? '● ACTUAL' : 'PREDICTED'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                {h.temp !== undefined ? `${Number(h.temp).toFixed(1)}°` : '--'}
              </span>
              {getTrendBadge(h.trend)}
            </div>

            {/* Uncertainty Interval */}
            {h.interval && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Range: [{h.interval[0]}° - {h.interval[1]}°C]
              </div>
            )}

            {/* Future Thermal Stress Score Pill */}
            <div style={{
              marginTop: '6px',
              padding: '4px 6px',
              borderRadius: '4px',
              background: h.cat === 'EXTREME' ? 'rgba(255,23,68,0.2)' : h.cat === 'VERY HIGH' ? 'rgba(255,61,0,0.2)' : 'rgba(0,230,118,0.2)',
              border: `1px solid ${h.cat === 'EXTREME' ? 'var(--color-red)' : h.cat === 'VERY HIGH' ? '#ff3d00' : 'var(--color-green)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <span>Stress Score:</span>
              <strong>{h.score ? Math.round(h.score) : '--'}/100</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Predictive Weather Table */}
      <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '8px' }}>PARAMETER</th>
              <th style={{ padding: '8px', color: 'var(--color-cyan)' }}>NOW (ACTUAL)</th>
              <th style={{ padding: '8px' }}>+15 MIN (FCST)</th>
              <th style={{ padding: '8px' }}>+30 MIN (FCST)</th>
              <th style={{ padding: '8px' }}>+60 MIN (FCST)</th>
              <th style={{ padding: '8px' }}>+120 MIN (FCST)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '8px', color: '#fff', fontWeight: 600 }}>Temperature (°C)</td>
              <td style={{ padding: '8px', color: 'var(--color-cyan)' }}>{current.temperature?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f15.temperature?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f30.temperature?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f60.temperature?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f120.temperature?.toFixed(1) || '--'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '8px', color: '#fff', fontWeight: 600 }}>Relative Humidity (%)</td>
              <td style={{ padding: '8px', color: 'var(--color-cyan)' }}>{current.relative_humidity ? Math.round(current.relative_humidity) : '--'}%</td>
              <td style={{ padding: '8px' }}>{f15.relative_humidity ? Math.round(f15.relative_humidity) : '--'}%</td>
              <td style={{ padding: '8px' }}>{f30.relative_humidity ? Math.round(f30.relative_humidity) : '--'}%</td>
              <td style={{ padding: '8px' }}>{f60.relative_humidity ? Math.round(f60.relative_humidity) : '--'}%</td>
              <td style={{ padding: '8px' }}>{f120.relative_humidity ? Math.round(f120.relative_humidity) : '--'}%</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '8px', color: '#fff', fontWeight: 600 }}>Dew Point (°C)</td>
              <td style={{ padding: '8px', color: 'var(--color-cyan)' }}>{current.dew_point?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f15.dew_point?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f30.dew_point?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f60.dew_point?.toFixed(1) || '--'}</td>
              <td style={{ padding: '8px' }}>{f120.dew_point?.toFixed(1) || '--'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '8px', color: '#fff', fontWeight: 600 }}>Thermal Stress Score</td>
              <td style={{ padding: '8px', color: 'var(--color-cyan)', fontWeight: 700 }}>{current.score ? Math.round(current.score) : '--'}</td>
              <td style={{ padding: '8px' }}>{f15.thermal_stress_score ? Math.round(f15.thermal_stress_score) : '--'}</td>
              <td style={{ padding: '8px' }}>{f30.thermal_stress_score ? Math.round(f30.thermal_stress_score) : '--'}</td>
              <td style={{ padding: '8px' }}>{f60.thermal_stress_score ? Math.round(f60.thermal_stress_score) : '--'}</td>
              <td style={{ padding: '8px' }}>{f120.thermal_stress_score ? Math.round(f120.thermal_stress_score) : '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
