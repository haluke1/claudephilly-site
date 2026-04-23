"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TiltCard from "@/components/shared/TiltCard";
import { useIsMobile } from "@/lib/use-is-mobile";

const projects = [
  {
    title: "AI-Powered Philly Guide",
    description: "Local business recommendations using Claude + real-time data",
    tag: "Shipped",
  },
  {
    title: "Voice Command Center",
    description: "Persistent AI assistant with multi-agent orchestration",
    tag: "Building",
  },
  {
    title: "Workshop Engine",
    description: "Interactive AI workshops for non-technical professionals",
    tag: "Upcoming",
  },
  {
    title: "Community Dashboard",
    description: "Real-time member activity, project showcase, event calendar",
    tag: "Planned",
  },
];

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile || !sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const scrollWidth = track.scrollWidth - track.clientWidth;

      gsap.to(track, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden"
    >
      {isMobile ? (
        /* Mobile: vertical stacked cards */
        <div className="py-24 px-6 max-w-2xl mx-auto">
          <div className="mb-12">
            <span className="text-accent font-heading font-semibold text-sm uppercase tracking-widest">
              Chapter 02
            </span>
            <h2 className="font-heading text-4xl font-bold mt-4">What We Build</h2>
          </div>
          <div className="flex flex-col gap-6">
            {projects.map((project, i) => (
              <div key={i} className="glass rounded-2xl p-8 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent mb-6">
                    {project.tag}
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3">{project.title}</h3>
                  <p className="text-text-muted leading-relaxed">{project.description}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-accent font-medium text-sm">
                  View project
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Desktop: GSAP horizontal scroll */
        <div className="h-screen flex flex-col justify-center">
          <div className="px-6 max-w-7xl mx-auto w-full mb-12">
            <span className="text-accent font-heading font-semibold text-sm uppercase tracking-widest">
              Chapter 02
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4">What We Build</h2>
          </div>
          <div ref={trackRef} className="flex gap-8 px-6 will-change-transform">
            {projects.map((project, i) => (
              <TiltCard
                key={i}
                className="relative glass rounded-2xl p-8 min-w-[350px] md:min-w-[450px] flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent mb-6">
                    {project.tag}
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3">{project.title}</h3>
                  <p className="text-text-muted leading-relaxed">{project.description}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-accent font-medium text-sm">
                  View project
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
