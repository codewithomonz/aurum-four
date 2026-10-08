import { COLS, CONNECT, ROWS } from "./constants";
import type {
  Board,
  Cell,
  GameState,
  GameStatus,
  MoveResult,
  PlayerId,
  Position,
} from "./types";

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

export const otherPlayer = (player: PlayerId): PlayerId =>
  player === 1 ? 2 : 1;

export function createBoard(rows = ROWS, cols = COLS): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): Cell => null),
  );
}

export function createGame(starter: PlayerId = 1): GameState {
  return {
    board: createBoard(),
    current: starter,
    starter,
    status: { kind: "playing" },
    moves: [],
  };
}

function inBounds(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

/** Lowest empty row in a column, or null when the column is full. */
export function getDropRow(board: Board, col: number): number | null {
  for (let row = board.length - 1; row >= 0; row -= 1) {
    if (board[row][col] === null) return row;
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== null);
}

/** Returns every connected cell through `origin` when it completes a line of CONNECT or more. */
export function findWinningLine(
  board: Board,
  origin: Position,
  player: PlayerId,
): Position[] | null {
  for (const [dRow, dCol] of DIRECTIONS) {
    const line: Position[] = [origin];
    for (const sign of [1, -1]) {
      let row = origin.row + dRow * sign;
      let col = origin.col + dCol * sign;
      while (inBounds(board, row, col) && board[row][col] === player) {
        line.push({ row, col });
        row += dRow * sign;
        col += dCol * sign;
      }
    }
    if (line.length >= CONNECT) {
      return line.sort((a, b) => a.row - b.row || a.col - b.col);
    }
  }
  return null;
}

export function dropDisc(state: GameState, col: number): MoveResult {
  if (state.status.kind !== "playing")
    return { ok: false, reason: "game-over" };
  if (!Number.isInteger(col) || col < 0 || col >= state.board[0].length) {
    return { ok: false, reason: "out-of-range" };
  }

  const row = getDropRow(state.board, col);
  if (row === null) return { ok: false, reason: "column-full" };

  const board: Board = state.board.map((line, r) =>
    r === row
      ? line.map((cell, c) => (c === col ? state.current : cell))
      : line,
  );

  const winningLine = findWinningLine(board, { row, col }, state.current);
  let status: GameStatus = { kind: "playing" };
  if (winningLine)
    status = { kind: "won", winner: state.current, line: winningLine };
  else if (isBoardFull(board)) status = { kind: "draw" };

  return {
    ok: true,
    state: {
      ...state,
      board,
      status,
      moves: [...state.moves, { player: state.current, row, col }],
      current:
        status.kind === "playing" ? otherPlayer(state.current) : state.current,
    },
  };
}

/** Reverts the last move. Returns null when there is nothing to undo or the game has ended. */
export function undoMove(state: GameState): GameState | null {
  if (state.moves.length === 0 || state.status.kind !== "playing") return null;

  const last = state.moves[state.moves.length - 1];
  const board: Board = state.board.map((line, r) =>
    r === last.row
      ? line.map((cell, c) => (c === last.col ? null : cell))
      : line,
  );

  return {
    ...state,
    board,
    current: last.player,
    status: { kind: "playing" },
    moves: state.moves.slice(0, -1),
  };
}
