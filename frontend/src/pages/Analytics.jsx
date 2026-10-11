import React, { useEffect, useState } from 'react';
import { fetchModelInfo, fetchHistoricalObservations } from '../services/api';
import { Cpu, Award, BarChart3, Database, Layers, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Analytics() {
  const [modelInfo, setModelInfo] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchModelInfo(), fetchHistoricalObservations()])
      .then(([info, hist]) => {
        setModelInfo(info);
        setHistoricalData(hist.records || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const benchmarkData = modelInfo?.benchmark_comparison
    ? Object.entries(modelInfo.benchmark_comparison).map(([name, m]) => ({
        name,
        accuracy: (m.test_accuracy * 100).toFixed(1),
        recall: (m.test_macro_recall * 100).toFixed(1),
        f1: (m.test_macro_f1 * 100).toFixed(1)
      }))
    : [];

  const featureImpData = modelInfo?.feature_importances
    ? Object.entries(modelInfo.feature_importances).slice(0, 10).map(([k, v]) => ({
        feature: k,
        importance: Math.round(v * 1000) / 10
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={22} color="var(--color-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: '#fff' }}>
            AI & CLIMATE MACHINE LEARNING INTELLIGENCE
          </h2>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
          Chronological cross-validation, feature importances, and proxy model diagnostics
        </p>
      </div>

      {/* Champion Model Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', border: '1.5px solid var(--color-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-cyan)', marginBottom: '8px' }}>
            <Award size={20} />
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.85rem', fontWeight: 700 }}>
              CHAMPION PROXY MODEL
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-hud)', fontWeight: 800, color: '#fff' }}>
            {modelInfo?.champion_model || 'RandomForest'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Trained with chronological splitting (70% train / 15% val / 15% test) to prevent temporal data leakage.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DATASET PARTITIONING</div>
          <div style={{ display: 'flex', gap: '18px', marginTop: '10px' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: '#fff' }}>
                {modelInfo?.dataset_split?.train_samples || 1372}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Train (70%)</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: 'var(--color-amber)' }}>
                {modelInfo?.dataset_split?.val_samples || 294}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Validation (15%)</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-hud)', fontWeight: 700, color: 'var(--color-green)' }}>
                {modelInfo?.dataset_split?.test_samples || 294}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Test (15%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table & Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff' }}>
            ALGORITHM BENCHMARK COMPARISON
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>MODEL</th>
                  <th style={{ padding: '8px' }}>ACCURACY</th>
                  <th style={{ padding: '8px' }}>MACRO RECALL</th>
                  <th style={{ padding: '8px' }}>MACRO F1</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px', color: '#fff', fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: '10px', color: 'var(--color-cyan)' }}>{row.accuracy}%</td>
                    <td style={{ padding: '10px', color: 'var(--color-amber)' }}>{row.recall}%</td>
                    <td style={{ padding: '10px', color: 'var(--color-green)', fontWeight: 700 }}>{row.f1}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: '#fff' }}>
            FEATURE IMPORTANCE METRICS
          </h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImpData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#57657e" tick={{ fill: '#8b9bb4', fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" stroke="#57657e" tick={{ fill: '#8b9bb4', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <Tooltip contentStyle={{ backgroundColor: '#070a13', border: '1px solid var(--color-cyan)', fontSize: '0.75rem' }} />
                <Bar dataKey="importance" fill="var(--color-cyan)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Limitations Document Card */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: 'var(--color-amber)' }}>
          ACADEMIC & METHODOLOGICAL LIMITATIONS
        </h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <li>• <strong>Engineered Targets:</strong> As the dataset lacks clinical heatstroke labels, targets are engineered from empirical thermal comfort equations.</li>
          <li>• <strong>Environmental Proxy:</strong> The system measures external thermal burden; it cannot assess internal core temperature, hydration, age, or clothing insulation.</li>
          <li>• <strong>Time-Series Leakage Safeguard:</strong> Training strictly enforces temporal sequencing without mixing future days into historical models.</li>
        </ul>
      </div>
    </div>
  );
}
