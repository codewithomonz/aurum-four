export const ROWS = 6;
export const COLS = 7;

export type Player = 1 | 2;
export type Cell = 0 | Player;
export type Board = Cell[][]; // board[row][col], row 0 is the top
export type Result =
  | { status: "playing" }
  | { status: "draw" }
  | { status: "won"; winner: Player; line: [number, number][] };

export const emptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(0));

/** Lowest empty row in a column, or -1 if the column is full. */
export function dropRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === 0) return r;
  return -1;
}

/** Returns a new board, or null when the move is invalid. */
export function applyMove(
  board: Board,
  col: number,
  player: Player,
): Board | null {
  if (col < 0 || col >= COLS) return null;
  const row = dropRow(board, col);
  if (row < 0) return null;
  const next = board.map((r) => [...r]);
  next[row][col] = player;
  return next;
}

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

export function evaluate(board: Board): Result {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (!p) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const line: [number, number][] = [];
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (
            rr < 0 ||
            rr >= ROWS ||
            cc < 0 ||
            cc >= COLS ||
            board[rr][cc] !== p
          )
            break;
          line.push([rr, cc]);
        }
        if (line.length === 4) return { status: "won", winner: p, line };
      }
    }
  }
  return board[0].every(Boolean) ? { status: "draw" } : { status: "playing" };
}
