"use client";

import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    n: "01",
    title: "Exclusive by Design",
    body: "Only one hundred visionary leaders. Membership is by referral, selective, and earned - never bought.",
    accent: "var(--eye)",
  },
  {
    n: "02",
    title: "We Rise Together",
    body: "Members collaborate, share resources, and form alliances. No direct competition - one eagle's strength is the whole flock's.",
    accent: "var(--surf)",
  },
  {
    n: "03",
    title: "Integrity, Non-Negotiable",
    body: "The highest standards in every dealing. Zero tolerance for breaches - the covenant protects the hundred.",
    accent: "var(--ember)",
  },
  {
    n: "04",
    title: "Innovation & Impact",
    body: "Members drive prosperity through shared ideas, focused on lasting, positive change in their spheres of influence.",
    accent: "var(--eye)",
  },
  {
    n: "05",
    title: "Respect the Roots",
    body: "Impact begins at home - Port Harcourt and Nigeria first, the world next.",
    accent: "var(--surf)",
  },
  {
    n: "06",
    title: "Accountable to Each Other",
    body: "Members hold one another to the standard. Disputes are resolved with discretion, dignity, and respect.",
    accent: "var(--ember)",
  },
];

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function Covenant() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PRINCIPLES.map((p, i) => (
        <motion.div
          key={p.n}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: (i % 3) * 0.12, ease }}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.05]"
        >
          <div
            className="absolute -right-4 -top-4 text-7xl font-bold opacity-[0.06] transition group-hover:opacity-[0.1]"
            style={{ color: p.accent }}
          >
            {p.n}
          </div>
          <div
            className="mb-3 h-1 w-8 rounded-full"
            style={{ background: p.accent }}
          />
          <h3 className="mb-2 text-lg font-bold">{p.title}</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            {p.body}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
