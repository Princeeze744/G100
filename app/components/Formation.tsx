"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionValue,
} from "framer-motion";
import { FORMATION, EYE_INDEX } from "./formation-data";

function Dot({
  progress,
  target,
  scatter,
  size,
  isEye,
  stagger,
}: {
  progress: MotionValue<number>;
  target: [number, number];
  scatter: [number, number];
  size: [number, number];
  isEye: boolean;
  stagger: number;
}) {
  const [tx, ty] = target;
  const [sx, sy] = scatter;
  const [cw, ch] = size;

  const start = 0.05 + stagger * 0.14;
  const x = useTransform(
    progress,
    [start, 0.58],
    [((sx - tx) / 100) * cw, 0]
  );
  const y = useTransform(
    progress,
    [start, 0.58],
    [((sy - ty) / 100) * ch, 0]
  );
  const opacity = useTransform(progress, [0.02, 0.12], [0, 1]);
  const scale = useTransform(
    progress,
    [0.78, 0.92],
    [1, isEye ? 1.9 : 1]
  );

  const base =
    "absolute rounded-full " +
    (isEye
      ? "h-2.5 w-2.5 bg-[var(--eye)] shadow-[0_0_18px_var(--eye)]"
      : "h-1.5 w-1.5 bg-[var(--bone)]/85 sm:h-2 sm:w-2");

  return (
    <motion.div
      className={base}
      style={{
        left: tx + "%",
        top: ty + "%",
        x,
        y,
        opacity,
        scale,
      }}
    />
  );
}

export default function Formation() {
  const ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [size, setSize] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const measure = () => {
      if (boxRef.current) {
        setSize([
          boxRef.current.offsetWidth,
          boxRef.current.offsetHeight,
        ]);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const line1Op = useTransform(scrollYProgress, [0.05, 0.12, 0.34, 0.42], [0, 1, 1, 0]);
  const line2Op = useTransform(scrollYProgress, [0.56, 0.66], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.56, 0.66], [16, 0]);

  if (reduced) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="relative aspect-[1297/683] w-full">
          {FORMATION.map(([tx, ty], i) => (
            <div
              key={i}
              className={
                "absolute rounded-full " +
                (i === EYE_INDEX
                  ? "h-2.5 w-2.5 bg-[var(--eye)]"
                  : "h-2 w-2 bg-[var(--bone)]/85")
              }
              style={{ left: tx + "%", top: ty + "%" }}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-xl font-semibold">
          In formation, we are{" "}
          <span className="text-[var(--eye)]">G100</span>.
        </p>
      </section>
    );
  }

  return (
    <div ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div
          ref={boxRef}
          className="relative aspect-[1297/683] w-[92vw] max-w-3xl"
        >
          {size[0] > 0 &&
            FORMATION.map(([tx, ty, sx, sy], i) => (
              <Dot
                key={i}
                progress={scrollYProgress}
                target={[tx, ty]}
                scatter={[sx, sy]}
                size={size}
                isEye={i === EYE_INDEX}
                stagger={((i * 7919) % 100) / 100}
              />
            ))}
        </div>

        <div className="relative mt-10 h-14 w-full">
          <motion.p
            style={{ opacity: line1Op }}
            className="absolute inset-x-0 text-center text-lg text-neutral-400 sm:text-2xl"
          >
            Scattered, we are only individuals.
          </motion.p>
          <motion.p
            style={{ opacity: line2Op, y: line2Y }}
            className="absolute inset-x-0 text-center text-lg font-semibold sm:text-2xl"
          >
            In formation, we are{" "}
            <span className="text-[var(--eye)]">G100</span>.
          </motion.p>
        </div>
      </div>
    </div>
  );
}




