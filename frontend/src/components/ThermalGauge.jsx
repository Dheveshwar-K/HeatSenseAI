import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, Zap } from 'lucide-react';

function getCategoryColor(category = 'LOW') {
  switch (category) {
    case 'LOW':
      return { stroke: '#00e676', bg: 'badge-low', text: 'var(--color-green)' };
    case 'MODERATE':
      return { stroke: '#ffab00', bg: 'badge-moderate', text: 'var(--color-amber)' };
    case 'HIGH':
      return { stroke: '#ff6d00', bg: 'badge-high', text: 'var(--color-orange)' };
    case 'VERY HIGH':
      return { stroke: '#ff3d00', bg: 'badge-very-high', text: '#ff3d00' };
    case 'EXTREME':
    default:
      return { stroke: '#ff1744', bg: 'badge-extreme', text: 'var(--color-red)' };
  }
}

export default function ThermalGauge({
  score = 88,
  category = 'EXTREME',
  probability = 0.94,
  heatwaveStatus = 'SEVERE',
  isEmergency = false
}) {
  const colorMeta = getCategoryColor(category);
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '16px'
    }}>
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="12"
          />
          {/* Dynamic Progress Arc */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="transparent"
            stroke={colorMeta.stroke}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
              filter: `drop-shadow(0 0 10px ${colorMeta.stroke})`
            }}
          />
        </svg>

        {/* Center Numbers */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-hud)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em'
          }}>
            Thermal Stress
          </div>

          <div style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.0,
            color: '#fff',
            textShadow: `0 0 25px ${colorMeta.stroke}`
          }}>
            {Math.round(score)}
          </div>

          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: '2px'
          }}>
            / 100
          </div>
        </div>
      </div>

      {/* Badges and Subtitle */}
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div className={`badge ${colorMeta.bg}`} style={{ fontSize: '0.95rem', padding: '6px 16px' }}>
          {category === 'EXTREME' ? <Flame size={16} /> : <AlertTriangle size={16} />}
          <span>{category} RISK</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.76rem',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span>AI Conf: <strong style={{ color: 'var(--color-cyan)' }}>{(probability * 100).toFixed(0)}%</strong></span>
          <span>•</span>
          <span>Heatwave: <strong style={{ color: heatwaveStatus === 'SEVERE' ? 'var(--color-red)' : 'var(--color-amber)' }}>{heatwaveStatus}</strong></span>
        </div>
      </div>
    </div>
  );
}
