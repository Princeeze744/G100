# G100 — PROJECT BIBLE (Master Handoff)

> NEW CHAT: read this fully before touching anything.
> This is a LIVE product with real users. Do not rebuild. Extend carefully.
> Built over 6 days with Claude's guidance. Owner/dev: Ochidi Prince.

## STATUS
Competition: 5 finalists from 100 engineers / 20 countries.
Day 6 standings: G100 350 pts | 2nd 155 | 3rd 123 | 4th 100. Leading throughout.
Judges asked for a living social platform (feed, posts, reactions, chat,
reels, stories) — ALL DELIVERED.

## WHAT IT IS
Website + installable PWA for a private Nigerian community of 100 visionary
leaders, founded 28 Feb 2026 in Port Harcourt. Both a cinematic award
showpiece AND a working social platform.
Brand: an eagle whose body forms "G100" — "At first glance an eagle, on
closer look a hundred leaders."
Admins: Rejoice, Femi, Shimah (+ Prince).

## DESIGN LAW (never violate)
Nothing chosen, everything derived from the G100 story. Restraint everywhere
so signature moments detonate. Mobile-first. Reduced-motion honoured.
See DESIGN.md for full derivation.
Tokens (app/globals.css): --ink #0d0b09, --bone #f5f2ec, --eye #e8a33d
(amber accent, the eagle's eye, ~10% rationed), --ember #e2603a,
--surf #3dbfb0. Gait: cubic-bezier(0.25,0.1,0.25,1) ~800ms, glide never
bounce. Font: Space Grotesk. Film grain 3.5% over everything.

## STACK
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 +
Framer Motion + Lenis. Custom canvas particle engine (no Three.js).
Supabase (Auth + Postgres + Storage, RLS enforced). Vercel auto-deploy on
push to main. PWA installable + offline SW.
Repo: github.com/Princeeze744/G100 | Live: g100-eight.vercel.app

## WORKFLOW (how we work — important)
- Windows PowerShell + VS Code. Node v24.
- Deliver code as: @'' ... ''@ | Set-Content -Encoding UTF8 path
- PowerShell EATS lone "<a" JSX lines — keep JSX compact.
- Paths with [brackets] REQUIRE -LiteralPath.
- Big/risky files: build in container, user downloads, Copy-Item in.
  Browser appends " (1)", " (2)" — always ls Downloads first.
- Always: npm run build → git add -A → git commit → git push
- git checkout -- <file> rescues a corrupted file.
- Regex replaces on page files are DANGEROUS (over-match). Prefer
  .Replace() with exact strings, or hand over whole files.
- Env keys in .env.local AND Vercel dashboard env vars.
- After ANY new table: verify policies with
  select tablename, count(*) from pg_policies where tablename in (...)
  group by tablename;   (silent RLS failures burned us twice)

## PAGES
/ homepage film: ParticleEagle hero (1500 pts assemble, cursor scatters) +
  FloatingFaces constellation (6 stations, parallax, starlight lines) +
  Origin (2026 parallax founding date, The Covenant 6 principles, The
  Founders) + EagleReveal (scroll ink-draw) + Formation (100 dots fly into
  eagle) + The 100 (live member grid) + The Life (Eket countdown) +
  Gallery "Life in Formation" (albums, FLIP filter, Ken Burns lightbox)
/threads  public timeline + Stories tray + Composer
/threads/[id]  server page (generateMetadata for OG) + ThreadClient.tsx
/member/[id]   server page (OG) + MemberClient.tsx — profile + their posts
/reels    full-screen vertical video feed
/notifications, /bookmarks, /profile, /admin (The Gate), /eket, /join, /login

## FEATURES BUILT
Posts: text + up to 4 images + video. Like, comment, comment-like,
reply-to-comment (1 level), repost, quote-post, bookmark, share, edit/delete
own. @mentions (amber render + notify). Counts on cards. Realtime everywhere.
Stories: 24h expiry, photo/video, captions, multi-upload, progress bars,
5s auto-advance, tap L/R, HOLD to pause, likes, replies (private to owner),
"Seen by N" on your own.
Reels: any post with video_url, snap-scroll, IntersectionObserver autoplay,
tap to unmute, right rail actions.
Auth: signup → admin approves in The Gate → appears in The 100.
PUBLIC VIEWS EVERYTHING; only approved members can act.

## DATABASE (Supabase)
profiles (id, full_name, role_title, city, bio, services, education,
  hobbies, fav_place, fav_dish, birthday, photos[], instagram, twitter,
  linkedin, whatsapp, photo_url, accent, approved, is_admin)
  + is_admin() security-definer fn + auto-create trigger on signup
posts (author_id, body, image_url, image_urls[], video_url, repost_of,
  is_quote), post_likes, post_comments (parent_id), comment_likes,
bookmarks, notifications (user_id, actor_id, type, post_id, read),
stories (expires_at 24h, caption, video_url), story_likes, story_replies,
story_views, gallery (album), event_rsvps
Buckets: avatars, posts, gallery (all public, member/admin upload).
Images shrunk client-side via lib/shrinkImage.ts before upload.

## KEY FILES
lib/: supabaseClient.ts, social.ts (ACCENTS, timeAgo, notify,
  notifyMentions, types), usePosts.ts (data + realtime hook),
  shrinkImage.ts, haptic.ts
app/components/: SocialUI.tsx (Avatar, Body, PostImages, Lightbox,
  PostCard), Composer.tsx, Stories.tsx, MobileTabs.tsx (bottom tabs +
  slim top header + FAB + scroll-hide), SideDrawer.tsx, Navbar.tsx
  (desktop only, sm:flex), Toast.tsx, LazyMount.tsx, ParticleEagle.tsx,
  FloatingFaces.tsx, Origin.tsx, EagleReveal.tsx, Formation.tsx,
  Members.tsx, Gallery.tsx, GalleryManager.tsx, EketCountdown.tsx

## UX RULES LEARNED (do not regress)
- Touch targets >= 44px (h-11 min-w-11). Smaller doubles error rates.
- All actions OPTIMISTIC — update local state instantly, DB syncs after.
- globals.css: touch-action:manipulation, no tap-highlight,
  -webkit-touch-callout:none, active:scale(0.94).
- INPUTS MUST BE 16px on mobile or iOS Safari auto-zooms (this caused a
  "the app is zooming" bug). Viewport locked: maximumScale 1, userScalable
  false, viewportFit cover.
- Single feed image: full/uncropped over a blurred-darkened copy of ITSELF
  as backdrop. KEEP THE BLUR — user prefers filled over empty gaps.
  2-4 images: equal grid tiles. Tap any → swipeable lightbox with n/total.
- Stories timer MUST key to [open?.g, open?.i] and groups must NOT reload
  while the player is open (openRef guard) or playback loops backwards.
- Notifications are ONLY for actions involving you (not every new post).
- Skeleton loaders, never blank "Loading..." screens.
- Video src + "#t=0.1" forces a first-frame thumbnail instead of black.

## PERFORMANCE (protect this)
GTmetrix ~89%, LCP 2.0s, TBT 31ms, CLS 0, ~425KB.
Via: lazy-mount below-fold, dynamic imports, batched particle renderer,
client-side image compression, composited-only animations.
Measure on pagespeed.web.dev / GTmetrix — NOT localhost, NOT with browser
extensions (they poison the score).

## REMAINING / IDEAS
- Reels + quote-post visual polish (closer to X/Instagram)
- Richer profile UI for hobbies/fav_place/fav_dish/photos[] (columns exist,
  form not built)
- Push notifications (PWA capable)
- Submission kit: walkthrough video, pitch doc, honest Tear Test scoring
