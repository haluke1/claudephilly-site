# Changelog

All changes auto-logged per commit. Reasoning lives in the commit body.

## [ce1d3ee] 2026-04-23 13:03
**feat: dual 3D hero — City Hall wireframe assembly + Philly skyline emergence**

Scene 1 (City Hall Assembly):
- 21 wireframe box pieces forming Philadelphia City Hall's silhouette
- EdgesGeometry for clean wireframe lines (not mesh wireframe)
- Each piece flies from scattered position → locks into place with stagger
- Color transitions: dim slate → bright terra cotta as pieces assemble
- Lock-in scale pulse effect on each piece
- Construction dust particles that converge during assembly
- Dramatic orbiting camera with mouse influence
- Ground grid reference plane

Scene 2 (Skyline Emergence):
- 48x48 grid (2,304 instanced cubes) — up from 32x32
- Noise-driven heights morph into Philly skyline profile via Gaussian bumps
- 20 buildings mapped to real relative positions/heights
- Comcast towers as tallest peaks, City Hall with wide footprint
- 5-stop color ramp for richer height coloring
- Cinematic orbit camera that pulls back as skyline forms

Orchestration:
- City Hall plays as auto-animation on page load (4s assembly)
- Crossfade to Skyline when user starts scrolling
- Both scenes lazy-loaded with Suspense

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>

---

---

