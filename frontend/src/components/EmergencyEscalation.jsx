import React, { useState } from 'react';
import { ShieldAlert, PhoneCall, Bell, CheckCircle2, AlertOctagon, Volume2, ShieldCheck, RefreshCw, Zap, Users, Droplet, Home } from 'lucide-react';
import { triggerManualEmergencyCall, acknowledgeAlarm, resolveEmergency } from '../services/api';

export default function EmergencyEscalation({ liveState }) {
  const { data } = liveState;
  const emergency = data?.emergency_system || {
    state: 'MONITORING',
    alarm_active: false,
    acknowledged: false,
    primary_contact: '+91 98765 43210',
    secondary_contact: '+91 98765 43211',
    call_attempts: 0
  };

  const [callStatus, setCallStatus] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const isEmergency = emergency.state === 'EMERGENCY' || emergency.alarm_active;

  const handleManualCall = async () => {
    setLoadingAction(true);
    try {
      const res = await triggerManualEmergencyCall({ reason: 'User triggered high-priority call test' });
      setCallStatus('Two-Number Emergency Call Dispatched Successfully');
      setTimeout(() => setCallStatus(null), 5000);
    } catch (e) {
      setCallStatus('Failed to dispatch call: ' + e.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAck = async () => {
    try {
      await acknowledgeAlarm();
      setCallStatus('Alarm Acknowledged');
      setTimeout(() => setCallStatus(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveEmergency();
      setCallStatus('Emergency Resolved & Reset to Monitoring');
      setTimeout(() => setCallStatus(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section id="emergency" style={{
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
            color: 'var(--accent-crimson)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px'
          }}>
            <ShieldAlert size={14} />
            <span>09 • DUAL-CONTACT EMERGENCY ESCALATION SYSTEM</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '12px'
          }}>
            AUTOMATED CRISIS ESCALATION <br />
            <span className="gradient-text-danger">& LIFE-SAFETY PROTOCOLS.</span>
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            When extreme thermal stress persists beyond predefined thresholds, the system executes a deterministic 6-state emergency escalation, activating acoustic sirens and dispatching dual telephone calls.
          </p>
        </div>

        {/* 6-State Emergency Machine Pipeline Visualizer */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            DETERMINISTIC 6-STATE EMERGENCY ESCALATION ENGINE
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {[
              { id: 'MONITORING', label: '1. MONITORING', desc: 'Real-time telemetry ingestion' },
              { id: 'PRE_WARNING', label: '2. PRE-WARNING', desc: 'Thermal score > 60 threshold' },
              { id: 'CRITICAL', label: '3. CRITICAL', desc: 'Sustained heatwave accumulation' },
              { id: 'EMERGENCY', label: '4. EMERGENCY', desc: 'Score >= 80 & siren active' },
              { id: 'ESCALATING', label: '5. ESCALATING', desc: 'Dual phone calls in progress' },
              { id: 'RESOLVED', label: '6. RESOLVED', desc: 'Normal conditions restored' }
            ].map((st) => {
              const isActive = emergency.state === st.id;
              return (
                <div
                  key={st.id}
                  style={{
                    background: isActive ? 'rgba(255, 23, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isActive ? '1px solid var(--accent-crimson)' : '1px solid rgba(255, 255, 255, 0.06)',
                    padding: '12px',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: isActive ? '#ff1744' : '#fff', fontFamily: 'var(--font-mono)' }}>
                    {st.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {st.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual-Contact Calling Card & Safety Action Matrix Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Left: Dual Calling & Controls (6 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 6',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: isEmergency ? 'radial-gradient(circle at center, rgba(255, 23, 68, 0.15) 0%, rgba(17, 24, 34, 0.95) 75%)' : 'rgba(17, 24, 34, 0.72)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={18} color="var(--accent-crimson)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    Two-Contact Telephony Dispatcher
                  </h3>
                </div>
                <span className={isEmergency ? 'status-badge status-badge-extreme' : 'status-badge status-badge-safe'}>
                  {emergency.state}
                </span>
              </div>

              {/* Contact Numbers Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PRIMARY CONTACT (OPERATOR)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {emergency.primary_contact || '+91 98765 43210'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-safe)', fontWeight: 600 }}>CARRIER READY</span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SECONDARY CONTACT (EMERGENCY TEAM)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {emergency.secondary_contact || '+91 98765 43211'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-safe)', fontWeight: 600 }}>CARRIER READY</span>
                </div>
              </div>

              {callStatus && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid var(--accent-cyan)',
                  borderRadius: '8px',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  {callStatus}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleManualCall}
                disabled={loadingAction}
                style={{
                  background: 'linear-gradient(135deg, #ff1744 0%, #ff6d00 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <PhoneCall size={14} />
                <span>Trigger Manual Call</span>
              </button>

              <button
                onClick={handleAck}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Bell size={14} />
                <span>Acknowledge Alarm</span>
              </button>

              <button
                onClick={handleResolve}
                style={{
                  background: 'rgba(0, 230, 118, 0.12)',
                  border: '1px solid rgba(0, 230, 118, 0.3)',
                  color: 'var(--accent-safe)',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Resolve & Reset</span>
              </button>
            </div>
          </div>

          {/* Right: What Should You Do Now? Safety Action Recommendations (6 cols) */}
          <div className="glass-card" style={{ padding: '28px', gridColumn: 'span 6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <ShieldCheck size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                WHAT SHOULD YOU DO NOW?
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
                <Droplet size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Enforce Rapid Hydration</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Consume 250–500 mL of electrolyte-enriched water every 20 minutes to maintain plasma volume.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
                <Home size={20} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Deploy Shaded Work/Rest Cycles</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Implement a 15m work / 45m rest schedule in air-conditioned or ventilated cooling stations.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
                <Users size={20} color="var(--accent-heat)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>Check Vulnerable Individuals</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Conduct hourly wellness checks on older adults (65+), outdoor laborers, and young children.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
