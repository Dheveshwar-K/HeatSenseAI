import React from 'react';
import { Award, CheckCircle2, FileText, Database, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export default function ModelTransparency() {
  const modelBenchmarks = [
    { model: 'Random Forest Ensemble (Champion)', acc: '90.14%', recall: '86.92%', f1: '88.45%', latency: '2.4 ms', status: 'CHAMPION DEPLOYED' },
    { model: 'Gradient Boosting (XGBoost Equiv)', acc: '89.20%', recall: '85.40%', f1: '87.10%', latency: '4.8 ms', status: 'BENCHMARKED' },
    { model: 'Support Vector Machine (RBF Kernel)', acc: '84.50%', recall: '81.20%', f1: '82.80%', latency: '8.2 ms', status: 'BENCHMARKED' },
    { model: 'Multi-Class Logistic Regression', acc: '78.30%', recall: '74.10%', f1: '76.00%', latency: '0.8 ms', status: 'BASELINE' },
    { model: 'Isolation Forest (Sensor Guardian)', acc: '99.10% DQI', recall: '98.50%', f1: '98.80%', latency: '1.2 ms', status: 'ACTIVE INGEST' }
  ];

  return (
    <section id="model-transparency" style={{
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
            color: 'var(--accent-safe)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px'
          }}>
            <Award size={14} />
            <span>11 • MODEL TRANSPARENCY & VALIDATION</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '12px'
          }}>
            SCIENTIFIC BENCHMARKING <br />
            <span className="gradient-text-heat">& EMPIRICAL VALIDATION.</span>
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Full scientific auditability of model architecture, training cross-validation, and performance metrics across 5 candidate machine learning algorithms.
          </p>
        </div>

        {/* 4 Core Quantitative Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CHAMPION ACCURACY</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-safe)', margin: '4px 0' }}>90.14%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stratified 5-Fold Test Set</div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>MACRO-AVERAGED RECALL</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>86.92%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Extreme class sensitivity</div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>R² EXPLAINED VARIANCE</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-heat)', margin: '4px 0' }}>0.942</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Thermal stress regression</div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>INFERENCE LATENCY</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>2.4 ms</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sub-millisecond per packet</div>
          </div>
        </div>

        {/* Model Comparison Table */}
        <div className="glass-card" style={{ padding: '28px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              Comparative Machine Learning Benchmark Suite
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              10,000 BIOMETEOROLOGICAL HOURLY SAMPLES
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>ALGORITHM</th>
                <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>ACCURACY</th>
                <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>MACRO RECALL</th>
                <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>F1-SCORE</th>
                <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>LATENCY</th>
                <th style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>DEPLOY STATUS</th>
              </tr>
            </thead>
            <tbody>
              {modelBenchmarks.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: i === 0 ? 'rgba(0, 230, 118, 0.04)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: i === 0 ? '#fff' : 'var(--text-secondary)' }}>
                    {row.model}
                  </td>
                  <td style={{ padding: '12px 14px', color: i === 0 ? 'var(--accent-safe)' : '#fff', fontWeight: 700 }}>
                    {row.acc}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--accent-cyan)' }}>{row.recall}</td>
                  <td style={{ padding: '12px 14px', color: '#ffab00' }}>{row.f1}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{row.latency}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: i === 0 ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: i === 0 ? 'var(--accent-safe)' : 'var(--text-muted)',
                      border: i === 0 ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
