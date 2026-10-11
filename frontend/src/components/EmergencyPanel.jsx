import React, { useState } from 'react';
import {
  AlertOctagon,
  Volume2,
  VolumeX,
  PhoneCall,
  CheckCircle,
  RefreshCw,
  ShieldAlert,
  XCircle,
  PhoneForwarded,
  UserCheck
} from 'lucide-react';
import {
  acknowledgeAlarm,
  resolveEmergency,
  triggerManualEmergencyCall,
  triggerSimulationTest
} from '../services/api';

export default function EmergencyPanel({
  emergencySystem = {},
  assessment = {},
  isMuted = false,
  onToggleMute = () => {}
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [callingState, setCallingState] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const isEmergency = emergencySystem.state === 'EMERGENCY';
  const isAlarm = emergencySystem.alarm_active;
  const isAck = emergencySystem.acknowledged;
  const contacts = emergencySystem.contacts || {};
  const activeCall = emergencySystem.active_call_sequence;

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAlarm();
      setActionMessage('Alarm Acknowledged');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveEmergency();
      setActionMessage('Emergency State Cleared & Resolved');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerManualCall = async () => {
    setShowConfirmModal(false);
    setCallingState('DISPATCHING');
    try {
      const res = await triggerManualEmergencyCall({
        temperature: 42.5,
        relative_humidity: 75.0,
        thermal_stress_score: 95.0
      });
      setCallingState('DISPATCHED');
      setActionMessage('Manual escalation sequence dispatched to both contacts.');
      setTimeout(() => setCallingState(null), 4000);
    } catch (e) {
      setCallingState('ERROR');
    }
  };

  const handleSimulationTest = async () => {
    try {
      await triggerSimulationTest();
      setActionMessage('Simulation test event generated.');
      setTimeout(() => setActionMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className={`glass-panel ${isEmergency ? 'emergency-active danger-glow' : ''}`}
      style={{
        padding: '22px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        border: isEmergency ? '1.5px solid var(--color-red)' : '1px solid var(--border-subtle)'
      }}
    >
      {/* Emergency Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: isEmergency ? 'var(--color-red)' : 'rgba(255, 255, 255, 0.08)',
            color: isEmergency ? '#fff' : 'var(--text-secondary)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1.25rem',
                color: isEmergency ? 'var(--color-red)' : '#fff',
                letterSpacing: '0.04em'
              }}>
                {isEmergency ? '🚨 EXTREME THERMAL RISK ESCALATION ACTIVE' : 'EMERGENCY ESCALATION SYSTEM'}
              </h2>
              {emergencySystem.simulation_mode && (
                <span className="badge" style={{ background: 'rgba(0, 229, 255, 0.15)', color: 'var(--color-cyan)', border: '1px solid var(--color-cyan)' }}>
                  SIMULATION MODE
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Automated Dual-Contact Telephone Escalation & Alarm Protocol
            </p>
          </div>
        </div>

        {/* Global Sound and Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onToggleMute}
            style={{
              background: isMuted ? 'rgba(255,255,255,0.06)' : 'rgba(0, 229, 255, 0.15)',
              border: '1px solid var(--border-subtle)',
              color: isMuted ? 'var(--text-muted)' : 'var(--color-cyan)',
              padding: '6px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-hud)',
              fontSize: '0.75rem'
            }}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isMuted ? 'UNMUTE ALARM' : 'MUTE ALARM'}</span>
          </button>

          {isAlarm && !isAck && (
            <button
              onClick={handleAcknowledge}
              style={{
                background: 'var(--color-amber)',
                color: '#000',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontFamily: 'var(--font-hud)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              ACKNOWLEDGE ALARM
            </button>
          )}

          {isEmergency && (
            <button
              onClick={handleResolve}
              style={{
                background: 'var(--color-green)',
                color: '#000',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontFamily: 'var(--font-hud)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              RESOLVE EMERGENCY
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div style={{
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid var(--color-cyan)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: 'var(--color-cyan)',
          fontFamily: 'var(--font-mono)'
        }}>
          {actionMessage}
        </div>
      )}

      {/* Dual Emergency Contact Call Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {/* Contact 1 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              PRIMARY ESCALATION (CONTACT 1)
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: activeCall?.contact_1?.status === 'CONNECTED' ? 'rgba(0,230,118,0.2)' : 'rgba(255,171,0,0.2)',
              color: activeCall?.contact_1?.status === 'CONNECTED' ? 'var(--color-green)' : 'var(--color-amber)'
            }}>
              {activeCall?.contact_1?.status || 'STANDBY'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={20} color={activeCall?.contact_1?.status === 'CONNECTED' ? 'var(--color-green)' : 'var(--color-cyan)'} />
            <div>
              <div style={{ fontSize: '0.92rem', fontFamily: 'var(--font-hud)', fontWeight: 600, color: '#fff' }}>
                {contacts.contact_1?.name || 'Dr. A. Sharma'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {contacts.contact_1?.masked || '+91******210'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact 2 */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SECONDARY ESCALATION (CONTACT 2)
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: activeCall?.contact_2?.status === 'CONNECTED' ? 'rgba(0,230,118,0.2)' : 'rgba(255,171,0,0.2)',
              color: activeCall?.contact_2?.status === 'CONNECTED' ? 'var(--color-green)' : 'var(--color-amber)'
            }}>
              {activeCall?.contact_2?.status || 'STANDBY'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={20} color={activeCall?.contact_2?.status === 'CONNECTED' ? 'var(--color-green)' : 'var(--color-cyan)'} />
            <div>
              <div style={{ fontSize: '0.92rem', fontFamily: 'var(--font-hud)', fontWeight: 600, color: '#fff' }}>
                {contacts.contact_2?.name || 'Emergency Dispatch'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {contacts.contact_2?.masked || '+91******211'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Row & Manual Override */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '14px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowConfirmModal(true)}
            style={{
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid var(--color-red)',
              color: 'var(--color-red)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PhoneForwarded size={16} />
            <span>MANUAL EMERGENCY CALL</span>
          </button>

          <button
            onClick={handleSimulationTest}
            style={{
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid var(--color-cyan)',
              color: 'var(--color-cyan)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            TEST SIMULATION WORKFLOW
          </button>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Persistence: {emergencySystem.persistence_remaining_seconds ? `${emergencySystem.persistence_remaining_seconds}s active` : 'Normal'} | Cooldown: {emergencySystem.cooldown_remaining_seconds || 0}s
        </div>
      </div>

      {/* Manual Call Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '24px', border: '2px solid var(--color-red)' }}>
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.2rem', color: 'var(--color-red)', marginBottom: '8px' }}>
              CONFIRM EMERGENCY CALL
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Are you sure you want to call both emergency contacts?
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
              • Primary Contact: {contacts.contact_1?.name} ({contacts.contact_1?.masked})<br />
              • Secondary Contact: {contacts.contact_2?.name} ({contacts.contact_2?.masked})
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-hud)',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleTriggerManualCall}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--color-red)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                CALL BOTH CONTACTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
