import React from 'react';
import { Shield, AlertCircle, Flame, Moon, Sun, Clock } from 'lucide-react';

export default function HeatwaveStatus({
  status = 'SEVERE',
  maxTemp = 42.5,
  minNightTemp = 28.2,
  durationHours = 36
}) {
  const statusLevels = [
    { name: 'NORMAL', desc: 'Baseline meteorological conditions', activeColor: '#00e676' },
    { name: 'WATCH', desc: 'Temperatures approaching local 90th percentile', activeColor: '#ffab00' },
    { name: 'WARNING', desc: 'Consecutive high diurnal heat accumulation', activeColor: '#ff6d00' },
    { name: 'SEVERE', desc: 'Extreme dangerous heatwave across day and night', activeColor: '#ff1744' }
  ];

  const currentIdx = statusLevels.findIndex(s => s.name === status);
  const activeColor = statusLevels[currentIdx]?.activeColor || '#ff1744';

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={20} color={activeColor} />
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff', letterSpacing: '0.04em' }}>
            METEOROLOGICAL HEATWAVE REGIME
          </h3>
        </div>

        <span style={{
          fontFamily: 'var(--font-hud)',
          fontSize: '0.85rem',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: '6px',
          background: `${activeColor}22`,
          color: activeColor,
          border: `1px solid ${activeColor}`
        }}>
          STATUS: {status}
        </span>
      </div>

      {/* Progress Levels Ladder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {statusLevels.map((lvl, idx) => {
          const isActive = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={lvl.name}
              style={{
                background: isCurrent ? `${lvl.activeColor}20` : 'rgba(255, 255, 255, 0.03)',
                border: isCurrent ? `1.5px solid ${lvl.activeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '10px 8px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: isActive ? lvl.activeColor : 'var(--text-muted)'
              }}>
                {lvl.name}
              </div>
              <div style={{
                fontSize: '0.62rem',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                lineHeight: 1.2
              }}>
                {lvl.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Meteorological Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={18} color="#ff3d00" />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PEAK DAY TEMP</div>
            <div style={{ fontSize: '1.05rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: '#fff' }}>{maxTemp.toFixed(1)} °C</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Moon size={18} color="#00e5ff" />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MIN NIGHT TEMP</div>
            <div style={{ fontSize: '1.05rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: minNightTemp >= 25 ? '#ff3d00' : '#fff' }}>
              {minNightTemp.toFixed(1)} °C
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#ffd600" />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DURATION</div>
            <div style={{ fontSize: '1.05rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: '#fff' }}>{durationHours} Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
