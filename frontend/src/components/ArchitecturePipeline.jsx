import React, { useState } from 'react';
import { Layers, Database, ShieldCheck, Cpu, Activity, AlertOctagon, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ArchitecturePipeline() {
  const [activeStage, setActiveStage] = useState(3);

  const stages = [
    {
      id: 0,
      name: 'DATA INGESTION',
      sub: 'Open-Meteo & IoT Array',
      icon: <Database size={18} color="var(--accent-cyan)" />,
      desc: 'Ingests real-time dry-bulb temperature, relative humidity, wind velocity, and solar irradiance packets via high-frequency REST & WebSocket streams.',
      tech: 'Open-Meteo API • Local IoT Microstations • NOAA Reanalysis'
    },
    {
      id: 1,
      name: 'ANOMALY FILTER',
      sub: 'Isolation Forest + DQI',
      icon: <ShieldCheck size={18} color="var(--accent-safe)" />,
      desc: 'Validates sensor integrity using scikit-learn Isolation Forest to filter corrupted telemetry spikes and assigns a real-time Data Quality Index (DQI).',
      tech: 'Isolation Forest (Contamination=0.01) • Z-Score Validator'
    },
    {
      id: 2,
      name: 'FEATURE PIPELINE',
      sub: 'Thermodynamics & Lags',
      icon: <Cpu size={18} color="var(--accent-amber)" />,
      desc: 'Computes saturated vapor pressures (Tetens equation), enthalpy, lagged rolling averages, and nocturnal heat retention deficits.',
      tech: 'NumPy Vectorized Physics • Pandas Rolling Windows'
    },
    {
      id: 3,
      name: 'ML RISK ENGINE',
      sub: 'RandomForest Champion',
      icon: <Cpu size={18} color="var(--accent-heat)" />,
      desc: 'Deploys our champion Random Forest ensemble (90.14% Accuracy, 86.92% Macro-Recall) trained on comprehensive climate datasets to classify thermal risk.',
      tech: 'Scikit-Learn Ensemble • 5-Class Stratified Cross-Validation'
    },
    {
      id: 4,
      name: 'MULTI-HORIZON FORECAST',
      sub: '15m to 24h Regressors',
      icon: <Activity size={18} color="var(--accent-cyan)" />,
      desc: 'Projects forward trajectory of temperature, humidity, and heat stress across 5 forecast horizons with 90% empirical confidence intervals.',
      tech: 'Gradient Boosted Multi-Output Regressors'
    },
    {
      id: 5,
      name: 'CRISIS ESCALATION',
      sub: 'Deterministic 6-State FSM',
      icon: <AlertOctagon size={18} color="var(--accent-crimson)" />,
      desc: 'Governs acoustic siren triggers, threshold timers, acknowledgement tokens, and telephony cooldown cycles.',
      tech: 'FastAPI State Machine • Asyncio Event Loops'
    },
    {
      id: 6,
      name: 'TELEPHONY & ALARMS',
      sub: 'Two-Number Calling',
      icon: <PhoneCall size={18} color="#ff5252" />,
      desc: 'Automatically places emergency telephone calls to Primary and Secondary emergency contacts when extreme risk persists.',
      tech: 'Dual-Carrier Telephony Gateway • Web Audio API Synthesizer'
    }
  ];

  const current = stages[activeStage];

  return (
    <section id="architecture" style={{
      padding: '80px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px'
          }}>
            <Layers size={14} />
            <span>10 • SYSTEM ARCHITECTURE & DATA LIFECYCLE</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '12px'
          }}>
            END-TO-END <br />
            <span className="gradient-text-cyan">CLIMATE INTELLIGENCE PIPELINE.</span>
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Trace how raw atmospheric sensor packets traverse through anomaly detection, thermodynamic physics, machine learning classification, and automated emergency escalation.
          </p>
        </div>

        {/* 7-Stage Horizontal Pipeline Visualizer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px',
          marginBottom: '28px'
        }}>
          {stages.map((st) => {
            const isSelected = activeStage === st.id;
            return (
              <div
                key={st.id}
                onClick={() => setActiveStage(st.id)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '16px',
                  background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'rgba(17, 24, 34, 0.65)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '130px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {st.icon}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    0{st.id + 1}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-secondary)', marginTop: '8px' }}>
                    {st.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {st.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Deep Dive Banner */}
        <div className="glass-card" style={{
          padding: '32px',
          background: 'radial-gradient(circle at top right, rgba(0, 229, 255, 0.08) 0%, rgba(17, 24, 34, 0.95) 75%)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(0, 229, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {current.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  STAGE 0{current.id + 1} • {current.name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {current.sub}
                </div>
              </div>
            </div>

            <span className="status-badge status-badge-safe">
              SUBSYSTEM ACTIVE & VERIFIED
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '900px' }}>
            {current.desc}
          </p>

          <div style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '12px 18px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              UNDERLYING TECHNOLOGIES:
            </span>
            <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {current.tech}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
