import React from 'react';
import { ArrowRight, BookOpen, Flame, Sparkles } from 'lucide-react';

export default function FinalCTA({ onLaunch = () => {}, onExploreScience = () => {} }) {
  return (
    <section style={{
      padding: '100px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255, 109, 0, 0.12) 0%, rgba(255, 23, 68, 0.05) 50%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        padding: '0 20px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 16px',
          borderRadius: '999px',
          marginBottom: '20px'
        }}>
          <Flame size={14} color="var(--accent-heat)" />
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600 }}>
            NEXT-GENERATION BIOMETEOROLOGICAL DEFENSE
          </span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: '#fff',
          marginBottom: '20px'
        }}>
          HEAT DOESN’T WAIT. <br />
          <span className="gradient-text-heat">NEITHER SHOULD WARNING.</span>
        </h2>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '620px',
          margin: '0 auto 36px auto'
        }}>
          Empowering cities, civil protection agencies, and vulnerable populations with predictive AI thermal intelligence before dangerous thresholds are crossed.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onLaunch}
            className="framer-button-primary"
            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
          >
            <span>Launch Live Intelligence</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreScience}
            className="framer-button-secondary"
            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
          >
            <BookOpen size={18} color="var(--accent-cyan)" />
            <span>Explore the Science</span>
          </button>
        </div>
      </div>
    </section>
  );
}
