"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { ACCENTS, EASE, timeAgo, initials, Post } from "../../lib/social";

export function Avatar({ url, name, accent, size, href }: { url?: string; name?: string; accent: string; size: number; href?: string }) {
  const inner = (
    <div className="relative shrink-0 overflow-hidden rounded-full border transition hover:opacity-85" style={{ width: size, height: size, borderColor: accent + "88" }}>
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-neutral-300" style={{ fontSize: size * 0.32 }}>
          {initials(name)}
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function PostImages({ urls, onOpen }: { urls: string[]; onOpen: (i: number) => void }) {
  const imgs = (urls || []).filter(Boolean);
  if (imgs.length === 0) return null;

  if (imgs.length === 1) {
    return (
      <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/5" style={{ maxHeight: "80vh" }}>
        <div className="absolute inset-0 scale-125" style={{ backgroundImage: "url(" + imgs[0] + ")", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(28px) brightness(0.5)" }} />
        <img src={imgs[0]} alt="" onClick={(e) => { e.stopPropagation(); onOpen(0); }} className="relative mx-auto block h-auto w-full cursor-zoom-in" style={{ maxHeight: "80vh", objectFit: "contain" }} loading="lazy" />
      </div>
    );
  }

  const tile = "relative overflow-hidden bg-black/30 cursor-zoom-in";
  const imgCls = "h-full w-full object-cover";

  if (imgs.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10" }}>
        {imgs.map((u, i) => (
          <div key={i} className={tile} onClick={(e) => { e.stopPropagation(); onOpen(i); }}>
            <img src={u} alt="" className={imgCls} loading="lazy" />
          </div>
        ))}
      </div>
    );
  }

  if (imgs.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "16/10" }}>
        <div className={tile} onClick={(e) => { e.stopPropagation(); onOpen(0); }}>
          <img src={imgs[0]} alt="" className={imgCls} loading="lazy" />
        </div>
        <div className="grid grid-rows-2 gap-1">
          {[1, 2].map((i) => (
            <div key={i} className={tile} onClick={(e) => { e.stopPropagation(); onOpen(i); }}>
              <img src={imgs[i]} alt="" className={imgCls} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "1/1" }}>
      {imgs.slice(0, 4).map((u, i) => (
        <div key={i} className={tile} onClick={(e) => { e.stopPropagation(); onOpen(i); }}>
          <img src={u} alt="" className={imgCls} loading="lazy" />
          {i === 3 && imgs.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xl font-bold text-white">+{imgs.length - 4}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Lightbox({ urls, index, onClose }: { urls: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, urls.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [urls.length, onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4">
      <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-neutral-200 transition hover:bg-white/10">x</button>
      {urls.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setI((v) => Math.max(v - 1, 0)); }} disabled={i === 0} aria-label="Previous" className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-lg text-neutral-200 transition hover:bg-white/10 disabled:opacity-30">{"\u2039"}</button>
          <button onClick={(e) => { e.stopPropagation(); setI((v) => Math.min(v + 1, urls.length - 1)); }} disabled={i === urls.length - 1} aria-label="Next" className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-lg text-neutral-200 transition hover:bg-white/10 disabled:opacity-30">{"\u203A"}</button>
        </>
      )}
      <AnimatePresence mode="wait">
        <motion.img key={i} src={urls[i]} alt="" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-full object-contain" />
      </AnimatePresence>
      {urls.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
          {urls.map((_, d) => (<span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: d === i ? "#fff" : "rgba(255,255,255,0.35)" }} />))}
        </div>
      )}
    </motion.div>
  );
}

