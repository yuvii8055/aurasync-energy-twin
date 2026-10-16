import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Float,
  Sky,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { useCampusStore } from '../../store/useCampusStore.js';
import campusConfig from '../../config/campus.json';
import { formatKw, formatINR } from '../../lib/utils.js';

// Procedural Tree Component
function Tree({ position }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.4, 2.4, 6]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>
      {/* Foliage Canopy */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[1.6, 8, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Street Lamp with Controllable Glow
function StreetLamp({ lamp }) {
  const isNight = false; // IST lighting logic
  return (
    <group position={[lamp.x, 0, lamp.z]}>
      {/* Pole */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 6, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Lamp Head */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.4]} />
        <meshStandardMaterial color="#64748B" />
      </mesh>
      {/* Emissive Light Bulb */}
      <mesh position={[0, 5.9, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#FEF08A"
          emissiveIntensity={lamp.state === 'on' ? 2.5 : 0.1}
        />
      </mesh>
    </group>
  );
}

// Moving Lift Cabin inside Building Shaft
function LiftCabin({ x, z, minHeight = 1, maxHeight = 16, status = 'running' }) {
  const liftRef = useRef();
  useFrame(({ clock }) => {
    if (liftRef.current && status === 'running') {
      const t = clock.getElapsedTime() * 0.8;
      const height = minHeight + ((Math.sin(t) + 1) / 2) * (maxHeight - minHeight);
      liftRef.current.position.y = height;
    }
  });

  return (
    <mesh ref={liftRef} position={[x, minHeight, z]}>
      <boxGeometry args={[2.5, 3.2, 2.5]} />
      <meshStandardMaterial
        color="#0284C7"
        emissive="#0284C7"
        emissiveIntensity={0.6}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// Animated Energy Flow Particles along cables
function EnergyCables() {
  const particlesRef = useRef();
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Flowing from substation (-110, -60) to DSATM Main (-55, 45) and Mech (68, -40)
      const t = i / count;
      pos[i * 3] = -110 + t * 60;
      pos[i * 3 + 1] = 1.5 + Math.sin(t * Math.PI) * 2;
      pos[i * 3 + 2] = -60 + t * 90;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color="#38BDF8"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3D Campus Building Mesh
function Building({ building, isSelected, onClick }) {
  const { activeOverlay, explodedView, telemetry } = useCampusStore();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const bData = telemetry?.buildings?.[building.id] || { realKw: 25, ghostKw: 20, gapKw: 5, alert: 'normal' };
  const hasGhostAnomaly = bData.gapKw > 12;

  // Determine material color based on overlay
  const materialProps = useMemo(() => {
    if (activeOverlay === 'GHOST') {
      return { color: '#0284C7', emissive: '#0284C7', emissiveIntensity: 0.35, opacity: 0.85, transparent: true };
    }
    if (activeOverlay === 'GAP') {
      if (hasGhostAnomaly) {
        return { color: '#EF4444', emissive: '#EF4444', emissiveIntensity: hovered ? 1.2 : 0.8 };
      }
      return { color: '#10B981', emissive: '#10B981', emissiveIntensity: 0.2 };
    }
    if (activeOverlay === 'THERMAL') {
      const isWarm = bData.realKw > 30;
      return { color: isWarm ? '#F97316' : '#06B6D4', emissive: isWarm ? '#EA580C' : '#0891B2', emissiveIntensity: 0.4 };
    }
    if (activeOverlay === 'SOLAR') {
      if (building.solarCapacityKwp) {
        return { color: '#FBBF24', emissive: '#F59E0B', emissiveIntensity: 0.9 };
      }
      return { color: '#475569', emissive: '#000000', emissiveIntensity: 0 };
    }
    // Default REAL
    return {
      color: building.color || '#CBD5E1',
      emissive: hovered ? building.accentColor || '#3B82F6' : '#000000',
      emissiveIntensity: hovered ? 0.4 : 0
    };
  }, [activeOverlay, hasGhostAnomaly, hovered, building, bData]);

  // Exploded Floor Stacking
  const floors = building.floors || [];
  const floorHeight = building.dimensions.height / Math.max(1, building.floorsCount);

  return (
    <group
      position={[building.position.x, 0, building.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(building);
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* If exploded view is active, render separated floors vertically */}
      {explodedView ? (
        floors.map((floor, idx) => {
          const separationY = idx * (floorHeight + 6) + floorHeight / 2;
          return (
            <group key={idx} position={[0, separationY, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[building.dimensions.width, floorHeight * 0.9, building.dimensions.depth]} />
                <meshStandardMaterial {...materialProps} />
              </mesh>
              <Text
                position={[0, floorHeight * 0.8, building.dimensions.depth / 2 + 1]}
                fontSize={1.4}
                color="#FFFFFF"
                anchorX="center"
              >
                {floor.name}
              </Text>
            </group>
          );
        })
      ) : (
        // Standard Unified Block
        <mesh
          ref={meshRef}
          position={[0, building.dimensions.height / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[building.dimensions.width, building.dimensions.height, building.dimensions.depth]} />
          <meshStandardMaterial
            {...materialProps}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Rooftop Solar Array if configured */}
      {building.solarCapacityKwp && (
        <mesh position={[0, building.dimensions.height + (explodedView ? (floors.length * 6) : 0.2), 0]}>
          <boxGeometry args={[building.dimensions.width * 0.85, 0.3, building.dimensions.depth * 0.85]} />
          <meshStandardMaterial
            color="#1E3A8A"
            emissive="#3B82F6"
            emissiveIntensity={activeOverlay === 'SOLAR' ? 1.5 : 0.4}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Lift Cabin if building has lifts */}
      {building.lifts && building.lifts.length > 0 && !explodedView && (
        <LiftCabin
          x={building.dimensions.width / 4}
          z={0}
          minHeight={1}
          maxHeight={building.dimensions.height - 3}
          status="running"
        />
      )}

      {/* Floating Building HUD Label */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
        <group position={[0, building.dimensions.height + (explodedView ? (floors.length * 7) : 4), 0]}>
          <Text
            fontSize={2.2}
            color={hovered || isSelected ? '#38BDF8' : '#FFFFFF'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.2}
            outlineColor="#090D16"
          >
            {building.shortCode || building.name}
          </Text>
          <Text
            position={[0, -2, 0]}
            fontSize={1.4}
            color={hasGhostAnomaly ? '#F87171' : '#34D399'}
            anchorX="center"
            outlineWidth={0.15}
            outlineColor="#090D16"
          >
            {`${bData.realKw || 25} kW | Gap: ${bData.gapKw || 0} kW`}
          </Text>
        </group>
      </Float>
    </group>
  );
}

// Helpdesk Ticket 3D Pins
function Ticket3DPins() {
  const { activeOverlay } = useCampusStore();
  if (activeOverlay !== 'HELPDESK') return null;

  const samplePins = [
    { id: 'p1', pos: [-45, 8, 42], urgency: 'high', label: 'Lab 204 AC Waste' },
    { id: 'p2', pos: [72, 3, 25], urgency: 'high', label: 'Overflowing Bin' },
    { id: 'p3', pos: [0, 5, -48], urgency: 'emergency', label: 'Lift Sensor Jam' },
    { id: 'p4', pos: [-60, 4, 40], urgency: 'normal', label: 'Tap Leakage' }
  ];

  return (
    <group>
      {samplePins.map((pin) => {
        const color = pin.urgency === 'emergency' ? '#EF4444' : (pin.urgency === 'high' ? '#F59E0B' : '#3B82F6');
        return (
          <group key={pin.id} position={pin.pos}>
            <Float speed={3} floatIntensity={1.5}>
              <mesh position={[0, 2, 0]}>
                <octahedronGeometry args={[1.4]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} />
              </mesh>
              <Text position={[0, 4, 0]} fontSize={1.2} color="#FFFFFF" outlineWidth={0.1} outlineColor="#000">
                {pin.label}
              </Text>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

// Main 3D DSATM Campus Digital Twin Canvas
export default function CampusTwin3D({ onSelectBuilding }) {
  const { viewMode, setViewMode } = useCampusStore();
  const controlsRef = useRef();

  const buildings = campusConfig.campus.buildings;
  const roads = campusConfig.campus.roads;
  const streetLamps = roads[0]?.streetLamps || [];

  return (
    <div className="relative w-full h-full min-h-[550px] bg-[#070B12] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Overlay UI Controls Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode(viewMode === '3d' ? 'map' : '3d')}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 shadow"
        >
          {viewMode === '3d' ? '🗺️ Map View' : '🏢 3D Perspective'}
        </button>
      </div>

      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={viewMode === 'map' ? [0, 260, 0] : [0, 110, 180]}
          fov={42}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={viewMode === 'map' ? 0.05 : Math.PI / 2.1}
          minDistance={30}
          maxDistance={380}
        />

        {/* Ambient & Sun Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[70, 120, 60]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Sky sunPosition={[70, 90, 60]} turbidity={8} rayleigh={0.6} />

        {/* Ground Terrain */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
          <planeGeometry args={[340, 280]} />
          <meshStandardMaterial color="#0B132B" roughness={0.9} />
        </mesh>

        {/* Outer Perimeter Ring Road */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[115, 135, 32]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>

        {/* Central Cross Boulevard */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <planeGeometry args={[260, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* Basketball Court Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.1, 65]}>
          <planeGeometry args={[32, 22]} />
          <meshStandardMaterial color="#EA580C" roughness={0.5} />
        </mesh>

        {/* Rainwater Harvesting Pond in Green Belt */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[65, 0.1, -100]}>
          <circleGeometry args={[12, 24]} />
          <meshStandardMaterial color="#0284C7" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Trees in Green Belt */}
        <Tree position={[55, 0, -90]} />
        <Tree position={[75, 0, -95]} />
        <Tree position={[85, 0, -110]} />
        <Tree position={[60, 0, -115]} />
        <Tree position={[45, 0, -105]} />
        <Tree position={[-85, 0, 90]} />
        <Tree position={[-95, 0, 80]} />

        {/* Street Lamps */}
        {streetLamps.map((lamp) => (
          <StreetLamp key={lamp.id} lamp={lamp} />
        ))}

        {/* Energy Flowing Particles */}
        <EnergyCables />

        {/* 3D Buildings */}
        {buildings.map((b) => (
          <Building
            key={b.id}
            building={b}
            isSelected={false}
            onClick={(bObj) => {
              if (onSelectBuilding) onSelectBuilding(bObj);
            }}
          />
        ))}

        {/* Helpdesk Ticket 3D Pins */}
        <Ticket3DPins />
      </Canvas>
    </div>
  );
}
