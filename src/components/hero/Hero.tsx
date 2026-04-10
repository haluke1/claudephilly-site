"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Entry animation — stagger in on load
      const tl = gsap.timeline({ delay: 0.3 });
      tl.from(headingRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })
        .from(
          subRef.current,
          { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.5"
        )
        .from(
          ctaRef.current,
          { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );

      // Zoom-reveal on scroll — hero scales up and fades as you scroll down
      gsap.to(zoomRef.current, {
        scale: 1.5,
        opacity: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
          pin: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div ref={zoomRef} className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass text-sm text-text-muted">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Philadelphia&apos;s Builder-First AI Community
        </div>

        {/* Headline */}
        <h1
          ref={headingRef}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8"
        >
          Stop Watching
          <br />
          <span className="text-accent">Start Building</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subRef}
          className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Join the community where CS students and developers build real things
          with AI — not just talk about it.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#waitlist"
            className="group relative px-8 py-4 bg-accent text-bg-deep font-heading font-semibold text-lg rounded-full cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]"
          >
            Apply to Join
          </a>
          <a
            href="#manifesto"
            className="px-8 py-4 glass rounded-full font-heading font-medium text-lg cursor-pointer transition-all duration-300 hover:bg-white/10"
          >
            Our Manifesto
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted text-sm">
          <span>Scroll to explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-text-muted/50 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
