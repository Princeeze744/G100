"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, initials, timeAgo } from "../../lib/social";
import { tap } from "../../lib/haptic";

type Reel = {
  id: string;
  author_id: string;
  body: string;
  video_url: string;
  created_at: string;
  author: any;
  likes: number;
  liked: boolean;
  comments: number;
};

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (myId: string | null) => {
    const { data } = await supabase
      .from("posts")
      .select("id, author_id, body, video_url, created_at, author:profiles!posts_author_id_fkey(full_name, photo_url, accent, role_title)")
      .neq("video_url", "")
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = (data || []) as any[];
    const ids = rows.map((r) => r.id);
    const lc: Record<string, number> = {};
    const mine = new Set<string>();
    const cc: Record<string, number> = {};
    if (ids.length) {
      const [{ data: ls }, { data: cs }] = await Promise.all([
        supabase.from("post_likes").select("post_id, user_id").in("post_id", ids),
        supabase.from("post_comments").select("post_id").in("post_id", ids),
      ]);
      for (const l of ls || []) { lc[l.post_id] = (lc[l.post_id] || 0) + 1; if (myId && l.user_id === myId) mine.add(l.post_id); }
      for (const c of cs || []) cc[c.post_id] = (cc[c.post_id] || 0) + 1;
    }
    setReels(rows.map((r) => ({ ...r, likes: lc[r.id] || 0, liked: mine.has(r.id), comments: cc[r.id] || 0 })));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id || null;
      setUid(id);
      if (id) {
        const { data: p } = await supabase.from("profiles").select("approved").eq("id", id).single();
        setApproved(!!p?.approved);
      }
      await load(id);
      setReady(true);
    });
  }, [load]);

  // autoplay the reel in view
  useEffect(() => {
    if (!ready) return;
    const vids = Array.from(document.querySelectorAll("video[data-reel]")) as HTMLVideoElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && e.intersectionRatio > 0.6) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [ready, reels.length]);

  async function like(r: Reel) {
    if (!uid || !approved) return;
    tap();
    const next = !r.liked;
    setReels((prev) => prev.map((x) => x.id === r.id ? { ...x, liked: next, likes: x.likes + (next ? 1 : -1) } : x));
    if (next) await supabase.from("post_likes").insert({ post_id: r.id, user_id: uid });
    else await supabase.from("post_likes").delete().eq("post_id", r.id).eq("user_id", uid);
  }

  async function share(r: Reel) {
    const url = window.location.origin + "/threads/" + r.id;
    if (navigator.share) { try { await navigator.share({ title: "G100", text: r.body || "A reel from G100", url }); } catch {} }
    else window.open("https://wa.me/?text=" + encodeURIComponent(url), "_blank");
  }

  if (!ready) {
    return <main className="flex h-screen items-center justify-center bg-black"><p className="text-neutral-500">Loading Reels...</p></main>;
  }

  if (reels.length === 0) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">No reels yet</p>
        <p className="text-sm text-neutral-400">Post a video on Threads and it lands here.</p>
        <Link href="/threads" className="rounded-full bg-[var(--eye)] px-6 py-2.5 text-sm font-semibold text-[var(--ink)]">Go to Threads</Link>
      </main>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-30 snap-y snap-mandatory overflow-y-scroll bg-black" style={{ scrollbarWidth: "none" }}>
      {reels.map((r) => {
        const a = ACCENTS[r.author?.accent || "eye"];
        return (
          <section key={r.id} className="relative flex h-screen w-full snap-start items-center justify-center">
            <video
              data-reel
              src={r.video_url}
              muted={muted}
              loop
              playsInline
              onClick={() => { setMuted((m) => !m); tap(); }}
              className="h-full w-full object-contain"
            />

            {/* right action rail */}
            <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
              <button onClick={() => like(r)} disabled={!approved} className="flex flex-col items-center gap-1" aria-label="Like">
                <span className="text-3xl" style={{ color: r.liked ? "#e2603a" : "#fff" }}>{r.liked ? "\u2665" : "\u2661"}</span>
                <span className="text-xs text-white">{r.likes}</span>
              </button>
              <Link href={"/threads/" + r.id} className="flex flex-col items-center gap-1" aria-label="Comments">
                <span className="text-2xl text-white">{"\u{1F4AC}"}</span>
                <span className="text-xs text-white">{r.comments}</span>
              </Link>
              <button onClick={() => share(r)} className="flex h-12 w-12 items-center justify-center text-2xl text-white" aria-label="Share">{"\u21AA"}</button>
              <button onClick={() => setMuted((m) => !m)} className="flex h-12 w-12 items-center justify-center text-xl text-white" aria-label="Sound">
                {muted ? "\u{1F507}" : "\u{1F509}"}
              </button>
            </div>

            {/* bottom info */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 pb-24 pt-24" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
              <div className="pointer-events-auto px-4">
                <Link href={"/member/" + r.author_id} className="flex items-center gap-2.5">
                  <span className="h-10 w-10 overflow-hidden rounded-full border-2" style={{ borderColor: a }}>
                    {r.author?.photo_url ? (
                      <img src={r.author.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-white/10 text-xs text-white">{initials(r.author?.full_name)}</span>
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{r.author?.full_name || "G100 Member"}</span>
                    <span className="block text-xs text-white/60">{timeAgo(r.created_at)}</span>
                  </span>
                </Link>
                {r.body && <p className="mt-3 max-w-[80%] text-sm leading-relaxed text-white/95">{r.body}</p>}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
