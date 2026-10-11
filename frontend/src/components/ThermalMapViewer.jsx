import React, { useState } from 'react';
import { MapPin, Search, Layers, Compass, Flame, ShieldAlert, Eye, Globe, ChevronRight } from 'lucide-react';

const REGIONAL_STATIONS = [
  { id: 'cbe', name: 'Coimbatore District Met Hub', region: 'Tamil Nadu, India', lat: 11.0168, lng: 76.9558, temp: 23.0, rh: 60, wind: 1.8, hi: 23.5, score: 18, status: 'LOW RISK' },
  { id: 'maa', name: 'Chennai Coastal Radar Station', region: 'Tamil Nadu, India', lat: 13.0827, lng: 80.2707, temp: 41.2, rh: 78, wind: 1.4, hi: 58.1, score: 93, status: 'EXTREME' },
  { id: 'del', name: 'Delhi NCR Urban Heat Island', region: 'Delhi, India', lat: 28.6139, lng: 77.2090, temp: 45.1, rh: 42, wind: 2.8, hi: 53.8, score: 89, status: 'VERY HIGH' },
  { id: 'bom', name: 'Mumbai Harbor Station', region: 'Maharashtra, India', lat: 19.0760, lng: 72.8777, temp: 37.4, rh: 84, wind: 3.1, hi: 55.6, score: 87, status: 'VERY HIGH' },
  { id: 'blr', name: 'Bengaluru Plateau Sensor', region: 'Karnataka, India', lat: 12.9716, lng: 77.5946, temp: 34.0, rh: 50, wind: 3.9, hi: 38.2, score: 46, status: 'MODERATE' },
  { id: 'dxb', name: 'Dubai Desert Perimeter', region: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, temp: 47.3, rh: 56, wind: 1.9, hi: 64.2, score: 97, status: 'EXTREME' },
  { id: 'phx', name: 'Phoenix Valley Array', region: 'Arizona, USA', lat: 33.4484, lng: -112.0740, temp: 45.8, rh: 18, wind: 2.2, hi: 46.1, score: 81, status: 'VERY HIGH' }
];

