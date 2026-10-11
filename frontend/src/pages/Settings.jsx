import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../services/api';
import { Settings as SettingsIcon, ShieldCheck, Phone, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchSettings()
      .then(res => {
        setConfig(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        emergency_threshold: parseFloat(config.emergency_threshold),
        persistence_seconds: parseInt(config.persistence_seconds),
        cooldown_seconds: parseInt(config.cooldown_seconds),
        simulation_mode: config.simulation_mode,
        calls_enabled: config.emergency_call_enabled
      });
      setSaveStatus('Settings successfully saved to backend.');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      setSaveStatus('Error saving settings');
    }
  };

  if (loading || !config) {
    return <div className="glass-panel" style={{ padding: '24px' }}>Loading configuration...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon size={22} color="var(--color-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: '#fff' }}>
            SYSTEM CONFIGURATION & TELEPHONY SETTINGS
          </h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Configure emergency state thresholds, persistence timers, and escalation rules
        </p>
      </div>

      {saveStatus && (
        <div style={{
          background: 'rgba(0, 230, 118, 0.15)',
          border: '1px solid var(--color-green)',
          padding: '10px 14px',
          borderRadius: '8px',
          color: 'var(--color-green)',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Escalation Thresholds */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', color: 'var(--color-cyan)' }}>
            STATE MACHINE THRESHOLDS
          </h3>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              EMERGENCY THRESHOLD (0 - 100)
            </label>
            <input
              type="number"
              value={config.emergency_threshold}
              onChange={(e) => setConfig({ ...config, emergency_threshold: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              PERSISTENCE DURATION (SECONDS)
            </label>
            <input
              type="number"
              value={config.persistence_seconds}
              onChange={(e) => setConfig({ ...config, persistence_seconds: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px'
              }}
            />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Condition must persist for this duration before triggering automated emergency calls.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              ANTI-SPAM COOLDOWN (SECONDS)
            </label>
            <input
              type="number"
              value={config.cooldown_seconds}
              onChange={(e) => setConfig({ ...config, cooldown_seconds: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px'
              }}
            />
          </div>
        </div>

        {/* Telephony Contacts & Safety Switches */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', color: 'var(--color-amber)' }}>
            EMERGENCY CONTACTS & TELEPHONY
          </h3>

          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CONTACT 1 (PRIMARY)</div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{config.contact_1?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>{config.contact_1?.masked}</div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CONTACT 2 (SECONDARY)</div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{config.contact_2?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>{config.contact_2?.masked}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.simulation_mode}
                onChange={(e) => setConfig({ ...config, simulation_mode: e.target.checked })}
              />
              <span><strong>Simulation Mode:</strong> Prevent outbound carrier calls during demos.</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.emergency_call_enabled}
                onChange={(e) => setConfig({ ...config, emergency_call_enabled: e.target.checked })}
              />
              <span><strong>Enable Live Automated Calling:</strong> (Requires verified carrier credentials in .env)</span>
            </label>
          </div>

          <button
            type="submit"
            style={{
              marginTop: 'auto',
              padding: '12px',
              background: 'var(--color-cyan)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
}
