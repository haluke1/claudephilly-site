# ClaudePhilly.com — Build Roadmap

> Auto-updated by sessions. Check STATE.md for current status.

## Phases

- [ ] **Phase 1: Foundation** — Repo setup, design system generation (UI UX Pro Max), Tailwind tokens, base layout, Lenis smooth scroll, GSAP setup, component scaffolding
- [ ] **Phase 2: Hero + Above-Fold** — Three.js particle/WebGL hero, page-enter animation, zoom-reveal transition to manifesto, primary CTA (waitlist), magnetic cursor
- [ ] **Phase 3: Scroll Sections** — Manifesto, "What We Build" (sticky transformer), resources (horizontal scroll), podcast, events, social proof, all with scroll-triggered animations and section color morphs
- [ ] **Phase 4: Waitlist Flow** — Apply form, email capture, confirmation experience, post-submit animation
- [ ] **Phase 5: Polish + Animations** — Animation timing refinement, mobile responsiveness, performance optimization (Core Web Vitals), accessibility pass, final visual QA

## Multi-Agent Execution Pattern

Phases 1-2 are sequential (foundation must exist before hero).
Phases 2-4 can partially overlap via git worktrees once foundation is stable.
Phase 5 is sequential (needs all sections built).

## Branch Strategy

```
main                         ← production (claudephilly.com)
feat/01-foundation           ← Phase 1
feat/02-hero-above-fold      ← Phase 2
feat/03-scroll-sections      ← Phase 3
feat/04-waitlist-flow        ← Phase 4
feat/05-polish-animations    ← Phase 5
```

Each branch gets a Vercel preview URL automatically on push.