export function PostCard({
  p, uid, approved, onChanged, embedded,
}: {
  p: Post; uid: string | null; approved: boolean; onChanged: () => void; embedded?: boolean;
}) {
  const a = ACCENTS[p.author?.accent || "eye"];
  const [box, setBox] = useState<{ urls: string[]; index: number } | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(p.body);
  const hot = p.likes + p.reposts >= 4;

  const isPlainRepost = !!p.repost_of && !p.is_quote;
  const orig = p.original;
  const shownAuthor = isPlainRepost ? orig?.author : p.author;
  const shownAuthorId = isPlainRepost ? orig?.author_id : p.author_id;
  const shownBody = isPlainRepost ? orig?.body : p.body;
  const shownImages = (isPlainRepost ? orig?.image_urls : p.image_urls) || [];

  async function like() {
    if (!uid || !approved) return;
    if (p.liked) await supabase.from("post_likes").delete().eq("post_id", p.id).eq("user_id", uid);
    else await supabase.from("post_likes").insert({ post_id: p.id, user_id: uid });
    onChanged();
  }

  async function repost() {
    if (!uid || !approved) return;
    if (p.reposted) {
      await supabase.from("posts").delete().eq("author_id", uid).eq("repost_of", p.id).eq("is_quote", false);
    } else {
      await supabase.from("posts").insert({ author_id: uid, body: "", image_urls: [], repost_of: p.id, is_quote: false });
    }
    onChanged();
  }

  async function sendQuote() {
    if (!uid || !quoteText.trim()) return;
    await supabase.from("posts").insert({ author_id: uid, body: quoteText.trim(), image_urls: [], repost_of: p.id, is_quote: true });
    setQuoteText("");
    setQuoteOpen(false);
    onChanged();
  }

  async function saveEdit() {
    await supabase.from("posts").update({ body: editText.trim() }).eq("id", p.id);
    setEditing(false);
    onChanged();
  }

  async function share() {
    const url = window.location.origin + "/threads/" + p.id;
    const text = (p.body || "A post from G100").slice(0, 100);
    if (navigator.share) { try { await navigator.share({ title: "G100", text, url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); } catch {} window.open("https://wa.me/?text=" + encodeURIComponent(text + " - " + url), "_blank"); }
  }

  async function del() {
    await supabase.from("posts").delete().eq("id", p.id);
    onChanged();
  }

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: EASE }}
        className={"relative overflow-hidden rounded-3xl border bg-white/[0.03] " + (embedded ? "p-4" : "p-5")}
        style={{ borderColor: hot ? a + "55" : "rgba(255,255,255,0.08)", boxShadow: hot ? "0 0 26px " + a + "1f" : "none" }}
      >
        {!embedded && <div className="absolute left-0 top-0 h-full w-1" style={{ background: a, opacity: hot ? 0.9 : 0.35 }} />}

        {isPlainRepost && (
          <p className="mb-2 pl-1 text-xs text-neutral-400">{"\u21BB"} {p.author?.full_name || "Member"} reposted</p>
        )}

        <div className="flex items-center gap-3">
          <Avatar url={shownAuthor?.photo_url} name={shownAuthor?.full_name} accent={a} size={embedded ? 36 : 44} href={"/member/" + shownAuthorId} />
          <div className="min-w-0 flex-1">
            <Link href={"/member/" + shownAuthorId} className="truncate text-sm font-semibold hover:underline">
              {shownAuthor?.full_name || "G100 Member"}
            </Link>
            <p className="truncate text-xs text-neutral-400">
              {shownAuthor?.role_title || "Visionary Leader"} {"\u00B7"} {timeAgo(p.created_at)}
            </p>
          </div>
          {p.author_id === uid && !embedded && (
            <div className="flex gap-3">
              {!isPlainRepost && (
                <button onClick={() => setEditing((v) => !v)} className="text-xs text-neutral-500 transition hover:text-[var(--eye)]">
                  {editing ? "Cancel" : "Edit"}
                </button>
              )}
              <button onClick={del} className="text-xs text-neutral-500 transition hover:text-[var(--ember)]">Delete</button>
            </div>
          )}
        </div>

        {editing && (
          <div className="mt-3 flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-[var(--bone)] outline-none focus:border-[var(--eye)]"
            />
            <button onClick={saveEdit} className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--ink)]" style={{ background: a }}>Save</button>
          </div>
        )}

        {!editing && shownBody && (
          <Link href={"/threads/" + p.id} className="mt-3 block whitespace-pre-wrap text-[0.95rem] leading-relaxed text-neutral-100">
            {shownBody}
          </Link>
        )}

        <PostImages urls={shownImages} onOpen={(i) => setBox({ urls: shownImages.filter(Boolean), index: i })} />

        {p.is_quote && orig && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center gap-2">
              <Avatar url={orig.author?.photo_url} name={orig.author?.full_name} accent={ACCENTS[orig.author?.accent || "eye"]} size={26} />
              <p className="truncate text-xs font-semibold">{orig.author?.full_name || "Member"}</p>
              <span className="text-xs text-neutral-500">{timeAgo(orig.created_at)}</span>
            </div>
            {orig.body && <p className="mt-2 line-clamp-4 text-sm text-neutral-300">{orig.body}</p>}
            {orig.image_urls && orig.image_urls[0] && (
              <div className="mt-2 overflow-hidden rounded-xl">
                <img src={orig.image_urls[0]} alt="" className="max-h-64 w-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
        )}

        {!embedded && (
          <div className="mt-4 flex items-center gap-6 text-sm">
            <Link href={"/threads/" + p.id} className="flex items-center gap-1.5 text-neutral-400 transition hover:text-[var(--bone)]">
              <span>{"\u{1F4AC}"}</span>
              <span className="tabular-nums">{p.comments}</span>
            </Link>
            <button onClick={repost} disabled={!approved} className="flex items-center gap-1.5 transition disabled:opacity-50" style={{ color: p.reposted ? "#3dbfb0" : "var(--smoke)" }}>
              <span>{"\u21BB"}</span>
              <span className="tabular-nums">{p.reposts}</span>
            </button>
            <button onClick={like} disabled={!approved} className="flex items-center gap-1.5 transition disabled:opacity-50" style={{ color: p.liked ? a : "var(--smoke)" }}>
              <span>{p.liked ? "\u2665" : "\u2661"}</span>
              <span className="tabular-nums">{p.likes}</span>
            </button>
            <button onClick={() => setQuoteOpen((q) => !q)} disabled={!approved} className="text-neutral-400 transition hover:text-[var(--bone)] disabled:opacity-50">Quote</button>
            <button onClick={share} className="ml-auto text-neutral-400 transition hover:text-[var(--bone)]">Share</button>
          </div>
        )}

        {quoteOpen && approved && (
          <div className="mt-3 flex gap-2">
            <input value={quoteText} onChange={(e) => setQuoteText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendQuote()} placeholder="Add your take..." className="flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-[var(--bone)] outline-none placeholder:text-neutral-500 focus:border-[var(--eye)]" />
            <button onClick={sendQuote} disabled={!quoteText.trim()} className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--ink)] disabled:opacity-40" style={{ background: a }}>Post</button>
          </div>
        )}
      </motion.article>

      <AnimatePresence>
        {box && <Lightbox urls={box.urls} index={box.index} onClose={() => setBox(null)} />}
      </AnimatePresence>
    </>
  );
}
