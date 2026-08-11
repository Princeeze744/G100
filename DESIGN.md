# G100 — Design Case Study

**A Group of Visionary Leaders.**
*At first glance, an eagle. On closer look, a hundred leaders.*

This document explains how the G100 website was designed and built.
Nothing here was chosen from a trend palette or template. Every
decision was **derived** from the G100 story using a story-first
design system. If a pixel could not cite its sentence, it was deleted.

---

## 1. The Story (the only input)

G100 is a Nigerian community of one hundred visionary leaders -
women and men - scattered across cities, united as one family.
They lead, they laugh, they live. The identity is an eagle whose
body secretly forms the letters G100:

> "The letters are not placed next to each other.
> They become the shape."

That sentence is the entire design system. The enemy of the story
is **scattered-ness**; the promise is **formation**.

## 2. The Derivation

### Colour — computed, not picked
- The brand brief said "bold, minimal, timeless" -> an achromatic
  world: `--ink #0d0b09` and `--bone #f5f2ec`.
- The only detail in the eagle's head is the eye -> the single
  voltage accent: **eagle-eye amber `#e8a33d`**, rationed to ~10%,
  appearing only where *focus* happens (hover, CTA, the reveal).
- The community's real life (beach days, warmth, play) warmed the
  world: **sunset ember `#e2603a`** and a whisper of **Atlantic
  surf `#3dbfb0`**, breathing as ambient light - never fields.
- Film grain (~3.5%) over everything: evidence of the human hand.

### Motion — one gait
The eagle glides; it does not bounce. One easing family governs
the whole site:

```css
--gait-ease: cubic-bezier(0.25, 0.1, 0.25, 1);
--gait-base: 800ms;
--gait-stagger: 100ms;
```

Elements settle like a bird landing. The single permitted
detonation is the reveal.

### Type
"Bold, minimal, timeless" -> Space Grotesk, a sharp geometric
grotesk, fluid-scaled between phone and cinema.

## 3. The Signature Moments

### The Particle Eagle (hero)
~1500 points of light assemble into the eagle on load - scattered
individuals becoming one form, the story performed in the first
two seconds. The cursor (or a finger, on mobile) scatters the
particles like feathers in wind; they glide home. Custom canvas
engine, zero dependencies, device-tiered: phones fly a lighter
flock at 60fps; reduced-motion users receive the assembled eagle
as a designed still.

### The Reveal (scroll)
A pinned, scroll-driven scene: ink strokes trace the eagle
("At first glance, an eagle."), the body fills, and the eye
ignites amber ("On closer look, a hundred leaders."). The logo's
own concept, made interactive. Paths traced from the real logo
with potrace - 7 paths, 4KB.

### The Formation
100 marks scattered across the screen fly into the eagle's
silhouette as you scroll - coordinates sampled from the actual
logo bitmap. The conflict (scattered) resolved spatially
(formation). The mark nearest the eye turns amber.

### The Constellation
Member portraits float around the hero in six stations, joined
by faint breathing starlight lines - the family, connected.
Faces dissolve in blur and re-materialize from soft focus
(Ken Burns drift inside each frame); the whole constellation
shifts with cursor-depth parallax. Mobile gets its own diamond
geometry rather than a collapsed desktop layout.

## 4. The Platform

The site is not a brochure - it is a living community platform:

- **Accounts & profiles** - Supabase Auth + Postgres.
  Members build a showcase profile: portrait, bio, services,
  education, socials, personal accent colour.
- **Profile showcase** - a 3D tilt card (spring physics, light
  that follows the cursor) presenting each member like a
  magazine feature.
- **The Gate** - an admin approval panel. New members appear in
  "The 100" only after approval. Enforced by Postgres Row Level
  Security, not client trust.
- **The 100** - the live member grid, rendered from the real
  database, each card opening a full profile sheet.
- **Eket countdown** - a living event module for the family's
  real gatherings.

## 5. Craft Rules Obeyed

- One signature moment per scene; the calm carries the storm.
- Mobile is the first stage, not the encore - every effect ships
  a purpose-built phone version.
- Reduced-motion is a second choreography, not a fallback.
- Depth is information; motion means; grain is biographical.
- Every hex, easing and effect can cite its sentence.

## 6. The Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4
Framer Motion (choreography) · Lenis (momentum scroll)
Custom canvas particle engine · SVG traced with potrace
Supabase (Auth, Postgres + RLS, Storage) · Vercel (CI/CD)

## 7. The Numbers

- Logo vector: 7 paths, 4.6KB (vs 7,398 paths / 1.5MB from an
  auto-vectorizer)
- Particle targets: 1500 points sampled from the real eagle
- Formation: 100 coordinates sampled from the real eagle
- One easing family. One accent, rationed. One story.

---

*Nothing chosen. Everything derived.*

Built by **Ochidi Prince** - G100, Nigeria. 2026.
