# G100 — PROJECT BIBLE (Master Handoff Document)

> If this conversation is new: read this ENTIRELY before doing anything.
> This is a live, deployed product. Do not rebuild. Extend carefully.

---

## WHAT THIS IS
G100 is a website + installable app for a private Nigerian community of
100 visionary leaders (women & men), founded 28 February 2026 in Port
Harcourt. It is BOTH a cinematic award-competition showpiece AND a real
working member platform. Brand: an eagle whose body forms the letters
"G100" - "At first glance an eagle, on closer look a hundred leaders."

Owner/developer: Ochidi Prince. Admins: Rejoice, Femi, Shimah.

## THE DESIGN LAW (never violate)
Nothing chosen, everything derived from the G100 story. Every colour,
motion, effect must cite its reason. Restraint everywhere so signature
moments detonate. Mobile-first. Reduced-motion always honoured. See
DESIGN.md for full derivation.

### Design tokens (app/globals.css)
- --ink #0d0b09 (bg) · --bone #f5f2ec (text)
- --eye #e8a33d (amber accent, the eagle eye, ~10% rationed)
- --ember #e2603a · --surf #3dbfb0 (warm/cool secondary accents)
- Gait: cubic-bezier(0.25,0.1,0.25,1), ~800ms, glide never bounce
- Font: Space Grotesk. Film grain ~3.5% over everything.

## TECH STACK
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4
- Framer Motion (animation) + Lenis (smooth scroll)
- Custom canvas particle engine (no Three.js)
- Supabase: Auth + Postgres + Storage (RLS enforced)
- Vercel hosting, auto-deploy on git push to main
- PWA: installable, offline service worker
- Repo: github.com/Princeeze744/G100
- Live: g100-eight.vercel.app

## WORKFLOW (critical - how we work)
- User works in PowerShell/VS Code on Windows. Node v24.
- Give code as PowerShell here-strings: @'' ... ''@ | Set-Content -Encoding UTF8 path
- PowerShell SOMETIMES eats lone "<a" JSX lines - keep JSX on compact lines.
- For big/risky files: build in container, user downloads, Copy-Item in.
- Always: npm run build -> git add -A -> git commit -> git push
- git checkout -- <file> rescues a corrupted file to last commit.
- Env keys live in .env.local (gitignored) AND in Vercel dashboard env vars.
- Regex replaces on page.tsx are DANGEROUS (over-match). Prefer anchored
  single-line replaces or hand user the full file.

## WHAT IS BUILT (all live)
Homepage film (app/page.tsx) in scroll order:
1. Hero - ParticleEagle (1500 pts assemble, cursor scatters) +
   FloatingFaces (constellation of member photos, 6 stations, parallax,
   starlight lines) + headline + Atmosphere glows + WhatsAppFloat
2. Origin (app/components/Origin.tsx) - "2026" parallax founding date,
   the story, The Covenant (6 principles), The Founders (3 admins)
3. EagleReveal - scroll-driven ink-draw of the logo (id="reveal")
4. Formation - 100 dots fly into eagle shape
5. The 100 (Members.tsx) - live member grid from DB, profile sheets
6. The Life - EketCountdown -> links to /eket
7. Gallery - "Life in Formation", albums, FLIP filter, Ken Burns lightbox
8. Join CTA + footer

Pages:
- /join, /login - cinematic auth (AuthShell.tsx)
- /profile - showcase card w/ 3D tilt; Edit mode form; photo upload
- /admin - "The Gate": approve/revoke members + GalleryManager
- /eket - event page, countdown, RSVP wall of member faces

Components: Navbar (global, auth-aware, admin sees "Gate"), SmoothScroll,
InstallPrompt, SWRegister, LazyMount (perf), Section.
Libs: lib/supabaseClient.ts, lib/shrinkImage.ts (client image compression)

## DATABASE (Supabase)
- profiles: id, full_name, role_title, city, bio, services, education,
  instagram, twitter, linkedin, whatsapp, photo_url, accent, approved,
  is_admin, created_at. RLS: public sees approved; users edit own;
  admins (is_admin) see/update all. Trigger auto-creates row on signup.
  is_admin() function = security-definer admin check.
- event_rsvps: user_id, event_slug, created_at. RLS: public read,
  self insert/delete.
- gallery: id, image_url, caption, album, sort, created_at.
  RLS: public read, admin write.
- Storage buckets: avatars (public, user-folder upload),
  gallery (public, admin upload). Both shrink images client-side first.
- Email confirmation is OFF. Approval gate is the real bouncer.

## PERFORMANCE (audited, protected)
Live scores: ~89% GTmetrix, LCP 2.0s, TBT 31ms, CLS 0, ~425KB.
Achieved via: lazy-mount below-fold, dynamic imports, batched particle
renderer, client-side image compression, composited-only animations.
KEEP IT FAST. Measure on pagespeed.web.dev or GTmetrix (NOT localhost,
NOT with browser extensions on).

## STILL TO DO
- Submission kit: walkthrough video, polished pitch doc, honest scoring
- Possible next: activity feed / posts, in-app chat, richer events
  (see "SCALING" below - discuss scope before building)

## SCALING VISION (under discussion)
Owner wants to explore turning this into a fuller social platform:
member posts/feed, in-app chat, social-media integration, video reels.
This is achievable on the SAME stack (Supabase Realtime handles chat &
live feeds). Approach: phase it, keep the calm/restraint law, never let
features bloat the award showpiece. Build member-only social features
BEHIND the login so the public landing stays cinematic and clean.
