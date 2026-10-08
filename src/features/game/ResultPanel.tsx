import { motion } from 'framer-motion';
import { AvatarIcon } from '../../components/AvatarIcon';
import { Button } from '../../components/Button';
import { otherPlayer } from '../../game/logic';
import { useGameStore } from '../../store/useGameStore';
import { DISC_COLORS, discBackground } from '../../theme/palette';

export function ResultPanel() {
  const status = useGameStore((s) => s.game.status);
  const players = useGameStore((s) => s.players);
  const nextStarter = useGameStore((s) => s.players[otherPlayer(s.game.starter)].name);
  const rematch = useGameStore((s) => s.rematch);
  const backToMenu = useGameStore((s) => s.backToMenu);

  const winner = status.kind === 'won' ? players[status.winner] : null;

  return (
    <motion.section
      aria-labelledby="result-title"
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="glass w-full max-w-md rounded-card p-6 text-center"
    >
      {winner ? (
        <>
          <div
            className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full text-black/75"
            style={{
              background: discBackground(winner.color),
              boxShadow: `0 0 30px 4px ${DISC_COLORS[winner.color].glow}88`,
            }}
          >
            <AvatarIcon name={winner.avatar} className="h-7 w-7" />
          </div>
          <h2 id="result-title" className="font-display text-3xl font-bold text-gold sm:text-4xl">
            {winner.name} wins!
          </h2>
          <p className="mt-1 text-muted">Four in a row, beautifully played.</p>
        </>
      ) : (
        <>
          <h2 id="result-title" className="font-display text-3xl font-bold text-gold sm:text-4xl">
            A perfect stalemate
          </h2>
          <p className="mt-1 text-muted">The board is full and nobody connected four.</p>
        </>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button autoFocus onClick={rematch}>
          Rematch
        </Button>
        <Button variant="secondary" onClick={backToMenu}>
          Back to menu
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted">{nextStarter} starts the rematch.</p>
    </motion.section>
  );
}