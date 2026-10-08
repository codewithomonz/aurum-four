import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DISC_COLORS, type ColorKey } from '../../theme/palette';

interface Particle {
  id: number;
  x: number;
  drift: number;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  round: boolean;
}

const PARTICLE_COUNT = 90;

export function Confetti({ winner }: { winner: ColorKey }) {
  const reduced = useReducedMotion();

  const particles = useMemo<Particle[]>(() => {
    const palette = [DISC_COLORS[winner].glow, DISC_COLORS[winner].light, '#F6D676', '#FFFFFF'];
    return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
      id,
      x: Math.random() * 100,
      drift: (Math.random() - 0.5) * 240,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 2.4 + Math.random() * 1.8,
      rotate: 360 + Math.random() * 720,
      color: palette[id % palette.length],
      round: Math.random() > 0.6,
    }));
  }, [winner]);

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            borderRadius: p.round ? 9999 : 2,
          }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', x: p.drift, rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  );
}