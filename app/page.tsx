"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Section from "./components/Section";
import Members from "./components/Members";
import FloatingFaces from "./components/FloatingFaces";
import EagleReveal from "./components/EagleReveal";
import Formation from "./components/Formation";
import Atmosphere from "./components/Atmosphere";
import EketCountdown from "./components/EketCountdown";

const headline = ["A", "Group", "of", "Visionary", "Leaders"];

const pillars = [
  {
    title: "Vision",
    text: "The eagle eye - focus and clarity in everything we do.",
  },
  {
    title: "Leadership",
    text: "Strength and direction. We set the pace, others follow.",
  },
  {
    title: "Unity",
    text: "100 leaders flowing together as one unified force.",
  },
];

const heroEase = [0.22, 1, 0.36, 1] as const;

const joinBtn =
  "inline-block rounded-full bg-[var(--bone)] px-8 py-3 text-sm " +
  "font-semibold text-[var(--ink)] transition hover:bg-[var(--eye)]";

const ctaBtn =
  "mt-4 rounded-full border border-white/20 px-6 py-2.5 text-sm " +
  "text-neutral-300 transition hover:border-[var(--eye)] " +
  "hover:text-[var(--eye)]";

const cardCls =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 " +
  "transition hover:border-[var(--eye)]/40 hover:bg-white/[0.06]";

const memberCls =
  "flex aspect-square items-center justify-center rounded-2xl " +
  "border border-white/10 bg-white/[0.03] text-2xl font-bold " +
  "text-neutral-700";

export default function Home() {
  return (
    <>
      <Atmosphere />

      <main
        id="home"
        className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6"
      >
        <FloatingFaces />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: heroEase }}
        >
          <Image
            src="/eagle.svg"
            alt="G100 - A Group of Visionary Leaders"
            width={320}
            height={200}
            priority
            className="h-auto w-64 invert sm:w-80"
          />
        </motion.div>

        <h1 className="flex flex-wrap justify-center gap-x-3 text-center text-3xl font-bold tracking-tight sm:text-5xl">
          {headline.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.5 + i * 0.12,
                ease: heroEase,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="max-w-md text-center text-sm text-neutral-400 sm:text-base"
        >
          Vision. Leadership. Unity. - 100 leaders, one eagle.
        </motion.p>

        <motion.a
          href="#reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
          className={ctaBtn}
        >
          Discover the Vision
        </motion.a>
      </main>

      <Section
        id="idea"
        kicker="The Idea"
        title="One Eagle. One Hundred Leaders."
      >
        <p className="mb-12 max-w-2xl text-neutral-400">
          At first glance, you see an eagle - vision and leadership. On
          closer look, the word G100 becomes clear. The letters are not
          placed next to each other. They become the shape. That is who
          we are: individuals who flow together as one unified form.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={cardCls}
            >
              <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-neutral-400">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <EagleReveal />

      <Formation />

      <Section id="members" kicker="The Family" title="The 100">
        <p className="mb-12 max-w-2xl text-neutral-400">
          One hundred visionary leaders - each one a feather in the same
          wing. Tap a member to meet them.
        </p>
        <Members />
      </Section>

      <Section id="life" kicker="The Life" title="We Lead. We Laugh. We Live.">
        <p className="mb-10 max-w-2xl text-neutral-400">
          G100 is not a boardroom. It is family - we catch fun, we
          show love, we play hard, and we show up for each other. The
          eagle flies, but it also lands on the beach.
        </p>
        <EketCountdown />
      </Section>

      <Section id="join" kicker="Take Flight" title="Fly With Us">
        <p className="mb-8 max-w-xl text-neutral-400">
          G100 is a family of visionary leaders. If you have the eye
          of the eagle, your place in the formation is waiting.
        </p>
        <a href="/join" className={joinBtn}>
          Create Your Profile
        </a>
      </Section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-neutral-600">
        G100 - A Group of Visionary Leaders. All rights reserved.
      </footer>
    </>
  );
}















