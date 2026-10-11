import React, { useState } from 'react';
import { useLiveThermalData } from './hooks/useLiveThermalData';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import TWCWeatherMonitor from './components/TWCWeatherMonitor';
import TheProblem from './components/TheProblem';
import ScientificModel from './components/ScientificModel';
import LiveIntelligence from './components/LiveIntelligence';
import ThermalMapViewer from './components/ThermalMapViewer';
import AIThermalForecast from './components/AIThermalForecast';
import HumanBodyRisk from './components/HumanBodyRisk';
import AIExplainability from './components/AIExplainability';
import EmergencyEscalation from './components/EmergencyEscalation';
import ArchitecturePipeline from './components/ArchitecturePipeline';
import ModelTransparency from './components/ModelTransparency';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import JuryPresentationMode from './components/JuryPresentationMode';

export default function App() {
  const liveState = useLiveThermalData();
  const { data, connectionStatus, isAudioMuted, toggleAudio, setScenario } = liveState;

  const [activeSection, setActiveSection] = useState('hero');
  const [modalMode, setModalMode] = useState(null); // 'demo' | 'presentation' | null

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isEmergency = data?.emergency_system?.state === 'EMERGENCY' || data?.emergency_system?.alarm_active;

  return (
    <div className="custom-cursor-active" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Custom Desktop Interactive Cursor */}
      <CustomCursor />

      {/* Emergency Global Pulsing Top Border */}
      {isEmergency && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #ff1744, #ff6d00, #ff1744)',
          boxShadow: '0 0 20px #ff1744',
          zIndex: 9999,
          animation: 'live-pulse 1.5s infinite'
        }} />
      )}

      {/* Floating Translucent Glass Navbar */}
      <Navbar
        connectionStatus={connectionStatus}
        isAudioMuted={isAudioMuted}
        toggleAudio={toggleAudio}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenJuryDemo={() => setModalMode('demo')}
        onOpenPresentation={() => setModalMode('presentation')}
      />

      {/* Main Page Storytelling Flow */}
      <main style={{ width: '100%', flex: 1, padding: '0 24px' }}>
        {/* 01: Hero Section */}
        <Hero3D
          liveData={data}
          onExplore={() => scrollToSection('twc-weather')}
          onViewMap={() => scrollToSection('thermal-map')}
          onOpenJuryDemo={() => setModalMode('demo')}
        />

        {/* 02: The Weather Company (TWC) & PWS Ingestion Monitor */}
        <TWCWeatherMonitor />

        {/* 03: The Problem */}
        <TheProblem />

        {/* 03: Scientific Model & Thermodynamics Sandbox */}
        <ScientificModel liveState={liveState} />

        {/* 04: Live Intelligence Dashboard & Realtime Telemetry Stream */}
        <LiveIntelligence liveState={liveState} />

        {/* 05: Real-Time Geographic Thermal Map */}
        <ThermalMapViewer />

        {/* 06: Multi-Horizon AI Thermal Forecast */}
        <AIThermalForecast liveState={liveState} />

        {/* 07: Physiological Human Body Thermal Risk Silhouette */}
        <HumanBodyRisk liveScore={data?.thermal_assessment?.score ?? 76} />

        {/* 08: Explainable AI (SHAP Feature Importance) */}
        <AIExplainability liveData={data} />

        {/* 09: Automated Emergency Escalation & Dual Telephony */}
        <EmergencyEscalation liveState={liveState} />

        {/* 10: System Architecture & Data Pipeline */}
        <ArchitecturePipeline />

        {/* 11: Model Transparency & Scientific Benchmarking */}
        <ModelTransparency />

        {/* 12: Final Cinematic Call To Action */}
        <FinalCTA
          onLaunch={() => scrollToSection('live-monitor')}
          onExploreScience={() => scrollToSection('scientific-model')}
        />
      </main>

      {/* Minimalist Scientific Footer */}
      <Footer onNavigate={scrollToSection} />

      {/* Jury Demo Mode & Presentation Mode Modal */}
      <JuryPresentationMode
        isOpen={modalMode !== null}
        mode={modalMode || 'demo'}
        onClose={() => setModalMode(null)}
        onSelectScenario={(scenarioName) => {
          setScenario(scenarioName);
          scrollToSection('live-monitor');
        }}
      />
    </div>
  );
}
