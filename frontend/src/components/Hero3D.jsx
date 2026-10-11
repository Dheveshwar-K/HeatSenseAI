import React from 'react';
import { Flame, ArrowRight, MapPin, Sparkles, Activity, ShieldCheck, Cpu } from 'lucide-react';
import Globe3DViewer from './Globe3DViewer';

export default function Hero3D({
  liveData,
  onExplore = () => {},
  onViewMap = () => {},
  onOpenJuryDemo = () => {}
}) {
  const env = liveData?.environmental || {
    temperature: 23.0,
    relative_humidity: 60.0,
    wind_speed: 1.8,
    heat_index: 23.5,
    wet_bulb_temp: 18.2
  };

  const score = liveData?.thermal_assessment?.score ?? 18;
  const riskCategory = liveData?.thermal_assessment?.risk_category ?? 'LOW';
  const location = liveData?.environmental?.location ?? 'Coimbatore, India';

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '90px',
      paddingBottom: '40px',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Left Editorial Narrative Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Live Atmospheric Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '6px 14px',
            borderRadius: '9999px',
            width: 'fit-content'
          }}>
            <span className="live-dot" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              letterSpacing: '0.04em'
            }}>
              LIVE CLIMATE INTELLIGENCE • {location}
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#ffffff'
          }}>
            EXTREME HEAT <br />
            <span className="gradient-text-heat">IS NOT JUST A</span> <br />
            TEMPERATURE.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1rem, 1.3vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '540px'
          }}>
            Human thermal stress depends on the complex non-linear interaction of air temperature, relative humidity, wind velocity, and solar radiation. Our AI predicts physiological heat danger before it turns critical.
          </p>

          {/* Live Micro-Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            maxWidth: '520px'
          }}>
            <div className="glass-card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>AIR TEMP</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                {env.temperature?.toFixed(1)}°C
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>HUMIDITY</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {env.relative_humidity?.toFixed(0)}%
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>THERMAL SCORE</div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: score >= 80 ? 'var(--accent-crimson)' : 'var(--accent-heat)'
              }}>
                {score} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>/ 100</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '8px' }}>
            <button
              onClick={onExplore}
              className="framer-button-primary"
            >
              <span>Explore Live Intelligence</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onViewMap}
              className="framer-button-secondary"
            >
              <MapPin size={16} color="var(--accent-cyan)" />
              <span>View Thermal Map</span>
            </button>

            <button
              onClick={onOpenJuryDemo}
              style={{
                background: 'rgba(255, 109, 0, 0.1)',
                border: '1px solid rgba(255, 109, 0, 0.35)',
                color: '#ff9e80',
                padding: '12px 20px',
                borderRadius: '9999px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={16} color="#ff6d00" />
              <span>Jury Demo Mode</span>
            </button>
          </div>
        </div>

        {/* Right 3D Globe Digital Twin Column */}
        <div style={{
          height: '540px',
          background: 'radial-gradient(circle at center, rgba(0, 229, 255, 0.05) 0%, rgba(11, 16, 23, 0.8) 70%)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          <Globe3DViewer liveData={liveData} onSelectCity={(city) => console.log('Inspecting city:', city)} />
        </div>
      </div>
    </section>
  );
}
