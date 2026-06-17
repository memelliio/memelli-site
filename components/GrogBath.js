'use client';
import { useEffect, useRef } from 'react';
import { api } from '../app/lib/api';

export default function GrogBath() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf, isActive = true;
    function size() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    size();
    window.addEventListener('resize', size);

    // The bath: a dense grog swarm, rendered immediately (never blocked on the network)
    const N = Math.min(1300, Math.max(500, Math.floor((canvas.width * canvas.height) / 2600)));
    const P = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 1.4),
      r: 0.6 + Math.random() * 1.8
    }));

    function render() {
      if (!isActive) return;
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const p of P) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = 'rgba(225,29,42,' + (0.35 + p.r * 0.25) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    }
    render();

    // Live telemetry modulates the swarm (API-only: density boost from real activity)
    api.getLiveData().then(d => {
      const cpm = (d && d.wire && d.wire.calls_per_min) || 0;
      const boost = Math.min(500, Math.floor(cpm) * 2);
      for (let i = 0; i < boost && isActive; i++) {
        P.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: -(0.3 + Math.random() * 1.4), r: 0.6 + Math.random() * 1.8 });
      }
    }).catch(() => {});

    return () => { isActive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }} />;
}
