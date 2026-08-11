"use client";

import { useEffect, useRef } from "react";
import { EAGLE_POINTS, EAGLE_ASPECT } from "./eagle-points";

// v2 - batched rendering, zero per-frame allocation, idle start.

const COLORS = [
  "rgb(245,242,236)",
  "rgb(232,163,61)",
  "rgb(226,96,58)",
];

type P = {
  tx: number;
  ty: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  ci: number;
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
    const step = mobile ? 2 : 1;
    const dprCap = mobile ? 1.5 : 2;

    let W = 0;
    let H = 0;
    let raf = 0;
    let running = false;
    let disposed = false;
    let started = 0;

    const pointer = { x: -9999, y: -9999, active: false };

    const particles: P[] = [];
    for (let i = 0; i < EAGLE_POINTS.length; i += step) {
      const [nx, ny] = EAGLE_POINTS[i];
      const roll = Math.random();
      const ci = roll < 0.06 ? 1 : roll < 0.09 ? 2 : 0;
      particles.push({
        tx: nx,
        ty: ny,
        x: Math.random() * 2 - 0.5,
        y: Math.random() * 2 - 0.5,
        vx: 0,
        vy: 0,
        size: 0.8 + Math.random() * 1.3,
        ci,
        alpha: 0.35 + Math.random() * 0.65,
        tw: Math.random() * 6.28,
        twSpeed: 0.4 + Math.random() * 1.2,
        delay: Math.random() * 1200,
      });
    }

    // batch particles by color once
    const groups: P[][] = [[], [], []];
    for (const p of particles) groups[p.ci].push(p);

    function resize() {
      if (!wrap || !canvas || !ctx) return;
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
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
      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = COLORS[g];
        for (const p of groups[g]) {
          ctx.globalAlpha = p.alpha;
          const s = p.size;
          ctx.fillRect(p.tx * W - s, p.ty * H - s, s * 2, s * 2);
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame(now: number) {
      if (!ctx || !running || disposed) return;
      const t = now - started;
      ctx.clearRect(0, 0, W, H);

      const R = mobile ? 70 : 110;
      const pa = pointer.active;
      const px0 = pointer.x;
      const py0 = pointer.y;

      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = COLORS[g];
        const arr = groups[g];
        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          if (t < p.delay) continue;

          const txp = p.tx * W;
          const typ = p.ty * H;
          let x = p.x * W;
          let y = p.y * H;

          let ax = (txp - x) * 0.012;
          let ay = (typ - y) * 0.012;

          if (pa) {
            const dx = x - px0;
            const dy = y - py0;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const f = ((R - d) / R) * 2.2;
              ax += (dx / d) * f;
              ay += (dy / d) * f;
            }
          }

          p.vx = (p.vx + ax) * 0.88;
          p.vy = (p.vy + ay) * 0.88;
          x += p.vx;
          y += p.vy;
          p.x = x / W;
          p.y = y / H;

          p.tw += p.twSpeed * 0.016;
          ctx.globalAlpha =
            p.alpha * (0.75 + Math.sin(p.tw) * 0.25);
          const s = p.size;
          ctx.fillRect(x - s, y - s, s * 2, s * 2);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function begin() {
      if (disposed || running) return;
      running = true;
      started = performance.now();
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
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0])
        toLocal(e.touches[0].clientX, e.touches[0].clientY);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      drawStatic();
      return () => {
        disposed = true;
        window.removeEventListener("resize", resize);
      };
    }

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);

    const io = new IntersectionObserver(
      (entries) => {
        const vis = !!entries[0]?.isIntersecting;
        if (!vis) {
          running = false;
          cancelAnimationFrame(raf);
        } else if (started > 0 && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (started > 0) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    // Let the page paint first - assemble when the browser breathes
    const idler =
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(begin, { timeout: 900 })
        : setTimeout(begin, 500);

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      if ("requestIdleCallback" in window)
        (window as any).cancelIdleCallback(idler);
      else clearTimeout(idler as any);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
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


