import React, { useState } from 'react';
import { X, Sparkles, Play, CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert, Activity, PhoneCall, Brain, Flame, Layers } from 'lucide-react';

export const JURY_SCENARIOS = [
  { id: 'extreme_heat_test', name: '🚨 EXTREME HEAT TEST (Jury Demo)', temp: 48.5, rh: 73, wind: 0.5, score: 95, status: 'EXTREME EMERGENCY', desc: 'Simulates extreme catastrophic thermal stress (48.5°C, 73% RH, 0.5 m/s wind) crossing the 90/100 threshold to trigger siren alarm and dual phone dispatch.' },
  { id: 'normal', name: '01 • Normal Summer Day', temp: 32.0, rh: 45, wind: 3.5, score: 38, status: 'MODERATE', desc: 'Mild baseline conditions within human thermoregulatory capacity.' },
  { id: 'heat_spike', name: '02 • Rapid Afternoon Heat Spike', temp: 39.2, rh: 55, wind: 2.1, score: 72, status: 'HIGH RISK', desc: 'Rapid sensible heat escalation with moderate humidity.' },
  { id: 'wet_bulb_crisis', name: '03 • Extreme Coastal Wet-Bulb Crisis', temp: 41.5, rh: 78, wind: 1.2, score: 94, status: 'EXTREME EMERGENCY', desc: 'Severe evaporative failure threatening human survival without AC.' },
  { id: 'low_wind_trap', name: '04 • Low Wind Stagnant Microclimate', temp: 38.4, rh: 65, wind: 0.4, score: 82, status: 'VERY HIGH', desc: 'Boundary layer heat entrapment in dense urban canyons.' },
  { id: 'solar_assault', name: '05 • High Solar Radiant Assault', temp: 43.0, rh: 35, wind: 2.5, score: 86, status: 'VERY HIGH', desc: 'Intense shortwave solar irradiance (>1050 W/m²) on outdoor workers.' },
  { id: 'night_retention', name: '06 • Nocturnal Heat Retention Deficit', temp: 31.5, rh: 82, wind: 1.0, score: 78, status: 'HIGH RISK', desc: 'Compounded cumulative cardiac stress due to lack of nighttime cooling.' },
  { id: 'urban_island', name: '07 • Industrial Urban Heat Island', temp: 44.5, rh: 48, wind: 1.8, score: 91, status: 'EXTREME EMERGENCY', desc: 'Asphalt thermal radiation and anthropogenic industrial emissions.' },
  { id: 'early_warning', name: '08 • Early Warning Threshold Activation', temp: 40.8, rh: 72, wind: 1.5, score: 88, status: 'CRITICAL ESCALATION', desc: 'Crossing the 80/100 danger threshold triggers acoustic alarms.' },
  { id: 'phone_escalation', name: '09 • Dual-Contact Phone Dispatch', temp: 42.0, rh: 75, wind: 1.1, score: 96, status: 'TELEPHONY ACTIVE', desc: 'Simulates automatic dual carrier emergency phone calls to configured numbers.' },
  { id: 'system_recovery', name: '10 • Meteorological Recovery Cycle', temp: 28.5, rh: 50, wind: 4.2, score: 32, status: 'SAFE / RESOLVED', desc: 'Convective storm front lowers temperature and restores safe baseline.' }
];

