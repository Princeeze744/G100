"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

// Traced from the original G100 logo - 7 paths, 4KB.
// Path index 1 is the eagle's eye.
const PATHS = [
  "M8925 8630 c-459 -32 -1011 -137 -1560 -296 -598 -174 -1398 -482 -1805 -695 -141 -74 -152 -84 -85 -75 654 85 1146 5 1531 -249 302 -200 471 -499 499 -882 4 -51 9 -93 12 -93 3 0 41 34 85 75 147 139 317 235 497 282 126 33 307 37 425 9 288 -67 549 -267 753 -576 70 -105 170 -313 212 -440 18 -52 34 -102 37 -110 3 -9 23 19 49 69 165 309 424 529 725 617 83 25 112 28 235 29 153 0 207 -10 339 -65 208 -87 415 -286 562 -541 26 -44 48 -78 50 -76 3 2 11 30 19 62 49 187 194 346 400 441 219 99 534 147 818 125 248 -20 449 -70 635 -157 118 -55 200 -113 282 -201 123 -130 173 -282 153 -462 -6 -53 -14 -105 -19 -116 -12 -32 60 40 125 126 105 138 190 326 227 501 26 122 24 354 -4 468 -123 502 -520 830 -1307 1081 -336 107 -365 124 -472 289 -70 109 -197 224 -343 312 -364 219 -1254 452 -2045 534 -183 19 -832 28 -1030 14z m1555 -891 c122 -11 293 -45 400 -81 36 -11 167 -61 293 -109 376 -147 544 -189 758 -189 l104 -1 -63 -30 c-41 -20 -91 -58 -145 -110 -139 -136 -250 -198 -395 -224 -134 -24 -282 9 -381 83 -103 78 -165 178 -195 315 -14 62 -25 87 -52 117 -70 78 -302 173 -502 207 -95 16 -103 19 -67 24 65 10 123 10 245 -2z",
  "M11431 7342 c-20 -16 -49 -27 -81 -30 -28 -2 -50 -8 -50 -13 0 -4 12 -22 27 -40 59 -70 174 -89 268 -45 51 24 134 90 125 99 -3 3 -62 16 -131 29 l-126 24 -32 -24z",
  "M5765 7294 c-16 -2 -95 -14 -175 -25 -596 -83 -1294 -388 -1815 -794 -635 -494 -1098 -1149 -1423 -2011 -102 -271 -136 -380 -327 -1054 -122 -429 -229 -686 -378 -913 -105 -159 -272 -343 -427 -470 l-45 -37 30 0 c36 0 379 27 445 35 761 96 1554 317 2175 608 281 131 589 313 763 448 34 27 62 47 62 43 0 -21 -101 -194 -157 -269 -84 -112 -285 -314 -420 -422 -118 -95 -314 -226 -476 -320 -121 -70 -547 -283 -566 -283 -6 0 -11 -5 -11 -12 0 -18 452 -3 650 22 708 89 1153 358 1480 895 54 88 158 296 203 405 159 384 286 931 332 1430 25 260 16 711 -15 806 -25 75 -87 97 -285 98 -160 1 -220 -4 -365 -34 -559 -114 -972 -441 -1126 -893 -32 -95 -32 -141 2 -163 28 -19 12 -22 239 46 240 72 597 123 610 88 3 -8 -5 -48 -19 -88 -150 -429 -636 -787 -1026 -757 -214 17 -340 122 -410 342 -29 93 -32 325 -6 455 139 680 634 1391 1214 1744 158 97 298 151 450 176 153 25 312 -26 429 -136 77 -72 94 -71 148 14 206 324 300 447 475 623 69 69 173 164 232 212 59 48 110 97 113 108 10 30 -19 56 -78 69 -51 12 -444 22 -502 14z",
  "M6870 6817 c-226 -81 -487 -264 -746 -522 -194 -193 -325 -373 -360 -492 -20 -69 -11 -101 34 -120 32 -13 51 -13 166 1 81 9 135 12 146 6 26 -14 32 -129 21 -395 -31 -709 -124 -1400 -247 -1839 -184 -657 -507 -1138 -994 -1481 -30 -21 -59 -43 -65 -48 -6 -6 69 -7 205 -4 526 14 1123 139 1645 344 154 61 342 152 393 190 42 31 43 71 3 122 -100 127 -179 321 -216 536 -56 322 -30 851 96 1975 21 195 46 420 54 500 8 80 17 163 20 185 3 22 14 150 25 285 40 502 39 697 -4 747 -31 36 -93 39 -176 10z",
  "M8195 6442 c-396 -102 -727 -568 -919 -1292 -132 -498 -178 -1200 -111 -1688 104 -752 476 -1180 954 -1098 396 69 738 451 946 1057 81 236 133 475 171 789 22 179 25 674 6 848 -48 429 -158 775 -330 1037 -64 98 -212 242 -291 284 -139 73 -295 97 -426 63z m146 -782 c58 -16 124 -82 164 -163 70 -143 105 -349 105 -616 0 -421 -67 -765 -200 -1036 -94 -193 -188 -280 -300 -279 -186 1 -292 212 -315 629 -11 199 21 548 71 773 81 366 208 613 349 679 56 26 74 27 126 13z",
  "M10425 6026 c-393 -90 -720 -580 -879 -1316 -89 -411 -117 -941 -71 -1310 68 -533 272 -925 550 -1056 111 -53 181 -67 309 -62 82 3 128 11 176 28 155 54 281 140 414 281 269 286 451 716 543 1278 23 148 27 194 27 421 1 349 -29 578 -110 848 -144 474 -390 789 -684 876 -78 23 -203 29 -275 12z m223 -745 c20 -11 51 -34 68 -53 252 -269 221 -1214 -56 -1651 -149 -236 -359 -237 -478 -2 -62 124 -92 301 -92 552 0 277 37 518 116 759 72 218 159 349 267 400 60 29 112 27 175 -5z",
  "M11973 5770 c-43 -18 -39 -50 26 -214 67 -170 121 -370 147 -546 21 -140 24 -536 6 -680 -7 -52 -15 -115 -18 -140 -7 -54 -40 -222 -60 -305 -103 -415 -302 -845 -543 -1170 -140 -189 -318 -376 -494 -518 -38 -31 -51 -47 -40 -47 36 0 291 69 388 105 55 20 172 72 260 115 482 235 838 588 1066 1055 105 218 186 475 206 665 12 114 9 406 -6 490 -51 298 -147 526 -311 746 -188 249 -524 487 -627 444z",
];

