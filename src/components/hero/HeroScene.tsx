"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  Color,
  MathUtils,
} from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// ──────────────────────────────────────────────
// Perlin noise (compact, zero deps)
// ──────────────────────────────────────────────
const PERM = new Uint8Array(512);
const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];
(() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();

function dot3(g: number[], x: number, y: number, z: number) {
  return g[0] * x + g[1] * y + g[2] * z;
}
function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function noise3D(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A + 1] + Z;
  const B = PERM[X + 1] + Y, BA = PERM[B] + Z, BB = PERM[B + 1] + Z;
  return MathUtils.lerp(
    MathUtils.lerp(
      MathUtils.lerp(dot3(GRAD3[PERM[AA] % 12], x, y, z), dot3(GRAD3[PERM[BA] % 12], x - 1, y, z), u),
      MathUtils.lerp(dot3(GRAD3[PERM[AB] % 12], x, y - 1, z), dot3(GRAD3[PERM[BB] % 12], x - 1, y - 1, z), u), v),
    MathUtils.lerp(
      MathUtils.lerp(dot3(GRAD3[PERM[AA + 1] % 12], x, y, z - 1), dot3(GRAD3[PERM[BA + 1] % 12], x - 1, y, z - 1), u),
      MathUtils.lerp(dot3(GRAD3[PERM[AB + 1] % 12], x, y - 1, z - 1), dot3(GRAD3[PERM[BB + 1] % 12], x - 1, y - 1, z - 1), u), v), w);
}

function fbm(x: number, y: number, z: number, octaves = 4): number {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue;
}

// ──────────────────────────────────────────────
// Philadelphia skyline heightmap
// Each building is a Gaussian bump at a grid position
// Relative heights based on real Philly skyline
// ──────────────────────────────────────────────
interface Building {
  x: number;   // grid-normalized position (-1 to 1)
  z: number;
  height: number; // relative height (0-1)
  radius: number; // footprint size
}

const PHILLY_BUILDINGS: Building[] = [
  // ── Center City cluster ──
  { x: 0.05, z: 0.0, height: 1.0, radius: 0.08 },    // Comcast Technology Center (tallest)
  { x: -0.02, z: 0.05, height: 0.87, radius: 0.07 },  // Comcast Center
  { x: 0.12, z: -0.05, height: 0.84, radius: 0.06 },  // One Liberty Place
  { x: 0.15, z: 0.02, height: 0.75, radius: 0.06 },   // Two Liberty Place
  { x: -0.1, z: -0.08, height: 0.7, radius: 0.06 },   // BNY Mellon Center
  { x: -0.15, z: 0.1, height: 0.68, radius: 0.06 },   // FMC Tower
  { x: 0.08, z: 0.12, height: 0.65, radius: 0.05 },   // Three Logan Square

  // ── City Hall (shorter but WIDE footprint) ──
  { x: -0.05, z: -0.15, height: 0.5, radius: 0.12 },  // City Hall base
  { x: -0.05, z: -0.15, height: 0.65, radius: 0.04 }, // City Hall tower

  // ── Secondary buildings ──
  { x: 0.25, z: 0.08, height: 0.55, radius: 0.05 },
  { x: -0.22, z: -0.02, height: 0.5, radius: 0.05 },
  { x: 0.18, z: -0.15, height: 0.45, radius: 0.05 },
  { x: -0.18, z: 0.18, height: 0.4, radius: 0.04 },
  { x: 0.0, z: 0.22, height: 0.35, radius: 0.05 },
  { x: 0.28, z: -0.1, height: 0.38, radius: 0.04 },

  // ── Outer ring (shorter) ──
  { x: 0.35, z: 0.0, height: 0.25, radius: 0.06 },
  { x: -0.3, z: 0.15, height: 0.22, radius: 0.05 },
  { x: 0.0, z: -0.3, height: 0.2, radius: 0.06 },
  { x: -0.32, z: -0.2, height: 0.18, radius: 0.05 },
  { x: 0.3, z: 0.2, height: 0.2, radius: 0.05 },
];

function skylineHeight(nx: number, nz: number): number {
  let h = 0;
  for (const b of PHILLY_BUILDINGS) {
    const dx = nx - b.x;
    const dz = nz - b.z;
    const dist2 = (dx * dx + dz * dz) / (b.radius * b.radius);
    // Gaussian bump, squared for sharper building edges
    h = Math.max(h, b.height * Math.exp(-dist2 * 2));
  }
  return h;
}

// ──────────────────────────────────────────────
// Constants — bigger grid for higher resolution
// ──────────────────────────────────────────────
const GRID = 48;
const TOTAL = GRID * GRID;
const GAP = 0.28;
const MIN_H = 0.04;
const MAX_H = 3.5;

