# ClaudePhilly.com — Locked Spec

> Locked: 2026-04-10 | Do NOT modify without explicit user approval

## What

A public-facing website for ClaudePhilly — a builder-first AI community in Philadelphia. The site is a scroll-driven storytelling experience with award-winning animations (Shopify Editions / Awwwards SOTD tier), not a static page. Code-first on Next.js 16 + Vercel.

## Primary CTA

**Join waitlist / apply to community.** Everything on the site funnels toward this action. Secondary: workshops (post-OPT), newsletter/podcast, resources.

## Who visits

**Primary:** CS students and developers in Philly who want to build with AI, not just learn about it. The builder energy is the magnet that pulls in everyone else.

**Secondary:** Non-technical professionals wanting to understand AI, company decision-makers evaluating AI adoption (post-OPT workshop buyers).

## The one-sentence test

> "This guy Haluk runs a Philly AI community where you actually build stuff with Claude, not just watch tutorials — you gotta check it out"

Person-led (Haluk as magnet within builder community) + outcome-focused (build real things, not consume content).

## What this is NOT

- NOT a blog or content site (no articles, no SEO play — the site IS the experience)
- NOT a course platform (no lessons, no curriculum — community, not school)
- NOT a personal portfolio (Haluk is present but community is the product)
- NOT a SaaS or tool (no login dashboard, no app functionality)
- NOT corporate or enterprise-looking (no stock photos, no "trusted by 500 companies")

## Quality bar

Final grade. Award-winning. The site itself is O-1A evidence — a technical artifact demonstrating Haluk's leadership of a real community.

## Visual references

- Shopify Editions (Winter '25) — scroll-driven storytelling, zoom-reveals, section transitions
- Top Awwwards SOTD parallax sites — premium feel, magnetic cursor, buttery smooth

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| Scroll animations | GSAP + ScrollTrigger |
| Component animations | Framer Motion |
| Smooth scroll | Lenis |
| Hero WebGL | React Three Fiber (Three.js) |
| Hosting | Vercel (preview deploys per branch) |
| Forms | TBD (Vercel + Resend, or embedded) |
| Design system gen | UI UX Pro Max skill |

## Animation architecture

| Effect | Library | Where |
|---|---|---|
| Zoom-reveal | GSAP ScrollTrigger | Hero → manifesto transition |
| Horizontal scroll | GSAP ScrollTrigger | Resources/showcase gallery |
| Parallax depth | GSAP ScrollTrigger | Background layers in every section |
| Text stagger reveal | GSAP + Framer Motion | Section headlines |
| Section color morphs | GSAP ScrollTrigger | Background transitions between sections |
| Sticky transformers | GSAP ScrollTrigger | "What we build" section |
| Magnetic cursor | Framer Motion | CTAs and interactive cards |
| Page-enter animation | Framer Motion | Initial load sequence |
| Page transitions | CSS View Transitions | Next.js 16 native |
