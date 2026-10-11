import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Ring, Float } from '@react-three/drei';
import * as THREE from 'three';

// Color palette mapping based on thermal stress score
function getRiskThemeColors(score = 0) {
  if (score < 20) {
    return {
      core: '#00e5ff',
      atmosphere: '#00b0ff',
      particles: '#00e676',
      rings: '#00e5ff',
      glowIntensity: 0.8,
      speed: 0.6
    };
  } else if (score < 40) {
    return {
      core: '#ffab00',
      atmosphere: '#ffd740',
      particles: '#ffd600',
      rings: '#ffab00',
      glowIntensity: 1.2,
      speed: 0.9
    };
  } else if (score < 60) {
    return {
      core: '#ff6d00',
      atmosphere: '#ff9100',
      particles: '#ff6d00',
      rings: '#ff6d00',
      glowIntensity: 1.6,
      speed: 1.4
    };
  } else if (score < 80) {
    return {
      core: '#ff3d00',
      atmosphere: '#ff1744',
      particles: '#ff3d00',
      rings: '#ff1744',
      glowIntensity: 2.2,
      speed: 2.0
    };
  } else {
    // EXTREME / EMERGENCY (>= 80)
    return {
      core: '#d50000',
      atmosphere: '#ff1744',
      particles: '#ff5252',
      rings: '#ff1744',
      glowIntensity: 3.0,
      speed: 2.8
    };
  }
}

function AtmosphereCore({ score = 88, windSpeed = 1.8 }) {
  const meshRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();
  const ringRef3 = useRef();

  const theme = useMemo(() => getRiskThemeColors(score), [score]);

  useFrame((state, delta) => {
    const rotSpeed = delta * theme.speed;
    if (meshRef.current) {
      meshRef.current.rotation.y += rotSpeed * 0.4;
      meshRef.current.rotation.x += rotSpeed * 0.15;
    }
    if (ringRef1.current) ringRef1.current.rotation.z += rotSpeed * 0.6;
    if (ringRef2.current) ringRef2.current.rotation.x += rotSpeed * 0.8;
    if (ringRef3.current) ringRef3.current.rotation.y += rotSpeed * 0.5;
  });

  return (
    <group>
      {/* Central Thermal Core Sphere */}
      <Sphere ref={meshRef} args={[1.5, 48, 48]}>
        <meshStandardMaterial
          color={theme.core}
          emissive={theme.atmosphere}
          emissiveIntensity={theme.glowIntensity}
          roughness={0.25}
          metalness={0.8}
          wireframe={score < 40}
        />
      </Sphere>

      {/* Atmospheric Wave Rings */}
      <Ring ref={ringRef1} args={[1.85, 1.95, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshBasicMaterial color={theme.rings} transparent opacity={0.65} side={THREE.DoubleSide} />
      </Ring>

      <Ring ref={ringRef2} args={[2.2, 2.28, 64]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <meshBasicMaterial color={theme.atmosphere} transparent opacity={0.4} side={THREE.DoubleSide} />
      </Ring>

      <Ring ref={ringRef3} args={[2.6, 2.66, 64]} rotation={[Math.PI / 2, Math.PI / 5, 0]}>
        <meshBasicMaterial color={theme.core} transparent opacity={0.25} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
}

function HeatParticles({ count = 220, score = 88 }) {
  const pointsRef = useRef();
  const theme = useMemo(() => getRiskThemeColors(score), [score]);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      scl[i] = Math.random() * 1.5 + 0.5;
    }
    return [pos, scl];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * theme.speed * 0.3;
      pointsRef.current.rotation.z += delta * theme.speed * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={theme.particles}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Thermal3DScene({ score = 88, windSpeed = 1.8, isEmergency = false }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '340px', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={isEmergency ? 2.5 : 1.2} color={isEmergency ? '#ff1744' : '#00e5ff'} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#ff9100" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <AtmosphereCore score={score} windSpeed={windSpeed} />
          <HeatParticles count={score >= 80 ? 320 : 180} score={score} />
        </Float>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Futuristic HUD overlay labels */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 16,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          3D ATMOSPHERIC THERMAL CORE
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-hud)', fontWeight: 600 }}>
          DYNAMIC THERMAL FIELD ACTIVE
        </div>
      </div>
    </div>
  );
}
