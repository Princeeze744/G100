"use client";

import { useEffect, useRef } from "react";
import { EAGLE_POINTS, EAGLE_ASPECT } from "./eagle-points";

// The G100 eagle, assembled live from points of light.
// Scattered individuals become one form - the story, rendered.

const BONE = [245, 242, 236];
const EYE = [232, 163, 61];
const EMBER = [226, 96, 58];

type P = {
  tx: number;
  ty: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number[];
  alpha: number;
  tw: number;
  twSpeed: number;
  delay: number;
};

export default function ParticleEagle() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const mobile = window.innerWidth < 640;

    // Device tier: phones fly a lighter flock
    const step = mobile ? 2 : 1;
    const dprCap = mobile ? 1.5 : 2;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let started = performance.now();

    const pointer = { x: -9999, y: -9999, active: false };

    const particles: P[] = [];
    for (let i = 0; i < EAGLE_POINTS.length; i += step) {
      const [nx, ny] = EAGLE_POINTS[i];
      const roll = Math.random();
      const color =
        roll < 0.06 ? EYE : roll < 0.09 ? EMBER : BONE;
      particles.push({
        tx: nx,
        ty: ny,
        x: Math.random() * 2 - 0.5,
        y: Math.random() * 2 - 0.5,
        vx: 0,
        vy: 0,
        size: 0.7 + Math.random() * 1.4,
        color,
        alpha: 0.35 + Math.random() * 0.65,
        tw: Math.random() * Math.PI * 2,
        twSpeed: 0.4 + Math.random() * 1.2,
        delay: Math.random() * 1400,
      });
    }

    function resize() {
      if (!wrap || !canvas || !ctx) return;
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const [r, g, b] = p.color;
        ctx.fillStyle =
          "rgba(" + r + "," + g + "," + b + "," + p.alpha + ")";
        ctx.beginPath();
        ctx.arc(p.tx * W, p.ty * H, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame(now: number) {
      if (!ctx || !running) return;
      const t = now - started;
      ctx.clearRect(0, 0, W, H);

      const R = mobile ? 70 : 110;

      for (const p of particles) {
        if (t < p.delay) continue;

        const txp = p.tx * W;
        const typ = p.ty * H;
        let px = p.x * W;
        let py = p.y * H;

        // spring home
        let ax = (txp - px) * 0.012;
        let ay = (typ - py) * 0.012;

        // cursor wind
        if (pointer.active) {
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < R && d > 0.01) {
            const f = ((R - d) / R) * 2.2;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }

        p.vx = (p.vx + ax) * 0.88;
        p.vy = (p.vy + ay) * 0.88;
        px += p.vx;
        py += p.vy;
        p.x = px / W;
        p.y = py / H;

        p.tw += p.twSpeed * 0.016;
        const twinkle = 0.75 + Math.sin(p.tw) * 0.25;

        const [r, g, b] = p.color;
        ctx.fillStyle =
          "rgba(" +
          r +
          "," +
          g +
          "," +
          b +
          "," +
          p.alpha * twinkle +
          ")";
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function toLocal(cx: number, cy: number) {
      const r = canvas!.getBoundingClientRect();
      pointer.x = cx - r.left;
      pointer.y = cy - r.top;
      pointer.active = true;
    }

    const onMouse = (e: MouseEvent) => toLocal(e.clientX, e.clientY);
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0])
        toLocal(e.touches[0].clientX, e.touches[0].clientY);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      drawStatic();
    } else {
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("mouseout", onLeave);
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onLeave);

      // pause off-screen and when tab hidden
      const io = new IntersectionObserver(
        (entries) => {
          const vis = entries[0]?.isIntersecting;
          if (vis && !running) {
            running = true;
            raf = requestAnimationFrame(frame);
          } else if (!vis) {
            running = false;
            cancelAnimationFrame(raf);
          }
        },
        { threshold: 0.05 }
      );
      io.observe(wrap);

      const onVis = () => {
        if (document.hidden) {
          running = false;
          cancelAnimationFrame(raf);
        } else {
          running = true;
          started = performance.now() - 5000;
          raf = requestAnimationFrame(frame);
        }
      };
      document.addEventListener("visibilitychange", onVis);

      raf = requestAnimationFrame(frame);

      return () => {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("mouseout", onLeave);
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchend", onLeave);
        document.removeEventListener("visibilitychange", onVis);
        io.disconnect();
      };
    }

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-[92vw] max-w-xl sm:max-w-2xl"
      style={{ aspectRatio: String(EAGLE_ASPECT) }}
      aria-label="G100 eagle assembled from particles"
      role="img"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
