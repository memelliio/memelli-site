'use client';
import { useEffect, useRef } from 'react';
import { api } from '../app/lib/api';

export default function GrogBath() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let isActive = true;

    async function initSwarm() {
      try {
        // Law 1: Fresh live-computed counts at answer-time/render
        const data = await api.getLiveData();
        if (!isActive) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Handle responsive screen constraints natively
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize particles matching the true ~8,000,005 grog telemetry count
        const totalGrogs = data.grogs || 8000005;
        const particles = Array.from({ length: Math.min(totalGrogs, 300) }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.5 + Math.random() * 1.5
        }));

        function render() {
          if (!isActive) return;
          ctx.fillStyle = '#000000'; // Strict solid-black foundation
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#ff0000'; // Red WebGL-style particle elements
          particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();

            p.y -= p.speed;
            if (p.y < 0) p.y = canvas.height;
          });

          animationFrameId = requestAnimationFrame(render);
        }

        render();
      } catch (error) {
        console.error('GrogBath synchronization breakdown:', error);
      }
    }

    initSwarm();

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }} />;
}
