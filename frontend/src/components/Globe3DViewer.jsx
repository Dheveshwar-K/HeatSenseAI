import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

// Known real-world heat monitoring hubs with coordinates & realistic baseline microclimates
export const HEAT_MONITORING_NODES = [
  {
    id: 'coimbatore',
    name: 'Coimbatore, India',
    lat: 11.0168,
    lng: 76.9558,
    temp: 23.0,
    humidity: 60,
    wind: 1.8,
    solar: 420,
    score: 18,
    status: 'LOW RISK'
  },
  {
    id: 'chennai',
    name: 'Chennai, India',
    lat: 13.0827,
    lng: 80.2707,
    temp: 41.2,
    humidity: 78,
    wind: 1.4,
    solar: 960,
    score: 93,
    status: 'EXTREME EMERGENCY'
  },
  {
    id: 'delhi',
    name: 'New Delhi, India',
    lat: 28.6139,
    lng: 77.2090,
    temp: 45.1,
    humidity: 42,
    wind: 2.8,
    solar: 1020,
    score: 89,
    status: 'VERY HIGH'
  },
  {
    id: 'mumbai',
    name: 'Mumbai, India',
    lat: 19.0760,
    lng: 72.8777,
    temp: 37.4,
    humidity: 84,
    wind: 3.1,
    solar: 840,
    score: 87,
    status: 'VERY HIGH'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru, India',
    lat: 12.9716,
    lng: 77.5946,
    temp: 34.0,
    humidity: 50,
    wind: 3.9,
    solar: 780,
    score: 46,
    status: 'MODERATE'
  },
  {
    id: 'dubai',
    name: 'Dubai, UAE',
    lat: 25.2048,
    lng: 55.2708,
    temp: 47.3,
    humidity: 56,
    wind: 1.9,
    solar: 1050,
    score: 97,
    status: 'EXTREME EMERGENCY'
  },
  {
    id: 'phoenix',
    name: 'Phoenix, Arizona, USA',
    lat: 33.4484,
    lng: -112.0740,
    temp: 45.8,
    humidity: 18,
    wind: 2.2,
    solar: 1010,
    score: 81,
    status: 'VERY HIGH'
  },
  {
    id: 'death_valley',
    name: 'Death Valley, USA',
    lat: 36.5323,
    lng: -116.9325,
    temp: 51.4,
    humidity: 11,
    wind: 3.4,
    solar: 1100,
    score: 99,
    status: 'EXTREME EMERGENCY'
  },
  {
    id: 'seville',
    name: 'Seville, Spain',
    lat: 37.3891,
    lng: -5.9845,
    temp: 42.6,
    humidity: 28,
    wind: 2.4,
    solar: 940,
    score: 78,
    status: 'HIGH RISK'
  }
];

