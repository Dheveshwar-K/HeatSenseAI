import React from 'react';
import { Flame, ShieldAlert, Globe2, Activity, Code2, FileText, Heart } from 'lucide-react';

export default function Footer({ onNavigate = () => {} }) {
  return (
    <footer style={{
      background: 'rgba(5, 7, 10, 0.98)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '60px 0 30px 0',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Col 1: Brand & Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6d00 0%, #ff1744 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Flame size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                HeatSense AI
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              Extreme Heatwave Early Warning & Human Thermal Stress Index. An AI-powered climate intelligence operating system.
            </p>

            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              BUILT FOR CLIMATE RESILIENCE & HUMAN SAFETY
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              NAVIGATION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <a href="#hero" onClick={(e) => { e.preventDefault(); onNavigate('hero'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Overview & Hero</a>
              <a href="#live-monitor" onClick={(e) => { e.preventDefault(); onNavigate('live-monitor'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Live Telemetry Monitor</a>
              <a href="#thermal-map" onClick={(e) => { e.preventDefault(); onNavigate('thermal-map'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Thermal Danger Map</a>
              <a href="#forecast" onClick={(e) => { e.preventDefault(); onNavigate('forecast'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Multi-Horizon Forecast</a>
              <a href="#human-risk" onClick={(e) => { e.preventDefault(); onNavigate('human-risk'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Physiological Body Risk</a>
            </div>
          </div>

          {/* Col 3: Science & Architecture */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              SCIENCE & SYSTEM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <a href="#scientific-model" onClick={(e) => { e.preventDefault(); onNavigate('scientific-model'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Thermodynamic Model</a>
              <a href="#explainability" onClick={(e) => { e.preventDefault(); onNavigate('explainability'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Explainable AI (SHAP)</a>
              <a href="#emergency" onClick={(e) => { e.preventDefault(); onNavigate('emergency'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dual-Contact Escalation</a>
              <a href="#architecture" onClick={(e) => { e.preventDefault(); onNavigate('architecture'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>System Pipeline</a>
              <a href="#model-transparency" onClick={(e) => { e.preventDefault(); onNavigate('model-transparency'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Model Benchmarks</a>
            </div>
          </div>

          {/* Col 4: Status & Certification */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              SYSTEM METRICS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Model: <strong style={{ color: '#fff' }}>RandomForest (90.14%)</strong></div>
              <div style={{ color: 'var(--text-secondary)' }}>Sensor DQI: <strong style={{ color: 'var(--accent-safe)' }}>99.4% (Optimal)</strong></div>
              <div style={{ color: 'var(--text-secondary)' }}>Telephony: <strong style={{ color: 'var(--accent-cyan)' }}>Dual-Carrier Ready</strong></div>
              <div style={{ color: 'var(--text-secondary)' }}>Latency: <strong style={{ color: '#fff' }}>2.4 ms inference</strong></div>
            </div>
          </div>
        </div>

        {/* Bottom Safety Statement & Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.74rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © 2026 HeatSense AI • Extreme Heatwave Early Warning Platform. All rights reserved.
          </div>
          <div>
            ⚠️ <strong>Safety Statement:</strong> Evaluates environmental biometeorological thermal strain. Does not substitute diagnostic clinical medical devices.
          </div>
        </div>
      </div>
    </footer>
  );
}