const GROUP_TRANSFORM =
  "translate(-117.5,863.641689) scale(0.1,-0.1)";

function EagleSvg({
  fillOpacity,
  strokeOpacity,
  drawProgress,
  isStatic,
}: {
  fillOpacity?: any;
  strokeOpacity?: any;
  drawProgress?: any;
  isStatic?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1297 683"
      className="h-auto w-full text-[var(--bone)]"
      aria-label="G100 - at first glance an eagle, on closer look the letters G100"
      role="img"
    >
      <motion.g
        transform={GROUP_TRANSFORM}
        style={
          isStatic
            ? { fillOpacity: 1, strokeOpacity: 0 }
            : { fillOpacity, strokeOpacity }
        }
      >
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={40}
            style={isStatic ? undefined : { pathLength: drawProgress }}
          />
        ))}
      </motion.g>
    </svg>
  );
}

export default function EagleReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The glide: ink strokes trace the bird
  const draw = useTransform(scrollYProgress, [0.04, 0.34], [0, 1]);
  // The body arrives: fill breathes in
  const fillOp = useTransform(scrollYProgress, [0.34, 0.46], [0, 1]);
  const strokeOp = useTransform(
    scrollYProgress,
    [0.04, 0.08, 0.4, 0.48],
    [0, 1, 1, 0]
  );
  // The detonation: the eye ignites
  const eyeGlow = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

  // Copy - the story in two lines
  const line1Op = useTransform(
    scrollYProgress,
    [0.08, 0.14, 0.3, 0.38],
    [0, 1, 1, 0]
  );
  const line2Op = useTransform(scrollYProgress, [0.48, 0.58], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.48, 0.58], [20, 0]);

  // Reduced-motion cut: same beat, no travel (Law IX)
  if (reduced) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-6 py-32">
        <EagleSvg isStatic />
        <p className="text-center text-xl font-semibold sm:text-2xl">
          At first glance, an eagle.
          <br />
          <span className="text-[var(--eye)]">
            On closer look, a hundred leaders.
          </span>
        </p>
      </section>
    );
  }

  return (
    <div ref={ref} className="relative h-[200vh]" id="reveal">
      <div className="sticky top-0 flex h-[100dvh] flex-col items-center justify-center overflow-hidden px-6">
        <div className="relative w-[88vw] max-w-2xl">
          <EagleSvg
            fillOpacity={fillOp}
            strokeOpacity={strokeOp}
            drawProgress={draw}
          />
          {/* The eye ignites - positioned over path 1 */}
          <motion.div
            aria-hidden
            style={{ opacity: eyeGlow }}
            className="pointer-events-none absolute left-[71%] top-[6%] h-[22%] w-[16%] rounded-full bg-[var(--eye)] opacity-0 blur-2xl"
          />
        </div>

        <div className="relative mt-12 h-16 w-full">
          <motion.p
            style={{ opacity: line1Op }}
            className="absolute inset-x-0 text-center text-lg text-neutral-400 sm:text-2xl"
          >
            At first glance, an eagle.
          </motion.p>
          <motion.p
            style={{ opacity: line2Op, y: line2Y }}
            className="absolute inset-x-0 text-center text-lg font-semibold sm:text-2xl"
          >
            On closer look,{" "}
            <span className="text-[var(--eye)]">a hundred leaders.</span>
          </motion.p>
        </div>
      </div>
    </div>
  );
}




