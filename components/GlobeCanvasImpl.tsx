'use client';

import { Line, OrbitControls, useTexture } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type MutableRefObject, type ReactNode } from 'react';
import * as THREE from 'three';
import { geographicToCartesian, headingForLongitude } from '@/lib/geography';
import GlobeFallback from './GlobeFallback';

type Destination = 'london' | 'dubai' | 'singapore';
type City = Destination | 'new-york';
type Props = { story?: boolean; destination?: Destination; focusCity?: City; progress?: MutableRefObject<{ value: number }>; onDestinationSelect?: (destination: Destination) => void; onFocusCity?: (city: City) => void; onSceneReady?: () => void; onSceneFailure?: () => void; active?: boolean; motionAllowed?: boolean };

const locations: Record<Destination | 'new-york', { name: string; lat: number; lon: number }> = {
  'new-york': { name: 'New York', lat: 40.7128, lon: -74.006 },
  london: { name: 'London', lat: 51.5072, lon: -0.1276 },
  dubai: { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  singapore: { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
};

function point(lat: number, lon: number, radius = 1.42) {
  const p = geographicToCartesian({ lat, lon }, radius);
  return new THREE.Vector3(p.x, p.y, p.z);
}

class ElevatedArcCurve extends THREE.Curve<THREE.Vector3> {
  private readonly angle: number;
  private readonly sine: number;

  constructor(private readonly start: THREE.Vector3, private readonly end: THREE.Vector3, private readonly arcHeight = 0.28) {
    super();
    this.angle = start.angleTo(end);
    this.sine = Math.sin(this.angle);
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    if (Math.abs(this.sine) < 1e-6) {
      return target.copy(this.start).lerp(this.end, t).normalize().multiplyScalar(1.46 + Math.sin(Math.PI * t) * this.arcHeight);
    }
    target.copy(this.start).multiplyScalar(Math.sin((1 - t) * this.angle) / this.sine)
      .addScaledVector(this.end, Math.sin(t * this.angle) / this.sine)
      .normalize()
      .multiplyScalar(1.46 + Math.sin(Math.PI * t) * this.arcHeight);
    return target;
  }
}

function WebGLContextGuard({ onFailure }: { onFailure?: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onFailure?.();
    };
    canvas.addEventListener('webglcontextlost', handleContextLoss, { once: true });
    return () => canvas.removeEventListener('webglcontextlost', handleContextLoss);
  }, [gl, onFailure]);
  return null;
}

function geoLines() {
  const lines: THREE.Vector3[][] = [];
  for (const latitude of [-60, -30, 0, 30, 60]) {
    lines.push(Array.from({ length: 129 }, (_, i) => point(latitude, -180 + (i / 128) * 360, 1.433)));
  }
  for (const longitude of [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]) {
    lines.push(Array.from({ length: 65 }, (_, i) => point(-90 + (i / 64) * 180, longitude, 1.433)));
  }
  return lines;
}

