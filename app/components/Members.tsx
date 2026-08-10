"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MEMBERS, Member } from "./members-data";

const ACCENTS = {
  eye: "var(--eye)",
  ember: "var(--ember)",
  surf: "var(--surf)",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const cardCls =
  "group relative aspect-[3/4] w-full overflow-hidden rounded-2xl " +
  "border border-white/10 bg-white/[0.03] text-left transition " +
  "hover:border-white/25";

const sheetCls =
  "relative max-h-[92vh] w-full max-w-lg overflow-y-auto " +
  "rounded-t-3xl border border-white/10 bg-[#161310] " +
  "sm:rounded-3xl";

export default function Members() {
  const [open, setOpen] = useState<Member | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {MEMBERS.map((m, i) => {
          const accent = ACCENTS[m.accent];
          return (
            <motion.button
              key={m.id}
              onClick={() => setOpen(m)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className={cardCls}
            >
              {m.photo ? (
                <>
                  <Image
                    src={m.photo}
                    alt={m.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(13,11,9,0.92) 0%, rgba(13,11,9,0.25) 45%, transparent 70%)",
                    }}
                  />
                </>
              ) : (
                <span
                  className="absolute left-1/2 top-[38%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-base font-bold"
                  style={{
                    background: accent + "22",
                    color: accent,
                    border: "1px solid " + accent + "55",
                  }}
                >
                  {initials(m.name)}
                </span>
              )}

              <span
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{
                  borderBottom: "2px solid " + accent,
                }}
              >
                <span className="block text-sm font-semibold sm:text-base">
                  {m.name}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-400">
                  {m.role} - {m.city}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              className={sheetCls}
            >
              <button
                onClick={() => setOpen(null)}
                aria-label="Close profile"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-neutral-200 backdrop-blur-sm transition hover:bg-black/70"
              >
                x
              </button>

              {open.photo && (
                <div className="relative aspect-[4/5] w-full sm:aspect-[4/4]">
                  <Image
                    src={open.photo}
                    alt={open.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 512px"
                    className="object-cover object-top"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, #161310 2%, transparent 45%)",
                    }}
                  />
                </div>
              )}

              <div className="p-8 pt-5">
                {!open.photo && (
                  <span
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                    style={{
                      background: ACCENTS[open.accent] + "22",
                      color: ACCENTS[open.accent],
                      border:
                        "1px solid " + ACCENTS[open.accent] + "55",
                    }}
                  >
                    {initials(open.name)}
                  </span>
                )}

                <h3 className="text-2xl font-bold">{open.name}</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {open.role} - {open.city}
                </p>

                <p
                  className="mt-6 border-l-2 pl-4 text-lg italic leading-relaxed text-neutral-200"
                  style={{ borderColor: ACCENTS[open.accent] }}
                >
                  &quot;{open.line}&quot;
                </p>

                <p className="mt-8 text-xs uppercase tracking-[0.3em] text-neutral-500">
                  G100 - One of the Hundred
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
