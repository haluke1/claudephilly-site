@AGENTS.md

# ClaudePhilly.com — Project Instructions

## FIRST: Read .planning/STATE.md

Before doing ANY work, read `.planning/STATE.md` to understand where the project is and what's next. Then check `git log --oneline -20` for recent activity.

## What This Is

A scroll-driven storytelling website for ClaudePhilly — a builder-first AI community in Philadelphia. NOT a static page. Think Shopify Editions, Awwwards SOTD tier. The site IS the experience.

See `.planning/PROJECT.md` for the full locked spec. Do NOT change the spec without Haluk's explicit approval.

## Stack

- **Next.js 16 App Router** (TypeScript, src/ directory)
- **Tailwind CSS** for styling
- **GSAP + ScrollTrigger** for all scroll-linked animations (pinning, scrubbing, parallax, zoom-reveal)
- **Framer Motion** for component-level animations (hover, tap, enter/exit, layout)
- **Lenis** for smooth scrolling (never native scroll for animated sections)
- **React Three Fiber** (Three.js) for hero WebGL scene
- **Vercel** for hosting with preview deploys per branch

## Animation Rules

- ALL scroll-triggered animations use GSAP ScrollTrigger. Never CSS-only scroll animations (inconsistent cross-browser).
- Smooth scroll is always via Lenis. Never disable it.
- Component-level animations (hover states, enter/exit, layout shifts) use Framer Motion.
- 3D/WebGL only in the hero section via React Three Fiber. Don't add WebGL elsewhere without approval.
- Animation timing: ease curves should feel premium. Use `power2.inOut` or `power3.out` for most transitions. Never linear.
- Mobile: simplify animations (reduce particle count, disable horizontal scroll, reduce parallax layers). Never break functionality.

## Design System

> Will be populated after UI UX Pro Max generation. Until then, use these defaults:

- **Background**: Dark (#0A0A0A to #111111 range)
- **Text**: Always #FFFFFF for body text on dark backgrounds. NEVER gray.
- **Accent**: TBD (from design system generation)
- **Typography**: TBD (from design system generation)
- **Spacing**: Tailwind defaults, sections have generous vertical padding (py-24 minimum)

## File Conventions

- Components: `src/components/{section-name}/` — one folder per major section
- Animations: animation logic lives WITH the component, not in a separate utils file
- Pages: `src/app/` — minimal, imports section components
- Shared: `src/lib/` for shared utilities (scroll context, animation helpers)
- Assets: `public/` for static assets

## Git Conventions

- Branch names: `feat/{phase-number}-{short-name}` (e.g., `feat/02-hero-above-fold`)
- Commits: conventional commits (`feat:`, `fix:`, `style:`, `docs:`, `refactor:`)
- Always update `.planning/STATE.md` at end of session before final commit
- Never force push to main

## What NOT To Do

- Don't add pages not in the spec
- Don't change the design system without updating this file
- Don't use CSS scroll-snap (conflicts with GSAP ScrollTrigger)
- Don't add a blog, CMS, auth system, or dashboard
- Don't use stock photos. Ever.
- Don't make it look corporate. No "trusted by" badges, no enterprise copy.

## Multi-Agent Coordination

- Each agent works in its own git worktree on a feature branch
- Read `.planning/phases/{phase}/PLAN.md` for your assigned work
- Commit atomically (one logical change per commit)
- Push branch when done — Vercel auto-deploys a preview
- Don't merge into main — the orchestrating session handles merges

## Context for Non-Technical Readers

Haluk (the project owner) is not a developer. When explaining decisions or asking for input, use real-world analogies. Don't dump technical jargon.
