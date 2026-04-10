"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  Color,
  Vector3,
  MathUtils,
} from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// --- Simplex-style noise (compact, no deps) ---
// Attempt to use a seeded pseudo-random permutation for 3D noise
const PERM = new Uint8Array(512);
const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];
(() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  // Deterministic shuffle (seed = 42)
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
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
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A + 1] + Z;
  const B = PERM[X + 1] + Y, BA = PERM[B] + Z, BB = PERM[B + 1] + Z;
  return MathUtils.lerp(
    MathUtils.lerp(
      MathUtils.lerp(dot3(GRAD3[PERM[AA] % 12], x, y, z), dot3(GRAD3[PERM[BA] % 12], x - 1, y, z), u),
      MathUtils.lerp(dot3(GRAD3[PERM[AB] % 12], x, y - 1, z), dot3(GRAD3[PERM[BB] % 12], x - 1, y - 1, z), u),
      v
    ),
    MathUtils.lerp(
      MathUtils.lerp(dot3(GRAD3[PERM[AA + 1] % 12], x, y, z - 1), dot3(GRAD3[PERM[BA + 1] % 12], x - 1, y, z - 1), u),
      MathUtils.lerp(dot3(GRAD3[PERM[AB + 1] % 12], x, y - 1, z - 1), dot3(GRAD3[PERM[BB + 1] % 12], x - 1, y - 1, z - 1), u),
      v
    ),
    w
  );
}

// Fractal Brownian Motion for richer patterns
function fbm(x: number, y: number, z: number, octaves = 4): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue;
}

// --- Constants ---
const GRID_SIZE = 32; // 32x32 = 1024 instances (good perf)
const TOTAL = GRID_SIZE * GRID_SIZE;
const SPACING = 0.35;
const BASE_HEIGHT = 0.05;
const MAX_HEIGHT = 2.5;

const colorDark = new Color("#1E293B");
const colorMid = new Color("#334155");
const colorGlow = new Color("#22C55E");
const colorBright = new Color("#4ADE80");

// --- The instanced grid ---
function EmergenceGrid({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Track mouse in normalized coords
  const onPointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  // Attach mouse listener
  useMemo(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("pointermove", onPointerMove);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pointermove", onPointerMove);
      }
    };
  }, [onPointerMove]);

  // Color array
  const colorArray = useMemo(() => new Float32Array(TOTAL * 3), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime() * 0.3;
    const mx = mouseRef.current.x * 0.5;
    const my = mouseRef.current.y * 0.5;

    // Scroll drives emergence: 0 = flat, 1 = full height
    const emergence = Math.min(scrollProgress * 3, 1); // reaches full height at 33% scroll
    const rotY = scrollProgress * Math.PI * 0.3; // slow rotation with scroll

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j;

        // Grid position (centered)
        const gx = (i - GRID_SIZE / 2) * SPACING;
        const gz = (j - GRID_SIZE / 2) * SPACING;

        // Distance from center for radial effects
        const distFromCenter = Math.sqrt(gx * gx + gz * gz);
        const maxDist = (GRID_SIZE / 2) * SPACING;
        const normalizedDist = distFromCenter / maxDist;

        // Noise-driven height with time evolution
        const noiseVal = fbm(
          gx * 0.4 + mx * 0.3,
          gz * 0.4 + my * 0.3,
          time + scrollProgress * 2
        );

        // Height: noise * emergence, with radial falloff so edges are shorter
        const radialFalloff = 1 - normalizedDist * normalizedDist * 0.6;
        const height = Math.max(
          BASE_HEIGHT,
          (noiseVal * 0.5 + 0.5) * MAX_HEIGHT * emergence * radialFalloff
        );

        // Position + scale
        dummy.position.set(gx, height / 2, gz);
        dummy.scale.set(SPACING * 0.85, height, SPACING * 0.85);
        dummy.rotation.set(0, rotY, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        // Color based on height — dark at base, green at peaks
        const heightNorm = (height - BASE_HEIGHT) / (MAX_HEIGHT - BASE_HEIGHT);
        const color = new Color();
        if (heightNorm < 0.3) {
          color.lerpColors(colorDark, colorMid, heightNorm / 0.3);
        } else if (heightNorm < 0.7) {
          color.lerpColors(colorMid, colorGlow, (heightNorm - 0.3) / 0.4);
        } else {
          color.lerpColors(colorGlow, colorBright, (heightNorm - 0.7) / 0.3);
        }

        colorArray[idx * 3] = color.r;
        colorArray[idx * 3 + 1] = color.g;
        colorArray[idx * 3 + 2] = color.b;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    meshRef.current.geometry.attributes.color && (meshRef.current.geometry.attributes.color.needsUpdate = true);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TOTAL]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </boxGeometry>
      <meshStandardMaterial
        vertexColors
        roughness={0.6}
        metalness={0.3}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

// --- Camera rig that responds to mouse ---
function CameraRig() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useMemo(() => {
    if (typeof window !== "undefined") {
      const handler = (e: MouseEvent) => {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("mousemove", handler);
      return () => window.removeEventListener("mousemove", handler);
    }
  }, []);

  useFrame(() => {
    // Subtle camera tilt based on mouse
    const targetX = 0 + mouseRef.current.x * 1.5;
    const targetZ = 0 + mouseRef.current.y * 1.5;
    camera.position.x = MathUtils.lerp(camera.position.x, targetX, 0.03);
    camera.position.z = MathUtils.lerp(camera.position.z, 8 + targetZ, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// --- Main exported scene ---
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
        {/* Green point light from below — illuminates peaks */}
        <pointLight position={[0, -2, 0]} intensity={2} color="#22C55E" distance={15} />
        <pointLight position={[3, -1, 3]} intensity={1} color="#22C55E" distance={10} />

        <EmergenceGrid scrollProgress={scrollProgress} />
        <CameraRig />

        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
