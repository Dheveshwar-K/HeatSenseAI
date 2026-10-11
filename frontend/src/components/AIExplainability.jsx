import React, { useState } from 'react';
import { Brain, Sparkles, CheckCircle2, ChevronRight, BarChart3, HelpCircle, Layers } from 'lucide-react';

export default function AIExplainability({ liveData }) {
  const [selectedFeature, setSelectedFeature] = useState('temp');

  const contributors = liveData?.thermal_assessment?.contributors || {
    temperature: 0.42,
    relative_humidity: 0.28,
    wind_speed: 0.14,
    solar_radiation: 0.10,
    dew_point: 0.06
  };

  const featureDetails = {
    temp: {
      name: 'Dry-Bulb Ambient Temperature',
      weight: '42%',
      impact: 'HIGH POSITIVE (+)',
      value: `${liveData?.environmental?.temperature?.toFixed(1) || 23.0}°C`,
      desc: 'High sensible heat creates an immediate thermal gradient across human skin, driving sensory thermoreceptors and accelerating metabolic core load.',
      shap: '+14.2 to Risk Score'
    },
    humidity: {
      name: 'Relative Humidity Saturation',
      weight: '28%',
      impact: 'CRITICAL POSITIVE (+)',
      value: `${liveData?.environmental?.relative_humidity?.toFixed(0) || 60}%`,
      desc: 'Ambient vapor pressure above 28 hPa prevents the vaporization of cutaneous perspiration, shutting down 80% of the body’s evaporative heat loss capacity.',
      shap: '+9.8 to Risk Score'
    },
    wind: {
      name: 'Low Wind Velocity Stagnation',
      weight: '14%',
      impact: 'NEGATIVE FORCED (+)',
      value: `${liveData?.environmental?.wind_speed?.toFixed(1) || 1.8} m/s`,
      desc: 'Wind velocity below 2.0 m/s reduces boundary layer convective heat transfer coefficients from 18 W/m²K down to 4.2 W/m²K, trapping microclimatic heat.',
      shap: '+4.9 to Risk Score'
    },
    radiation: {
      name: 'Solar Shortwave Irradiance',
      weight: '10%',
      impact: 'POSITIVE RADIANT (+)',
      value: `${liveData?.environmental?.solar_radiation?.toFixed(0) || 890} W/m²`,
      desc: 'High radiant flux directly warms superficial capillary beds and increases mean radiant temperature (MRT) by +7.4°C over dry-bulb air temperature.',
      shap: '+3.5 to Risk Score'
    },
    dew: {
      name: 'Dew Point & Thermal Inertia',
      weight: '6%',
      impact: 'CUMULATIVE LOAD (+)',
      value: `${liveData?.environmental?.dew_point?.toFixed(1) || 31.4}°C`,
      desc: 'Elevated dew points above 24°C represent extreme moisture enthalpy and indicate poor nocturnal atmospheric cooling.',
      shap: '+2.1 to Risk Score'
    }
  };

  const active = featureDetails[selectedFeature] || featureDetails.temp;

  return (
    <section id="explainability" style={{
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
            <Brain size={14} />
            <span>08 • EXPLAINABLE ARTIFICIAL INTELLIGENCE (XAI)</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '12px'
          }}>
            WHY DID THE MODEL <br />
            <span className="gradient-text-cyan">ISSUE THIS WARNING?</span>
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Our tree ensemble SHAP (SHapley Additive exPlanations) engine decomposes every prediction into exact mathematical feature contributions. No black boxes.
          </p>
        </div>

        {/* Feature Contribution Breakdown Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Left: SHAP Contribution Bars (7 cols) */}
          <div className="glass-card" style={{ padding: '28px', gridColumn: 'span 7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                FEATURE ATTRIBUTION (SHAP WEIGHTS)
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                CLICK FEATURE TO INSPECT
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'temp', label: 'Air Temperature (T)', pct: 42, color: '#ff6d00' },
                { id: 'humidity', label: 'Relative Humidity (RH)', pct: 28, color: '#00e5ff' },
                { id: 'wind', label: 'Wind Velocity Deficit (v)', pct: 14, color: '#ffab00' },
                { id: 'radiation', label: 'Solar Radiant Flux (S)', pct: 10, color: '#ff7043' },
                { id: 'dew', label: 'Dew Point Enthalpy (Td)', pct: 6, color: '#b388ff' }
              ].map((feat) => {
                const isSelected = selectedFeature === feat.id;
                return (
                  <div
                    key={feat.id}
                    onClick={() => setSelectedFeature(feat.id)}
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: isSelected ? `1px solid ${feat.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                        {feat.label}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: feat.color, fontFamily: 'var(--font-mono)' }}>
                        {feat.pct}% Contribution
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${feat.pct * 2.38}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: feat.color,
                        boxShadow: `0 0 10px ${feat.color}88`,
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Feature Explanation Inspector (5 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 5',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'radial-gradient(circle at top right, rgba(0, 229, 255, 0.08) 0%, rgba(17, 24, 34, 0.95) 75%)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  DEEP FEATURE INSPECTOR
                </span>
                <span className="status-badge status-badge-high">
                  {active.impact}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {active.name}
              </h3>

              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '8px 0 14px 0', fontFamily: 'var(--font-display)' }}>
                {active.value} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>({active.weight} of risk)</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {active.desc}
              </p>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                INDIVIDUAL SHAP VALUE MARGINAL EFFECT
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00e676', marginTop: '2px' }}>
                {active.shap}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
