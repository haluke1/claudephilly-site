"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    });

    // Velocity-based glow — bar brightens when scrolling fast
    let lastScroll = 0;
    let raf: number;
    const trackVelocity = () => {
      const current = window.scrollY;
      const velocity = Math.abs(current - lastScroll);
      lastScroll = current;

      if (glowRef.current) {
        const intensity = Math.min(velocity / 30, 1);
        glowRef.current.style.opacity = String(intensity);
      }

      raf = requestAnimationFrame(trackVelocity);
    };
    raf = requestAnimationFrame(trackVelocity);

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
      <div
        ref={barRef}
        className="h-full bg-accent origin-left relative"
        style={{ transform: "scaleX(0)" }}
      >
        {/* Velocity glow — brighter when scrolling fast */}
        <div
          ref={glowRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-4 bg-accent rounded-full blur-md opacity-0 transition-opacity duration-100"
        />
      </div>
    </div>
  );
}
