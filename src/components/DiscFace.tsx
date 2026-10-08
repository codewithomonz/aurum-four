import { DISC_COLORS, discBackground, type ColorKey } from '../theme/palette';

interface DiscFaceProps {
  color: ColorKey;
  className?: string;
  glow?: boolean;
}

/** A static, decorative disc used outside the board (hero, ghost preview, logo). */
export function DiscFace({ color, className = '', glow = false }: DiscFaceProps) {
  const base = 'inset 0 -4px 8px rgba(0,0,0,.35), inset 0 3px 5px rgba(255,255,255,.35)';
  return (
    <span
      aria-hidden="true"
      className={`block rounded-full ${className}`}
      style={{
        background: discBackground(color),
        boxShadow: glow ? `${base}, 0 0 24px 2px ${DISC_COLORS[color].glow}88` : base,
      }}
    />
  );
}