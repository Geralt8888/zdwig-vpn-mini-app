import { PRIZES } from '../config';
import type { Prize, PrizeTone } from '../types';

const TAU = Math.PI * 2;

const TONES: Record<PrizeTone, { fills: [string, string]; text: string }> = {
  base: { fills: ['#171a2f', '#1e2140'], text: '#dfe2ff' },
  rare: { fills: ['#241b45', '#2b2055'], text: '#d8ccff' },
  gold: { fills: ['#3a2b10', '#463413'], text: '#ffd166' },
};

export function pickPrizeIndex(prizes: Prize[] = PRIZES): number {
  const total = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < prizes.length; i++) {
    roll -= prizes[i].weight;
    if (roll <= 0) return i;
  }

  return prizes.length - 1;
}

export function segmentUnderPointer(rotation: number, count = PRIZES.length): number {
  const seg = TAU / count;
  return Math.floor((((-rotation % TAU) + TAU) % TAU) / seg);
}

/**
 * Рисует колесо на canvas с учётом devicePixelRatio.
 * Возвращает CSS-размер колеса, чтобы вызывающий код мог позиционировать хаб.
 */
export function drawWheel(canvas: HTMLCanvasElement, rotation: number, prizes: Prize[] = PRIZES): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const rect = canvas.getBoundingClientRect();
  const size = Math.max(200, Math.round(rect.width || 320));
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const px = Math.round(size * dpr);

  if (canvas.width !== px || canvas.height !== px) {
    canvas.width = px;
    canvas.height = px;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size / 2 - Math.max(6, size * 0.02);
  const seg = TAU / prizes.length;
  const fontSize = Math.max(10, Math.min(15, size * 0.042));
  const pad = Math.max(14, size * 0.055);

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(rotation);

  for (let i = 0; i < prizes.length; i++) {
    const tone = TONES[prizes[i].tone] ?? TONES.base;
    const a0 = i * seg - Math.PI / 2;
    const a1 = a0 + seg;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, a0, a1);
    ctx.closePath();
    ctx.fillStyle = tone.fills[i % 2];
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const depth = ctx.createRadialGradient(-radius * 0.4, -radius * 0.5, radius * 0.1, 0, 0, radius);
  depth.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
  depth.addColorStop(0.45, 'rgba(255, 255, 255, 0.02)');
  depth.addColorStop(1, 'rgba(0, 0, 0, 0.30)');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fillStyle = depth;
  ctx.fill();

  ctx.textBaseline = 'middle';
  ctx.font = `700 ${fontSize}px Inter, system-ui, -apple-system, "Segoe UI", sans-serif`;

  for (let i = 0; i < prizes.length; i++) {
    const prize = prizes[i];
    const tone = TONES[prize.tone] ?? TONES.base;
    const mid = i * seg + seg / 2 - Math.PI / 2;

    ctx.save();
    ctx.rotate(mid);
    ctx.fillStyle = tone.text;

    if (Math.cos(mid) < 0) {
      ctx.rotate(Math.PI);
      ctx.textAlign = 'left';
      ctx.fillText(prize.short, -(radius - pad), 0);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(prize.short, radius - pad, 0);
    }
    ctx.restore();
  }

  const rim = ctx.createLinearGradient(-radius, -radius, radius, radius);
  rim.addColorStop(0, '#8b5cff');
  rim.addColorStop(0.5, '#22d3ee');
  rim.addColorStop(1, '#ffd166');
  ctx.beginPath();
  ctx.arc(0, 0, radius - Math.max(2, size * 0.006), 0, TAU);
  ctx.lineWidth = Math.max(3, size * 0.013);
  ctx.strokeStyle = rim;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, size * 0.155, 0, TAU);
  ctx.fillStyle = '#0b0c16';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
  return size;
}
