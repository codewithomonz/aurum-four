import { motion } from 'framer-motion';
import { Button } from '../../components/Button';
import { useGameStore } from '../../store/useGameStore';

export function Controls() {
  const canUndo = useGameStore((s) => s.game.moves.length > 0);
  const undo = useGameStore((s) => s.undo);
  const restart = useGameStore((s) => s.restart);
  const backToMenu = useGameStore((s) => s.backToMenu);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex flex-wrap justify-center gap-3"
    >
      <Button variant="secondary" onClick={undo} disabled={!canUndo}>
        Undo move
      </Button>
      <Button variant="secondary" onClick={restart}>
        Restart
      </Button>
      <Button variant="ghost" onClick={backToMenu}>
        Back to menu
      </Button>
    </motion.div>
  );
}