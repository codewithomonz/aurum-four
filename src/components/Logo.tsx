import { BRAND } from '../config';
import { DiscFace } from './DiscFace';

const MARK = [0, 1, 2, 3];

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex gap-[3px] rounded-full border border-primary/40 px-2 py-1.5"
        style={{ background: 'rgb(var(--c-board))' }}
      >
        {MARK.map((i) => (
          <DiscFace key={i} color="gold" className="h-2.5 w-2.5" />
        ))}
      </span>
      <span className="font-display text-xl font-semibold tracking-wide">{BRAND.name}</span>
    </div>
  );
}