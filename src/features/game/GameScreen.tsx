import { AnimatePresence } from 'framer-motion';
import type { GameState, PlayerId } from '../../game/types';
import { useGameStore, type InvalidMove } from '../../store/useGameStore';
import type { PlayerProfile } from '../../theme/palette';
import { Board } from './Board';
import { Confetti } from './Confetti';
import { Controls } from './Controls';
import { ResultPanel } from './ResultPanel';
import { Scoreboard } from './Scoreboard';

function describeState(
  game: GameState,
  players: Record<PlayerId, PlayerProfile>,
  invalid: InvalidMove | null,
): string {
  if (invalid) return `Column ${invalid.col + 1} is full. Choose another column.`;

  switch (game.status.kind) {
    case 'won':
      return `${players[game.status.winner].name} wins with four in a row.`;
    case 'draw':
      return 'The board is full. The game is a draw.';
    case 'playing': {
      const turn = `${players[game.current].name}'s turn.`;
      if (game.moves.length === 0) return `${turn} Choose a column.`;
      const last = game.moves[game.moves.length - 1];
      return `${players[last.player].name} dropped in column ${last.col + 1}. ${turn}`;
    }
  }
}

export function GameScreen() {
  const game = useGameStore((s) => s.game);
  const players = useGameStore((s) => s.players);
  const invalid = useGameStore((s) => s.invalid);
  const { status } = game;

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-5 px-4 pb-10 pt-2 outline-none"
    >
      <Scoreboard />
      <Board />

      <AnimatePresence mode="wait" initial={false}>
        {status.kind === 'playing' ? <Controls key="controls" /> : <ResultPanel key="result" />}
      </AnimatePresence>

      <p className="hidden max-w-md text-center text-xs text-muted md:block">
        Use the arrow keys to pick a column and Enter to drop. Number keys drop straight into a column.
      </p>

      {/* Announces turns, invalid moves and results to screen readers. */}
      <p role="status" aria-live="polite" className="sr-only">
        {describeState(game, players, invalid)}
      </p>

      {status.kind === 'won' && <Confetti winner={players[status.winner].color} />}
    </main>
  );
}