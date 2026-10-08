import type { ReactNode } from 'react';
import { useGameStore } from '../store/useGameStore';
import { IconButton } from './IconButton';

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {children}
    </svg>
  );
}

const Sun = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

const Moon = () => (
  <Svg>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Svg>
);

const SpeakerOn = () => (
  <Svg>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </Svg>
);

const SpeakerOff = () => (
  <Svg>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    <path d="M22 9l-6 6M16 9l6 6" />
  </Svg>
);

export function Toolbar() {
  const theme = useGameStore((s) => s.theme);
  const muted = useGameStore((s) => s.muted);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  const toggleMute = useGameStore((s) => s.toggleMute);

  return (
    <div className="flex items-center gap-2">
      <IconButton label={muted ? 'Unmute sound' : 'Mute sound'} onClick={toggleMute}>
        {muted ? <SpeakerOff /> : <SpeakerOn />}
      </IconButton>
      <IconButton
        label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </IconButton>
    </div>
  );
}