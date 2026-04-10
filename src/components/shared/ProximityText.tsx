"use client";

import { useRef, useEffect, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ProximityTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  blurRadius?: number;
  proximityRange?: number;
}

/**
 * Text where each character blurs/unblurs based on cursor proximity.
 * Far from cursor = blurred. Near cursor = sharp + slightly scaled.
 * Think: frosted glass that clears where you touch.
 */
export default function ProximityText({
  text,
  className = "",
  as: Tag = "p",
  blurRadius = 8,
  proximityRange = 200,
}: ProximityTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const [revealed, setRevealed] = useState(false);

  // Split into chars (preserving spaces as wider spans)
  const chars = text.split("").map((char, i) => ({
    char: char === " " ? "\u00A0" : char,
    isSpace: char === " ",
    key: i,
  }));

  // Scroll-triggered reveal
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        onEnter: () => setRevealed(true),
        onLeaveBack: () => setRevealed(false),
      });
    });
    return () => ctx.revert();
  }, []);

  // Initial stagger-in animation
  useEffect(() => {
    if (!revealed) return;
    const validChars = charsRef.current.filter(Boolean);
    gsap.fromTo(
      validChars,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.015,
      }
    );
  }, [revealed]);

  // Cursor proximity blur effect
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    let raf: number;
    const animate = () => {
      charsRef.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouse.current.x - cx;
        const dy = mouse.current.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Normalize: 0 = on top of char, 1 = at proximityRange
        const t = Math.min(dist / proximityRange, 1);

        // Blur: 0 when close, blurRadius when far
        const blur = t * blurRadius;
        // Scale: slight bump when very close
        const scale = 1 + (1 - t) * 0.06;
        // Opacity: brighter when close
        const opacity = 1 - t * 0.3;

        el.style.filter = `blur(${blur}px)`;
        el.style.transform = `scale(${scale})`;
        el.style.opacity = String(opacity);
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(raf);
    };
  }, [blurRadius, proximityRange]);

  return (
    <Tag
      ref={containerRef as RefObject<never>}
      className={className}
      aria-label={text}
    >
      {chars.map(({ char, isSpace, key }) => (
        <span
          key={key}
          ref={(el) => { charsRef.current[key] = el; }}
          className={`inline-block will-change-[filter,transform] transition-none ${
            isSpace ? "w-[0.3em]" : ""
          }`}
          style={{ filter: `blur(${blurRadius}px)`, opacity: 0 }}
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
