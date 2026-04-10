"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/shared/MagneticButton";
import TextScramble from "@/components/shared/TextScramble";

// Lazy load 3D scenes — no blocking initial paint
const CityHallScene = lazy(() => import("./CityHallScene"));
const HeroScene = lazy(() => import("./HeroScene"));

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScenes, setShowScenes] = useState(false);

  // Scene 1 (City Hall) plays as auto-animation on load
  // Scene 2 (Skyline) takes over when user starts scrolling
  const scenePhase = scrollProgress < 0.05 ? "cityhall" : "skyline";

  // Delay loading 3D to let text animate first
  useEffect(() => {
    const timer = setTimeout(() => setShowScenes(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // City Hall assembly: auto-plays over ~4 seconds after scene loads
  useEffect(() => {
    if (!showScenes) return;
    const start = performance.now();
    const duration = 4000; // 4s assembly

    let raf: number;
    const animate = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out for satisfying lock-in
      const eased = 1 - Math.pow(1 - progress, 3);
      setAssemblyProgress(eased);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [showScenes]);

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

      // Zoom-reveal on scroll
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
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
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
      {/* 3D Scenes — crossfade between City Hall and Skyline */}
      {showScenes && (
        <Suspense fallback={null}>
          {/* Scene 1: City Hall wireframe assembly */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: scenePhase === "cityhall" ? 1 : 0,
              zIndex: scenePhase === "cityhall" ? 2 : 0,
              pointerEvents: scenePhase === "cityhall" ? "auto" : "none",
            }}
          >
            <CityHallScene progress={assemblyProgress} />
          </div>

          {/* Scene 2: Philadelphia skyline emergence */}
          <div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: scenePhase === "skyline" ? 1 : 0,
              zIndex: scenePhase === "skyline" ? 2 : 0,
              pointerEvents: scenePhase === "skyline" ? "auto" : "none",
            }}
          >
            <HeroScene scrollProgress={scrollProgress} />
          </div>
        </Suspense>
      )}

      {/* Fallback ambient glow (visible before 3D loads) */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-[drift_20s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-[drift_25s_ease-in-out_infinite_alternate-reverse]" />
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
          <TextScramble text="Stop Watching" delay={400} duration={1200} />
          <br />
          <span className="text-accent">
            <TextScramble text="Start Building" delay={900} duration={1400} />
          </span>
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
          <MagneticButton as="a" href="#waitlist" strength={0.4} className="group relative px-8 py-4 bg-accent text-bg-deep font-heading font-semibold text-lg rounded-full cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_40px_rgba(217,119,87,0.3)]">
            Apply to Join
          </MagneticButton>
          <MagneticButton as="a" href="#manifesto" strength={0.3} className="px-8 py-4 glass rounded-full font-heading font-medium text-lg cursor-pointer transition-all duration-300 hover:bg-white/10">
            Our Manifesto
          </MagneticButton>
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
