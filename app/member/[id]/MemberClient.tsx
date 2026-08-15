"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";
import { usePosts } from "../../../lib/usePosts";
import { ACCENTS, EASE } from "../../../lib/social";
import { PostCard } from "../../components/SocialUI";

export default function MemberClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [prof, setProf] = useState<any>(null);
  const { posts, uid, approved, ready, refresh } = usePosts({ authorId: id });

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", id).single().then(({ data }) => setProf(data));
  }, [id]);

  if (!prof) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-400">Loading profile...</p></main>;
  }

  const a = ACCENTS[prof.accent || "eye"];
  const socials: { label: string; href: string }[] = [];
  if (prof.instagram) socials.push({ label: "Instagram", href: "https://instagram.com/" + String(prof.instagram).replace(/^@/, "") });
  if (prof.twitter) socials.push({ label: "X", href: "https://x.com/" + String(prof.twitter).replace(/^@/, "") });
  if (prof.linkedin) socials.push({ label: "LinkedIn", href: String(prof.linkedin).startsWith("http") ? prof.linkedin : "https://" + prof.linkedin });
  if (prof.whatsapp) socials.push({ label: "WhatsApp", href: "https://wa.me/" + String(prof.whatsapp).replace(/\D/g, "") });

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-24 sm:px-6">
      <button onClick={() => router.back()} className="mb-5 text-sm text-neutral-400 transition hover:text-[var(--eye)]">{"\u2190"} Back</button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="overflow-hidden rounded-3xl border border-white/10">
        <div className="relative aspect-[16/10] w-full bg-white/[0.03]">
          {prof.photo_url ? (
            <img src={prof.photo_url} alt={prof.full_name} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-600">No photo</div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,11,9,0.96), transparent 60%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: a }}>
              {prof.approved ? "One of the Hundred" : "Pending"}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">{prof.full_name}</h1>
            <p className="mt-0.5 text-sm text-neutral-300">{prof.role_title}{prof.city ? " - " + prof.city : ""}</p>
          </div>
        </div>
      </motion.div>

      {prof.bio && <p className="mt-6 border-l-2 pl-4 leading-relaxed text-neutral-200" style={{ borderColor: a }}>{prof.bio}</p>}

      {(prof.services || prof.education) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {prof.services && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Services</p>
              <p className="text-sm text-neutral-300">{prof.services}</p>
            </div>
          )}
          {prof.education && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Education</p>
              <p className="text-sm text-neutral-300">{prof.education}</p>
            </div>
          )}
        </div>
      )}

      {uid && uid !== id && (
        <button
          onClick={async () => {
            const [x, y] = [uid, id].sort();
            const { data: ex } = await supabase.from("conversations").select("id").eq("user_a", x).eq("user_b", y).maybeSingle();
            if (ex?.id) { router.push("/messages/" + ex.id); return; }
            const { data: made } = await supabase.from("conversations").insert({ user_a: x, user_b: y }).select("id").single();
            if (made?.id) router.push("/messages/" + made.id);
          }}
          className="mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-[var(--ink)]"
          style={{ background: a }}
        >
          Message
        </button>
      )}

      {socials.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener" className="rounded-full border border-white/15 px-4 py-1.5 text-xs transition hover:border-current" style={{ color: a }}>{s.label}</a>
          ))}
        </div>
      )}

      <h2 className="mb-4 mt-12 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
        Posts {ready ? "(" + posts.length + ")" : ""}
      </h2>

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {posts.map((p) => <PostCard key={p.id} p={p} uid={uid} approved={approved} onChanged={refresh} />)}
        </AnimatePresence>
        {ready && posts.length === 0 && <p className="text-sm text-neutral-500">No posts yet.</p>}
      </div>
    </main>
  );
}


