"use client";

import { useRef, useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ReactiveTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  stagger?: number;
  repelStrength?: number;
}

/**
 * Text that reveals word-by-word on scroll AND reacts to cursor proximity.
 * Words near the mouse get a subtle push/scale effect — they feel alive.
 */
export default function ReactiveText({
  text,
  className = "",
  as: Tag = "p",
  stagger = 0.07,
  repelStrength = 15,
}: ReactiveTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const words = text.split(" ");
  const mouse = useRef({ x: -1000, y: -1000 });

  // Scroll-triggered word reveal
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(wordsRef.current.filter(Boolean), {
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
      });
    });

    return () => ctx.revert();
  }, [stagger]);

  // Cursor proximity reaction
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    let raf: number;
    const animate = () => {
      wordsRef.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouse.current.x - cx;
        const dy = mouse.current.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * repelStrength;
          const angle = Math.atan2(dy, dx);
          // Push AWAY from cursor
          gsap.to(el, {
            x: -Math.cos(angle) * force,
            y: -Math.sin(angle) * force,
            scale: 1 + (1 - dist / maxDist) * 0.08,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          gsap.to(el, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
          });
        }
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(raf);
    };
  }, [repelStrength]);

  return (
    <Tag
      ref={containerRef as RefObject<never>}
      className={className}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => { wordsRef.current[i] = el; }}
          className="inline-block mr-[0.3em] will-change-transform"
          aria-hidden="true"
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
