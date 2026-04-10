"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TiltCard from "@/components/shared/TiltCard";

const events = [
  {
    title: "Build Night",
    frequency: "Weekly",
    description: "Bring a project, build for 3 hours, demo at the end.",
    icon: "⚡",
  },
  {
    title: "AI Workshop",
    frequency: "Monthly",
    description: "Hands-on workshop for non-technical professionals. Leave with something you built.",
    icon: "🔧",
  },
  {
    title: "Demo Day",
    frequency: "Quarterly",
    description: "Community members showcase what they shipped. Pizza and honest feedback.",
    icon: "🚀",
  },
];

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef = useRef<SVGSVGElement>(null);
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMd(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger card entry
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Animated connection lines (desktop only)
      if (lineRef.current && isMd) {
        const paths = lineRef.current.querySelectorAll(".connection-line");
        paths.forEach((path) => {
          const p = path as SVGPathElement;
          const length = p.getTotalLength();
          gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(p, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMd]);

  return (
    <section id="events" ref={sectionRef} className="relative py-32">
      <div className="max-w-7xl mx-auto px-6">
        <span className="text-accent font-heading font-semibold text-sm uppercase tracking-widest">
          Chapter 03
        </span>
        <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-16">
          How We Gather
        </h2>

        <div className="relative">
          {/* Connection lines between cards (desktop) */}
          {isMd && (
            <svg
              ref={lineRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              preserveAspectRatio="none"
            >
              {/* Line from card 1 to card 2 */}
              <path
                className="connection-line"
                d="M 33.3% 50% Q 50% 30%, 66.6% 50%"
                fill="none"
                stroke="rgba(217, 119, 87, 0.3)"
                strokeWidth="2"
              />
              {/* Glowing dots at connection points */}
              <circle cx="33.3%" cy="50%" r="4" fill="#D97757" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="66.6%" cy="50%" r="4" fill="#D97757" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          )}

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {events.map((event, i) => (
              <TiltCard
                key={i}
                className="relative glass rounded-2xl p-8 cursor-pointer group"
              >
                <div
                  ref={(el) => { cardsRef.current[i] = el as HTMLDivElement; }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-accent font-heading font-semibold text-sm uppercase tracking-wider">
                      {event.frequency}
                    </span>
                    <span className="text-2xl">{event.icon}</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
