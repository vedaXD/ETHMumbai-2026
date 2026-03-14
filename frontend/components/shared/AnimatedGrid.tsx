"use client";

import { useEffect, useRef } from 'react';

export default function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Grid animation with red accents
    let offset = 0;
    const gridSize = 50;

    const animate = () => {
      offset += 0.3;
      if (offset >= gridSize) offset = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw main grid in dark gray
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -offset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = -offset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw red accent lines (every 5th line)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';
      ctx.lineWidth = 2;

      // Vertical red lines
      for (let x = -offset; x < canvas.width; x += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal red lines
      for (let y = -offset; y < canvas.height; y += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}