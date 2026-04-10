"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  Group,
  Vector3,
  MathUtils,
  Color,
  Points,
  PointsMaterial,
} from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// ──────────────────────────────────────────────
// City Hall geometry — each piece is a box with position + size
// Proportions based on the real building's distinctive silhouette:
// massive square base, courtyard, corner pavilions, and the
// iconic tower crowned by William Penn
// ──────────────────────────────────────────────
interface Piece {
  pos: [number, number, number];
  size: [number, number, number];
  delay: number; // stagger order for assembly
}

const PIECES: Piece[] = [
  // ── BASE WALLS (courtyard is hollow) ──
  { pos: [0, 1.2, -2.4], size: [5.6, 2.4, 0.6], delay: 0 },      // north
  { pos: [0, 1.2, 2.4], size: [5.6, 2.4, 0.6], delay: 0.05 },    // south
  { pos: [-2.7, 1.2, 0], size: [0.6, 2.4, 5.4], delay: 0.1 },    // west
  { pos: [2.7, 1.2, 0], size: [0.6, 2.4, 5.4], delay: 0.15 },    // east

  // ── CORNER PAVILIONS (taller than base walls) ──
  { pos: [-2.7, 1.8, -2.4], size: [1.0, 3.6, 1.0], delay: 0.2 },
  { pos: [2.7, 1.8, -2.4], size: [1.0, 3.6, 1.0], delay: 0.25 },
  { pos: [-2.7, 1.8, 2.4], size: [1.0, 3.6, 1.0], delay: 0.3 },
  { pos: [2.7, 1.8, 2.4], size: [1.0, 3.6, 1.0], delay: 0.35 },

  // ── ROOF / MANSARD (Second Empire style) ──
  { pos: [0, 3.2, -2.4], size: [5.0, 0.6, 0.4], delay: 0.4 },
  { pos: [0, 3.2, 2.4], size: [5.0, 0.6, 0.4], delay: 0.42 },
  { pos: [-2.7, 3.2, 0], size: [0.4, 0.6, 4.8], delay: 0.44 },
  { pos: [2.7, 3.2, 0], size: [0.4, 0.6, 4.8], delay: 0.46 },

  // ── TOWER — BASE ──
  { pos: [0, 4.5, 0], size: [2.0, 3.0, 2.0], delay: 0.5 },
  // ── TOWER — MIDDLE ──
  { pos: [0, 7.0, 0], size: [1.6, 2.4, 1.6], delay: 0.58 },
  // ── TOWER — CLOCK SECTION (distinctive wider band) ──
  { pos: [0, 8.8, 0], size: [1.8, 1.2, 1.8], delay: 0.65 },
  // ── TOWER — UPPER COLONNADE ──
  { pos: [0, 10.2, 0], size: [1.3, 1.6, 1.3], delay: 0.72 },
  // ── TOWER — DOME / CAP ──
  { pos: [0, 11.6, 0], size: [1.0, 0.8, 1.0], delay: 0.78 },
  // ── TOWER — FINIAL ──
  { pos: [0, 12.4, 0], size: [0.5, 0.6, 0.5], delay: 0.84 },

  // ── WILLIAM PENN STATUE ──
  { pos: [0, 13.0, 0], size: [0.2, 0.4, 0.2], delay: 0.9 },  // pedestal
  { pos: [0, 13.6, 0], size: [0.15, 0.8, 0.15], delay: 0.95 }, // figure
  { pos: [0, 14.2, 0], size: [0.3, 0.15, 0.08], delay: 1.0 },  // hat brim
];

const ACCENT = new Color("#D97757");
const ACCENT_BRIGHT = new Color("#E8956F");
const WIRE_DIM = new Color("#334155");

