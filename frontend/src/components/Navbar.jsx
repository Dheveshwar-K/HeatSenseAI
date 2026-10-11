import React from 'react';
import {
  Flame,
  Globe2,
  Activity,
  MapPin,
  TrendingUp,
  UserCheck,
  Brain,
  Layers,
  Volume2,
  VolumeX,
  PlayCircle,
  Sliders,
  Sparkles,
  Wifi,
  WifiOff,
  CloudSun
} from 'lucide-react';

export default function Navbar({
  connectionStatus = 'CONNECTED',
  isAudioMuted = false,
  toggleAudio = () => {},
  onOpenPresentation = () => {},
  onOpenJuryDemo = () => {},
  activeSection = 'hero',
  onNavigate = () => {}
}) {
  const isConnected = connectionStatus === 'CONNECTED';

  const navLinks = [
    { id: 'hero', label: 'Overview', icon: <Flame size={14} /> },
    { id: 'twc-weather', label: 'TWC Weather', icon: <CloudSun size={14} /> },
    { id: 'globe', label: '3D Globe', icon: <Globe2 size={14} /> },
    { id: 'live-monitor', label: 'Live Monitor', icon: <Activity size={14} /> },
    { id: 'thermal-map', label: 'Thermal Map', icon: <MapPin size={14} /> },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp size={14} /> },
    { id: 'human-risk', label: 'Human Risk', icon: <UserCheck size={14} /> },
    { id: 'explainability', label: 'AI Explainability', icon: <Brain size={14} /> },
    { id: 'architecture', label: 'Architecture', icon: <Layers size={14} /> }
  ];

  return (
    <header style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '1380px',
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <div style={{
        background: 'rgba(11, 16, 23, 0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'auto'
      }}>
        {/* Logo & Platform Name */}
        <a
          href="#hero"
          onClick={(e) => { e.preventDefault(); onNavigate('hero'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit',
            flexShrink: 0
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6d00 0%, #ff1744 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(255, 109, 0, 0.5)'
          }}>
            <Flame size={18} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.1
            }}>
              HeatSense AI
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em'
            }}>
              CLIMATE INTELLIGENCE OS
            </div>
          </div>
        </a>

        {/* Center Nav Pills (Desktop) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '3px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflowX: 'auto'
        }}>
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Live Status, Demo, Presentation & Audio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Live Indicator */}
          <div
            title={`Telemetry WebSocket: ${connectionStatus}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: isConnected ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.1)',
              border: `1px solid ${isConnected ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 23, 68, 0.3)'}`,
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: isConnected ? 'var(--accent-safe)' : 'var(--accent-crimson)'
            }}
          >
            <span className={isConnected ? "live-dot" : "live-dot-danger"} style={{ width: 6, height: 6 }} />
            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          {/* Jury Demo Mode Trigger */}
          <button
            onClick={onOpenJuryDemo}
            title="Open 10 Deterministic Heatwave Scenarios"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 109, 0, 0.2) 0%, rgba(255, 23, 68, 0.2) 100%)',
              border: '1px solid rgba(255, 109, 0, 0.4)',
              color: '#ff9e80',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={13} color="#ff6d00" />
            <span>JURY DEMO</span>
          </button>

          {/* Guided Presentation Mode */}
          <button
            onClick={onOpenPresentation}
            title="Start 2-3 Minute Guided Walkthrough"
            style={{
              background: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              color: 'var(--accent-cyan)',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.74rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <PlayCircle size={13} />
            <span>PRESENTATION</span>
          </button>

          {/* Audio Siren Mute / Unmute */}
          <button
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: isAudioMuted ? 'var(--text-muted)' : 'var(--accent-cyan)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
