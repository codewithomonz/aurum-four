import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'text-primary-ink shadow-glow bg-[length:200%_100%] bg-[linear-gradient(110deg,rgb(var(--c-primary))_0%,rgb(var(--c-accent))_50%,rgb(var(--c-primary))_100%)] animate-shimmer',
  secondary: 'border border-line bg-surface-2/70 text-ink backdrop-blur hover:border-primary/60',
  ghost: 'text-muted hover:text-ink',
};

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { y: -1 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}