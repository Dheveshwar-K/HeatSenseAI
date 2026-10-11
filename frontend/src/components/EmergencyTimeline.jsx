import React from 'react';
import { Clock, Phone, AlertTriangle, CheckCircle, BellRing, User } from 'lucide-react';

function getCategoryIcon(cat = 'INFO') {
  switch (cat) {
    case 'EMERGENCY':
    case 'ALERT':
      return <AlertTriangle size={14} color="var(--color-red)" />;
    case 'CALL':
      return <Phone size={14} color="var(--color-cyan)" />;
    case 'ALARM':
      return <BellRing size={14} color="var(--color-amber)" />;
    case 'MANUAL':
      return <User size={14} color="var(--color-purple)" />;
    case 'RESOLVE':
    case 'ACK':
      return <CheckCircle size={14} color="var(--color-green)" />;
    default:
      return <Clock size={14} color="var(--text-muted)" />;
  }
}

export default function EmergencyTimeline({ timeline = [] }) {
  const displayItems = timeline.length > 0 ? timeline : [
    { timestamp: '14:10:02', description: 'Extreme thermal risk condition detected (Score: 92/100)', category: 'ALERT' },
    { timestamp: '14:10:03', description: 'Local alarm activated', category: 'ALARM' },
    { timestamp: '14:10:04', description: 'Emergency event created & persistence verified', category: 'EMERGENCY' },
    { timestamp: '14:10:06', description: 'Calling Primary Emergency Contact (Dr. A. Sharma)', category: 'CALL' },
    { timestamp: '14:10:20', description: 'Contact 1 connected and automated alert delivered', category: 'CALL' },
    { timestamp: '14:10:22', description: 'Calling Secondary Emergency Contact (Dispatch)', category: 'CALL' },
    { timestamp: '14:10:40', description: 'Contact 2 connected and automated alert delivered', category: 'CALL' },
    { timestamp: '14:10:42', description: 'Dual notification sequence completed successfully', category: 'RESOLVE' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff', letterSpacing: '0.04em' }}>
          EMERGENCY EVENT TIMELINE
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          CHRONOLOGICAL AUDIT LOG
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '300px',
        overflowY: 'auto',
        paddingRight: '6px'
      }}>
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '8px 10px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '6px',
              borderLeft: `2px solid ${
                item.category === 'EMERGENCY'
                  ? 'var(--color-red)'
                  : item.category === 'CALL'
                  ? 'var(--color-cyan)'
                  : item.category === 'ALARM'
                  ? 'var(--color-amber)'
                  : 'rgba(255,255,255,0.1)'
              }`
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {getCategoryIcon(item.category)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)', fontWeight: 600 }}>
                  {item.timestamp}
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  {item.category}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
