import React from 'react';
import ForecastPanel from '../components/ForecastPanel';
import LiveThermalChart from '../components/LiveThermalChart';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Forecast({ liveState }) {
  const { data, chartHistory } = liveState;
  const forecast = data?.forecast || {};
  const current = {
    temperature: data?.environmental?.temperature,
    relative_humidity: data?.environmental?.relative_humidity,
    dew_point: data?.environmental?.dew_point,
    score: data?.thermal_assessment?.score,
    risk_category: data?.thermal_assessment?.risk_category
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={22} color="var(--color-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: '#fff' }}>
            MULTI-HORIZON REAL-TIME THERMAL STRESS FORECASTING
          </h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Autoregressive climate trajectory (15m, 30m, 60m, 120m, 6h) with uncertainty intervals and early danger detection
        </p>
      </div>

      <ForecastPanel forecast={forecast} current={current} />
      <LiveThermalChart data={chartHistory} />
    </div>
  );
}
