"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { shrinkImage } from "../../lib/shrinkImage";

const ACCENTS: Record<string, string> = {
  eye: "#e8a33d",
  ember: "#e2603a",
  surf: "#3dbfb0",
};
const ease = [0.25, 0.1, 0.25, 1] as const;

type Author = { full_name: string; photo_url: string; accent: string; role_title: string };
type Post = {
  id: string;
  author_id: string;
  body: string;
  image_urls: string[];
  created_at: string;
  author: Author | null;
  likes: number;
  liked: boolean;
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}
function initials(n: string) {
  return n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ url, name, accent, size }: { url?: string; name?: string; accent: string; size: number }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-full border" style={{ width: size, height: size, borderColor: accent + "88" }}>
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-neutral-300" style={{ fontSize: size * 0.32 }}>
          {initials(name || "G")}
        </div>
      )}
    </div>
  );
}

// Single image = full natural shape. Multi = tidy grid tiles.
function PostImages({ urls, onOpen }: { urls: string[]; onOpen: (i: number) => void }) {
  const imgs = urls.filter(Boolean);
  if (imgs.length === 0) return null;

  if (imgs.length === 1) {
    return (
      <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/5" style={{ maxHeight: "80vh" }}>
        <div
          className="absolute inset-0 scale-125"
          style={{
            backgroundImage: "url(" + imgs[0] + ")",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(28px) brightness(0.5)",
          }}
        />
        <img
          src={imgs[0]}
          alt=""
          onClick={() => onOpen(0)}
          className="relative mx-auto block h-auto w-full cursor-zoom-in"
          style={{ maxHeight: "80vh", objectFit: "contain" }}
          loading="lazy"
        />
      </div>
    );
  }

  const tile = "relative overflow-hidden bg-black/30 cursor-zoom-in";
  const imgCls = "h-full w-full object-cover";

  if (imgs.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10" }}>
        {imgs.map((u, i) => (
          <div key={i} className={tile} onClick={() => onOpen(i)}>
            <img src={u} alt="" className={imgCls} loading="lazy" />
          </div>
        ))}
      </div>
    );
  }

  if (imgs.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10" }}>
        <div className={tile} onClick={() => onOpen(0)}>
          <img src={imgs[0]} alt="" className={imgCls} loading="lazy" />
        </div>
        <div className="grid grid-rows-2 gap-1">
          {[1, 2].map((i) => (
            <div key={i} className={tile} onClick={() => onOpen(i)}>
              <img src={imgs[i]} alt="" className={imgCls} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4+
  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1" }}>
      {imgs.slice(0, 4).map((u, i) => (
        <div key={i} className={tile} onClick={() => onOpen(i)}>
          <img src={u} alt="" className={imgCls} loading="lazy" />
          {i === 3 && imgs.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xl font-bold text-white">
              +{imgs.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Full-screen lightbox with swipe between images
function Lightbox({ urls, index, onClose }: { urls: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, urls.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [urls.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-neutral-200 transition hover:bg-white/10"
      >
        x
      </button>

      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setI((v) => Math.max(v - 1, 0)); }}
            disabled={i === 0}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-lg text-neutral-200 transition hover:bg-white/10 disabled:opacity-30"
          >
            {"\u2039"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setI((v) => Math.min(v + 1, urls.length - 1)); }}
            disabled={i === urls.length - 1}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-lg text-neutral-200 transition hover:bg-white/10 disabled:opacity-30"
          >
            {"\u203A"}
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={i}
          src={urls[i]}
          alt=""
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] max-w-full object-contain"
        />
      </AnimatePresence>

      {urls.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
          {urls.map((_, d) => (
            <span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: d === i ? "#fff" : "rgba(255,255,255,0.35)" }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CommentThread({ postId, uid, approved, accent }: { postId: string; uid: string | null; approved: boolean; accent: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("id, body, created_at, author_id, author:profiles!post_comments_author_id_fkey(full_name, photo_url, accent)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setRows(data || []);
  }, [postId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    const ch = supabase
      .channel("comments-" + postId)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments", filter: "post_id=eq." + postId }, () => { if (open) load(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [postId, open, load]);

  async function send() {
    if (!uid || !text.trim()) return;
    setSending(true);
    await supabase.from("post_comments").insert({ post_id: postId, author_id: uid, body: text.trim() });
    setText("");
    setSending(false);
    load();
  }

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <button onClick={() => setOpen((o) => !o)} className="text-xs text-neutral-400 transition hover:text-[var(--bone)]">
        {open ? "Hide replies" : (rows.length > 0 ? rows.length + (rows.length === 1 ? " reply" : " replies") : "Reply")}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {rows.map((c) => {
            const ca = ({ eye: "#e8a33d", ember: "#e2603a", surf: "#3dbfb0" } as Record<string, string>)[c.author?.accent || "eye"];
            return (
              <div key={c.id} className="flex gap-2.5">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: ca + "88" }}>
                  {c.author?.photo_url ? (
                    <img src={c.author.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-[0.55rem] text-neutral-300">
                      {(c.author?.full_name || "G").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 rounded-2xl bg-white/[0.04] px-3 py-2">
                  <p className="text-xs font-semibold">{c.author?.full_name || "Member"}</p>
                  <p className="text-sm text-neutral-200">{c.body}</p>
                </div>
              </div>
            );
          })}

          {approved ? (
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Write a reply..."
                className="flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-[var(--bone)] outline-none placeholder:text-neutral-500 focus:border-[var(--eye)]"
              />
              <button onClick={send} disabled={sending || !text.trim()} className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--ink)] disabled:opacity-40" style={{ background: accent }}>
                Send
              </button>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Log in as a member to reply.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [me, setMe] = useState<Author | null>(null);
  const [approved, setApproved] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [box, setBox] = useState<{ urls: string[]; index: number } | null>(null);

  const load = useCallback(async (myId: string | null) => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, author_id, body, image_urls, created_at, author:profiles!posts_author_id_fkey(full_name, photo_url, accent, role_title)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) { setErr(error.message); return; }
    const rows = (data || []) as any[];
    const ids = rows.map((r) => r.id);
    const likesByPost: Record<string, number> = {};
    const likedSet = new Set<string>();
    if (ids.length) {
      const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", ids);
      for (const l of likes || []) {
        likesByPost[l.post_id] = (likesByPost[l.post_id] || 0) + 1;
        if (myId && l.user_id === myId) likedSet.add(l.post_id);
      }
    }
    setPosts(rows.map((r) => ({
      ...r,
      image_urls: r.image_urls || [],
      author: r.author,
      likes: likesByPost[r.id] || 0,
      liked: likedSet.has(r.id),
    })));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const myId = data.user?.id || null;
      setUid(myId);
      if (myId) {
        const { data: prof } = await supabase.from("profiles").select("full_name, photo_url, accent, role_title, approved").eq("id", myId).single();
        if (prof) { setMe(prof as Author); setApproved(!!prof.approved); }
      }
      await load(myId);
      setReady(true);
    });
  }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => load(uid))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, load]);

  function addFiles(list: FileList) {
    const incoming = Array.from(list).slice(0, 4 - files.length);
    const next = [...files, ...incoming].slice(0, 4);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }
  function removeFile(i: number) {
    const next = files.filter((_, x) => x !== i);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function submit() {
    if (!uid || (!body.trim() && files.length === 0)) return;
    setPosting(true); setErr("");
    const urls: string[] = [];
    for (const file of files) {
      const small = await shrinkImage(file, 1400);
      const path = uid + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + ".jpg";
      const { error: upErr } = await supabase.storage.from("posts").upload(path, small, { contentType: "image/jpeg" });
      if (upErr) { setErr("Image upload failed: " + upErr.message); setPosting(false); return; }
      urls.push(supabase.storage.from("posts").getPublicUrl(path).data.publicUrl);
    }
    const { error } = await supabase.from("posts").insert({
      author_id: uid,
      body: body.trim(),
      image_url: urls[0] || "",
      image_urls: urls,
    });
    if (error) { setErr("Post failed: " + error.message); setPosting(false); return; }
    setBody(""); setFiles([]); setPreviews([]); setPosting(false);
    await load(uid);
  }

  async function like(p: Post) {
    if (!uid || !approved) return;
    setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x));
    if (p.liked) await supabase.from("post_likes").delete().eq("post_id", p.id).eq("user_id", uid);
    else await supabase.from("post_likes").insert({ post_id: p.id, user_id: uid });
  }

  async function share(p: Post) {
    const text = (p.body || "A post from G100").slice(0, 100);
    const url = window.location.origin + "/feed";
    if (navigator.share) { try { await navigator.share({ title: "G100", text, url }); } catch {} }
    else window.open("https://wa.me/?text=" + encodeURIComponent(text + " - " + url), "_blank");
  }

  async function del(p: Post) {
    await supabase.from("posts").delete().eq("id", p.id);
    load(uid);
  }

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-400">Loading the feed...</p></main>;
  }

  const myAccent = ACCENTS[me?.accent || "eye"];

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-24 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">The Feed</h1>
        <p className="text-sm text-neutral-400">The voice of G100.</p>
      </div>

      {approved ? (
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex gap-3">
            <Avatar url={me?.photo_url} name={me?.full_name} accent={myAccent} size={40} />
            <div className="flex-1">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's on your mind?" className="min-h-[60px] w-full resize-none bg-transparent text-sm text-[var(--bone)] outline-none placeholder:text-neutral-500" />
              {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => removeFile(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white" aria-label="Remove">x</button>
                    </div>
                  ))}
                </div>
              )}
              {err && <p className="mt-2 text-xs text-[var(--ember)]">{err}</p>}
              <div className="mt-3 flex items-center justify-between">
                <button onClick={() => fileRef.current?.click()} disabled={files.length >= 4} className="text-xs text-neutral-400 transition hover:text-[var(--eye)] disabled:opacity-40">
                  + Photo {files.length > 0 ? "(" + files.length + "/4)" : ""}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }} />
                <button onClick={submit} disabled={posting || (!body.trim() && files.length === 0)} className="rounded-full px-5 py-2 text-xs font-semibold text-[var(--ink)] transition disabled:opacity-40" style={{ background: myAccent }}>{posting ? "Posting..." : "Post"}</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-[var(--eye)]/25 bg-[var(--eye)]/10 p-5">
          <p className="text-sm text-neutral-200">{uid ? "Awaiting approval to post." : "Log in to post, like and share."}</p>
          <Link href={uid ? "/profile" : "/login"} className="shrink-0 rounded-full bg-[var(--eye)] px-4 py-2 text-xs font-semibold text-[var(--ink)]">{uid ? "My Profile" : "Log in"}</Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {posts.map((p) => {
            const a = ACCENTS[p.author?.accent || "eye"];
            const hot = p.likes >= 3;
            return (
              <motion.article key={p.id} layout initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4, ease }} className="relative overflow-hidden rounded-3xl border bg-white/[0.03] p-5" style={{ borderColor: hot ? a + "66" : "rgba(255,255,255,0.08)", boxShadow: hot ? "0 0 30px " + a + "22" : "none" }}>
                <div className="absolute left-0 top-0 h-full w-1" style={{ background: a, opacity: hot ? 0.9 : 0.4 }} />
                <div className="flex items-center gap-3">
                  <Avatar url={p.author?.photo_url} name={p.author?.full_name} accent={a} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.author?.full_name || "G100 Member"}</p>
                    <p className="truncate text-xs text-neutral-400">{p.author?.role_title || "Visionary Leader"} {"\u00B7"} {timeAgo(p.created_at)}</p>
                  </div>
                  {p.author_id === uid && (<button onClick={() => del(p)} className="text-xs text-neutral-500 transition hover:text-[var(--ember)]" aria-label="Delete">Delete</button>)}
                </div>
                {p.body && <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-neutral-100">{p.body}</p>}
                <PostImages urls={p.image_urls} onOpen={(i) => setBox({ urls: p.image_urls.filter(Boolean), index: i })} />
                <div className="mt-4 flex items-center gap-6">
                  <button onClick={() => like(p)} disabled={!approved} className="flex items-center gap-1.5 text-sm disabled:opacity-50" style={{ color: p.liked ? a : "var(--bone)" }}>
                    <span className="text-base">{p.liked ? "\u2665" : "\u2661"}</span>
                    <span className="tabular-nums">{p.likes}</span>
                  </button>
                  <button onClick={() => share(p)} className="text-sm text-neutral-400 transition hover:text-[var(--bone)]">Share</button>
                </div>
                <CommentThread postId={p.id} uid={uid} approved={approved} accent={a} />
              </motion.article>
            );
          })}
        </AnimatePresence>
        {posts.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">No posts yet.</p>}
      </div>

      <AnimatePresence>
        {box && <Lightbox urls={box.urls} index={box.index} onClose={() => setBox(null)} />}
      </AnimatePresence>
    </main>
  );
}




