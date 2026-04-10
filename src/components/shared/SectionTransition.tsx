"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SectionTransitionProps {
  from: string;
  to: string;
}

/**
 * Invisible element placed between sections that morphs the body background color
 * as the user scrolls through it. Creates smooth color transitions between chapters.
 */
export default function SectionTransition({
  from,
  to,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
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
    });

    return () => ctx.revert();
  }, [from, to]);

  return <div ref={ref} className="h-0" aria-hidden="true" />;
}
