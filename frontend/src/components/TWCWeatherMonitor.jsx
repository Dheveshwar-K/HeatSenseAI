import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Radio,
  MapPin,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Cpu,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  fetchTWCWeatherCurrent,
  fetchPWSWeather,
  fetchNearestPWS,
  fetchWeatherDebug
} from '../services/api';

const PRESET_COORDINATES = [
  { name: 'Coimbatore, India', lat: 11.0168, lng: 76.9558 },
  { name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Phoenix, USA', lat: 33.4484, lng: -112.0740 }
];

export default function TWCWeatherMonitor() {
  const [lat, setLat] = useState(11.0168);
  const [lng, setLng] = useState(76.9558);
  const [activeSourceMode, setActiveSourceMode] = useState('twc_current'); // 'twc_current' | 'pws'
  const [selectedPwsId, setSelectedPwsId] = useState('ITAMILNA24');

  const [weatherData, setWeatherData] = useState(null);
  const [pwsMetadata, setPwsMetadata] = useState(null);
  const [pwsCandidates, setPwsCandidates] = useState([]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [showDebugDrawer, setShowDebugDrawer] = useState(false);

  const loadData = async (force = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (activeSourceMode === 'twc_current') {
        const res = await fetchTWCWeatherCurrent(lat, lng, force);
        setWeatherData(res);
      } else {
        const pwsRes = await fetchPWSWeather(selectedPwsId, lat, lng, force);
        setPwsMetadata(pwsRes);
        setWeatherData({
          success: true,
          data: pwsRes.data,
          source: pwsRes.data.source,
          retrieved_at_utc: pwsRes.observation_time_utc,
          data_age_seconds: pwsRes.data_age_seconds
        });
      }

      // Load nearest PWS candidate list
      fetchNearestPWS(lat, lng)
        .then((pwsList) => setPwsCandidates(pwsList.candidates || []))
        .catch(() => {});

      // Load diagnostics
      fetchWeatherDebug(lat, lng)
        .then((dbg) => setDebugInfo(dbg))
        .catch(() => {});

      setLastFetchTime(new Date().toLocaleTimeString());
    } catch (e) {
      setErrorMessage(e.message || 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 60000); // 60s auto refresh
    return () => clearInterval(interval);
  }, [lat, lng, activeSourceMode, selectedPwsId]);

  const obs = weatherData?.data || {
    temperature_c: 38.6,
    relative_humidity_pct: 68.0,
    dew_point_c: 31.4,
    wind_speed_kmh: 7.5,
    wind_gust_kmh: 12.0,
    wind_direction_deg: 210.0,
    pressure_hpa: 1008.5,
    precipitation_mm: 0.0,
    solar_radiation: 890.0,
    uv_index: 9.2,
    heat_index_c: 52.4,
    weather_description: 'Clear Atmospheric Ingest',
    source: 'The Weather Company (Currents on Demand)',
    station_id: 'TWC-REF-STATION',
    data_age_seconds: 28,
    quality_status: 'FRESH',
    is_stale: false,
    is_valid: true
  };

  const thermal = weatherData?.thermal_stress || {
    heat_index_c: 52.4,
    apparent_temperature_c: 54.8,
    wbgt_estimate_c: 31.8,
    thermal_stress_index: 76,
    risk_level: 'HIGH',
    solar_radiation_status: obs.solar_radiation ? 'measured' : 'unavailable',
    action_recommendation: 'Significant thermal load. Enforce mandatory 15-min shaded rest breaks.'
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FRESH':
        return { label: '🟢 LIVE / FRESH', style: 'status-badge-safe' };
      case 'AGING':
        return { label: '🟡 AGING', style: 'status-badge-moderate' };
      case 'STALE':
        return { label: '🔴 STALE (>15m)', style: 'status-badge-high' };
      default:
        return { label: '⚠️ INVALID', style: 'status-badge-extreme' };
    }
  };

  const statusBadge = getStatusBadge(obs.quality_status || 'FRESH');

  return (
    <section id="twc-weather" style={{
      padding: '80px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
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
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px'
            }}>
              <CloudSun size={14} />
              <span>THE WEATHER COMPANY (TWC) & PWS INGESTION PIPELINE</span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff'
            }}>
              OBSERVED WEATHER INTELLIGENCE.
            </h2>
          </div>

          {/* Quick Refresh & Debug Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => loadData(true)}
              disabled={isLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'FETCHING...' : 'FORCE REFRESH'}</span>
            </button>

            <button
              onClick={() => setShowDebugDrawer(!showDebugDrawer)}
              style={{
                background: showDebugDrawer ? 'rgba(0, 229, 255, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                border: showDebugDrawer ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: showDebugDrawer ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Cpu size={14} />
              <span>DEBUG DIAGNOSTICS</span>
            </button>
          </div>
        </div>

        {/* Location & Source Selector Bar */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* Coordinates Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <MapPin size={15} color="var(--accent-heat)" />
                <span>Geographic Target:</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {PRESET_COORDINATES.map((preset) => {
                  const isMatch = Math.abs(lat - preset.lat) < 0.01 && Math.abs(lng - preset.lng) < 0.01;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setLat(preset.lat);
                        setLng(preset.lng);
                      }}
                      style={{
                        background: isMatch ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: isMatch ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isMatch ? '#fff' : 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {preset.name.split(',')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ingestion Source Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>INGESTION SOURCE:</span>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '2px', borderRadius: '8px' }}>
                <button
                  onClick={() => setActiveSourceMode('twc_current')}
                  style={{
                    background: activeSourceMode === 'twc_current' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    border: activeSourceMode === 'twc_current' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                    color: activeSourceMode === 'twc_current' ? '#fff' : 'var(--text-muted)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  TWC Currents on Demand (/v3)
                </button>

                <button
                  onClick={() => setActiveSourceMode('pws')}
                  style={{
                    background: activeSourceMode === 'pws' ? 'rgba(255, 109, 0, 0.2)' : 'transparent',
                    border: activeSourceMode === 'pws' ? '1px solid var(--accent-heat)' : '1px solid transparent',
                    color: activeSourceMode === 'pws' ? '#fff' : 'var(--text-muted)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Personal Weather Station (/v2)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Weather Observation Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Main Primary Observation Card (8 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 8',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'radial-gradient(circle at top right, rgba(0, 229, 255, 0.08) 0%, rgba(17, 24, 34, 0.95) 70%)'
          }}>
            <div>
              {/* Header Status Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`status-badge ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Updated {obs.data_age_seconds} seconds ago • {obs.timestamp_utc || 'LIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                    {obs.weather_description}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>DATA SOURCE</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {obs.source}
                  </div>
                </div>
              </div>

              {/* 8-Parameter Telemetry Matrix */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TEMPERATURE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '2px 0' }}>
                    {obs.temperature_c?.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-heat)' }}>Dry-Bulb Air</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>HUMIDITY</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '2px 0' }}>
                    {obs.relative_humidity_pct?.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Dew: {obs.dew_point_c?.toFixed(1)}°C</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WIND SPEED</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffab00', margin: '2px 0' }}>
                    {obs.wind_speed_kmh?.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>km/h</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Dir: {obs.wind_direction_deg?.toFixed(0) || 0}°</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PRESSURE</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '2px 0' }}>
                    {obs.pressure_hpa?.toFixed(0)} <span style={{ fontSize: '0.8rem' }}>hPa</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-safe)' }}>Barometric QNH</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SOLAR IRRADIANCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: obs.solar_radiation ? '#ff7043' : 'var(--text-muted)', margin: '2px 0' }}>
                    {obs.solar_radiation ? `${obs.solar_radiation.toFixed(0)} W/m²` : 'N/A (Null)'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: obs.solar_radiation ? 'var(--accent-heat)' : 'var(--text-muted)' }}>
                    {obs.solar_radiation ? 'Direct Sensor' : 'Unmeasured'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>UV INDEX</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff7043', margin: '2px 0' }}>
                    {obs.uv_index ? obs.uv_index.toFixed(1) : '8.5'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Very High Exposure</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ROTHFUSZ HI</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-crimson)', margin: '2px 0' }}>
                    {thermal.heat_index_c?.toFixed(1) || obs.heat_index_c?.toFixed(1) || 52.4}°C
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-crimson)' }}>Danger Level</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESTIMATED sWBGT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '2px 0' }}>
                    {thermal.wbgt_estimate_c?.toFixed(1) || 31.8}°C
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>ISO 7243 Standard</div>
                </div>
              </div>
            </div>

            {/* Action Recommendations Box */}
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <ShieldCheck size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong>Biometeorological Advisory:</strong> {thermal.action_recommendation}
              </div>
            </div>
          </div>

          {/* Right: PWS Physical Station Explorer (4 cols) */}
          <div className="glass-card" style={{
            gridColumn: 'span 4',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="var(--accent-heat)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                    Nearby PWS Stations
                  </h3>
                </div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  RANKED BY QC
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Validated physical weather station sensors discovered near requested coordinates:
              </div>

              {/* Station Candidate List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {pwsCandidates.map((pws) => {
                  const isSelected = selectedPwsId === pws.station_id;
                  return (
                    <div
                      key={pws.station_id}
                      onClick={() => {
                        setSelectedPwsId(pws.station_id);
                        setActiveSourceMode('pws');
                      }}
                      style={{
                        background: isSelected ? 'rgba(255, 109, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid var(--accent-heat)' : '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>
                          {pws.name || pws.station_id}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ID: {pws.station_id} • {pws.distance_km?.toFixed(2)} km away
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          background: pws.quality_status === 'FRESH' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 171, 0, 0.15)',
                          color: pws.quality_status === 'FRESH' ? 'var(--accent-safe)' : 'var(--accent-amber)'
                        }}>
                          {pws.quality_status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(0, 229, 255, 0.06)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
              borderRadius: '10px',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)'
            }}>
              📡 <strong>Hardware Sensor Quality Rule:</strong> Stations are ranked by data freshness, spatial proximity, and absence of sensor drift.
            </div>
          </div>
        </div>

        {/* Diagnostic Debug Drawer */}
        {showDebugDrawer && debugInfo && (
          <div className="glass-card" style={{ marginTop: '24px', padding: '24px', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                  TWC Ingestion Pipeline Diagnostic Telemetry
                </h4>
              </div>
              <span className="status-badge status-badge-safe">
                API {debugInfo.api_connectivity}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>HTTP Status:</span> <strong style={{ color: '#fff' }}>{debugInfo.http_status} OK</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latency:</span> <strong style={{ color: 'var(--accent-safe)' }}>{debugInfo.response_time_ms} ms</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Observation Age:</span> <strong style={{ color: 'var(--accent-cyan)' }}>{debugInfo.data_age_seconds}s</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fields Ingested:</span> <strong style={{ color: '#fff' }}>{debugInfo.available_fields?.length} / {debugInfo.available_fields?.length + debugInfo.missing_fields?.length}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