// ──────────────────────────────────────────────
// Single wireframe piece with assembly animation
// ──────────────────────────────────────────────
function WirePiece({
  pos,
  size,
  delay,
  assemblyProgress,
}: Piece & { assemblyProgress: number }) {
  const groupRef = useRef<Group>(null!);
  const matRef = useRef<LineBasicMaterial>(null!);

  // Scattered origin — each piece comes from a different direction
  const scattered = useMemo(() => {
    const angle = delay * Math.PI * 6;
    const radius = 8 + delay * 12;
    return new Vector3(
      Math.cos(angle) * radius,
      5 + Math.sin(angle * 1.7) * 10,
      Math.sin(angle) * radius
    );
  }, [delay]);

  const target = useMemo(() => new Vector3(...pos), [pos]);

  // Pre-build the edge geometry (no per-frame allocation)
  const edgesGeo = useMemo(() => {
    const box = new BoxGeometry(...size, 1, 1, 1);
    return new EdgesGeometry(box);
  }, [size]);

  useFrame(() => {
    if (!groupRef.current || !matRef.current) return;

    // Each piece locks in at its delay point within the assembly timeline
    const pieceProgress = MathUtils.clamp(
      (assemblyProgress - delay * 0.6) / 0.35,
      0,
      1
    );

    // Smooth easing
    const t = pieceProgress < 0.5
      ? 4 * pieceProgress * pieceProgress * pieceProgress
      : 1 - Math.pow(-2 * pieceProgress + 2, 3) / 2;

    // Position: scattered → target
    groupRef.current.position.lerpVectors(scattered, target, t);

    // Rotation: spinning → settled
    groupRef.current.rotation.x = (1 - t) * delay * 8;
    groupRef.current.rotation.y = (1 - t) * delay * 6;
    groupRef.current.rotation.z = (1 - t) * delay * 4;

    // Scale pulse when locking in
    const lockPulse = t > 0.9 ? 1 + (1 - (t - 0.9) / 0.1) * 0.15 : 1;
    groupRef.current.scale.setScalar(lockPulse);

    // Color: dim → glow → accent as piece locks in
    if (t < 0.5) {
      matRef.current.color.copy(WIRE_DIM);
    } else if (t < 0.95) {
      matRef.current.color.lerpColors(WIRE_DIM, ACCENT_BRIGHT, (t - 0.5) / 0.45);
    } else {
      matRef.current.color.lerpColors(ACCENT_BRIGHT, ACCENT, (t - 0.95) / 0.05);
    }

    matRef.current.opacity = 0.3 + t * 0.7;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial
          ref={matRef}
          color={WIRE_DIM}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

// ──────────────────────────────────────────────
// Particle dust that follows the assembly
// ──────────────────────────────────────────────
function ConstructionParticles({ assemblyProgress }: { assemblyProgress: number }) {
  const pointsRef = useRef<Points>(null!);
  const COUNT = 200;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;

    for (let i = 0; i < COUNT; i++) {
      // Particles converge toward center as assembly progresses
      const idx = i * 3;
      const speed = 0.3 + (i / COUNT) * 0.7;
      const convergence = assemblyProgress * 0.8;

      posAttr.array[idx] += (Math.sin(time * speed + i) * 0.02) * (1 - convergence);
      posAttr.array[idx + 1] += (Math.cos(time * speed * 0.7 + i * 0.5) * 0.015);
      posAttr.array[idx + 2] += (Math.sin(time * speed * 1.3 + i * 0.3) * 0.02) * (1 - convergence);

      // Slowly pull toward center
      posAttr.array[idx] *= 1 - convergence * 0.003;
      posAttr.array[idx + 2] *= 1 - convergence * 0.003;
    }
    posAttr.needsUpdate = true;

    // Fade out as assembly completes
    const mat = pointsRef.current.material as PointsMaterial;
    mat.opacity = (1 - assemblyProgress) * 0.6;
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
        color="#D97757"
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ──────────────────────────────────────────────
// Camera with dramatic angle + mouse tilt
// ──────────────────────────────────────────────
function DramaticCamera({ assemblyProgress }: { assemblyProgress: number }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Camera orbits slowly + mouse influence
    const baseAngle = time * 0.08;
    const mouseInfluence = mouse.current.x * 0.3;
    const angle = baseAngle + mouseInfluence;

    const radius = 14 - assemblyProgress * 2; // zoom in as building assembles
    const height = 8 + mouse.current.y * 2 - assemblyProgress * 1; // lower as it assembles

    camera.position.x = MathUtils.lerp(
      camera.position.x,
      Math.sin(angle) * radius,
      0.02
    );
    camera.position.z = MathUtils.lerp(
      camera.position.z,
      Math.cos(angle) * radius,
      0.02
    );
    camera.position.y = MathUtils.lerp(camera.position.y, height, 0.02);

    // Look at the tower top area
    camera.lookAt(0, 6, 0);
  });

  return null;
}

// ──────────────────────────────────────────────
// Ground grid — subtle reference plane
// ──────────────────────────────────────────────
function GroundGrid() {
  return (
    <gridHelper
      args={[30, 60, "#1E293B", "#1E293B"]}
      position={[0, -0.01, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// ──────────────────────────────────────────────
// Main assembly scene
// ──────────────────────────────────────────────
function AssemblyScene({ progress }: { progress: number }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 15, 8]} intensity={0.3} color="#94A3B8" />
      <pointLight position={[0, 20, 0]} intensity={1.5} color="#D97757" distance={30} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#D97757" distance={15} />
      <pointLight position={[-5, 8, -3]} intensity={0.4} color="#E8956F" distance={15} />

      {/* Ground reference */}
      <GroundGrid />

      {/* Construction particles */}
      <ConstructionParticles assemblyProgress={progress} />

      {/* City Hall wireframe pieces */}
      {PIECES.map((piece, i) => (
        <WirePiece key={i} {...piece} assemblyProgress={progress} />
      ))}

      <DramaticCamera assemblyProgress={progress} />

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

// ──────────────────────────────────────────────
// Exported component
// ──────────────────────────────────────────────
export default function CityHallScene({ progress = 0 }: { progress: number }) {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 8, 14], fov: 40, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <AssemblyScene progress={progress} />
      </Canvas>
    </div>
  );
}
