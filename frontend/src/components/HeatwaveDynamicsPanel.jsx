import React from 'react';
import { Flame, Moon, Sun, Layers, AlertCircle, ShieldCheck } from 'lucide-react';

export default function HeatwaveDynamicsPanel({ heatwave = {} }) {
  const cum = heatwave.cumulative_heat_load || {
    last_1h_points: 42,
    last_6h_points: 286,
    last_24h_points: 1034,
    exposure_level: 'EXTREME'
  };

  const peak = heatwave.day_peak_temperature ?? 42.2;
  const nightMin = heatwave.night_min_temperature ?? 29.5;
  const diff = heatwave.cooling_differential ?? 12.7;
  const poorRecovery = heatwave.poor_nighttime_recovery ?? true;
  const accumIndex = heatwave.heat_accumulation_index ?? 68.9;

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} color="var(--color-red)" />
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff' }}>
            CUMULATIVE HEAT LOAD & NIGHTTIME RECOVERY
          </h3>
        </div>
        <span style={{
          fontFamily: 'var(--font-hud)',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '4px',
          background: poorRecovery ? 'rgba(255,23,68,0.2)' : 'rgba(0,230,118,0.2)',
          color: poorRecovery ? 'var(--color-red)' : 'var(--color-green)',
          border: `1px solid ${poorRecovery ? 'var(--color-red)' : 'var(--color-green)'}`
        }}>
          {poorRecovery ? 'POOR NIGHTTIME RECOVERY' : 'NORMAL COOLING'}
        </span>
      </div>

      {/* Cumulative Exposure Load Meters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PAST 1 HOUR</div>
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
            {cum.last_1h_points} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>pts</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '6px' }}>
            <div style={{ width: `${Math.min(100, cum.last_1h_points * 1.5)}%`, height: '100%', background: 'var(--color-cyan)', borderRadius: '2px' }} />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PAST 6 HOURS</div>
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: 'var(--color-amber)', marginTop: '2px' }}>
            {cum.last_6h_points} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>pts</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '6px' }}>
            <div style={{ width: `${Math.min(100, cum.last_6h_points / 4)}%`, height: '100%', background: 'var(--color-amber)', borderRadius: '2px' }} />
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PAST 24 HOURS</div>
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: 'var(--color-red)', marginTop: '2px' }}>
            {cum.last_24h_points} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>pts</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '6px' }}>
            <div style={{ width: `${Math.min(100, cum.last_24h_points / 15)}%`, height: '100%', background: 'var(--color-red)', borderRadius: '2px' }} />
          </div>
        </div>
      </div>

      {/* Nighttime Differential Analysis */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DAY PEAK</div>
            <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: '#fff' }}>{peak.toFixed(1)}°C</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>➔</div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NIGHT MINIMUM</div>
            <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: poorRecovery ? 'var(--color-red)' : 'var(--color-green)' }}>
              {nightMin.toFixed(1)}°C
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {poorRecovery ? '⚠ Stagnant nocturnal heat impedes human biological thermal dissipation' : '✓ Normal nocturnal physiological recovery verified'}
        </div>
      </div>
    </div>
  );
}
