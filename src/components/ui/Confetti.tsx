import { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
}

const COLORS = ['#8b5cff', '#22d3ee', '#ffd166', '#34d399', '#f472b6', '#a78bfa'];

export function Confetti({ trigger }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: width * (0.25 + Math.random() * 0.5),
      y: height * 0.34 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 11,
      vy: -Math.random() * 13 - 3,
      w: 5 + Math.random() * 7,
      h: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    }));

    const startedAt = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startedAt;
      ctx.clearRect(0, 0, width, height);
      let alive = 0;

      for (const particle of particles) {
        particle.vy += 0.28;
        particle.vx *= 0.995;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rot += particle.vr;
        particle.life = Math.max(0, 1 - elapsed / 2600);

        if (particle.life <= 0 || particle.y > height + 40) continue;
        alive += 1;

        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rot);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
        ctx.restore();
      }

      if (alive > 0 && elapsed < 3200) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[110] h-full w-full"
      aria-hidden="true"
    />
  );
}
