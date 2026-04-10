"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Waitlist() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(formRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Connect to actual waitlist API (Resend, Vercel form, etc.)
    setSubmitted(true);
  };

  return (
    <section
      id="waitlist"
      ref={sectionRef}
      className="relative py-32 min-h-screen flex items-center"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <span className="text-accent font-heading font-semibold text-sm uppercase tracking-widest">
          The Climax
        </span>
        <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mt-4 mb-8 leading-[1.05]">
          Ready to
          <br />
          <span className="text-accent">Build?</span>
        </h2>

        <p className="text-xl text-text-muted max-w-xl mx-auto mb-12 leading-relaxed">
          We&apos;re selective because quality matters. Apply to join
          Philadelphia&apos;s most active AI builder community.
        </p>

        {!submitted ? (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-4 max-w-lg mx-auto"
          >
            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 w-full px-6 py-4 bg-bg-card border border-glass-border rounded-full text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-accent text-bg-deep font-heading font-semibold text-lg rounded-full cursor-pointer transition-all duration-300 hover:bg-accent-hover hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            >
              Apply Now
            </button>
          </form>
        ) : (
          <div className="glass rounded-2xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-2">You&apos;re In the Queue</h3>
            <p className="text-text-muted">
              We&apos;ll review your application and reach out soon. Builders get priority.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
