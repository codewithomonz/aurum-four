import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="grid h-11 w-11 place-items-center rounded-full border border-line/70 bg-surface/60 text-ink backdrop-blur transition-colors hover:border-primary/60 hover:text-primary"
    >
      {children}
    </motion.button>
  );
}