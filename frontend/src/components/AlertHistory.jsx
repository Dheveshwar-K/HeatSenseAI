import React from 'react';
import { History, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AlertHistory({ alerts = [] }) {
  const sampleAlerts = [
    { time: '15:20', risk: 'EXTREME', score: 94, alarm: 'YES', call1: 'CONNECTED', call2: 'CONNECTED', status: 'RESOLVED' },
    { time: '14:10', risk: 'EXTREME', score: 91, alarm: 'YES', call1: 'CONNECTED', call2: 'NO ANSWER', status: 'RESOLVED' },
    { time: '13:05', risk: 'VERY HIGH', score: 78, alarm: 'YES', call1: 'STANDBY', call2: 'STANDBY', status: 'ACKNOWLEDGED' },
    { time: '11:45', risk: 'HIGH', score: 58, alarm: 'NO', call1: 'STANDBY', call2: 'STANDBY', status: 'CLEARED' },
    { time: '09:30', risk: 'MODERATE', score: 38, alarm: 'NO', call1: 'STANDBY', call2: 'STANDBY', status: 'NOMINAL' }
  ];

  const items = alerts.length > 0 ? alerts : sampleAlerts;

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--color-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff', letterSpacing: '0.04em' }}>
            HISTORICAL ALERT & ESCALATION AUDIT LOG
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SECURE AUDIT RECORDS
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px' }}>TIME</th>
              <th style={{ padding: '8px 10px' }}>RISK TIER</th>
              <th style={{ padding: '8px 10px' }}>SCORE</th>
              <th style={{ padding: '8px 10px' }}>ALARM</th>
              <th style={{ padding: '8px 10px' }}>CALL 1</th>
              <th style={{ padding: '8px 10px' }}>CALL 2</th>
              <th style={{ padding: '8px 10px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}>
                <td style={{ padding: '10px', color: 'var(--color-cyan)' }}>{row.time || row.timestamp}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: row.risk === 'EXTREME' || row.risk_category === 'EXTREME' ? 'rgba(255,23,68,0.2)' : 'rgba(255,171,0,0.2)',
                    color: row.risk === 'EXTREME' || row.risk_category === 'EXTREME' ? 'var(--color-red)' : 'var(--color-amber)'
                  }}>
                    {row.risk || row.risk_category}
                  </span>
                </td>
                <td style={{ padding: '10px', fontWeight: 700 }}>{row.score}/100</td>
                <td style={{ padding: '10px', color: row.alarm === 'YES' ? 'var(--color-red)' : 'var(--text-muted)' }}>{row.alarm || 'YES'}</td>
                <td style={{ padding: '10px', color: row.call1 === 'CONNECTED' ? 'var(--color-green)' : 'var(--text-secondary)' }}>{row.call1 || 'CONNECTED'}</td>
                <td style={{ padding: '10px', color: row.call2 === 'CONNECTED' ? 'var(--color-green)' : row.call2 === 'NO ANSWER' ? 'var(--color-red)' : 'var(--text-secondary)' }}>{row.call2 || 'CONNECTED'}</td>
                <td style={{ padding: '10px', color: 'var(--color-green)', fontWeight: 600 }}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
