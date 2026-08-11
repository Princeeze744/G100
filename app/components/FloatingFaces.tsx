"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const POOL = [
  "/members/favour-1.jpg",
  "/members/joeling.jpg",
  "/members/favour-2.jpg",
  "/members/floating-4.jpg",
  "/members/floating-5.jpg",
  "/members/floating-6.jpg",
  "/members/floating-7.jpg",
  "/members/floating-8.jpg",
  "/members/floating-9.jpg",
];

// Six stations - centers in % of the hero. Lines connect them.
const SLOTS = [
  { x: 12, y: 26, size: "clamp(70px, 8.5vw, 126px)", glow: "var(--eye)", float: 7, delay: 2.2, depth: 1.3, hold: 9500, start: 0, mobile: true },
  { x: 88, y: 24, size: "clamp(78px, 9.5vw, 142px)", glow: "var(--ember)", float: 8.5, delay: 2.5, depth: 0.8, hold: 12000, start: 1, mobile: true },
  { x: 85, y: 74, size: "clamp(64px, 8vw, 118px)", glow: "var(--surf)", float: 6.5, delay: 2.8, depth: 1.5, hold: 10500, start: 2, mobile: true },
  { x: 13, y: 76, size: "clamp(74px, 9vw, 136px)", glow: "var(--ember)", float: 7.8, delay: 3.1, depth: 1.0, hold: 13500, start: 3, mobile: true },
  { x: 30, y: 10, size: "clamp(58px, 7vw, 104px)", glow: "var(--surf)", float: 9, delay: 3.4, depth: 0.6, hold: 11000, start: 4, mobile: false },
  { x: 71, y: 90, size: "clamp(58px, 7vw, 104px)", glow: "var(--eye)", float: 8.2, delay: 3.7, depth: 1.2, hold: 14000, start: 5, mobile: false },
];

// The starlight ring - pairs of slot indexes
const MOBILE_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

const LINES = [
  [0, 4],
  [4, 1],
  [1, 2],
  [2, 5],
  [5, 3],
  [3, 0],
];

function Slot({
  slot,
  reduced,
  px,
  py,
}: {
  slot: (typeof SLOTS)[number];
  reduced: boolean;
  px: any;
  py: any;
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

  const dx = useTransform(px, (v: number) => v * 16 * slot.depth);
  const dy = useTransform(py, (v: number) => v * 12 * slot.depth);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.4,
        delay: slot.delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={
        "absolute " + (slot.mobile ? "" : "hidden sm:block")
      }
      style={{
        left: slot.x + "%",
        top: slot.y + "%",
        x: dx,
        y: dy,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : { y: [0, -13, 0], rotate: [-3, 3, -3] }
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
          animate={reduced ? undefined : { opacity: [0.5, 1, 0.5] }}
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
              initial={{ opacity: 0, scale: 1.25, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
              transition={{
                duration: 1.6,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute inset-0"
            >
              <motion.div
                animate={reduced ? undefined : { scale: [1, 1.12, 1] }}
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
                  sizes="142px"
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
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 40, damping: 20 });
  const py = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* the starlight lines - the family, connected */}
      <svg
        className="absolute inset-0 h-full w-full sm:hidden"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {MOBILE_LINES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={SLOTS[a].x}
            y1={SLOTS[a].y}
            x2={SLOTS[b].x}
            y2={SLOTS[b].y}
            stroke="var(--bone)"
            strokeWidth="0.15"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.05, 0.16, 0.05] }}
            transition={{
              duration: 6 + i,
              delay: 4 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
      <svg
        className="absolute inset-0 hidden h-full w-full sm:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {LINES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={SLOTS[a].x}
            y1={SLOTS[a].y}
            x2={SLOTS[b].x}
            y2={SLOTS[b].y}
            stroke="var(--bone)"
            strokeWidth="0.08"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.04, 0.14, 0.04] }}
            transition={{
              duration: 6 + i,
              delay: 4 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {SLOTS.map((s, i) => (
        <Slot
          key={i}
          slot={s}
          reduced={!!reduced}
          px={px}
          py={py}
        />
      ))}
    </div>
  );
}

