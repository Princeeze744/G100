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


## THE FEED (built - app/feed/page.tsx)
Members-only ACTIONS, public VIEWING (anyone sees feed; login to post/like/share).
- Post: text + up to 4 images. Realtime via Supabase channel.
- Single image: shown full/uncropped (object-contain) on a blurred-darkened
  version of ITSELF as backdrop - fills side/letterbox gaps beautifully.
  KEEP THE BLUR - user prefers filled over empty gaps.
- 2-4 images: tidy equal grid tiles (2=side by side, 3=big+2, 4=2x2, +N overflow).
- Tap any image: full-screen Lightbox, swipe/arrow between, dots, Esc/X to close.
- Like = heart (only approved members). Share = native share / WhatsApp fallback.
- Hot post (3+ likes): glows in author accent colour.
- DB: posts(author_id, body, image_url, image_urls text[], created_at),
  post_likes(post_id,user_id), post_comments(...未built UI yet).
  Storage bucket: posts (public, members upload). Images shrunk client-side.
- Navbar "Feed" link shows for everyone.

## STILL TO BUILD (judges asked for these)
- Comments UI (table post_comments already exists)
- 24-hour Stories (disappearing) - the showstopper
- Multi-photo profiles, richer profile fields (hobbies, fav place/dish)
- Notifications (PWA push)
NOTE: competition status - leading by ~50 pts, top 5 of 100, ~1 month runway.
Judges pushed challenge: prove it's a living social platform (feed/posts/chat).
## SCALING VISION (under discussion)
Owner wants to explore turning this into a fuller social platform:
member posts/feed, in-app chat, social-media integration, video reels.
This is achievable on the SAME stack (Supabase Realtime handles chat &
live feeds). Approach: phase it, keep the calm/restraint law, never let
features bloat the award showpiece. Build member-only social features
BEHIND the login so the public landing stays cinematic and clean.


## THREADS PLATFORM (built - replaces /feed)
/threads - public timeline. /threads/[id] - post detail, all comments open,
fixed reply bar. /member/[id] - member profile + their personal post timeline.
Shared: lib/social.ts (types, ACCENTS, timeAgo), lib/usePosts.ts (data hook,
realtime), app/components/SocialUI.tsx (Avatar, PostImages, Lightbox, PostCard),
app/components/Composer.tsx.
Features: post (text + up to 4 images), like, comment, comment-like,
reply-to-comment (1 level nesting), repost, quote-post, share, edit own post,
delete own post/comment. Counts visible on cards. Realtime everywhere.
Public can VIEW all; only approved members can act.
DB adds: posts.repost_of, posts.is_quote, post_comments.parent_id,
comment_likes table. All RLS public-read, member-write.
UX: skeleton loaders (no blank "loading" screens). WhatsApp float = homepage only.

## COMPETITION STATUS (day 5)
G100: 120 pts | 2nd: 100 | 3rd: 80 | 4th: 60. Leading throughout.
Judges asked for: social feed, posts, chat, reactions - DELIVERED.
Still wanted: 24h Stories, multi-photo profiles, richer profile fields
(hobbies/fav place/fav dish), per-post link previews (OG images), notifications.

## THREADS PLATFORM (built - replaces /feed)
/threads = public timeline. /threads/[id] = post detail with all comments open.
/member/[id] = member profile + their personal post timeline.
Shared: lib/social.ts, lib/usePosts.ts (data + realtime),
app/components/SocialUI.tsx (Avatar, PostImages, Lightbox, PostCard),
app/components/Composer.tsx.
Features: post (text + up to 4 images), like, comment, comment-like,
reply-to-comment (1 level), repost, quote-post, share, edit + delete own
post/comment. Counts on cards. Realtime everywhere. Public VIEWS all;
only approved members act.
DB adds: posts.repost_of, posts.is_quote, post_comments.parent_id,
comment_likes table. RLS public-read, member-write.
UX: skeleton loaders, WhatsApp float only on homepage.
NOTE: PowerShell needs -LiteralPath for paths with [brackets].

## COMPETITION STATUS (day 5)
G100 120 pts | 2nd 100 | 3rd 80 | 4th 60.
Delivered what judges asked: feed, posts, reactions, comments, chat-like threads.
Still wanted: 24h Stories, multi-photo profiles, richer profile fields
(hobbies/fav place/fav dish), per-post OG link previews, push notifications.

## BATCH A+B (built)
- Quote posts render full original (avatar, name, role, body, images), clickable.
- Reposts appear on reposter profile with "reposted" attribution line.
- Avatars link to /member/[id] everywhere incl. composer.
- MobileTabs.tsx: bottom tab bar (sm:hidden) Home/Threads/Alerts/You + live
  unread badge. Mounted in layout.
- /notifications: like, comment, repost, quote, mention alerts. Realtime.
  Auto-marks read on view. notifications table.
- @mentions: notifyMentions() matches @handle to profile names, notifies,
  renders amber via <Body>.
- /bookmarks: private saved posts. bookmarks table. Star toggle on PostCard.
- lib/social.ts now exports notify(), notifyMentions(), Body renderer.
- usePosts({ authorId, bookmarksOnly }).

## DAY 6 - NAVIGATION + SPEED PASS (all built)
Mobile: slim top header (avatar->drawer, eagle, bookmarks star) + bottom tabs
(Home/Threads/Alerts/You, 4-col grid, h-14, avatar in You slot) + compose FAB
on /threads. Header & tabs auto-hide on scroll down, return on scroll up.
SideDrawer.tsx: slides in on avatar tap, drag-left to close, holds Threads,
Notifications, Bookmarks, The Idea, The 100, The Life, Eket, Gate, WhatsApp,
Log out. WhatsAppFloat removed from layout (lives in drawer).
Desktop: Navbar is sm:flex only, decluttered.
SPEED: globals.css has touch-action:manipulation, no tap-highlight,
-webkit-touch-callout:none (kills long-press copy menu), active:scale(0.94).
lib/haptic.ts tap() = navigator.vibrate. All actions OPTIMISTIC (instant
local state, DB syncs after) - like, repost, bookmark.
Touch targets: all action buttons h-11 min-w-11 (44px, Apple HIG).
Toast.tsx: ToastProvider in layout, useToast() for confirmations.
DB FIX: notifications table was missing; bookmarks had no policies.
ALWAYS verify with: select tablename, count(*) from pg_policies where
tablename in (...) group by tablename;

## COMPETITION (day 6): G100 222 | 2nd 155 | 3rd 123 | 4th 100
## REMAINING: 24h Stories (SQL already run, UI not built), richer profiles
## (hobbies/fav place/dish), multi-photo profiles, per-post OG previews.
