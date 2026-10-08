import { useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { BRAND } from './config';
import { Logo } from './components/Logo';
import { Toolbar } from './components/Toolbar';
import { GameScreen } from './features/game/GameScreen';
import { StartScreen } from './features/menu/StartScreen';
import { useGameStore } from './store/useGameStore';

const screenMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.28 },
} as const;

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const theme = useGameStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    // reducedMotion="user" disables transform animations for people who prefer reduced motion.
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink"
        >
          Skip to content
        </a>

        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Logo />
          <Toolbar />
        </header>

        <AnimatePresence mode="wait">
          {phase === 'menu' ? (
            <motion.div key="menu" className="flex flex-1 flex-col" {...screenMotion}>
              <StartScreen />
            </motion.div>
          ) : (
            <motion.div key="game" className="flex flex-1 flex-col" {...screenMotion}>
              <GameScreen />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="py-6 text-center text-xs text-muted">Demo build of {BRAND.name}</footer>
      </div>
    </MotionConfig>
  );
}