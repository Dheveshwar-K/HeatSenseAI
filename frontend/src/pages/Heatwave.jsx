import React from 'react';
import HeatwaveStatus from '../components/HeatwaveStatus';
import HeatwaveDynamicsPanel from '../components/HeatwaveDynamicsPanel';
import HeatwaveCalendar from '../components/HeatwaveCalendar';
import { Flame, Calendar, Sun, Moon } from 'lucide-react';

export default function Heatwave({ liveState }) {
  const { data } = liveState;
  const env = data?.environmental || {};
  const hwData = data?.heatwave_dynamics || {};
  const hwStatus = data?.thermal_assessment?.heatwave_status || 'SEVERE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={22} color="var(--color-red)" />
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: '#fff' }}>
            METEOROLOGICAL HEATWAVE REGIME & CUMULATIVE EXPOSURE
          </h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Diurnal heat accumulation, nocturnal cooling deficit analysis, and multi-day exposure tracking
        </p>
      </div>

      <HeatwaveStatus
        status={hwStatus}
        maxTemp={hwData.day_peak_temperature || 42.2}
        minNightTemp={hwData.night_min_temperature || 29.5}
        durationHours={hwData.consecutive_hot_hours || 36}
      />

      <HeatwaveDynamicsPanel heatwave={hwData} />
      <HeatwaveCalendar />
    </div>
  );
}
