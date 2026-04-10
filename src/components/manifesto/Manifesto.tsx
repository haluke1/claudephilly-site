"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ReactiveText from "@/components/shared/ReactiveText";

const manifestoLines = [
  "We don't sit in lectures about AI.",
  "We build with it.",
  "Every week. Real projects. Real tools.",
  "If you ship, you belong here.",
];

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Glass card fades in after the manifesto lines
      gsap.from(descRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: descRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-32"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-16">
          <span className="text-accent font-heading font-semibold text-sm uppercase tracking-widest">
            Chapter 01
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4">
            The Manifesto
          </h2>
        </div>

        <div className="space-y-12 md:space-y-16">
          {manifestoLines.map((line, i) => (
            <ReactiveText
              key={i}
              text={line}
              as="p"
              stagger={0.07}
              repelStrength={12}
              className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-text/90"
            />
          ))}
        </div>

        <div ref={descRef} className="mt-20 glass rounded-2xl p-8 md:p-12 max-w-2xl">
          <p className="text-lg text-text-muted leading-relaxed">
            ClaudePhilly is where Philadelphia&apos;s builders come to make things
            with AI. Not another meetup with slides. A workshop where you leave
            with something you built.
          </p>
        </div>
      </div>
    </section>
  );
}
