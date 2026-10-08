import { useEffect, useState } from 'react';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { AvatarIcon } from '../../components/AvatarIcon';
import type { PlayerId } from '../../game/types';
import { useGameStore } from '../../store/useGameStore';
import { DISC_COLORS, discBackground } from '../../theme/palette';

function PlayerCard({ id }: { id: PlayerId }) {
  const profile = useGameStore((s) => s.players[id]);
  const wins = useGameStore((s) => s.scores.wins[id]);
  const active = useGameStore((s) => s.game.status.kind === 'playing' && s.game.current === id);
  const winner = useGameStore((s) => s.game.status.kind === 'won' && s.game.status.winner === id);
  const { glow } = DISC_COLORS[profile.color];

  return (
    <div
      className="glass relative rounded-card p-3 sm:p-4"
      aria-current={active ? 'true' : undefined}
      style={{
        boxShadow:
          active || winner ? `0 0 0 1.5px ${glow}, 0 0 34px -6px ${glow}bb` : undefined,
        transition: 'box-shadow 300ms ease',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-black/75"
          style={{ background: discBackground(profile.color) }}
        >
          <AvatarIcon name={profile.avatar} className="h-5 w-5" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold sm:text-base">{profile.name}</span>
      </div>

      <div className="mt-3 flex min-h-9 items-end justify-between gap-2">
        <div>
          <span className="block text-xs text-muted">Wins</span>
          <AnimatedNumber value={wins} className="font-display text-3xl leading-none" />
        </div>
        {active && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Your move
          </span>
        )}
        {winner && (
          <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
            Winner
          </span>
        )}
      </div>
    </div>
  );
}

export function Scoreboard() {
  const scores = useGameStore((s) => s.scores);
  const playing = useGameStore((s) => s.game.status.kind === 'playing');
  const resetScores = useGameStore((s) => s.resetScores);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 3000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  const finished = scores.wins[1] + scores.wins[2] + scores.draws;
  const round = playing ? finished + 1 : finished;

  return (
    <section aria-label="Scoreboard" className="w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
        <PlayerCard id={1} />
        <div className="glass grid min-w-16 place-items-center rounded-card px-3 py-2 text-center">
          <span className="text-xs text-muted">Draws</span>
          <AnimatedNumber value={scores.draws} className="font-display text-2xl" />
        </div>
        <PlayerCard id={2} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
        <span>
          {finished === 0
            ? 'Round 1. No finished rounds yet.'
            : `Round ${round}. ${finished} finished so far.`}
        </span>
        {finished > 0 && (
          <button
            type="button"
            className="min-h-11 rounded-md px-2 underline-offset-4 hover:text-ink hover:underline"
            onClick={() => {
              if (confirming) {
                resetScores();
                setConfirming(false);
              } else {
                setConfirming(true);
              }
            }}
          >
            {confirming ? 'Tap again to reset scores' : 'Reset scores'}
          </button>
        )}
      </div>
    </section>
  );
}