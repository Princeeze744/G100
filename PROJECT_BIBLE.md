# G100 — PROJECT BIBLE (Master Handoff)

> NEW CHAT: read this fully before touching anything.
> LIVE product with real daily users. Do not rebuild. Extend carefully.
> Built in 6 days with Claude's guidance. Owner/dev: Ochidi Prince (Nigeria).

## STATUS (day 6)
Competition: top 5 of 100 engineers across 20 countries.
G100 400 pts | 2nd 350 | 3rd ~200 | 4th ~150. Led throughout.
Judges asked for a living social platform (feed, posts, reactions, comments,
chat/DMs, reels, stories) — ALL DELIVERED.

## WHAT IT IS
Website + installable PWA for a private Nigerian community of 100 visionary
leaders, founded 28 Feb 2026 in Port Harcourt. Both a cinematic award
showpiece AND a working social platform.
Brand: an eagle whose body forms "G100" — "At first glance an eagle, on
closer look a hundred leaders." Admins: Rejoice, Femi, Shimah, Prince.

## DESIGN LAW (never violate)
Nothing chosen, everything derived from the G100 story. Restraint everywhere
so signature moments detonate. Mobile-first. Reduced-motion honoured.
Full derivation in DESIGN.md.
Tokens (app/globals.css): --ink #0d0b09, --bone #f5f2ec,
--eye #e8a33d (amber accent, the eagle eye, ~10% rationed),
--ember #e2603a, --surf #3dbfb0.
Gait: cubic-bezier(0.25,0.1,0.25,1) ~800ms — glide, never bounce.
Font: Space Grotesk. Film grain 3.5%. Members pick a personal accent.

## STACK
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 +
Framer Motion + Lenis. Custom canvas particle engine (no Three.js).
Supabase (Auth + Postgres + Storage, RLS). Vercel auto-deploy on push.
PWA installable + offline service worker.
Repo: github.com/Princeeze744/G100 | Live: g100-eight.vercel.app

## WORKFLOW (critical — how we work)
- Windows PowerShell + VS Code. Node v24.
- Deliver code as: @'' ... ''@ | Set-Content -Encoding UTF8 path
- PowerShell EATS lone "<a" JSX lines — keep JSX compact.
- Paths with [brackets] REQUIRE -LiteralPath.
- Big/risky files: build in container, user downloads, Copy-Item in.
  Browser appends " (1)", " (2)" — ALWAYS ls Downloads first.
- Prefer .Replace() with exact strings over regex; regex over-matches and
  has corrupted page.tsx twice. git checkout -- <file> rescues it.
- Always: npm run build → git add -A → git commit → git push
- Env keys in .env.local AND Vercel dashboard env vars.
- After ANY new table: verify with
  select tablename, count(*) from pg_policies where tablename in (...)
  group by tablename;   (silent RLS failures burned us 3 times)

## PAGES
/ homepage film: ParticleEagle hero (1500 pts assemble, cursor scatters) +
  FloatingFaces constellation + Origin (2026 parallax founding date, The
  Covenant, The Founders) + EagleReveal + Formation + The 100 + The Life
  (Eket countdown) + Gallery (albums, FLIP filter, Ken Burns lightbox)
/threads          public timeline + Stories tray + Composer
/threads/[id]     server page (generateMetadata OG) + ThreadClient.tsx
/member/[id]      server page (OG) + MemberClient.tsx — profile + timeline
/reels            full-screen vertical video feed
/messages         DM list + horizontal member directory
/messages/[id]    chat (realtime, swipe-to-reply, images)
/notifications /bookmarks /profile /admin (The Gate) /eket /join /login

## FEATURES
Posts: text + up to 4 images + video. Like, comment, comment-like,
reply-to-comment (1 level), repost, quote-post, bookmark, share, edit/delete
own. @mentions. Counts on cards. Realtime.
Stories: 24h expiry, photo/video, captions, multi-upload, progress bars,
5s auto-advance, tap L/R, HOLD to pause, likes, replies, "Seen by N".
Reels: any post with video_url. Snap-scroll, IO autoplay, tap to unmute.
DMs: realtime, seen receipts, image sending, swipe-right-to-reply with
quoted preview, unread badges.
Auth: signup → admin approves in The Gate → appears in The 100.
PUBLIC VIEWS EVERYTHING; only approved members can act.

