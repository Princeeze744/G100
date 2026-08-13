"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

type Shot = {
  id: string;
  image_url: string;
  caption: string;
  album: string;
};

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function Gallery() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [album, setAlbum] = useState("All");
  const [open, setOpen] = useState<Shot | null>(null);

  useEffect(() => {
    supabase
      .from("gallery")
      .select("id, image_url, caption, album")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => setShots((data || []) as Shot[]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const albums = useMemo(() => {
    const set = new Set<string>();
    for (const s of shots) if (s.album) set.add(s.album);
    return ["All", ...Array.from(set)];
  }, [shots]);

  const visible = useMemo(
    () =>
      album === "All"
        ? shots
        : shots.filter((s) => s.album === album),
    [shots, album]
  );

  if (shots.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        The first memories land here soon - Eket is coming.
      </p>
    );
  }

  return (
    <>
      {/* Album chips - the pill glides between them */}
      <div className="mb-8 flex flex-wrap gap-2">
        {albums.map((a) => {
          const active = a === album;
          return (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className="relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
              style={{
                color: active ? "var(--ink)" : "var(--bone)",
              }}
            >
              {active && (
                <motion.span
                  layoutId="album-pill"
                  transition={{ duration: 0.45, ease }}
                  className="absolute inset-0 rounded-full bg-[var(--eye)]"
                />
              )}
              <span className="relative z-10">{a}</span>
            </button>
          );
        })}
      </div>

      {/* The grid - photos glide into place when the album changes */}
      <motion.div
        layout
        className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((s, i) => (
            <motion.button
              key={s.id}
              layout
              onClick={() => setOpen(s)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                duration: 0.55,
                delay: (i % 6) * 0.05,
                ease,
              }}
              className="group relative block w-full overflow-hidden rounded-2xl border border-white/10"
            >
              <Image
                src={s.image_url}
                alt={s.caption || s.album || "G100 memory"}
                width={600}
                height={800}
                sizes="(max-width: 640px) 50vw, 33vw"
                className="h-auto w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.06]"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to top, rgba(13,11,9,0.75), transparent 55%)",
                }}
              />
              {(s.caption || s.album) && (
                <span className="pointer-events-none absolute bottom-3 left-4 right-4 text-left text-xs text-neutral-200 opacity-0 transition duration-500 group-hover:opacity-100">
                  {s.caption || s.album}
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox - Ken Burns breath */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <button
              aria-label="Close photo"
              onClick={() => setOpen(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-neutral-200 transition hover:bg-white/10"
            >
              x
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.05] }}
                transition={{ duration: 14, ease: "linear" }}
              >
                <Image
                  src={open.image_url}
                  alt={open.caption || open.album || "G100 memory"}
                  width={1200}
                  height={1600}
                  sizes="90vw"
                  className="h-auto max-h-[85vh] w-full object-contain"
                />
              </motion.div>
              {(open.caption || open.album) && (
                <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-sm text-neutral-100">
                  {open.caption || open.album}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

