import React, { useEffect, useState } from 'react';
import EmergencyPanel from '../components/EmergencyPanel';
import EmergencyTimeline from '../components/EmergencyTimeline';
import AlertHistory from '../components/AlertHistory';
import { fetchEmergencyStatus, fetchEmergencyHistory } from '../services/api';
import { ShieldAlert, PhoneCall, Radio, History } from 'lucide-react';

export default function Emergency({ liveState }) {
  const { data, isAudioMuted, toggleAudio } = liveState;
  const emergencySystem = data?.emergency_system || {};
  const assessment = data?.thermal_assessment || {};

  const [history, setHistory] = useState(null);

  useEffect(() => {
    fetchEmergencyHistory()
      .then(res => setHistory(res))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={22} color="var(--color-red)" />
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: '#fff' }}>
            EMERGENCY TELEPHONY & ESCALATION MANAGEMENT
          </h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Mission-critical dual-contact automated call dispatch and audit supervision
        </p>
      </div>

      {/* Main Interactive Emergency Panel */}
      <EmergencyPanel
        emergencySystem={emergencySystem}
        assessment={assessment}
        isMuted={isAudioMuted}
        onToggleMute={toggleAudio}
      />

      {/* Timeline and History */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        <EmergencyTimeline timeline={emergencySystem.timeline || []} />
        <AlertHistory alerts={history?.call_sequences || []} />
      </div>
    </div>
  );
}
