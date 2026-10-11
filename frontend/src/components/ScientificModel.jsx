import React, { useState, useMemo } from 'react';
import { Calculator, Sparkles, BookOpen, Layers, Info } from 'lucide-react';

// Real-time client calculation functions based on NOAA & ISO 7243 standards
function calculateRothfuszHeatIndex(T_c, RH) {
  const T = (T_c * 9) / 5 + 32; // Fahrenheit
  if (T < 80) return T_c;

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH;

  if (RH < 13 && T >= 80 && T <= 112) {
    const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adj;
  } else if (RH > 85 && T >= 80 && T <= 87) {
    const adj = ((RH - 85) / 10) * ((87 - T) / 5);
    HI += adj;
  }

  return ((HI - 32) * 5) / 9; // convert back to Celsius
}

function calculateApparentTemperature(T_c, RH, wind_ms) {
  const e = (RH / 100) * 6.105 * Math.exp((17.27 * T_c) / (237.7 + T_c));
  const AT = T_c + 0.33 * e - 0.7 * wind_ms - 4.0;
  return AT;
}

function calculateSWBGT(T_c, RH, solar_wm2, wind_ms) {
  const e = (RH / 100) * 6.105 * Math.exp((17.27 * T_c) / (237.7 + T_c));
  const Tw = T_c * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
    Math.atan(T_c + RH) - Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) - 4.686035;
  const Tg = T_c + (solar_wm2 / 1000) * (14.0 / Math.max(wind_ms, 0.5));
  return 0.7 * Tw + 0.2 * Tg + 0.1 * T_c;
}

function calculateAIThermalStressScore(T_c, RH, wind_ms, solar_wm2) {
  const hi = calculateRothfuszHeatIndex(T_c, RH);
  const at = calculateApparentTemperature(T_c, RH, wind_ms);
  const wbgt = calculateSWBGT(T_c, RH, solar_wm2, wind_ms);

  const baseScore = ((hi - 25) / 30) * 45 + ((wbgt - 20) / 18) * 35 + ((at - 25) / 25) * 20;
  return Math.min(Math.max(Math.round(baseScore), 0), 100);
}

