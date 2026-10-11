import React, { useState } from 'react';
import { UserCheck, Heart, Droplets, Brain, Shield, AlertTriangle, Activity, Info } from 'lucide-react';

const COHORTS = [
  { id: 'general', label: 'General Population', sweatFactor: 1.0, strainMultiplier: 1.0, maxSafeMin: 90 },
  { id: 'workers', label: 'Outdoor Workers', sweatFactor: 1.6, strainMultiplier: 1.45, maxSafeMin: 45 },
  { id: 'athletes', label: 'Athletes / High Activity', sweatFactor: 1.9, strainMultiplier: 1.6, maxSafeMin: 35 },
  { id: 'elderly', label: 'Older Adults (65+)', sweatFactor: 0.7, strainMultiplier: 1.5, maxSafeMin: 40 },
  { id: 'children', label: 'Children & Infants', sweatFactor: 0.8, strainMultiplier: 1.35, maxSafeMin: 50 }
];

export default function HumanBodyRisk({ liveScore = 76 }) {
  const [selectedCohort, setSelectedCohort] = useState(COHORTS[0]);
  const [activeZone, setActiveZone] = useState('core');

  const isExtreme = liveScore >= 80;
  const isHigh = liveScore >= 60;

  // Compute cohort-adjusted physiological estimates
  const sweatRate = (1.1 * selectedCohort.sweatFactor * (liveScore / 60)).toFixed(2);
  const evaporativeEfficiency = Math.max(10, Math.round(92 - (liveScore * 0.7))).toString();
  const cardiacStrain = Math.min(10, (4.5 * selectedCohort.strainMultiplier * (liveScore / 50)).toFixed(1));
  const safeMinutes = Math.max(15, Math.round(selectedCohort.maxSafeMin * (100 - liveScore) / 40));

  const zones = {
    head: {
      title: 'Cranial & Neurological Zone',
      icon: <Brain size={18} color="var(--accent-crimson)" />,
      status: isExtreme ? 'CRITICAL CEREBRAL STRAIN' : isHigh ? 'MODERATE COGNITIVE FATIGUE' : 'NOMINAL',
      desc: 'High ambient temperature coupled with radiant load elevates cranial microvascular temperature, impairing executive decision-making, motor reaction time, and inducing heat syncope.',
      risk: isExtreme ? '94%' : '65%'
    },
    chest: {
      title: 'Cardiovascular & Thoracic Core',
      icon: <Heart size={18} color="var(--accent-heat)" />,
      status: isExtreme ? 'EXTREME CARDIAC WORKLOAD' : isHigh ? 'ELEVATED TACHYCARDIA RISK' : 'NORMAL',
      desc: 'The cardiovascular system redirects up to 60% of total cardiac output toward cutaneous blood vessels for convective cooling, doubling myocardial oxygen demand.',
      risk: isExtreme ? '88%' : '58%'
    },
    core: {
      title: 'Hepatosplanchnic & Core Metabolism',
      icon: <Activity size={18} color="var(--accent-amber)" />,
      status: isExtreme ? 'HEAT ACCUMULATION WARNING' : isHigh ? 'THERMAL EQUILIBRIUM STRAIN' : 'SAFE',
      desc: 'When environmental heat dissipation falls below metabolic heat production, thermal energy accumulates within core visceral organs, raising estimated core body temperature.',
      risk: isExtreme ? '91%' : '52%'
    },
    skin: {
      title: 'Cutaneous & Evaporative Barrier',
      icon: <Droplets size={18} color="var(--accent-cyan)" />,
      status: isExtreme ? 'EVAPORATIVE SATURATION LIMIT' : isHigh ? 'SWEAT RATE ACCELERATED' : 'OPTIMAL',
      desc: 'High humidity blocks droplet evaporation. Sweat beads roll off the skin without absorbing the latent heat of vaporization (2.4 kJ/g), causing rapid dehydration without cooling.',
      risk: isExtreme ? '98%' : '72%'
    }
  };

  const currentZone = zones[activeZone];

  return (
    <section id="human-risk" style={{
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
            color: 'var(--accent-heat)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px'
          }}>
            <UserCheck size={14} />
            <span>07 • PHYSIOLOGICAL THERMAL BURDEN MODEL</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '12px'
          }}>
            HOW EXTREME HEAT <br />
            <span className="gradient-text-heat">IMPACTS THE HUMAN BODY.</span>
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Explore how environmental heat, humidity, and radiant load distribute thermal strain across human organ systems and vulnerable demographic cohorts.
          </p>
        </div>

        {/* Cohort Selector Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          {COHORTS.map((c) => {
            const isSelected = selectedCohort.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCohort(c)}
                style={{
                  background: isSelected ? 'rgba(255, 109, 0, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-heat)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Main Interactive Silhouette & Physiological Metrics Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '28px',
          alignItems: 'stretch'
        }}>
          {/* Left: Vector Interactive Human Silhouette (5 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 5',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'radial-gradient(circle at center, rgba(255, 109, 0, 0.12) 0%, rgba(17, 24, 34, 0.95) 75%)',
            position: 'relative'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                ANATOMICAL HEAT MAP
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                CLICK ZONE TO INSPECT
              </span>
            </div>

            {/* SVG Interactive Silhouette with Heat Aura */}
            <svg
              viewBox="0 0 200 360"
              style={{ width: '100%', maxHeight: '320px', cursor: 'pointer' }}
            >
              {/* Glowing Aura Filter */}
              <defs>
                <filter id="heatGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Head / Cranial Node */}
              <circle
                cx="100"
                cy="45"
                r="24"
                fill={activeZone === 'head' ? '#ff1744' : isExtreme ? '#ff5252' : '#ff9100'}
                opacity={activeZone === 'head' ? 0.95 : 0.75}
                filter="url(#heatGlow)"
                onClick={() => setActiveZone('head')}
              />
              <text x="100" y="49" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                HEAD
              </text>

              {/* Chest / Cardiovascular Node */}
              <rect
                x="65"
                y="85"
                width="70"
                height="55"
                rx="14"
                fill={activeZone === 'chest' ? '#ff1744' : isExtreme ? '#ff3d00' : '#ffab00'}
                opacity={activeZone === 'chest' ? 0.95 : 0.7}
                filter="url(#heatGlow)"
                onClick={() => setActiveZone('chest')}
              />
              <text x="100" y="116" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                CARDIAC
              </text>

              {/* Core / Visceral Node */}
              <rect
                x="70"
                y="148"
                width="60"
                height="60"
                rx="12"
                fill={activeZone === 'core' ? '#ff1744' : isExtreme ? '#d50000' : '#ff6d00'}
                opacity={activeZone === 'core' ? 0.95 : 0.7}
                filter="url(#heatGlow)"
                onClick={() => setActiveZone('core')}
              />
              <text x="100" y="182" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                CORE
              </text>

              {/* Arms & Skin Surface */}
              <rect
                x="30"
                y="90"
                width="25"
                height="110"
                rx="10"
                fill={activeZone === 'skin' ? '#00e5ff' : '#00b0ff'}
                opacity={activeZone === 'skin' ? 0.95 : 0.5}
                onClick={() => setActiveZone('skin')}
              />
              <rect
                x="145"
                y="90"
                width="25"
                height="110"
                rx="10"
                fill={activeZone === 'skin' ? '#00e5ff' : '#00b0ff'}
                opacity={activeZone === 'skin' ? 0.95 : 0.5}
                onClick={() => setActiveZone('skin')}
              />

              {/* Legs */}
              <rect
                x="68"
                y="218"
                width="26"
                height="130"
                rx="10"
                fill={activeZone === 'skin' ? '#00e5ff' : '#ff9100'}
                opacity={activeZone === 'skin' ? 0.9 : 0.5}
                onClick={() => setActiveZone('skin')}
              />
              <rect
                x="106"
                y="218"
                width="26"
                height="130"
                rx="10"
                fill={activeZone === 'skin' ? '#00e5ff' : '#ff9100'}
                opacity={activeZone === 'skin' ? 0.9 : 0.5}
                onClick={() => setActiveZone('skin')}
              />
            </svg>

            {/* Zone Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', width: '100%', marginTop: '10px' }}>
              {['head', 'chest', 'core', 'skin'].map((z) => (
                <button
                  key={z}
                  onClick={() => setActiveZone(z)}
                  style={{
                    background: activeZone === z ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: activeZone === z ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: activeZone === z ? '#fff' : 'var(--text-muted)',
                    padding: '6px 4px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Physiological Estimates & Zone Inspector (7 cols) */}
          <div style={{
            gridColumn: 'span 7',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* Zone Diagnostic Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {currentZone.icon}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    {currentZone.title}
                  </h3>
                </div>
                <span className={isExtreme ? 'status-badge status-badge-extreme' : 'status-badge status-badge-high'}>
                  {currentZone.status}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
                {currentZone.desc}
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.35)',
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Organ Strain Probability ({selectedCohort.label}):
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isExtreme ? 'var(--accent-crimson)' : 'var(--accent-heat)', fontFamily: 'var(--font-mono)' }}>
                  {currentZone.risk}
                </span>
              </div>
            </div>

            {/* 4 Quantitative Physiological Burden Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  HOURLY SWEAT LOSS RATE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>
                  {sweatRate} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>L / hour</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Rapid fluid replacement mandatory
                </div>
              </div>

              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  EVAPORATIVE EFFICIENCY
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffab00', margin: '4px 0' }}>
                  {evaporativeEfficiency}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Restricted by high relative humidity
                </div>
              </div>

              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  CARDIOVASCULAR STRAIN
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-crimson)', margin: '4px 0' }}>
                  {cardiacStrain} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ 10</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Elevated stroke volume burden
                </div>
              </div>

              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  MAX SAFE CONTINUOUS EXPOSURE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-safe)', margin: '4px 0' }}>
                  {safeMinutes} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MINS</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Mandatory shaded rest interval
                </div>
              </div>
            </div>

            {/* Scientific Transparency Disclaimer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)'
            }}>
              <Info size={15} color="var(--accent-cyan)" />
              <span>
                <strong>Scientific Model Notice:</strong> Output represents biometeorological environmental risk modeling and does NOT constitute clinical diagnostic medical advice.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
