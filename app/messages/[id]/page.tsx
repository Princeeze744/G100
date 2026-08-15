"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";
import { shrinkImage } from "../../../lib/shrinkImage";
import { ACCENTS, timeAgo, initials } from "../../../lib/social";
import { tap } from "../../../lib/haptic";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [other, setOther] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async (myId: string) => {
    const { data: c } = await supabase.from("conversations").select("user_a, user_b").eq("id", id).single();
    if (!c) { router.push("/messages"); return; }
    const otherId = c.user_a === myId ? c.user_b : c.user_a;
    const { data: p } = await supabase.from("profiles").select("id, full_name, photo_url, accent, role_title").eq("id", otherId).single();
    setOther(p);
    const { data: ms } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true });
    setMsgs(ms || []);
    await supabase.from("messages").update({ read: true }).eq("conversation_id", id).neq("sender_id", myId).eq("read", false);
  }, [id, router]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUid(data.user.id);
      await load(data.user.id);
      setReady(true);
    });
  }, [router, load]);

  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel("chat-" + id)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: "conversation_id=eq." + id }, () => load(uid))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, id, load]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  async function send(imageUrl?: string) {
    if (!uid || (!text.trim() && !imageUrl)) return;
    setSending(true);
    tap();
    const body = text.trim();
    setText("");
    await supabase.from("messages").insert({ conversation_id: id, sender_id: uid, body, image_url: imageUrl || "" });
    await supabase.from("conversations").update({ last_message: body || "Photo", last_at: new Date().toISOString() }).eq("id", id);
    if (other?.id) await supabase.from("notifications").insert({ user_id: other.id, actor_id: uid, type: "message" });
    setSending(false);
    load(uid);
  }

  async function sendImage(file: File) {
    if (!uid) return;
    setSending(true);
    const small = await shrinkImage(file, 1200);
    const path = uid + "/dm-" + Date.now() + ".jpg";
    const { error } = await supabase.storage.from("posts").upload(path, small, { contentType: "image/jpeg" });
    if (!error) {
      const url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
      await send(url);
    }
    setSending(false);
  }

  const a = ACCENTS[other?.accent || "eye"];

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-400">Opening chat...</p></main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-0 sm:px-6">
      <div className="fixed left-1/2 top-0 z-40 flex w-full max-w-xl -translate-x-1/2 items-center gap-3 border-b border-white/10 bg-[#0d0b09]/95 px-4 py-3 backdrop-blur-xl sm:top-20 sm:rounded-2xl sm:border">
        <button onClick={() => router.push("/messages")} className="flex h-10 w-10 items-center justify-center text-lg text-neutral-300" aria-label="Back">{"\u2190"}</button>
        <Link href={"/member/" + other?.id} className="flex min-w-0 items-center gap-2.5">
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: a }}>
            {other?.photo_url ? <img src={other.photo_url} alt="" className="h-full w-full object-cover" /> : (
              <span className="flex h-full w-full items-center justify-center bg-white/[0.06] text-xs">{initials(other?.full_name)}</span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{other?.full_name || "Member"}</span>
            <span className="block truncate text-xs text-neutral-400">{other?.role_title || "Visionary Leader"}</span>
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-32 pt-24 sm:pt-40">
        <AnimatePresence initial={false}>
          {msgs.map((m) => {
            const mine = m.sender_id === uid;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22 }}
                className={"flex " + (mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={"max-w-[78%] rounded-2xl px-4 py-2.5 " + (mine ? "rounded-br-md" : "rounded-bl-md")}
                  style={{
                    background: mine ? a : "rgba(255,255,255,0.07)",
                    color: mine ? "var(--ink)" : "var(--bone)",
                  }}
                >
                  {m.image_url && (
                    <img src={m.image_url} alt="" className="mb-1.5 max-h-72 w-full rounded-xl object-cover" />
                  )}
                  {m.body && <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{m.body}</p>}
                  <p className="mt-1 text-right text-[0.6rem]" style={{ opacity: 0.6 }}>
                    {timeAgo(m.created_at)}{mine && m.read ? " \u00B7 seen" : ""}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {msgs.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">Say hello to {(other?.full_name || "them").split(" ")[0]}.</p>}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-0 left-1/2 z-[60] w-full max-w-xl -translate-x-1/2 border-t border-white/10 bg-[#0d0b09]/98 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="flex w-full items-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-neutral-400" aria-label="Send photo">+</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) sendImage(f); e.target.value = ""; }} />
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => { document.body.classList.add("typing"); setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 320); }}
            onBlur={() => document.body.classList.remove("typing")}
            placeholder="Message..."
            className="max-h-32 min-h-[2.75rem] min-w-0 flex-1 resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-[var(--bone)] outline-none placeholder:text-neutral-500 focus:border-[var(--eye)]"
            onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; }}
          />
          <button onClick={() => send()} disabled={sending || !text.trim()} className="shrink-0 rounded-full px-5 py-2.5 font-semibold text-[var(--ink)] disabled:opacity-40" style={{ background: a }}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}




