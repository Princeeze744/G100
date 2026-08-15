"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { usePosts } from "../../lib/usePosts";
import { PostCard } from "../components/SocialUI";

export default function BookmarksPage() {
  const router = useRouter();
  const { posts, uid, approved, ready, refresh } = usePosts({ bookmarksOnly: true });

  useEffect(() => {
    if (ready && !uid) router.push("/login");
  }, [ready, uid, router]);

  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-24 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold">Bookmarks</h1>
      <p className="mb-6 text-sm text-neutral-400">Saved for later. Only you can see these.</p>

      <div className="flex flex-col gap-4">
        {!ready && [0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/5" />)}
        <AnimatePresence initial={false}>
          {posts.map((p) => <PostCard key={p.id} p={p} uid={uid} approved={approved} onChanged={refresh} />)}
        </AnimatePresence>
        {ready && posts.length === 0 && <p className="py-16 text-center text-sm text-neutral-500">No bookmarks yet. Tap the star on any post.</p>}
      </div>
    </main>
  );
}