export const PRESENTATION_SLIDES = [
  {
    step: '01 / 06',
    title: 'THE CORE PROBLEM',
    headline: 'Temperature Alone Does Not Measure Human Heat Risk',
    body: 'Human thermoregulation depends on sweating and evaporation. A 38°C day at 80% relative humidity is biologically far more dangerous than 45°C in a dry desert because evaporative cooling completely halts.',
    icon: <Flame size={24} color="var(--accent-heat)" />,
    highlight: 'Multi-Parameter Physics Required'
  },
  {
    step: '02 / 06',
    title: '3D CLIMATE DIGITAL TWIN',
    headline: 'Real-Time Planetary & Regional Monitoring',
    body: 'Our platform visualizes global atmospheric heatwave propagation via interactive 3D digital twins and regional micro-station feeds with sub-kilometer geographic resolution.',
    icon: <Activity size={24} color="var(--accent-cyan)" />,
    highlight: 'Three.js Atmospheric Simulation'
  },
  {
    step: '03 / 06',
    title: 'PHYSIOLOGICAL BODY MAPPING',
    headline: 'Decomposing Heat Strain by Organ & Demographic',
    body: 'Translates raw environmental measurements into organ-specific stress (cranial cognitive strain, cardiac stroke volume, sweat rates) across outdoor workers, athletes, elderly, and children.',
    icon: <Brain size={24} color="var(--accent-amber)" />,
    highlight: 'Demographic Vulnerability Modeling'
  },
  {
    step: '04 / 06',
    title: 'TIME-SERIES ML FORECASTING',
    headline: 'Multi-Horizon Prediction with Uncertainty Bounds',
    body: 'Projecting forward up to 24 hours (15m, 30m, 1h, 3h, 6h, 12h, 24h) to anticipate exact heatwave onset and peak intensity hours before thermal decompensation occurs.',
    icon: <Layers size={24} color="var(--accent-heat)" />,
    highlight: 'RandomForest Champion: 90.14% Accuracy'
  },
  {
    step: '05 / 06',
    title: 'EXPLAINABLE AI (XAI)',
    headline: 'SHAP Feature Attribution for Scientific Trust',
    body: 'Judges and climate scientists can inspect exact mathematical feature weights (42% Temp, 28% RH, 14% Wind, 10% Solar) behind every warning threshold. Zero black boxes.',
    icon: <Brain size={24} color="var(--accent-cyan)" />,
    highlight: 'Shapley Values & Physics Explanations'
  },
  {
    step: '06 / 06',
    title: 'DUAL TELEPHONE ESCALATION',
    headline: 'Autonomous Emergency Calling & Life-Safety',
    body: 'When extreme thermal danger persists, our deterministic 6-state emergency machine activates acoustic alarms and automatically places voice calls to two configured emergency contacts.',
    icon: <PhoneCall size={24} color="var(--accent-crimson)" />,
    highlight: 'Dual-Carrier Automated Calling'
  }
];

export default function JuryPresentationMode({
  isOpen = false,
  mode = 'demo', // 'demo' or 'presentation'
  onClose = () => {},
  onSelectScenario = () => {}
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 10, 0.88)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: mode === 'presentation' ? '800px' : '960px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative',
        background: 'rgba(11, 16, 23, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {mode === 'demo' ? (
          /* JURY DEMO MODE SCENARIO SELECTOR */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ff6d00 0%, #ff1744 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  JURY DEMO MODE • 10 DETERMINISTIC TEST SCENARIOS
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Click any scenario below to instantly inject reproducible meteorological events into the live platform.
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
              marginTop: '24px'
            }}>
              {JURY_SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => {
                    onSelectScenario(sc.name);
                    onClose();
                  }}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fff' }}>
                        {sc.name}
                      </span>
                      <span className={sc.score >= 80 ? 'status-badge status-badge-extreme' : sc.score >= 60 ? 'status-badge status-badge-high' : 'status-badge status-badge-safe'}>
                        {sc.score}/100
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                      {sc.temp}°C • {sc.rh}% RH • {sc.wind} m/s
                    </div>

                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {sc.desc}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    color: 'var(--accent-heat)',
                    fontWeight: 700,
                    marginTop: '12px'
                  }}>
                    <span>INJECT SCENARIO</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* JURY GUIDED PRESENTATION MODE SLIDES */
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {PRESENTATION_SLIDES[activeSlide].icon}
                <div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    GUIDED JURY PRESENTATION • {PRESENTATION_SLIDES[activeSlide].step}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                    {PRESENTATION_SLIDES[activeSlide].title}
                  </h2>
                </div>
              </div>

              <span className="status-badge status-badge-high">
                {PRESENTATION_SLIDES[activeSlide].highlight}
              </span>
            </div>

            {/* Slide Body */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '28px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '28px'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
                {PRESENTATION_SLIDES[activeSlide].headline}
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {PRESENTATION_SLIDES[activeSlide].body}
              </p>
            </div>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                disabled={activeSlide === 0}
                onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: activeSlide === 0 ? 'var(--text-muted)' : '#fff',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: activeSlide === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous Pillar</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                {PRESENTATION_SLIDES.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: idx === activeSlide ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === activeSlide ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>

              {activeSlide < PRESENTATION_SLIDES.length - 1 ? (
                <button
                  onClick={() => setActiveSlide((prev) => Math.min(PRESENTATION_SLIDES.length - 1, prev + 1))}
                  className="framer-button-primary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <span>Next Pillar</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="framer-button-primary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <span>Finish Presentation</span>
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
