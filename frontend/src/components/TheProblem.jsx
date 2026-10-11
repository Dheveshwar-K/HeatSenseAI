import React, { useState } from 'react';
import { AlertTriangle, Thermometer, Droplets, Wind, Sun, Moon, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TheProblem() {
  const [activeTab, setActiveTab] = useState('humidity');

  const scenarios = {
    humidity: {
      title: 'The Evaporative Cooling Trap',
      icon: <Droplets size={20} color="var(--accent-cyan)" />,
      param: 'Relative Humidity > 75%',
      impact: 'When humidity rises, the air is saturated with water vapor. Human sweating can no longer evaporate into the surrounding air, completely neutralizing the body’s primary biological cooling mechanism.',
      metricA: '36°C @ 80% RH',
      labelA: 'Apparent Heat Index: 54.2°C (EXTREME)',
      metricB: '40°C @ 20% RH',
      labelB: 'Apparent Heat Index: 39.1°C (MODERATE)'
    },
    wind: {
      title: 'Boundary Layer Stagnation',
      icon: <Wind size={20} color="var(--accent-amber)" />,
      param: 'Wind Velocity < 1.2 m/s',
      impact: 'Low air movement traps a microclimatic boundary layer of saturated hot air against human skin and clothing. Convective cooling drops to near zero, causing rapid internal core temperature accumulation.',
      metricA: 'Wind Speed: 0.5 m/s',
      labelA: 'Convective Heat Dissipation: -72%',
      metricB: 'Wind Speed: 4.2 m/s',
      labelB: 'Convective Heat Dissipation: Normal'
    },
    radiation: {
      title: 'Direct Solar & Surface Radiant Load',
      icon: <Sun size={20} color="var(--accent-heat)" />,
      param: 'Solar Radiation > 900 W/m²',
      impact: 'Shortwave solar radiation combined with longwave thermal radiation emitted by asphalt and concrete adds an extra 5–9°C equivalent thermal load directly onto exposed human skin and organs.',
      metricA: 'Direct Solar Exposure',
      labelA: 'Mean Radiant Temp: +8.5°C over ambient',
      metricB: 'Shaded Canopy',
      labelB: 'Mean Radiant Temp: Baseline ambient'
    },
    night: {
      title: 'Nighttime Non-Recovery Deficit',
      icon: <Moon size={20} color="var(--accent-violet)" />,
      param: 'Night Minimum > 26°C',
      impact: 'The human cardiovascular system requires overnight cooling (<22°C) to lower core body temperature and recover cardiac output. High nocturnal heat prevents biological reset, compounding daily thermal strain.',
      metricA: 'Nocturnal Min: 29.4°C',
      labelA: 'Cumulative Heat Stress: HIGH (+3.4x mortality)',
      metricB: 'Nocturnal Min: 20.1°C',
      labelB: 'Cumulative Heat Stress: BASELINE'
    }
  };

  const current = scenarios[activeTab];

  return (
    <section id="the-problem" style={{
      padding: '80px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
        {/* Section Header */}
        <div style={{ maxWidth: '780px', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-heat)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px'
          }}>
            <AlertTriangle size={14} />
            <span>02 • SCIENTIFIC CONTEXT</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: '#fff',
            marginBottom: '16px'
          }}>
            TEMPERATURE ALONE <br />
            <span className="gradient-text-heat">DOES NOT TELL THE STORY.</span>
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}>
            Traditional weather apps broadcast a single dry-bulb temperature (e.g. 38°C). But human thermal strain is determined by energy exchange between the body and its environment.
          </p>
        </div>

        {/* Interactive Parameter Exploration Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Left: Parameter Switcher Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(scenarios).map((key) => {
              const item = scenarios[key];
              const isSelected = activeTab === key;
              return (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '18px 20px',
                    borderColor: isSelected ? 'rgba(0, 229, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(0, 229, 255, 0.06)' : 'rgba(17, 24, 34, 0.72)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.param}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={16} color={isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Deep Dive & Comparative Simulation */}
          <div className="glass-card" style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'radial-gradient(circle at top right, rgba(255, 109, 0, 0.08) 0%, rgba(17, 24, 34, 0.9) 60%)',
            border: '1px solid rgba(255, 255, 255, 0.14)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="status-badge status-badge-high">
                  PHYSIOLOGICAL MECHANISM
                </span>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  THERMAL DECOMPENSATION
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                {current.title}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '24px' }}>
                {current.impact}
              </p>
            </div>

            {/* Comparative Metrics Demonstration */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-crimson)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  CRITICAL LOAD CASE
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  {current.metricA}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-crimson)', fontWeight: 600 }}>
                  {current.labelA}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-safe)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  DRY / VENTILATED CASE
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  {current.metricB}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-safe)', fontWeight: 600 }}>
                  {current.labelB}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
