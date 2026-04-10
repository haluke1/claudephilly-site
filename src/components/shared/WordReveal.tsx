"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface WordRevealProps {
  text: string;
  className?: string;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function WordReveal({
  text,
  className = "",
  stagger = 0.06,
  as: Tag = "p",
}: WordRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const words = text.split(" ");

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(
        wordsRef.current.filter(Boolean),
        {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [stagger]);

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => { wordsRef.current[i] = el; }}
          className="inline-block mr-[0.3em]"
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
