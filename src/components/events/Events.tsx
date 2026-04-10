"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const events = [
  {
    title: "Build Night",
    frequency: "Weekly",
    description: "Bring a project, build for 3 hours, demo at the end.",
  },
  {
    title: "AI Workshop",
    frequency: "Monthly",
    description: "Hands-on workshop for non-technical professionals. Leave with something you built.",
  },
  {
    title: "Demo Day",
    frequency: "Quarterly",
    description: "Community members showcase what they shipped. Pizza and honest feedback.",
  },
];

export default function Events() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="events" ref={sectionRef} className="relative py-32">
      <div className="max-w-7xl mx-auto px-6">
        <span className="text-accent font-heading font-semibold text-sm uppercase tracking-widest">
          Chapter 03
        </span>
        <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-16">
          How We Gather
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="glass rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 cursor-pointer group"
            >
              <div className="text-accent font-heading font-semibold text-sm uppercase tracking-wider mb-4">
                {event.frequency}
              </div>
              <h3 className="font-heading text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">
                {event.title}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {event.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
