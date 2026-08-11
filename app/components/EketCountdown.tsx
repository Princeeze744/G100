"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TARGET = new Date("2026-08-21T09:00:00+01:00").getTime();

function diff() {
  const d = Math.max(0, TARGET - Date.now());
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    mins: Math.floor((d / 60000) % 60),
    secs: Math.floor((d / 1000) % 60),
  };
}

const cellCls =
  "flex flex-col items-center rounded-2xl bg-black/25 px-3 py-4 " +
  "backdrop-blur-sm sm:px-6";

export default function EketCountdown() {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { label: "Days", value: t?.days },
    { label: "Hours", value: t?.hours },
    { label: "Mins", value: t?.mins },
    { label: "Secs", value: t?.secs },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
      style={{
        background:
          "linear-gradient(135deg, rgba(232,163,61,0.16), rgba(226,96,58,0.14) 55%, rgba(61,191,176,0.1))",
        border: "1px solid rgba(232,163,61,0.25)",
      }}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
        Next Flight
      </p>
      <h3 className="mb-2 text-2xl font-bold sm:text-3xl">
        Eket Beach Day
      </h3>
      <p className="mb-8 max-w-md text-sm text-neutral-300">
        The formation lands on the sand. August 21 - sun, surf, and one hundred leaders catching fun.
      </p>

      <div className="grid max-w-md grid-cols-4 gap-2 sm:gap-3">
        {cells.map((c) => (
          <div key={c.label} className={cellCls}>
            <span className="text-2xl font-bold tabular-nums text-[var(--bone)] sm:text-4xl">
              {c.value === undefined || c.value === null
                ? "--"
                : String(c.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.6rem] uppercase tracking-widest text-neutral-400 sm:text-xs">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}


