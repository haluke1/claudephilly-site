"use client";

/**
 * CRT scanline overlay — subtle horizontal lines that give the hacker/terminal aesthetic.
 * Pure CSS, zero JS, zero perf cost (GPU composited, pointer-events: none).
 */
export default function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px)",
        mixBlendMode: "multiply",
      }}
      aria-hidden="true"
    />
  );
}
