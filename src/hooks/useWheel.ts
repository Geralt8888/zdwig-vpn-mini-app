import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { PRIZES } from '../config';
import { haptic } from '../lib/telegram';
import { drawWheel, segmentUnderPointer } from '../lib/wheel';
import type { Prize } from '../types';

const TAU = Math.PI * 2;

interface UseWheelOptions {
  onResult: (prize: Prize, index: number) => void;
}

interface UseWheelResult {
  spinning: boolean;
  spin: (index: number) => void;
  redraw: () => void;
}

export function useWheel(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { onResult }: UseWheelOptions,
): UseWheelResult {
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const [spinning, setSpinning] = useState(false);

  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) drawWheel(canvas, rotationRef.current);
  }, [canvasRef]);

  useEffect(() => {
    mountedRef.current = true;
    redraw();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    window.addEventListener('resize', redraw);

    return () => {
      mountedRef.current = false;
      observer.disconnect();
      window.removeEventListener('resize', redraw);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [canvasRef, redraw]);

  const spin = useCallback(
    (index: number) => {
      if (spinning) return;
      setSpinning(true);

      const seg = TAU / PRIZES.length;
      const jitter = (Math.random() - 0.5) * seg * 0.62;
      const target = -(index * seg + seg / 2) + jitter;
      const start = rotationRef.current;
      const startNorm = ((start % TAU) + TAU) % TAU;

      let delta = ((target - startNorm) % TAU + TAU) % TAU;
      delta += TAU * (5 + Math.floor(Math.random() * 2));

      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const duration = reduceMotion ? 700 : 5200;
      const startedAt = performance.now();

      let lastSegment = -1;
      let lastTick = 0;
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;

        rotationRef.current = (start + delta) % TAU;
        redraw();

        timeoutRef.current = window.setTimeout(() => {
          if (!mountedRef.current) return;
          setSpinning(false);
          onResultRef.current(PRIZES[index], index);
        }, 280);
      };

      const frame = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 5);
        rotationRef.current = start + delta * eased;
        redraw();

        const segment = segmentUnderPointer(rotationRef.current);
        if (segment !== lastSegment && now - lastTick > 85) {
          lastSegment = segment;
          lastTick = now;
          haptic.tap();
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          finish();
        }
      };

      rafRef.current = requestAnimationFrame(frame);

      // Защита от свёрнутого приложения: rAF может остановиться в фоне.
      timeoutRef.current = window.setTimeout(finish, duration + 900);
    },
    [spinning, redraw],
  );

  return { spinning, spin, redraw };
}
