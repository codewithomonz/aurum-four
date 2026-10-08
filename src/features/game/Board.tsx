import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'framer-motion';
import { DiscFace } from '../../components/DiscFace';
import { COLS, ROWS } from '../../game/constants';
import { getDropRow } from '../../game/logic';
import type { Board as BoardState, Cell as CellValue, PlayerId } from '../../game/types';
import { useGameStore, type InvalidMove } from '../../store/useGameStore';
import { DISC_COLORS, discBackground, type ColorKey } from '../../theme/palette';

const COLUMN_INDEXES = Array.from({ length: COLS }, (_, i) => i);
const ROW_INDEXES = Array.from({ length: ROWS }, (_, i) => i);
const GRID: CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` };
const HOLE_SHADOW = 'inset 0 8px 14px rgba(0,0,0,.75), inset 0 -2px 2px rgba(255,255,255,.07)';
const DISC_SHADOW =
  'inset 0 -5px 10px rgba(0,0,0,.3), inset 0 4px 6px rgba(255,255,255,.3), 0 2px 6px rgba(0,0,0,.5)';

type PlayerColors = Record<PlayerId, ColorKey>;

interface DiscProps {
  color: ColorKey;
  row: number;
  winning: boolean;
  dimmed: boolean;
}

function Disc({ color, row, winning, dimmed }: DiscProps) {
  const { glow } = DISC_COLORS[color];
  return (
    <motion.span
      className="absolute inset-[7%] rounded-full"
      style={{
        background: discBackground(color),
        boxShadow: winning ? `${DISC_SHADOW}, 0 0 26px 6px ${glow}aa` : DISC_SHADOW,
        zIndex: winning ? 2 : 1,
      }}
      // Percent translation is relative to the disc, so deeper rows start proportionally higher.
      initial={{ y: `${-(row + 1) * 125}%`, opacity: 1 }}
      animate={{
        y: '0%',
        scale: winning ? [1, 1.07, 1] : 1,
        opacity: dimmed ? 0.4 : 1,
      }}
      exit={{ scale: 0.3, opacity: 0 }}
      transition={{
        y: { type: 'spring', stiffness: 200, damping: 17, mass: 1 },
        scale: winning
          ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
          : { duration: 0.2 },
        opacity: { duration: 0.3 },
      }}
    >
      <span
        className="absolute inset-[17%] rounded-full border border-white/25"
        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,.25)' }}
      />
    </motion.span>
  );
}

interface CellProps {
  cell: CellValue;
  row: number;
  winning: boolean;
  dimmed: boolean;
  colors: PlayerColors;
}

function Cell({ cell, row, winning, dimmed, colors }: CellProps) {
  return (
    <span className="relative block aspect-square">
      <span
        className="absolute inset-[7%] rounded-full"
        style={{ background: 'rgb(var(--c-hole))', boxShadow: HOLE_SHADOW }}
      />
      <AnimatePresence initial={false}>
        {cell !== null && (
          <Disc key="disc" color={colors[cell]} row={row} winning={winning} dimmed={dimmed} />
        )}
      </AnimatePresence>
    </span>
  );
}

interface ColumnProps {
  col: number;
  board: BoardState;
  playing: boolean;
  winningCells: ReadonlySet<string>;
  colors: PlayerColors;
  invalid: InvalidMove | null;
  reduced: boolean;
  registerRef: (element: HTMLButtonElement | null) => void;
  onPlay: (col: number) => void;
  onHover: (col: number) => void;
}

function Column({
  col,
  board,
  playing,
  winningCells,
  colors,
  invalid,
  reduced,
  registerRef,
  onPlay,
  onHover,
}: ColumnProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const free = board.reduce((count, line) => (line[col] === null ? count + 1 : count), 0);
  const full = free === 0;
  const shakeKey = invalid !== null && invalid.col === col ? invalid.nonce : 0;

  useEffect(() => {
    if (shakeKey === 0 || reduced) return;
    void animate(scope.current, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
  }, [shakeKey, reduced, animate, scope]);

  return (
    <div ref={scope} className="relative">
      <button
        type="button"
        ref={registerRef}
        aria-label={
          full ? `Column ${col + 1}, full` : `Column ${col + 1}, ${free} free ${free === 1 ? 'slot' : 'slots'}`
        }
        aria-disabled={full || !playing ? true : undefined}
        onClick={() => onPlay(col)}
        onMouseEnter={() => onHover(col)}
        onFocus={() => onHover(col)}
        className="relative block w-full touch-manipulation overflow-hidden rounded-2xl outline-none transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        {ROW_INDEXES.map((row) => {
          const key = `${row}-${col}`;
          const winning = winningCells.has(key);
          return (
            <Cell
              key={row}
              cell={board[row][col]}
              row={row}
              winning={winning}
              dimmed={winningCells.size > 0 && !winning}
              colors={colors}
            />
          );
        })}
      </button>

      <AnimatePresence>
        {shakeKey > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-9 z-20 flex justify-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap rounded-lg bg-danger px-2.5 py-1 text-xs font-semibold text-bg shadow-lift"
            >
              Column is full
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Board() {
  const game = useGameStore((s) => s.game);
  const players = useGameStore((s) => s.players);
  const invalid = useGameStore((s) => s.invalid);
  const playColumn = useGameStore((s) => s.playColumn);
  const clearInvalid = useGameStore((s) => s.clearInvalid);
  const reduced = useReducedMotion() ?? false;

  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const columnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { board, status, current } = game;
  const playing = status.kind === 'playing';
  const colors: PlayerColors = { 1: players[1].color, 2: players[2].color };

  const winningCells = useMemo(
    () => new Set(status.kind === 'won' ? status.line.map((p) => `${p.row}-${p.col}`) : []),
    [status],
  );

  // The "column is full" tooltip clears itself.
  useEffect(() => {
    if (!invalid) return;
    const timer = window.setTimeout(clearInvalid, 1400);
    return () => window.clearTimeout(timer);
  }, [invalid, clearInvalid]);

  // Number keys 1 to 9 drop into the matching column from anywhere on the screen.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const col = Number(event.key) - 1;
      if (col >= COLS) return;
      setHoverCol(col);
      playColumn(col);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playColumn]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const focused = columnRefs.current.findIndex((el) => el !== null && el === document.activeElement);
    let target: number | null = null;
    if (event.key === 'ArrowRight') target = Math.min(COLS - 1, focused + 1);
    else if (event.key === 'ArrowLeft') target = Math.max(0, focused < 0 ? 0 : focused - 1);
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = COLS - 1;
    if (target === null) return;
    event.preventDefault();
    columnRefs.current[target]?.focus();
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoverCol(null);
  };

  const ghostCol =
    playing && hoverCol !== null && getDropRow(board, hoverCol) !== null ? hoverCol : null;

  return (
    <div className="relative" style={{ width: 'min(92vw, 34rem)' }}>
      {/* Preview of the disc you are about to drop. */}
      <div aria-hidden="true" className="px-[2.5%]" style={GRID}>
        {COLUMN_INDEXES.map((col) => (
          <div key={col} className="aspect-square p-[9%]">
            <AnimatePresence>
              {ghostCol === col && (
                <motion.div
                  key="ghost"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <DiscFace color={colors[current]} glow className="aspect-square w-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div
        role="group"
        aria-label={`Game board with ${COLS} columns. Use the arrow keys to choose a column and Enter to drop a disc.`}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onMouseLeave={() => setHoverCol(null)}
        className="rounded-board border border-primary/40 p-[2.5%]"
        style={{
          background: 'linear-gradient(160deg, rgb(var(--c-board-hi)), rgb(var(--c-board)))',
          boxShadow: '0 30px 60px -25px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)',
        }}
      >
        <div style={GRID}>
          {COLUMN_INDEXES.map((col) => (
            <Column
              key={col}
              col={col}
              board={board}
              playing={playing}
              winningCells={winningCells}
              colors={colors}
              invalid={invalid}
              reduced={reduced}
              registerRef={(element) => {
                columnRefs.current[col] = element;
              }}
              onPlay={playColumn}
              onHover={setHoverCol}
            />
          ))}
        </div>
      </div>
    </div>
  );
}