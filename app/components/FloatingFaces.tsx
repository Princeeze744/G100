"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// The chosen ones - floating in the hero air. Four corners, four glows.
const FACES = [
  {
    src: "/members/favour-1.jpg",
    pos: { left: "7%", top: "15%" },
    size: "clamp(72px, 9vw, 132px)",
    glow: "var(--eye)",
    float: 7,
    delay: 2.2,
    rotate: -4,
  },
  {
    src: "/members/joeling.jpg",
    pos: { right: "8%", top: "20%" },
    size: "clamp(80px, 10vw, 148px)",
    glow: "var(--ember)",
    float: 8.5,
    delay: 2.5,
    rotate: 3,
  },
  {
    src: "/members/favour-2.jpg",
    pos: { right: "15%", bottom: "11%" },
    size: "clamp(66px, 8vw, 120px)",
    glow: "var(--surf)",
    float: 6.5,
    delay: 2.8,
    rotate: -2,
  },
  {
    src: "/members/floating-4.jpg",
    pos: { left: "13%", bottom: "14%" },
    size: "clamp(76px, 9.5vw, 140px)",
    glow: "var(--ember)",
    float: 7.8,
    delay: 3.1,
    rotate: 3,
  },
];

export default function FloatingFaces() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {FACES.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.4,
            delay: f.delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="absolute"
          style={{ ...f.pos }}
        >
          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    y: [0, -14, 0],
                    rotate: [f.rotate, -f.rotate, f.rotate],
                  }
            }
            transition={{
              duration: f.float,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
            style={{ width: f.size, height: f.size }}
          >
            <motion.div
              animate={
                reduced ? undefined : { opacity: [0.55, 1, 0.55] }
              }
              transition={{
                duration: f.float * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-5 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, " +
                  f.glow +
                  "77, transparent 70%)",
              }}
            />
            <div
              className="relative h-full w-full overflow-hidden rounded-full"
              style={{
                border: "1.5px solid " + f.glow + "99",
                boxShadow:
                  "0 0 34px " + f.glow + "55, 0 0 70px " + f.glow + "22",
              }}
            >
              <Image
                src={f.src}
                alt=""
                fill
                sizes="148px"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
