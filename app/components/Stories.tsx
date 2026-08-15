"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { shrinkImage } from "../../lib/shrinkImage";
import { ACCENTS, EASE, initials, timeAgo } from "../../lib/social";
import { tap } from "../../lib/haptic";

type Story = {
  id: string;
  author_id: string;
  image_url: string;
  video_url?: string;
  caption?: string;
  created_at: string;
  author: any;
};

type Group = { authorId: string; author: any; items: Story[] };

const DURATION = 5000;

export default function Stories({ uid, me }: { uid: string | null; me: any }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState<{ g: number; i: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<any>(null);
  const pausedRef = useRef(false);
  const pauseMs = useRef(0);
  const pauseStart = useRef(0);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("stories")
      .select("id, author_id, image_url, video_url, caption, created_at, author:profiles!stories_author_id_fkey(full_name, photo_url, accent)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    const byAuthor: Record<string, Group> = {};
    for (const s of (data || []) as any[]) {
      if (!byAuthor[s.author_id]) byAuthor[s.author_id] = { authorId: s.author_id, author: s.author, items: [] };
      byAuthor[s.author_id].items.push(s);
    }
    const list = Object.values(byAuthor);
    list.sort((a, b) => (a.authorId === uid ? -1 : b.authorId === uid ? 1 : 0));
    setGroups(list);
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase.channel("stories")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // auto-advance
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) pauseStart.current = Date.now();
    else if (pauseStart.current) { pauseMs.current += Date.now() - pauseStart.current; pauseStart.current = 0; }
  }, [paused]);

  useEffect(() => {
    if (!open) return;
    const st = groups[open.g]?.items[open.i];
    if (!st) return;
    setReply(""); setSent(false); setPaused(false);
    pauseMs.current = 0; pauseStart.current = 0;
    (async () => {
      const { data: ls } = await supabase.from("story_likes").select("user_id").eq("story_id", st.id);
      setLikeCount((ls || []).length);
      setLiked(!!(uid && (ls || []).some((l: any) => l.user_id === uid)));
      const { data: vs } = await supabase.from("story_views").select("user_id").eq("story_id", st.id);
      setViewCount((vs || []).length);
      if (uid && st.author_id !== uid) {
        await supabase.from("story_views").upsert({ story_id: st.id, user_id: uid }, { onConflict: "story_id,user_id" });
      }
    })();
  }, [open, uid]);

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    const started = Date.now();
    timer.current = setInterval(() => {
      if (pausedRef.current) return;
      const p = Math.min((Date.now() - started - pauseMs.current) / DURATION, 1);
      setProgress(p);
      if (p >= 1) next();
    }, 50);
    return () => clearInterval(timer.current);
  }, [open]);

  function next() {
    clearInterval(timer.current);
    setOpen((o) => {
      if (!o) return null;
      const g = groups[o.g];
      if (o.i + 1 < g.items.length) return { g: o.g, i: o.i + 1 };
      if (o.g + 1 < groups.length) return { g: o.g + 1, i: 0 };
      return null;
    });
  }

  function prev() {
    clearInterval(timer.current);
    setOpen((o) => {
      if (!o) return null;
      if (o.i > 0) return { g: o.g, i: o.i - 1 };
      if (o.g > 0) return { g: o.g - 1, i: 0 };
      return o;
    });
  }

  async function likeStory(st: Story) {
    if (!uid) return;
    tap();
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    if (next) await supabase.from("story_likes").insert({ story_id: st.id, user_id: uid });
    else await supabase.from("story_likes").delete().eq("story_id", st.id).eq("user_id", uid);
  }

  async function sendReply(st: Story) {
    if (!uid || !reply.trim()) return;
    tap();
    await supabase.from("story_replies").insert({ story_id: st.id, author_id: uid, body: reply.trim() });
    setReply("");
    setSent(true);
    setTimeout(() => setSent(false), 1800);
  }

  async function shareStory(st: Story) {
    const url = window.location.origin + "/threads";
    const text = (st.caption || "A story from G100");
    if (navigator.share) { try { await navigator.share({ title: "G100", text, url }); } catch {} }
    else window.open("https://wa.me/?text=" + encodeURIComponent(text + " - " + url), "_blank");
  }

  async function uploadMany(list: FileList) {
    for (const f of Array.from(list)) await upload(f);
  }

  async function upload(file: File) {
    if (!uid) return;
    setUploading(true);
    tap();
    const isVideo = file.type.startsWith("video/");
    let blob: Blob = file;
    if (!isVideo) blob = await shrinkImage(file, 1400);
    const ext = isVideo ? ".mp4" : ".jpg";
    const path = uid + "/story-" + Date.now() + ext;
    const { error } = await supabase.storage.from("posts").upload(path, blob, { contentType: isVideo ? file.type : "image/jpeg" });
    if (!error) {
      const url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
      const cap = typeof window !== "undefined" ? (window.prompt("Add a caption (optional)") || "") : "";
      await supabase.from("stories").insert({
        author_id: uid,
        image_url: isVideo ? "" : url,
        video_url: isVideo ? url : "",
        caption: cap,
      });
      await load();
    }
    setUploading(false);
  }

  const mineIdx = groups.findIndex((g) => g.authorId === uid);
  const cur = open ? groups[open.g]?.items[open.i] : null;

  return (
    <>
      <div className="mb-6 flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {uid && (
          <div className="relative flex shrink-0 flex-col items-center gap-1.5">
            <button
              onClick={() => { tap(); if (mineIdx >= 0) setOpen({ g: mineIdx, i: 0 }); else fileRef.current?.click(); }}
              aria-label={mineIdx >= 0 ? "View your story" : "Add story"}
              className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full p-[2.5px]"
              style={{ background: mineIdx >= 0 ? "linear-gradient(135deg, " + ACCENTS[me?.accent || "eye"] + ", var(--ember))" : "transparent", border: mineIdx >= 0 ? "none" : "2px dashed " + ACCENTS[me?.accent || "eye"] + "66" }}
            >
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#0d0b09]">
                {me?.photo_url ? (
                  <img src={me.photo_url} alt="" className="h-full w-full object-cover" style={{ opacity: mineIdx >= 0 ? 1 : 0.7 }} />
                ) : (
                  <span className="text-xs text-neutral-400">{initials(me?.full_name)}</span>
                )}
              </span>
            </button>
            <button
              onClick={() => { tap(); fileRef.current?.click(); }}
              aria-label="Add to your story"
              className="absolute right-0 top-[2.9rem] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0d0b09] text-sm font-bold text-[var(--ink)]"
              style={{ background: ACCENTS[me?.accent || "eye"] }}
            >
              {uploading ? "\u00B7\u00B7" : "+"}
            </button>
            <span className="text-[0.65rem] text-neutral-400">Your story</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" multiple onChange={(e) => { if (e.target.files?.length) uploadMany(e.target.files); e.target.value = ""; }} />

        {groups.map((g, gi) => {
          const a = ACCENTS[g.author?.accent || "eye"];
          if (g.authorId === uid) return null;
          return (
            <button key={g.authorId} onClick={() => { tap(); setOpen({ g: gi, i: 0 }); }} className="flex shrink-0 flex-col items-center gap-1.5">
              <span className="flex h-16 w-16 items-center justify-center rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg, " + a + ", var(--ember))" }}>
                <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#0d0b09]">
                  {g.author?.photo_url ? (
                    <img src={g.author.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-neutral-300">{initials(g.author?.full_name)}</span>
                  )}
                </span>
              </span>
              <span className="max-w-16 truncate text-[0.65rem] text-neutral-300">
                {g.authorId === uid ? "You" : (g.author?.full_name || "Member").split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && cur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black"
          >
            <div className="flex gap-1 px-3 pt-3">
              {groups[open.g].items.map((_, i) => (
                <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full bg-white" style={{ width: i < open.i ? "100%" : i === open.i ? progress * 100 + "%" : "0%" }} />
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <Link href={"/member/" + cur.author_id} className="flex items-center gap-2.5">
                <span className="h-9 w-9 overflow-hidden rounded-full border" style={{ borderColor: ACCENTS[cur.author?.accent || "eye"] }}>
                  {cur.author?.photo_url ? <img src={cur.author.photo_url} alt="" className="h-full w-full object-cover" /> : null}
                </span>
                <span className="text-sm font-semibold text-white">{cur.author?.full_name || "Member"}</span>
              </Link>
              <span className="text-xs text-white/50">{timeAgo(cur.created_at)}</span>
              {cur.author_id === uid && (
                <button onClick={async () => { await supabase.from("stories").delete().eq("id", cur.id); setOpen(null); load(); }} className="ml-auto mr-2 text-xs text-white/60">Delete</button>
              )}
              <button onClick={() => setOpen(null)} aria-label="Close" className={"flex h-10 w-10 items-center justify-center text-2xl text-white/80 " + (cur.author_id === uid ? "" : "ml-auto")}>×</button>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              {cur.video_url ? (
                <video src={cur.video_url} autoPlay playsInline controls className="max-h-full max-w-full" />
              ) : (
                <img src={cur.image_url} alt="" className="max-h-full max-w-full object-contain" />
              )}
              {cur.caption && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 pb-24 pt-20" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
                  <p className="px-6 text-center text-lg font-semibold leading-snug text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
                    {cur.caption}
                  </p>
                </div>
              )}
              <button onClick={prev} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} className="absolute bottom-24 left-0 top-0 w-1/3" aria-label="Previous" />
              <button onClick={next} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} className="absolute bottom-24 right-0 top-0 w-1/3" aria-label="Next" />
            </div>

            <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
              {cur.author_id === uid ? (
                <div className="flex items-center gap-5 text-sm text-white/70">
                  <span>{"\u25C9"} Seen by {viewCount}</span>
                  <span style={{ color: likeCount > 0 ? "#e2603a" : undefined }}>{"\u2665"} {likeCount}</span>
                  <button onClick={() => shareStory(cur)} className="ml-auto flex h-11 w-11 items-center justify-center text-xl">{"\u21AA"}</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                    onKeyDown={(e) => e.key === "Enter" && sendReply(cur)}
                    placeholder={sent ? "Sent!" : "Reply to " + (cur.author?.full_name || "story").split(" ")[0] + "..."}
                    className="h-11 flex-1 rounded-full border border-white/30 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/60"
                  />
                  <button onClick={() => likeStory(cur)} aria-label="Like story" className="flex h-11 w-11 items-center justify-center text-2xl" style={{ color: liked ? "#e2603a" : "#fff" }}>
                    {liked ? "\u2665" : "\u2661"}
                  </button>
                  <button onClick={() => shareStory(cur)} aria-label="Share story" className="flex h-11 w-11 items-center justify-center text-xl text-white">{"\u21AA"}</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
