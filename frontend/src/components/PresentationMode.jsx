import React, { useState } from 'react';
import { Play, SkipForward, CheckCircle2, ShieldAlert, Radio } from 'lucide-react';

export default function PresentationMode({ currentScenario = 'EXTREME', onSelectScenario = () => {} }) {
  const scenarios = [
    { id: 'NORMAL', label: '1. NORMAL (21°C)', desc: 'Baseline comfort, calm atmosphere, zero alerts' },
    { id: 'MODERATE', label: '2. MODERATE (30°C)', desc: 'Warm day, subtle thermal particles, elevated index' },
    { id: 'HIGH', label: '3. HIGH (35°C)', desc: 'Warning threshold approached, high radiant load' },
    { id: 'VERY_HIGH', label: '4. VERY HIGH (39°C)', desc: 'Heavy sweat restriction, predictive alerts active' },
    { id: 'EXTREME', label: '5. EXTREME (42.5°C)', desc: 'Score > 80, visual & audible alarms, extreme warning' },
    { id: 'EMERGENCY', label: '6. EMERGENCY (44°C)', desc: 'Persistence verified, dual telephone calls dispatched' },
    { id: 'RECOVERY', label: '7. RECOVERY (24°C)', desc: 'Conditions cool down, alarms automatically resolve' },
    { id: 'SENSOR_FAILURE', label: '8. SENSOR FAULT', desc: 'Simulated erroneous reading, data quality drops' },
    { id: 'NETWORK_FAILURE', label: '9. OFFLINE MODE', desc: 'Internet down, local cached forecast active' },
    { id: 'CALL_FAILURE', label: '10. CALL FAILOVER', desc: 'Contact 1 fails, automatically falls back to Contact 2' }
  ];

  const currentIdx = scenarios.findIndex(s => s.id === currentScenario);

  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % scenarios.length;
    onSelectScenario(scenarios[nextIdx].id);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={18} color="var(--color-cyan)" />
          <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: '#fff' }}>
            JURY DEMONSTRATION & PRESENTATION STEPPER
          </h4>
        </div>

        <button
          onClick={handleNext}
          style={{
            background: 'linear-gradient(135deg, var(--color-cyan) 0%, #00b0ff 100%)',
            color: '#000',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '6px',
            fontFamily: 'var(--font-hud)',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--glow-cyan)'
          }}
        >
          <span>NEXT DEMO SCENARIO</span>
          <SkipForward size={16} />
        </button>
      </div>

      {/* Scenario Pill Buttons */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {scenarios.map((s, idx) => {
          const isSelected = currentScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScenario(s.id)}
              style={{
                background: isSelected ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1.5px solid var(--color-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isSelected ? 'var(--color-cyan)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-hud)',
                fontSize: '0.72rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        Active Event: <strong>{scenarios[currentIdx]?.desc}</strong>
      </div>
    </div>
  );
}
