import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

/** Slides the old value out and the new one in whenever the number changes. */
export function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="inline-block"
          initial={{ y: '60%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-60%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}