export type PlayerId = 1 | 2;
export type Cell = PlayerId | null;

/** `board[row][col]`, with row 0 at the top. */
export type Board = readonly (readonly Cell[])[];

export interface Position {
  readonly row: number;
  readonly col: number;
}

export interface Move extends Position {
  readonly player: PlayerId;
}

export type GameStatus =
  | { readonly kind: "playing" }
  | {
      readonly kind: "won";
      readonly winner: PlayerId;
      readonly line: readonly Position[];
    }
  | { readonly kind: "draw" };

export interface GameState {
  readonly board: Board;
  readonly current: PlayerId;
  readonly starter: PlayerId;
  readonly status: GameStatus;
  readonly moves: readonly Move[];
}

export type MoveRejection = "game-over" | "out-of-range" | "column-full";

export type MoveResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: MoveRejection };
