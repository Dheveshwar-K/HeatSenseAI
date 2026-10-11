import React, { useState } from 'react';
import { Calendar as CalIcon, Flame, Sun } from 'lucide-react';

export default function HeatwaveCalendar({ calendarData = [] }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const mockCalendar = calendarData.length > 0 ? calendarData : [
    { date: '2026-09-10', day_label: 'Sep 10', max_temp: 24.2, min_temp: 14.1, thermal_score: 18.0, risk_tier: 'LOW', heatwave_status: 'NORMAL', extreme_hours: 0 },
    { date: '2026-09-11', day_label: 'Sep 11', max_temp: 23.5, min_temp: 13.8, thermal_score: 16.5, risk_tier: 'LOW', heatwave_status: 'NORMAL', extreme_hours: 0 },
    { date: '2026-09-12', day_label: 'Sep 12', max_temp: 25.1, min_temp: 14.9, thermal_score: 19.2, risk_tier: 'LOW', heatwave_status: 'NORMAL', extreme_hours: 0 },
    { date: '2026-09-13', day_label: 'Sep 13', max_temp: 28.4, min_temp: 17.2, thermal_score: 32.0, risk_tier: 'MODERATE', heatwave_status: 'WATCH', extreme_hours: 0 },
    { date: '2026-09-14', day_label: 'Sep 14', max_temp: 34.0, min_temp: 21.0, thermal_score: 55.0, risk_tier: 'HIGH', heatwave_status: 'WATCH', extreme_hours: 0 },
    { date: '2026-09-15', day_label: 'Sep 15', max_temp: 38.2, min_temp: 26.5, thermal_score: 76.0, risk_tier: 'VERY HIGH', heatwave_status: 'WARNING', extreme_hours: 3 },
    { date: '2026-09-16', day_label: 'Sep 16', max_temp: 41.5, min_temp: 29.8, thermal_score: 92.0, risk_tier: 'EXTREME', heatwave_status: 'SEVERE', extreme_hours: 8 },
    { date: '2026-09-17', day_label: 'Sep 17', max_temp: 42.8, min_temp: 30.2, thermal_score: 95.0, risk_tier: 'EXTREME', heatwave_status: 'SEVERE', extreme_hours: 10 },
    { date: '2026-09-18', day_label: 'Sep 18', max_temp: 42.0, min_temp: 29.0, thermal_score: 93.0, risk_tier: 'EXTREME', heatwave_status: 'SEVERE', extreme_hours: 9 },
    { date: '2026-09-19', day_label: 'Sep 19', max_temp: 39.5, min_temp: 27.0, thermal_score: 82.0, risk_tier: 'EXTREME', heatwave_status: 'SEVERE', extreme_hours: 5 },
    { date: '2026-09-20', day_label: 'Sep 20', max_temp: 35.0, min_temp: 23.0, thermal_score: 62.0, risk_tier: 'VERY HIGH', heatwave_status: 'WARNING', extreme_hours: 1 },
    { date: '2026-09-21', day_label: 'Sep 21', max_temp: 29.0, min_temp: 18.0, thermal_score: 35.0, risk_tier: 'MODERATE', heatwave_status: 'WATCH', extreme_hours: 0 },
    { date: '2026-09-22', day_label: 'Sep 22', max_temp: 24.5, min_temp: 15.0, thermal_score: 18.0, risk_tier: 'LOW', heatwave_status: 'NORMAL', extreme_hours: 0 },
    { date: '2026-09-23', day_label: 'Sep 23', max_temp: 22.0, min_temp: 13.5, thermal_score: 14.0, risk_tier: 'LOW', heatwave_status: 'NORMAL', extreme_hours: 0 }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalIcon size={18} color="var(--color-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff' }}>
            14-DAY HEATWAVE CALENDAR HEATMAP
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          CLICK DAY FOR DETAILS
        </span>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {mockCalendar.map((d, i) => {
          const color = d.risk_tier === 'EXTREME' ? 'var(--color-red)' : d.risk_tier === 'VERY HIGH' ? '#ff3d00' : d.risk_tier === 'HIGH' ? 'var(--color-orange)' : d.risk_tier === 'MODERATE' ? 'var(--color-amber)' : 'var(--color-green)';
          return (
            <div
              key={i}
              onClick={() => setSelectedDay(d)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${color}`,
                borderRadius: '8px',
                padding: '10px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.day_label}</div>
              <div style={{ fontSize: '1.05rem', fontFamily: 'var(--font-hud)', fontWeight: 800, color, marginTop: '2px' }}>
                {Math.round(d.max_temp)}°
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {d.risk_tier}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--color-cyan)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <div>
            <strong>{selectedDay.date}:</strong> Peak Temp: <span style={{ color: '#fff' }}>{selectedDay.max_temp}°C</span> | Night Min: <span style={{ color: 'var(--color-cyan)' }}>{selectedDay.min_temp}°C</span> | Stress Score: <span style={{ color: 'var(--color-red)' }}>{selectedDay.thermal_score}/100</span>
          </div>
          <div>Extreme Hours: <strong>{selectedDay.extreme_hours}h</strong></div>
        </div>
      )}
    </div>
  );
}
