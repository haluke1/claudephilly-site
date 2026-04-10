"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SectionTransitionProps {
  from: string;
  to: string;
}

/**
 * Transition between sections. Does two things:
 * 1. Morphs body background color (smooth gradient between sections)
 * 2. Adds a diamond clip-path reveal line — a thin accent border that expands
 */
export default function SectionTransition({
  from,
  to,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      // Background color morph
      gsap.fromTo(
        document.body,
        { backgroundColor: from },
        {
          backgroundColor: to,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
          },
        }
      );

      // Expanding line — starts as a point, expands to full width
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0, opacity: 0.8 },
          {
            scaleX: 1,
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 70%",
              end: "top 30%",
              scrub: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [from, to]);

  return (
    <div ref={ref} className="relative h-8 overflow-hidden" aria-hidden="true">
      <div
        ref={lineRef}
        className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent origin-center"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