export default function ThermalMapViewer() {
  const [activeLayer, setActiveLayer] = useState('thermal-stress');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(REGIONAL_STATIONS[0]);

  const filteredStations = REGIONAL_STATIONS.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="thermal-map" style={{
      padding: '80px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
        {/* Section Header & Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-heat)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px'
            }}>
              <MapPin size={14} />
              <span>05 • GEOGRAPHIC THERMAL INTELLIGENCE MAP</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff'
            }}>
              HEATWAVE DANGER ZONES.
            </h2>
          </div>

          {/* Location Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(17, 24, 34, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '999px',
            padding: '8px 18px',
            minWidth: '280px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}>
            <Search size={16} color="var(--accent-cyan)" />
            <input
              type="text"
              placeholder="Search location (e.g. Coimbatore, Delhi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
                fontFamily: 'var(--font-body)'
              }}
            />
          </div>
        </div>

        {/* Layer Selector Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          {[
            { id: 'temperature', label: 'TEMPERATURE' },
            { id: 'humidity', label: 'HUMIDITY' },
            { id: 'heat-index', label: 'HEAT INDEX' },
            { id: 'thermal-stress', label: 'THERMAL STRESS' },
            { id: 'heatwave-zones', label: 'HEATWAVE DANGER ZONES' },
            { id: 'forecast', label: '+6H FORECAST ISOCHRONES' }
          ].map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(255, 109, 0, 0.25) 0%, rgba(255, 23, 68, 0.25) 100%)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-heat)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {layer.label}
              </button>
            );
          })}
        </div>

        {/* Main Map Viewer & Station Selector Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Interactive Map Visual Surface (8 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 8',
            minHeight: '480px',
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 40% 45%, rgba(255, 109, 0, 0.15) 0%, rgba(255, 23, 68, 0.12) 35%, rgba(11, 16, 23, 0.95) 75%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px'
          }}>
            {/* Top Map HUD Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
              <div style={{
                background: 'rgba(11, 16, 23, 0.85)',
                backdropFilter: 'blur(12px)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACTIVE LAYER</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  {activeLayer.replace('-', ' ')}
                </div>
              </div>

              {/* Heat gradient legend */}
              <div style={{
                background: 'rgba(11, 16, 23, 0.85)',
                backdropFilter: 'blur(12px)',
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  THERMAL ISOCHRONE GRADIENT
                </div>
                <div style={{
                  width: '160px',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(to right, #00e5ff 0%, #00e676 25%, #ffab00 50%, #ff6d00 75%, #ff1744 100%)'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                  <span>Safe</span>
                  <span>Moderate</span>
                  <span>Extreme</span>
                </div>
              </div>
            </div>

            {/* Simulated Geographic Grid with Hotspot Pulse Rings */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 48% 52%, rgba(255, 23, 68, 0.28) 0%, rgba(255, 109, 0, 0.18) 25%, transparent 60%)',
              pointerEvents: 'none'
            }} />

            {/* Floating Station Pins on Map Surface */}
            <div style={{ position: 'relative', width: '100%', height: '240px', zIndex: 2 }}>
              {REGIONAL_STATIONS.map((station, i) => {
                const isSelected = selectedStation?.id === station.id;
                // Layout in a geographic scatter distribution
                const leftPositions = [45, 60, 52, 38, 48, 25, 12];
                const topPositions = [55, 62, 32, 48, 68, 40, 35];
                const left = leftPositions[i % leftPositions.length];
                const top = topPositions[i % topPositions.length];

                return (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: isSelected ? 10 : 3
                    }}
                  >
                    <div style={{
                      width: isSelected ? '24px' : '16px',
                      height: isSelected ? '24px' : '16px',
                      borderRadius: '50%',
                      background: station.score >= 80 ? '#ff1744' : station.score >= 60 ? '#ff6d00' : '#00e5ff',
                      boxShadow: isSelected ? '0 0 20px #ff1744' : '0 0 10px rgba(0,0,0,0.5)',
                      border: '2px solid #ffffff',
                      transition: 'all 0.2s ease'
                    }} />

                    <div style={{
                      background: 'rgba(11, 16, 23, 0.9)',
                      border: isSelected ? '1px solid #ff1744' : '1px solid rgba(255,255,255,0.1)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#fff',
                      whiteSpace: 'nowrap'
                    }}>
                      {station.name.split(' ')[0]} ({station.temp}°C)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Map Info Footer */}
            <div style={{
              background: 'rgba(11, 16, 23, 0.88)',
              backdropFilter: 'blur(16px)',
              padding: '12px 20px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={15} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                  High-Resolution Regional Reanalysis Grid (0.05° Resolution)
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                LAT: {selectedStation.lat.toFixed(4)}° | LNG: {selectedStation.lng.toFixed(4)}°
              </span>
            </div>
          </div>

          {/* Right Station Inspector Panel (4 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 4',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  INSPECTED MET STATION
                </span>
                <span className={selectedStation.score >= 80 ? 'status-badge status-badge-extreme' : 'status-badge status-badge-high'}>
                  {selectedStation.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {selectedStation.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                {selectedStation.region}
              </p>

              {/* Telemetry Matrix for Selected Station */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>AIR TEMP</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{selectedStation.temp}°C</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>HUMIDITY</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{selectedStation.rh}%</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>HEAT INDEX</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-heat)' }}>{selectedStation.hi}°C</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>AI STRESS</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedStation.score >= 80 ? 'var(--accent-crimson)' : 'var(--accent-heat)' }}>
                    {selectedStation.score}/100
                  </div>
                </div>
              </div>

              {/* Station Search Results List */}
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                MONITORED METEOROLOGICAL HUBS ({filteredStations.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    style={{
                      background: selectedStation.id === station.id ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedStation.id === station.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.05)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>{station.name.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{station.temp}°C • Score {station.score}</div>
                    </div>
                    <ChevronRight size={14} color={selectedStation.id === station.id ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(255, 109, 0, 0.08)',
              border: '1px solid rgba(255, 109, 0, 0.25)',
              borderRadius: '10px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)'
            }}>
              🚨 <strong>Action Threshold:</strong> When thermal stress exceeds 80, dual emergency phone notifications activate automatically.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
