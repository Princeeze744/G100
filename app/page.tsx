"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import LazyMount from "./components/LazyMount";
import Section from "./components/Section";
const Members = dynamic(() => import("./components/Members"));
import FloatingFaces from "./components/FloatingFaces";
const EagleReveal = dynamic(() => import("./components/EagleReveal"));
import ParticleEagle from "./components/ParticleEagle";
const Formation = dynamic(() => import("./components/Formation"));
import Atmosphere from "./components/Atmosphere";
const Gallery = dynamic(() => import("./components/Gallery"));
const Origin = dynamic(() => import("./components/Origin"));
const EketCountdown = dynamic(() => import("./components/EketCountdown"));

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
        data-nopad
        id="home"
        className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6"
      >
        <FloatingFaces />
        <ParticleEagle />

        <h1 className="flex flex-wrap justify-center gap-x-3 text-center text-3xl font-bold tracking-tight sm:text-5xl">
          {headline.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.25 + i * 0.1,
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
          transition={{ duration: 1, delay: 1.0 }}
          className="max-w-md text-center text-sm text-neutral-400 sm:text-base"
        >
          Vision. Leadership. Unity. - 100 leaders, one eagle.
        </motion.p>

        <motion.a
          href="#reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className={ctaBtn}
        >
          Discover the Vision
        </motion.a>
      </main>

      <Origin />

      <LazyMount minH="200vh"><EagleReveal /></LazyMount>

      <LazyMount minH="160vh"><Formation /></LazyMount>

      <Section id="members" kicker="The Family" title="The 100">
        <p className="mb-12 max-w-2xl text-neutral-400">
          One hundred visionary leaders - each one a feather in the same
          wing. Tap a member to meet them.
        </p>
        <LazyMount minH="60vh"><Members /></LazyMount>
      </Section>

      <Section id="life" kicker="The Life" title="We Lead. We Laugh. We Live.">
        <p className="mb-10 max-w-2xl text-neutral-400">
          G100 is not a boardroom. It is family - we catch fun, we
          show love, we play hard, and we show up for each other. The
          eagle flies, but it also lands on the beach.
        </p>
        <LazyMount minH="20rem"><EketCountdown /></LazyMount>
      </Section>

      <Section id="gallery" kicker="The Memories" title="Life in Formation">
        <p className="mb-10 max-w-2xl text-neutral-400">
          The moments that make us - captured in flight.
        </p>
        <LazyMount minH="40vh"><Gallery /></LazyMount>
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

      <footer className="border-t border-white/10 py-10 text-center text-xs text-neutral-400">
        G100 - A Group of Visionary Leaders. All rights reserved.
      </footer>
    </>
  );
}


























