"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

// The pool - add any new photo here and it joins the rotation
const POOL = [
  "/members/favour-1.jpg",
  "/members/joeling.jpg",
  "/members/favour-2.jpg",
  "/members/floating-4.jpg",
  "/members/floating-5.jpg",
  "/members/floating-6.jpg",
  "/members/floating-7.jpg",
];

// Four stages in the air - each cycles through the pool
const SLOTS = [
  {
    pos: { left: "7%", top: "15%" },
    size: "clamp(72px, 9vw, 132px)",
    glow: "var(--eye)",
    float: 7,
    delay: 2.2,
    rotate: -4,
    hold: 9000,
    start: 0,
  },
  {
    pos: { right: "8%", top: "20%" },
    size: "clamp(80px, 10vw, 148px)",
    glow: "var(--ember)",
    float: 8.5,
    delay: 2.5,
    rotate: 3,
    hold: 12000,
    start: 1,
  },
  {
    pos: { right: "15%", bottom: "11%" },
    size: "clamp(66px, 8vw, 120px)",
    glow: "var(--surf)",
    float: 6.5,
    delay: 2.8,
    rotate: -2,
    hold: 10500,
    start: 2,
  },
  {
    pos: { left: "13%", bottom: "14%" },
    size: "clamp(76px, 9.5vw, 140px)",
    glow: "var(--ember)",
    float: 7.8,
    delay: 3.1,
    rotate: 3,
    hold: 13500,
    start: 3,
  },
];

function Slot({
  slot,
  reduced,
}: {
  slot: (typeof SLOTS)[number];
  reduced: boolean;
}) {
  const [idx, setIdx] = useState(slot.start);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % POOL.length),
      slot.hold
    );
    return () => clearInterval(id);
  }, [slot.hold, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 1.4,
        delay: slot.delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="absolute"
      style={{ ...slot.pos }}
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : {
                y: [0, -14, 0],
                rotate: [slot.rotate, -slot.rotate, slot.rotate],
              }
        }
        transition={{
          duration: slot.float,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
        style={{ width: slot.size, height: slot.size }}
      >
        <motion.div
          animate={reduced ? undefined : { opacity: [0.55, 1, 0.55] }}
          transition={{
            duration: slot.float * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-5 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, " +
              slot.glow +
              "77, transparent 70%)",
          }}
        />

        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            border: "1.5px solid " + slot.glow + "99",
            boxShadow:
              "0 0 34px " +
              slot.glow +
              "55, 0 0 70px " +
              slot.glow +
              "22",
          }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={idx}
              initial={{
                opacity: 0,
                scale: 1.25,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.85,
                filter: "blur(8px)",
              }}
              transition={{
                duration: 1.6,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute inset-0"
            >
              <motion.div
                animate={
                  reduced ? undefined : { scale: [1, 1.12, 1] }
                }
                transition={{
                  duration: slot.hold / 1000,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0"
              >
                <Image
                  src={POOL[idx]}
                  alt=""
                  fill
                  sizes="148px"
                  className="object-cover object-top"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FloatingFaces() {
  const reduced = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {SLOTS.map((s, i) => (
        <Slot key={i} slot={s} reduced={!!reduced} />
      ))}
    </div>
  );
}

