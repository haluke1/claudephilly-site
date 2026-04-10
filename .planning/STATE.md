# ClaudePhilly.com — Current State

> **READ THIS FIRST** at the start of every session.
> Last updated: 2026-04-10

## Current Phase

**Phase 0: Project Setup** — COMPLETE

## What's Done

- [x] Spec locked (see PROJECT.md)
- [x] Next.js 16 scaffolded with TypeScript, Tailwind, App Router
- [x] .planning/ infrastructure created (PROJECT.md, ROADMAP.md, STATE.md)
- [x] Project CLAUDE.md with stack rules, animation conventions, agent coordination
- [x] UI UX Pro Max skill installed (.claude/skills/)
- [x] Git initialized, pushed to GitHub (public): https://github.com/haluke1/claudephilly-site
- [x] Vercel linked + first deploy live: https://claudephilly-site.vercel.app
- [x] Memory pointer written for cross-session continuity

## What's NOT Done Yet

- [ ] Connect GitHub repo to Vercel for auto-deploy (needs GitHub Login Connection in Vercel dashboard)
- [ ] Generate design system via UI UX Pro Max (colors, typography, patterns)
- [ ] Install animation dependencies (gsap, @gsap/react, framer-motion, lenis, @react-three/fiber, @react-three/drei)
- [ ] Research reference sites (Shopify Editions, Awwwards winners) for animation patterns
- [ ] Plan Phase 1 (foundation) in detail
- [ ] Connect claudephilly.com domain

## What's Next

1. **Generate design system** — Run UI UX Pro Max with the locked spec to get colors, fonts, page pattern
2. **Install animation deps** — gsap, framer-motion, lenis, @react-three/fiber
3. **Plan Phase 1** — Foundation: design tokens in Tailwind, base layout, Lenis smooth scroll, GSAP setup
4. **Execute Phase 1** — Build the foundation so parallel agents can work on sections

## Key Decisions Log

| Date | Decision | Why |
|---|---|---|
| 2026-04-10 | Code-first, not Framer | Multi-agent parallelism, git versioning, award-winning animations need custom code |
| 2026-04-10 | Public repo | O-1A evidence — technical artifact of community leadership |
| 2026-04-10 | Primary CTA = waitlist/apply | Builder-first community, everything funnels to joining |
| 2026-04-10 | GSAP + ScrollTrigger for scroll | Industry standard for Awwwards-tier scroll-driven storytelling |
| 2026-04-10 | Next.js 16 + Vercel | Preview deploys per branch enable visual multi-agent review |

## Blockers

- **Vercel GitHub connection**: Need to add GitHub Login Connection in Vercel dashboard for auto-deploys. Manual `vercel deploy` works as fallback.

## Preview URLs

- **Production**: https://claudephilly-site.vercel.app (currently shows default Next.js page)
- **GitHub**: https://github.com/haluke1/claudephilly-site

## How to Continue This Project

1. Read this file (you just did)
2. Read PROJECT.md for the locked spec
3. Read ROADMAP.md for phase status
4. `git log --oneline -20` for recent work
5. Check the current phase's PLAN.md in `.planning/phases/`
6. Continue from "What's Next" above
