"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const FOUNDERS = [
  { name: "Rejoice", photo: "/members/admin-rejoice.jpg", accent: "var(--eye)" },
  { name: "Femi", photo: "/members/admin-femi.jpg", accent: "var(--ember)" },
  { name: "Shimah", photo: "/members/admin-shimah.jpg", accent: "var(--surf)" },
];

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function Founders() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {FOUNDERS.map((f, i) => (
        <motion.div
          key={f.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.15, ease }}
          className="group relative overflow-hidden rounded-3xl border border-white/10"
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={f.photo}
              alt={f.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover object-top transition duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(13,11,9,0.95), transparent 55%)",
              }}
            />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 p-6"
            style={{ borderBottom: "3px solid " + f.accent }}
          >
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: f.accent }}
            >
              Founder
            </p>
            <p className="text-xl font-bold">{f.name}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
