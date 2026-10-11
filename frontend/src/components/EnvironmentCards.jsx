import React from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  Activity,
  Flame,
  Gauge
} from 'lucide-react';

function MiniSparkline({ trend = 'up', color = '#00e5ff' }) {
  const points = trend === 'up'
    ? '0,20 15,18 30,12 45,15 60,6 75,8 90,2'
    : trend === 'down'
    ? '0,4 15,6 30,14 45,10 60,18 75,16 90,22'
    : '0,12 15,14 30,11 45,13 60,12 75,14 90,12';

  return (
    <svg width="70" height="24" viewBox="0 0 90 24" style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function EnvironmentCards({ environmental = {} }) {
  const temp = environmental.temperature ?? 40.8;
  const rh = environmental.relative_humidity ?? 72;
  const dp = environmental.dew_point ?? 32.5;
  const wind = environmental.wind_speed ?? 1.8;
  const solar = environmental.solar_radiation ?? 850;
  const wetBulb = environmental.wet_bulb ?? 36.8;
  const heatIndex = environmental.heat_index ?? 82.3;
  const swbgt = environmental.simplified_wbgt ?? 50.2;

  const cards = [
    {
      title: 'TEMPERATURE',
      value: temp.toFixed(1),
      unit: '°C',
      icon: <Thermometer size={18} color="#ff3d00" />,
      status: temp >= 40 ? 'CRITICAL' : temp >= 35 ? 'HIGH' : 'NORMAL',
      color: '#ff3d00',
      trend: 'up'
    },
    {
      title: 'HUMIDITY',
      value: Math.round(rh),
      unit: '%',
      icon: <Droplets size={18} color="#00e5ff" />,
      status: rh >= 70 ? 'OPPRESSIVE' : rh >= 50 ? 'ELEVATED' : 'NOMINAL',
      color: '#00e5ff',
      trend: 'up'
    },
    {
      title: 'DEW POINT',
      value: dp.toFixed(1),
      unit: '°C',
      icon: <CloudRain size={18} color="#b388ff" />,
      status: dp >= 24 ? 'DANGEROUS' : dp >= 20 ? 'MUGGY' : 'NORMAL',
      color: '#b388ff',
      trend: 'up'
    },
    {
      title: 'WIND SPEED',
      value: wind.toFixed(1),
      unit: 'm/s',
      icon: <Wind size={18} color="#ffd600" />,
      status: wind < 1.0 ? 'STAGNANT' : wind < 3.0 ? 'LIGHT' : 'VENTILATED',
      color: '#ffd600',
      trend: 'down'
    },
    {
      title: 'SOLAR RADIATION',
      value: Math.round(solar),
      unit: 'W/m²',
      icon: <Sun size={18} color="#ffab00" />,
      status: solar >= 800 ? 'INTENSE' : solar >= 400 ? 'MODERATE' : 'LOW',
      color: '#ffab00',
      trend: 'up'
    },
    {
      title: 'WET BULB',
      value: wetBulb.toFixed(1),
      unit: '°C',
      icon: <Activity size={18} color="#ff1744" />,
      status: wetBulb >= 32 ? 'LETHAL ZONE' : wetBulb >= 28 ? 'SEVERE' : 'SAFE',
      color: '#ff1744',
      trend: 'up'
    },
    {
      title: 'HEAT INDEX',
      value: heatIndex.toFixed(1),
      unit: '°C',
      icon: <Flame size={18} color="#ff3d00" />,
      status: heatIndex >= 54 ? 'EXTREME DANGER' : heatIndex >= 41 ? 'DANGER' : 'CAUTION',
      color: '#ff3d00',
      trend: 'up'
    },
    {
      title: 'SIMPLIFIED WBGT',
      value: swbgt.toFixed(1),
      unit: '°C',
      icon: <Gauge size={18} color="#ff9100" />,
      status: swbgt >= 32 ? 'BLACK FLAG' : swbgt >= 30 ? 'RED FLAG' : 'GREEN',
      color: '#ff9100',
      trend: 'up'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '14px',
      width: '100%'
    }}>
      {cards.map((card, i) => (
        <div
          key={i}
          className="glass-panel"
          style={{
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {card.icon}
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-hud)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em'
              }}>
                {card.title}
              </span>
            </div>
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: card.color,
              border: `1px solid ${card.color}33`
            }}>
              {card.status}
            </span>
          </div>

          {/* Value and Sparkline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px' }}>
            <div>
              <span style={{
                fontSize: '1.9rem',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em'
              }}>
                {card.value}
              </span>
              <span style={{
                fontSize: '0.88rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginLeft: '6px'
              }}>
                {card.unit}
              </span>
            </div>

            <MiniSparkline trend={card.trend} color={card.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