// Converts latitude & longitude into 3D Cartesian coordinates on unit sphere
function latLngToVector3(lat, lng, radius = 2.0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function HotspotPin({ node, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => latLngToVector3(node.lat, node.lng, 2.02), [node.lat, node.lng]);

  const isExtreme = node.score >= 80;
  const pinColor = isExtreme ? '#ff1744' : node.score >= 60 ? '#ff6d00' : '#00e5ff';

  return (
    <group position={position}>
      {/* Outer pulsing ring */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(node); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[isSelected ? 0.07 : 0.045, 16, 16]} />
        <meshBasicMaterial color={pinColor} />
      </mesh>

      {/* Interactive Tooltip Card on Hover or Select */}
      {(hovered || isSelected) && (
        <Html distanceFactor={8} position={[0, 0.12, 0]} center>
          <div style={{
            background: 'rgba(11, 16, 23, 0.94)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${pinColor}`,
            padding: '8px 12px',
            borderRadius: '8px',
            minWidth: '170px',
            boxShadow: `0 0 20px ${pinColor}44`,
            color: '#fff',
            pointerEvents: 'none',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-display)'
          }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '3px' }}>{node.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Temp / RH:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{node.temp}°C / {node.humidity}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span>Thermal Stress:</span>
              <span style={{ color: pinColor, fontWeight: 700 }}>{node.score}/100</span>
            </div>
            <div style={{
              marginTop: '4px',
              padding: '2px 4px',
              background: `${pinColor}22`,
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: pinColor,
              letterSpacing: '0.04em'
            }}>
              {node.status}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function EarthGlobe({ selectedNode, onSelectNode }) {
  const globeGroupRef = useRef();

  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* Base Oceanic Sphere */}
      <Sphere args={[2.0, 64, 64]}>
        <meshStandardMaterial
          color="#0b1626"
          roughness={0.7}
          metalness={0.2}
        />
      </Sphere>

      {/* Atmospheric Glowing Haze Layer */}
      <Sphere args={[2.08, 48, 48]}>
        <meshStandardMaterial
          color="#00e5ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Outer Thermal Ionosphere Glow */}
      <Sphere args={[2.22, 32, 32]}>
        <meshBasicMaterial
          color="#ff6d00"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Hotspots for real-world monitored regions */}
      {HEAT_MONITORING_NODES.map((node) => (
        <HotspotPin
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          onSelect={onSelectNode}
        />
      ))}
    </group>
  );
}

function AmbientSpaceParticles({ count = 300 }) {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.8 + Math.random() * 5.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00e5ff"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Globe3DViewer({ onSelectCity = () => {}, liveData = null }) {
  const [selectedNode, setSelectedNode] = useState(HEAT_MONITORING_NODES[0]);

  const handleSelect = (node) => {
    setSelectedNode(node);
    onSelectCity(node);
  };

  const isCoimbatore = selectedNode.id === 'coimbatore';
  const displayTemp = (isCoimbatore && liveData?.environmental?.temperature !== undefined)
    ? Number(liveData.environmental.temperature).toFixed(1)
    : selectedNode.temp;
  const displayHumidity = (isCoimbatore && liveData?.environmental?.relative_humidity !== undefined)
    ? Math.round(liveData.environmental.relative_humidity)
    : selectedNode.humidity;
  const displayWind = (isCoimbatore && liveData?.environmental?.wind_speed !== undefined)
    ? Number(liveData.environmental.wind_speed).toFixed(1)
    : selectedNode.wind;
  const displayScore = (isCoimbatore && (liveData?.thermal_assessment?.score !== undefined || liveData?.thermal_stress?.score !== undefined))
    ? (liveData?.thermal_assessment?.score ?? liveData?.thermal_stress?.score)
    : selectedNode.score;
  const displayStatus = (isCoimbatore && liveData?.thermal_assessment?.risk_category)
    ? liveData.thermal_assessment.risk_category
    : selectedNode.status;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '480px',
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-8, -5, -8]} intensity={0.6} color="#ff6d00" />

        <EarthGlobe selectedNode={selectedNode} onSelectNode={handleSelect} />
        <AmbientSpaceParticles />

        <OrbitControls
          enableZoom={true}
          maxDistance={7.5}
          minDistance={3.2}
          autoRotate={false}
          enablePan={false}
        />
      </Canvas>

      {/* Inspected Region Overlay Card */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(11, 16, 23, 0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '16px 20px',
          maxWidth: '320px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              GEOGRAPHIC DIGITAL TWIN
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: (displayScore >= 80) ? 'rgba(255, 23, 68, 0.2)' : 'rgba(255, 109, 0, 0.2)',
              color: (displayScore >= 80) ? 'var(--accent-crimson)' : 'var(--accent-heat)',
              border: `1px solid ${(displayScore >= 80) ? 'var(--accent-crimson)' : 'var(--accent-heat)'}`
            }}>
              {displayStatus}
            </span>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
            {selectedNode.name}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Air Temperature</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{displayTemp}°C</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Relative Humidity</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{displayHumidity}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Wind Speed</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{displayWind} m/s</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Thermal Stress</div>
              <div style={{ fontWeight: 800, color: (displayScore >= 80) ? 'var(--accent-crimson)' : 'var(--accent-heat)', fontSize: '0.95rem' }}>
                {displayScore} / 100
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
