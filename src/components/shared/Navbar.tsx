"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const chapters = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Projects", href: "#showcase" },
  { label: "Events", href: "#events" },
  { label: "Join", href: "#waitlist" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: "top -80%",
      end: 99999,
      onUpdate: (self) => {
        setVisible(self.progress > 0);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-4 left-4 right-4 z-40 glass rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <a href="#" className="font-heading font-bold text-lg cursor-pointer">
        Claude<span className="text-accent">Philly</span>
      </a>

      <div className="hidden sm:flex items-center gap-6">
        {chapters.map((ch) => (
          <a
            key={ch.href}
            href={ch.href}
            className="text-sm text-text-muted font-medium cursor-pointer transition-colors duration-200 hover:text-text"
          >
            {ch.label}
          </a>
        ))}
      </div>

      <a
        href="#waitlist"
        className="px-4 py-2 bg-accent text-bg-deep text-sm font-heading font-semibold rounded-full cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:scale-105"
      >
        Apply
      </a>
    </nav>
  );
}
