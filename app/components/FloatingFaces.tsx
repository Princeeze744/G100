"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// The chosen ones - floating in the hero air.
// pos: [left%, top%] on desktop / mobile handles itself
const FACES = [
  {
    src: "/members/favour-1.jpg",
    name: "Quin Favour",
    pos: { left: "8%", top: "16%" },
    size: "clamp(70px, 9vw, 130px)",
    glow: "var(--eye)",
    float: 7,
    delay: 2.2,
    rotate: -4,
  },
  {
    src: "/members/joeling.jpg",
    name: "Joeling",
    pos: { right: "9%", top: "22%" },
    size: "clamp(78px, 10vw, 145px)",
    glow: "var(--ember)",
    float: 8.5,
    delay: 2.5,
    rotate: 3,
  },
  {
    src: "/members/favour-2.jpg",
    name: "Quin Favour",
    pos: { right: "16%", bottom: "12%" },
    size: "clamp(64px, 8vw, 118px)",
    glow: "var(--surf)",
    float: 6.5,
    delay: 2.8,
    rotate: -2,
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
                : { y: [0, -14, 0], rotate: [f.rotate, -f.rotate, f.rotate] }
            }
            transition={{
              duration: f.float,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
            style={{ width: f.size, height: f.size }}
          >
            {/* the glow - breathing behind the face */}
            <motion.div
              animate={reduced ? undefined : { opacity: [0.5, 0.9, 0.5] }}
              transition={{
                duration: f.float * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-3 rounded-full blur-xl"
              style={{
                background:
                  "radial-gradient(circle, " +
                  f.glow +
                  "55, transparent 70%)",
              }}
            />
            <div
              className="relative h-full w-full overflow-hidden rounded-full"
              style={{
                border: "1.5px solid " + f.glow + "88",
                boxShadow: "0 0 30px " + f.glow + "33",
              }}
            >
              <Image
                src={f.src}
                alt=""
                fill
                sizes="145px"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
