"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor dot that stretches in the direction of movement.
 * Spring physics for snap-back. Only on desktop (pointer: fine).
 */
export default function ElasticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const pos = { x: -100, y: -100 };
    const vel = { x: 0, y: 0 };
    let prevX = -100;
    let prevY = -100;

    const handleMouse = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    // Add cursor: none to body
    document.body.style.cursor = "none";
    // Also for interactive elements
    const style = document.createElement("style");
    style.textContent = "a, button, input, [role='button'] { cursor: none !important; }";
    document.head.appendChild(style);

    let raf: number;
    const animate = () => {
      if (!dotRef.current) {
        raf = requestAnimationFrame(animate);
        return;
      }

      // Velocity
      vel.x = pos.x - prevX;
      vel.y = pos.y - prevY;
      prevX = pos.x;
      prevY = pos.y;

      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
      const angle = Math.atan2(vel.y, vel.x) * (180 / Math.PI);

      // Stretch based on speed
      const stretch = Math.min(speed / 15, 2.5);
      const scaleX = 1 + stretch * 0.6;
      const scaleY = 1 - stretch * 0.15;

      dotRef.current.style.left = `${pos.x}px`;
      dotRef.current.style.top = `${pos.y}px`;
      dotRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      style.remove();
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed z-[10000] w-4 h-4 rounded-full bg-accent/80 mix-blend-difference"
      style={{
        left: -100,
        top: -100,
        transition: "width 0.15s, height 0.15s, background-color 0.15s",
      }}
      aria-hidden="true"
    />
  );
}