## DATABASE
profiles (full_name, role_title, city, bio, services, education, hobbies,
  fav_place, fav_dish, birthday, photos[], instagram, twitter, linkedin,
  whatsapp, photo_url, accent, approved, is_admin) + is_admin() fn +
  auto-create trigger
posts (author_id, body, image_url, image_urls[], video_url, repost_of,
  is_quote), post_likes, post_comments (parent_id), comment_likes,
bookmarks, notifications (user_id, actor_id, type, post_id, read),
stories (expires_at, caption, video_url), story_likes, story_replies,
story_views, conversations (user_a, user_b, last_message, last_at),
messages (conversation_id, sender_id, body, image_url, read, reply_to),
gallery (album), event_rsvps
Buckets: avatars, posts, gallery. Images shrunk client-side first.

## KEY FILES
lib/: supabaseClient.ts, social.ts (ACCENTS, timeAgo, notify,
  notifyMentions, types), usePosts.ts (data + realtime + MEMORY CACHE),
  shrinkImage.ts, haptic.ts
app/components/: SocialUI.tsx (Avatar, Body, PostImages, Lightbox,
  PostCard), Composer.tsx, Stories.tsx, MobileTabs.tsx (bottom tabs + slim
  header + FAB + scroll-hide + DM/alert badges), SideDrawer.tsx,
  Navbar.tsx (desktop only), Toast.tsx, LazyMount.tsx, ParticleEagle.tsx,
  FloatingFaces.tsx, Origin.tsx, EagleReveal.tsx, Formation.tsx,
  Members.tsx, Gallery.tsx, GalleryManager.tsx, EketCountdown.tsx

## HARD-WON UX RULES (do not regress)
- Touch targets >= 44px (h-11 min-w-11). Smaller doubles error rates.
- All actions OPTIMISTIC — instant local state, DB syncs after.
- globals.css: touch-action:manipulation, no tap-highlight,
  -webkit-touch-callout:none, active:scale(0.94).
- INPUTS MUST BE 16px on mobile or iOS Safari auto-zooms (caused a
  "the app is zooming" bug). Viewport: maximumScale 1, userScalable false,
  viewportFit cover, interactiveWidget "resizes-content".
- iOS shows a system toolbar (up/down/Done) over <textarea>. Use <input>
  for chat, and the page must SCROLL like a normal document (not a locked
  100vh flex column) so iOS settles the toolbar below. Threads got this
  right naturally; DMs needed restructuring to match.
- Single feed image: full/uncropped over a blurred-darkened copy of ITSELF
  as backdrop. KEEP THE BLUR. 2-4 images: equal grid tiles. Tap → swipeable
  lightbox with n/total counter.
- Stories timer MUST key to [open?.g, open?.i] and groups must NOT reload
  while the player is open (openRef guard) or playback loops backwards.
- Notifications only for actions involving YOU (never every new post).
  Badges clear via window events "g100-notifs-read" / "g100-dm-read".
- Skeleton loaders, NEVER "Loading..." text.
- Video src + "#t=0.1" forces a first-frame thumbnail instead of black.
- usePosts has an in-memory CACHE so returning to a page renders instantly.
- Bottom tabs + header hide entirely inside /messages/[id] (X behaviour).

## PERFORMANCE (protect this)
GTmetrix ~89%, LCP 2.0s, TBT 31ms, CLS 0, ~425KB.
Via lazy-mount below-fold, dynamic imports, batched particle renderer,
client image compression, composited-only animations, memory cache.
Measure on pagespeed.web.dev / GTmetrix — NOT localhost, NOT with browser
extensions (they poison the score).

## OPEN ITEMS
1. Multiline DM input without the iOS toolbar (needs contenteditable div —
   <textarea> triggers the toolbar, <input> can't do newlines).
2. Member profile tabs (Posts/Reels/Reposts) styled like X/Instagram.
3. True push notifications (Web Push — app closed).
4. Richer profile UI for hobbies/fav_place/fav_dish/photos[] (DB columns
   exist, form not built).
5. Reels + quote-post visual polish toward X/Instagram standard.
6. Submission kit: walkthrough video, pitch doc, honest Tear Test scoring.
