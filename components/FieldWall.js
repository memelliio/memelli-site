"use client";
import { useEffect, useRef } from "react";

export default function FieldWall() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    let raf, W, H;
    const parts = [];
    function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    const N = Math.max(70, Math.min(170, Math.floor((W * H) / 12000)));
    for (let i = 0; i < N; i++) {
      parts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.8 + 0.4 });
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(225,29,42," + (0.22 + p.r * 0.18) + ")";
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fieldwall" aria-hidden="true" />;
}
