import type { AvatarKey } from '../theme/palette';

const PATHS: Record<AvatarKey, string> = {
  crown: 'M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6z',
  diamond: 'M12 2l8 10-8 10-8-10z',
  flame: 'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z',
};

interface AvatarIconProps {
  name: AvatarKey;
  className?: string;
}

export function AvatarIcon({ name, className }: AvatarIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}