const _c = new Color();
const C_DARK = new Color("#1E293B");
const C_MID = new Color("#334155");
const C_GLOW = new Color("#D97757");
const C_BRIGHT = new Color("#E8956F");
const C_PEAK = new Color("#F0B090");

// ──────────────────────────────────────────────
// Skyline grid: noise + skyline heightmap blend
// ──────────────────────────────────────────────
function SkylineGrid({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const mouse = useRef({ x: 0, y: 0 });
  const colorArray = useMemo(() => new Float32Array(TOTAL * 3), []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const handler = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime() * 0.2;
    const mx = mouse.current.x * 0.3;
    const my = mouse.current.y * 0.3;
    const halfGrid = GRID / 2;
    const gridExtent = halfGrid * GAP;

    // Emergence: grid rises overall
    const emergence = Math.min(scrollProgress * 2.5, 1);
    // Skyline blend: noise → skyline shape
    const skylineBlend = MathUtils.clamp((scrollProgress - 0.2) * 3, 0, 1);
    // Slow rotation
    const rotY = scrollProgress * Math.PI * 0.15;

    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const idx = i * GRID + j;
        const gx = (i - halfGrid) * GAP;
        const gz = (j - halfGrid) * GAP;

        // Normalized position (-1 to 1) for skyline lookup
        const nx = gx / gridExtent;
        const nz = gz / gridExtent;

        // Pure noise height
        const noiseH = (fbm(gx * 0.35 + mx * 0.2, gz * 0.35 + my * 0.2, time) * 0.5 + 0.5);

        // Skyline height
        const skyH = skylineHeight(nx, nz);

        // Blend: starts as pure noise, morphs into skyline
        const blended = MathUtils.lerp(noiseH * 0.4, skyH, skylineBlend);

        // Radial falloff (softer than before for larger grid)
        const dist = Math.sqrt(nx * nx + nz * nz);
        const falloff = MathUtils.smoothstep(1.2 - dist, 0, 0.4);

        const h = Math.max(MIN_H, blended * MAX_H * emergence * falloff);

        dummy.position.set(gx, h / 2, gz);
        dummy.scale.set(GAP * 0.88, h, GAP * 0.88);
        dummy.rotation.set(0, rotY, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        // Color ramp: dark → mid → accent → bright → peak
        const hn = MathUtils.clamp((h - MIN_H) / (MAX_H - MIN_H), 0, 1);
        if (hn < 0.2) {
          _c.lerpColors(C_DARK, C_MID, hn / 0.2);
        } else if (hn < 0.5) {
          _c.lerpColors(C_MID, C_GLOW, (hn - 0.2) / 0.3);
        } else if (hn < 0.8) {
          _c.lerpColors(C_GLOW, C_BRIGHT, (hn - 0.5) / 0.3);
        } else {
          _c.lerpColors(C_BRIGHT, C_PEAK, (hn - 0.8) / 0.2);
        }
        colorArray[idx * 3] = _c.r;
        colorArray[idx * 3 + 1] = _c.g;
        colorArray[idx * 3 + 2] = _c.b;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    const colorAttr = meshRef.current.geometry.attributes.color;
    if (colorAttr) colorAttr.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </boxGeometry>
      <meshStandardMaterial vertexColors roughness={0.5} metalness={0.35} toneMapped={false} />
    </instancedMesh>
  );
}

// ──────────────────────────────────────────────
// Camera: cinematic orbit with mouse influence
// ──────────────────────────────────────────────
function SkylineCamera({ scrollProgress }: { scrollProgress: number }) {
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
    const angle = time * 0.05 + mouse.current.x * 0.2;

    // Camera pulls back slightly as skyline forms
    const radius = 9 + scrollProgress * 2;
    const height = 7 + mouse.current.y * 1.5;

    camera.position.x = MathUtils.lerp(camera.position.x, Math.sin(angle) * radius, 0.02);
    camera.position.z = MathUtils.lerp(camera.position.z, Math.cos(angle) * radius, 0.02);
    camera.position.y = MathUtils.lerp(camera.position.y, height, 0.02);
    camera.lookAt(0, 1, 0);
  });

  return null;
}

// ──────────────────────────────────────────────
// Main scene
// ──────────────────────────────────────────────
export default function HeroScene({ scrollProgress = 0 }: { scrollProgress: number }) {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 7, 9], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[8, 12, 6]} intensity={0.35} color="#94A3B8" />
        <pointLight position={[0, -2, 0]} intensity={2.5} color="#D97757" distance={20} />
        <pointLight position={[4, -1, 4]} intensity={1} color="#D97757" distance={12} />
        <pointLight position={[-3, 5, -2]} intensity={0.6} color="#E8956F" distance={15} />

        <SkylineGrid scrollProgress={scrollProgress} />
        <SkylineCamera scrollProgress={scrollProgress} />

        <EffectComposer>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
