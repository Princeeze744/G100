"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { usePosts } from "../../lib/usePosts";
import { PostCard } from "../components/SocialUI";
import { Composer } from "../components/Composer";

export default function ThreadsPage() {
  const { posts, uid, approved, ready, refresh } = usePosts();
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    if (!uid) return;
    supabase.from("profiles").select("full_name, photo_url, accent, role_title").eq("id", uid).single()
      .then(({ data }) => setMe(data));
  }, [uid]);

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-neutral-400">Loading Threads...</p></main>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-24 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Threads</h1>
        <p className="text-sm text-neutral-400">The voice of G100.</p>
      </div>

      {approved && uid ? (
        <Composer uid={uid} me={me} onPosted={refresh} />
      ) : (
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-[var(--eye)]/25 bg-[var(--eye)]/10 p-5">
          <p className="text-sm text-neutral-200">{uid ? "Awaiting approval to post." : "Log in to post, like and repost."}</p>
          <Link href={uid ? "/profile" : "/login"} className="shrink-0 rounded-full bg-[var(--eye)] px-4 py-2 text-xs font-semibold text-[var(--ink)]">{uid ? "My Profile" : "Log in"}</Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {posts.map((p) => (
            <PostCard key={p.id} p={p} uid={uid} approved={approved} onChanged={refresh} />
          ))}
        </AnimatePresence>
        {posts.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">No posts yet.</p>}
      </div>
    </main>
  );
}