export default function ScientificModel({ liveState }) {
  const [temp, setTemp] = useState(38);
  const [rh, setRh] = useState(65);
  const [wind, setWind] = useState(2.0);
  const [solar, setSolar] = useState(850);

  const { heatIndex, apparentTemp, swbgt, aiScore } = useMemo(() => {
    const hi = calculateRothfuszHeatIndex(temp, rh);
    const at = calculateApparentTemperature(temp, rh, wind);
    const wbgt = calculateSWBGT(temp, rh, solar, wind);
    const score = calculateAIThermalStressScore(temp, rh, wind, solar);
    return {
      heatIndex: hi.toFixed(1),
      apparentTemp: at.toFixed(1),
      swbgt: wbgt.toFixed(1),
      aiScore: score
    };
  }, [temp, rh, wind, solar]);

  const riskTier =
    aiScore >= 90
      ? { label: 'EXTREME HEAT EMERGENCY', color: 'var(--accent-crimson)', badge: 'status-badge-extreme' }
      : aiScore >= 80
      ? { label: 'VERY HIGH RISK', color: '#ff3d00', badge: 'status-badge-very-high' }
      : aiScore >= 60
      ? { label: 'HIGH THERMAL RISK', color: 'var(--accent-heat)', badge: 'status-badge-high' }
      : aiScore >= 40
      ? { label: 'MODERATE CAUTION', color: 'var(--accent-amber)', badge: 'status-badge-moderate' }
      : { label: 'LOW / SAFE', color: 'var(--accent-safe)', badge: 'status-badge-safe' };

  return (
    <section id="scientific-model" style={{
      padding: '80px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ maxWidth: '820px', marginBottom: '40px' }}>
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
            marginBottom: '12px'
          }}>
            <Calculator size={14} />
            <span>03 • MULTI-PARAMETER THERMAL ENGINE</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: '#fff',
            marginBottom: '14px'
          }}>
            THE UNIFYING <br />
            <span className="gradient-text-cyan">THERMAL EQUATION.</span>
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Adjust the atmospheric parameters below to observe in real-time how non-linear thermodynamic interactions propagate into human physiological strain across 4 scientific standards.
          </p>
        </div>

        {/* Interactive Lab Sandbox Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '30px',
          alignItems: 'stretch'
        }}>
          {/* Controls Box */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <Sparkles size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Atmospheric Control Panel
              </h3>
            </div>

            {/* Slider 1: Temperature */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Dry-Bulb Air Temperature (T)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 700 }}>
                  {temp}°C
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="52"
                step="0.5"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-heat)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2: Humidity */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Relative Humidity (RH)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {rh}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={rh}
                onChange={(e) => setRh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 3: Wind */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Wind Speed (v)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 700 }}>
                  {wind} m/s
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={wind}
                onChange={(e) => setWind(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 4: Solar Radiation */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Solar Radiation (S)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#ff7043', fontWeight: 700 }}>
                  {solar} W/m²
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1200"
                step="25"
                value={solar}
                onChange={(e) => setSolar(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ff7043', cursor: 'pointer' }}
              />
            </div>

            {/* JURY DEMO ATMOSPHERIC INJECTION CONTROLS */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  JURY DEMO • SIMULATION INJECTION
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Same Backend Engine
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTemp(48.5);
                    setRh(73);
                    setWind(0.5);
                    setSolar(950);
                    if (liveState?.setTelemetry) {
                      liveState.setTelemetry({
                        temperature: 48.5,
                        relative_humidity: 73.0,
                        wind_speed: 0.5,
                        solar_radiation: 950.0
                      });
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 23, 68, 0.15)',
                    border: '1px solid rgba(255, 23, 68, 0.4)',
                    color: '#ff80ab',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={13} />
                  <span>48.5°C Extreme Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTemp(23.0);
                    setRh(60);
                    setWind(1.8);
                    setSolar(420);
                    if (liveState?.setScenario) {
                      liveState.setScenario('LIVE');
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    color: 'var(--accent-cyan)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Live Weather Mode
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (liveState?.setTelemetry) {
                    liveState.setTelemetry({
                      temperature: temp,
                      relative_humidity: rh,
                      wind_speed: wind,
                      solar_radiation: solar
                    });
                  }
                }}
                className="framer-button-secondary"
                style={{ width: '100%', padding: '8px 14px', fontSize: '0.74rem', justifyContent: 'center' }}
              >
                <span>Apply Custom Slider Values to Live Stream</span>
              </button>
            </div>
          </div>

          {/* Real-time Multi-Index Computation Display */}
          <div className="glass-card" style={{
            padding: '28px',
            background: 'radial-gradient(circle at top right, rgba(0, 229, 255, 0.08) 0%, rgba(17, 24, 34, 0.95) 70%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  COMPUTED THERMAL INDICES
                </span>
                <span className={`status-badge ${riskTier.badge}`}>
                  {riskTier.label}
                </span>
              </div>

              {/* Main AI Thermal Score */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '20px',
                borderRadius: '16px',
                border: `1px solid ${riskTier.color}44`,
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  AI HUMAN THERMAL STRESS INDEX (0–100)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: riskTier.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {aiScore}
                  </span>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
                </div>
              </div>

              {/* Secondary Scientific Standards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    ROTHFUSZ HI
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    {heatIndex}°C
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    sWBGT (ISO)
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    {swbgt}°C
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    APPARENT TEMP
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
                    {apparentTemp}°C
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '20px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <Info size={14} color="var(--accent-cyan)" />
              <span>Calibrated against ISO 7243 & Steadman Biometeorological Models.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