function makeCityLabel(name: string, accent: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 288;
  canvas.height = 72;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(13, 25, 32, 0.94)';
    context.strokeStyle = accent;
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(3, 3, 282, 66, 18);
    context.fill();
    context.stroke();
    context.fillStyle = '#f5f2e9';
    context.font = '600 30px Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, 144, 37, 260);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Globe({ story, destination, focusCity, progress, onDestinationSelect, onFocusCity, onSceneReady, onSceneFailure, motionAllowed = true }: Props) {
  const globe = useRef<THREE.Group>(null);
  const traveler = useRef<THREE.Group>(null);
  const shieldRings = useRef<THREE.Group>(null);
  const grid = useMemo(geoLines, []);
  const routeForward = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const routeNormal = useMemo(() => new THREE.Vector3(), []);
  const { gl } = useThree();
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const earthMap = useTexture('/textures/earth-blue-marble.jpg');
  const cityLabels = useMemo(() => Object.fromEntries(Object.entries(locations).map(([key, city]) => [key, makeCityLabel(city.name, '#e8cb8b')])) as Record<keyof typeof locations, THREE.CanvasTexture>, []);
  useEffect(() => () => Object.values(cityLabels).forEach((texture) => texture.dispose()), [cityLabels]);
  const destinationHeading = headingForLongitude(locations[focusCity ?? destination ?? 'london'].lon);
  const destinationHeadingRef = useRef(destinationHeading);
  destinationHeadingRef.current = destinationHeading;
  useEffect(() => {
    earthMap.colorSpace = THREE.SRGBColorSpace;
    earthMap.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    earthMap.needsUpdate = true;
  }, [earthMap, gl]);
  const route = useMemo(() => {
    const from = point(locations['new-york'].lat, locations['new-york'].lon).normalize();
    const toLoc = locations[destination ?? 'london'];
    const to = point(toLoc.lat, toLoc.lon).normalize();
    const curve = new ElevatedArcCurve(from, to);
    curve.arcLengthDivisions = 192;
    const geometry = new THREE.TubeGeometry(curve, 192, 0.008, 8, false);
    return { curve, geometry };
  }, [destination]);
  useEffect(() => () => route.geometry.dispose(), [route]);

  useFrame((state, delta) => {
    const heading = destinationHeadingRef.current;
    const t = progress?.current.value ?? 0;
    if (story) {
      if (!globe.current) return;
      globe.current.rotation.y += (heading + t * Math.PI * 0.72 - globe.current.rotation.y) * Math.min(1, delta * 2.4);
      globe.current.rotation.x = 0.06 + Math.sin(t * Math.PI) * 0.1;
      const scale = 1 + Math.sin(t * Math.PI) * 0.035;
      globe.current.scale.setScalar(scale);
      const reveal = motionAllowed ? Math.min(1, Math.max(0, (t - 0.06) / 0.34)) : 1;
      if (traveler.current) traveler.current.visible = reveal > 0.01;
    } else {
      if (!globe.current) return;
      if (motionAllowed) globe.current.rotation.y += (heading + state.clock.elapsedTime * 0.035 - globe.current.rotation.y) * Math.min(1, delta * 1.8);
      globe.current.rotation.x += (state.pointer.y * 0.11 - globe.current.rotation.x) * Math.min(1, delta * 1.3);
    }
    if (shieldRings.current && motionAllowed) {
      shieldRings.current.rotation.y += delta * 0.11;
      shieldRings.current.rotation.x += delta * 0.025;
      shieldRings.current.rotation.z += delta * 0.018;
    }
    if (traveler.current) {
      const routePosition = story
        ? motionAllowed ? Math.min(1, Math.max(0, (t - 0.06) / 0.34)) : 1
        : motionAllowed ? (state.clock.elapsedTime * 0.045) % 1 : 1;
      const routeReveal = story
        ? motionAllowed ? Math.min(1, Math.max(0, (t - 0.06) / 0.34)) : 1
        : motionAllowed ? Math.min(1, state.clock.elapsedTime / 2.6) : 1;
      route.geometry.setDrawRange(0, Math.floor(route.geometry.index!.count * routeReveal));
      traveler.current.position.copy(route.curve.getPointAt(routePosition));
      routeNormal.copy(traveler.current.position).normalize();
      traveler.current.quaternion.setFromUnitVectors(routeForward, routeNormal);
      if (motionAllowed) traveler.current.rotateZ(delta * 2.2);
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.2) * 0.08;
      traveler.current.scale.setScalar(pulse);
    }
  });

  return <>
    <ambientLight intensity={0.38} color="#c6d8df" />
    <hemisphereLight intensity={0.34} color="#e6f4f1" groundColor="#111923" />
    <WebGLContextGuard onFailure={onSceneFailure} />
    <directionalLight position={[-3.4, 3.4, 4]} intensity={2.4} color="#f7dfb4" />
    <pointLight position={[2.8, -1.8, 2.2]} intensity={8} color="#9bacc3" distance={9} />
    <group ref={globe} rotation-y={destinationHeading}>
      <group ref={shieldRings}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.007, 8, 180]} />
          <meshBasicMaterial color="#c9a45c" transparent opacity={0.29} depthWrite={false} />
        </mesh>
        <mesh rotation={[0.22, Math.PI / 2, 0.48]}>
          <torusGeometry args={[1.515, 0.006, 8, 180]} />
          <meshBasicMaterial color="#e8cb8b" transparent opacity={0.23} depthWrite={false} />
        </mesh>
        <mesh rotation={[0.8, 0.35, -0.2]}>
          <torusGeometry args={[1.53, 0.005, 8, 180]} />
          <meshBasicMaterial color="#c9a45c" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      </group>
      <mesh>
        <sphereGeometry args={[1.42, 128, 96]} />
        <meshPhysicalMaterial map={earthMap} roughness={0.86} metalness={0.025} clearcoat={0.08} clearcoatRoughness={0.72} emissive="#0a1720" emissiveIntensity={0.08} />
      </mesh>
      <mesh geometry={route.geometry} renderOrder={3}><meshBasicMaterial color="#c9a45c" toneMapped={false} transparent opacity={0.96} depthTest depthWrite={false} /></mesh>
      <mesh scale={1.03}>
        <sphereGeometry args={[1.42, 48, 36]} />
        <meshBasicMaterial color="#9bacc3" transparent opacity={0.065} side={THREE.BackSide} />
      </mesh>
      {grid.map((points, i) => <Line key={`grid-${i}`} points={points} color={i < 5 ? '#e8cb8b' : '#a9b8cd'} transparent opacity={i < 5 ? 0.1 : 0.065} lineWidth={0.65} />)}
      <group ref={traveler} position={route.curve.getPointAt(0)}>
        <mesh>
          <torusGeometry args={[0.072, 0.014, 12, 40]} />
          <meshBasicMaterial color="#c9a45c" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.036, 20, 16]} />
          <meshBasicMaterial color="#fff0e8" toneMapped={false} />
        </mesh>
        <mesh scale={2.35}>
          <sphereGeometry args={[0.036, 18, 14]} />
          <meshBasicMaterial color="#c9a45c" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
      {Object.entries(locations).map(([key, city]) => {
        const active = key === (destination ?? 'london');
        const p = point(city.lat, city.lon, 1.468);
        return <group key={key} position={p}>
          <mesh castShadow onPointerOver={(event) => { event.stopPropagation(); setHoveredCity(key); gl.domElement.style.cursor = 'pointer'; }} onPointerOut={() => { setHoveredCity(null); gl.domElement.style.cursor = 'grab'; }} onClick={(event) => { event.stopPropagation(); onFocusCity?.(key as City); if (key !== 'new-york' && onDestinationSelect) onDestinationSelect(key as Destination); }}>
          <sphereGeometry args={[active || hoveredCity === key ? 0.09 : 0.046, 20, 16]} />
            <meshStandardMaterial color={active ? '#e8cb8b' : '#d2d2d2'} emissive={active ? '#c9a45c' : '#666666'} emissiveIntensity={active ? 1.45 : 0.35} roughness={0.26} metalness={0.35} />
          </mesh>
          {(active || hoveredCity === key) && <mesh scale={1.75}><sphereGeometry args={[0.09, 18, 14]} /><meshBasicMaterial color={active ? '#c9a45c' : '#d5d5d5'} transparent opacity={0.24} depthWrite={false} /></mesh>}
          <sprite position={[0, 0.15, 0]} scale={[0.62, 0.155, 1]} visible={key === 'new-york' || active || hoveredCity === key} renderOrder={5}>
            <spriteMaterial map={cityLabels[key as keyof typeof locations]} transparent depthTest />
          </sprite>
        </group>;
      })}
    </group>
    <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.07} rotateSpeed={0.42} minPolarAngle={Math.PI * 0.25} maxPolarAngle={Math.PI * 0.75} autoRotate={!story && motionAllowed} autoRotateSpeed={0.24} />
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFailure?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.error('Globe scene failed:', error); this.props.onFailure?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function GlobeCanvasImpl({ active = true, motionAllowed = true, ...props }: Props) {
  const fallback = <GlobeFallback destination={props.destination ?? 'london'} label="Travel coordination route preview." />;
  return <SceneBoundary fallback={fallback} onFailure={props.onSceneFailure}>
    <Canvas fallback={fallback} frameloop={!active ? 'never' : motionAllowed ? 'always' : 'demand'} dpr={[1, 1.2]} camera={{ position: [0, 0, 4.9], fov: 39 }} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.08; requestAnimationFrame(() => requestAnimationFrame(() => props.onSceneReady?.())); }}>
      <Globe {...props} motionAllowed={motionAllowed} />
    </Canvas>
  </SceneBoundary>;
}
