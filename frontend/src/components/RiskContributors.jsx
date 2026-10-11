import React, { useState } from 'react';
import { Info, HelpCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function RiskContributors({
  contributors = {},
  riskReasons = []
}) {
  const [selectedFactor, setSelectedFactor] = useState(null);

  const factorKeys = [
    { key: 'temperature', label: 'Temperature', color: '#ff3d00' },
    { key: 'humidity', label: 'Relative Humidity', color: '#00e5ff' },
    { key: 'dew_point', label: 'Dew Point Moisture', color: '#b388ff' },
    { key: 'solar_radiation', label: 'Solar Irradiance', color: '#ffab00' },
    { key: 'wind_cooling', label: 'Wind Convective Cooling', color: '#ffd600' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff', letterSpacing: '0.04em' }}>
            THERMAL RISK CONTRIBUTORS (EXPLAINABLE AI)
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
            CLICK FACTOR FOR DETAILS
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
          Decomposition of environmental heat stress drivers
        </p>
      </div>

      {/* Contributor Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {factorKeys.map(({ key, label, color }) => {
          const item = contributors[key] || {
            score_points: 0,
            percentage: 20,
            status: 'NORMAL',
            current_value: '--',
            explanation: 'Factor metrics pending calculation.'
          };

          return (
            <div
              key={key}
              onClick={() => setSelectedFactor({ ...item, label, color })}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-hud)', fontWeight: 600, color: '#fff' }}>
                  {label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color }}>
                    {item.current_value}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${color}20`,
                    color,
                    fontWeight: 700
                  }}>
                    {item.status}
                  </span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </div>

              {/* Graphical Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(8, item.percentage * 2.5))}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '4px',
                    transition: 'width 0.6s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* "Why Am I At Risk?" Live Reasoning Card */}
      <div style={{
        background: 'rgba(0, 229, 255, 0.04)',
        border: '1px solid rgba(0, 229, 255, 0.2)',
        borderRadius: '8px',
        padding: '14px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          color: 'var(--color-cyan)',
          fontFamily: 'var(--font-hud)',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          <HelpCircle size={16} />
          <span>WHY IS THERMAL RISK HIGH?</span>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {riskReasons.map((reason, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
              <CheckCircle2 size={14} color="#00e5ff" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected Factor Modal / Detail Overlay */}
      {selectedFactor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '24px', border: `1.5px solid ${selectedFactor.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.15rem', color: selectedFactor.color }}>
                {selectedFactor.label}
              </h4>
              <button
                onClick={() => setSelectedFactor(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div><strong>Current Reading:</strong> <span style={{ color: selectedFactor.color, fontFamily: 'var(--font-mono)' }}>{selectedFactor.current_value}</span></div>
              <div><strong>Status:</strong> <span style={{ color: selectedFactor.color, fontWeight: 700 }}>{selectedFactor.status}</span></div>
              <div><strong>Weighted Impact:</strong> <span>{selectedFactor.score_points} points</span></div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', color: 'var(--text-secondary)' }}>
                {selectedFactor.explanation}
              </div>
            </div>

            <button
              onClick={() => setSelectedFactor(null)}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '8px',
                background: selectedFactor.color,
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
