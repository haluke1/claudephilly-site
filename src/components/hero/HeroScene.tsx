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

// --- Perlin-style 3D noise (compact, zero deps) ---
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

// --- Constants ---
const GRID = 32;
const TOTAL = GRID * GRID;
const GAP = 0.35;
const MIN_H = 0.05;
const MAX_H = 2.5;

// Pre-allocated colors for lerping (avoids GC pressure)
const _c = new Color();
const C_DARK = new Color("#1E293B");
const C_MID = new Color("#334155");
const C_GLOW = new Color("#D97757");
const C_BRIGHT = new Color("#E8956F");

// --- The instanced grid ---
function EmergenceGrid({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const mouse = useRef({ x: 0, y: 0 });
  const colorArray = useMemo(() => new Float32Array(TOTAL * 3), []);

  // Mouse tracking via useEffect (proper cleanup)
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

    const time = clock.getElapsedTime() * 0.3;
    const mx = mouse.current.x * 0.5;
    const my = mouse.current.y * 0.5;
    const emergence = Math.min(scrollProgress * 3, 1);
    const rotY = scrollProgress * Math.PI * 0.3;
    const halfGrid = GRID / 2;
    const maxDist = halfGrid * GAP;

    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const idx = i * GRID + j;
        const gx = (i - halfGrid) * GAP;
        const gz = (j - halfGrid) * GAP;

        const dist = Math.sqrt(gx * gx + gz * gz) / maxDist;
        const noiseVal = fbm(gx * 0.4 + mx * 0.3, gz * 0.4 + my * 0.3, time + scrollProgress * 2);
        const falloff = 1 - dist * dist * 0.6;
        const h = Math.max(MIN_H, (noiseVal * 0.5 + 0.5) * MAX_H * emergence * falloff);

        dummy.position.set(gx, h / 2, gz);
        dummy.scale.set(GAP * 0.85, h, GAP * 0.85);
        dummy.rotation.set(0, rotY, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        // Color: dark → mid → green → bright based on height
        const hn = (h - MIN_H) / (MAX_H - MIN_H);
        if (hn < 0.3) {
          _c.lerpColors(C_DARK, C_MID, hn / 0.3);
        } else if (hn < 0.7) {
          _c.lerpColors(C_MID, C_GLOW, (hn - 0.3) / 0.4);
        } else {
          _c.lerpColors(C_GLOW, C_BRIGHT, (hn - 0.7) / 0.3);
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
      <meshStandardMaterial vertexColors roughness={0.6} metalness={0.3} toneMapped={false} />
    </instancedMesh>
  );
}

// --- Camera rig: subtle mouse-follow ---
function CameraRig() {
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

  useFrame(() => {
    camera.position.x = MathUtils.lerp(camera.position.x, mouse.current.x * 1.5, 0.03);
    camera.position.z = MathUtils.lerp(camera.position.z, 8 + mouse.current.y * 1.5, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// --- Main scene ---
export default function HeroScene({ scrollProgress = 0 }: { scrollProgress: number }) {
  return (
    <div className="absolute inset-0" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 8, 8], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={0.4} color="#94A3B8" />
        <pointLight position={[0, -2, 0]} intensity={2} color="#D97757" distance={15} />
        <pointLight position={[3, -1, 3]} intensity={1} color="#D97757" distance={10} />

        <EmergenceGrid scrollProgress={scrollProgress} />
        <CameraRig />

        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
