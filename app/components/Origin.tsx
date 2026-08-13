"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as const;

const FOUNDERS = [
  {
    name: "Rejoice",
    photo: "/members/admin-rejoice.jpg",
    accent: "var(--eye)",
  },
  {
    name: "Femi",
    photo: "/members/admin-femi.jpg",
    accent: "var(--ember)",
  },
  {
    name: "Shimah",
    photo: "/members/admin-shimah.jpg",
    accent: "var(--surf)",
  },
];

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
    body: "Members drive prosperity through shared ideas, focused on lasting, positive change.",
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
    body: "Members hold one another to the standard. Disputes resolved with discretion and dignity.",
    accent: "var(--ember)",
  },
];

function FoundingDate() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yStatic = useTransform(scrollYProgress, [0, 1], [0, 0]);

  return (
    <div
      ref={ref}
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6"
    >
      {/* giant ghost year */}
      <motion.div
        aria-hidden
        style={{ y: reduced ? yStatic : y }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="select-none text-[28vw] font-bold leading-none text-white/[0.03]"
          style={{ letterSpacing: "-0.05em" }}
        >
          2026
        </span>
      </motion.div>

      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease }}
          className="mb-6 text-xs font-semibold uppercase text-[var(--eye)]"
        >
          The Beginning
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="text-4xl font-bold sm:text-6xl"
        >
          28 February
          <br />
          <span className="text-[var(--eye)]">2026</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mx-auto mt-6 max-w-md text-neutral-400"
        >
          The day one hundred scattered leaders chose to become one
          formation. Born in Port Harcourt. Built to outlast us.
        </motion.p>
      </div>
    </div>
  );
}

export default function Origin() {
  return (
    <section id="idea" className="relative">
      <FoundingDate />

      {/* The story */}
      <div className="mx-auto max-w-5xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
            The Idea
          </p>
          <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
            One Eagle. One Hundred Leaders.
          </h2>
          <p className="mb-6 max-w-2xl text-lg leading-relaxed text-neutral-300">
            At first glance you see an eagle - vision and leadership. On
            closer look, the word G100 becomes clear. The letters are not
            placed next to each other. They become the shape.
          </p>
          <p className="max-w-2xl leading-relaxed text-neutral-400">
            We are not a crowd. We are a formation - individuals who flow
            together as one unified force, bound by integrity, sharpened by
            collaboration, driven by lasting impact.
          </p>
        </motion.div>

        {/* The Covenant */}
        <h3 className="mb-8 mt-20 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
          The Covenant
        </h3>
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
                className="absolute -right-3 -top-4 text-7xl font-bold opacity-[0.06] transition group-hover:opacity-[0.12]"
                style={{ color: p.accent }}
              >
                {p.n}
              </div>
              <div
                className="mb-3 h-1 w-8 rounded-full"
                style={{ background: p.accent }}
              />
              <h4 className="mb-2 text-lg font-bold">{p.title}</h4>
              <p className="text-sm leading-relaxed text-neutral-400">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* The Founders */}
        <h3 className="mb-2 mt-20 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--eye)]">
          The Founders
        </h3>
        <p className="mb-8 text-sm text-neutral-400">
          Three who lit the fire.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {FOUNDERS.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease }}
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
      </div>
    </section>
  );
}
