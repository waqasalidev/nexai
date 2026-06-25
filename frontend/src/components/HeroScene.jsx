import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const ref = useRef(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(2500 * 3);
    for (let i = 0; i < 2500; i++) {
      const r = 4 + Math.random() * 6;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(p) * Math.cos(t);
      arr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      arr[i * 3 + 2] = r * Math.cos(p);
    }
    return arr;
  }, []);

  useFrame((state, dt) => {
    if (ref.current) {
      // Tilt particle field slightly based on mouse
      const targetY = state.pointer.x * 0.25;
      const targetX = state.pointer.y * 0.25;
      ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.05 + dt * 0.04;
      ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05 + dt * 0.015;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#a78bfa"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function Orb() {
  const mat = useRef(null);
  const grp = useRef(null);

  useFrame((state) => {
    if (mat.current) mat.current.distort = 0.35 + Math.sin(state.clock.elapsedTime) * 0.08;
    if (grp.current) {
      // Smoothly float the orb group towards the cursor
      const targetX = state.pointer.x * 0.8;
      const targetY = state.pointer.y * 0.8;
      grp.current.position.x += (targetX - grp.current.position.x) * 0.05;
      grp.current.position.y += (targetY - grp.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={grp}>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
        <Sphere args={[1.4, 96, 96]}>
          <MeshDistortMaterial
            ref={mat}
            color="#7c3aed"
            emissive="#22d3ee"
            emissiveIntensity={0.35}
            distort={0.4}
            speed={2.2}
            roughness={0.1}
            metalness={0.85}
          />
        </Sphere>
        <Sphere args={[1.65, 64, 64]}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.05} wireframe />
        </Sphere>
      </Float>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#a78bfa" />
      <pointLight position={[-5, -3, -5]} intensity={1.5} color="#22d3ee" />
      <pointLight position={[0, -5, 3]} intensity={1} color="#ec4899" />
      <ParticleField />
      <Orb />
    </>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
