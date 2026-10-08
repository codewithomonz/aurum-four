import { describe, expect, it } from "vitest";
import { COLS, ROWS } from "./constants";
import { createBoard, createGame, dropDisc, undoMove } from "./logic";
import type { Board, Cell, GameState } from "./types";

/** Plays a list of columns in order and fails the test if any move is rejected. */
function play(
  columns: readonly number[],
  start: GameState = createGame(),
): GameState {
  return columns.reduce((state, col) => {
    const result = dropDisc(state, col);
    if (!result.ok)
      throw new Error(`Move in column ${col} was rejected: ${result.reason}`);
    return result.state;
  }, start);
}

describe("Connect Four logic", () => {
  it("creates an empty board of the configured size", () => {
    const board = createBoard();
    expect(board).toHaveLength(ROWS);
    expect(
      board.every(
        (row) => row.length === COLS && row.every((cell) => cell === null),
      ),
    ).toBe(true);
  });

  it("drops discs to the lowest free row and alternates players", () => {
    const state = play([3, 3]);
    expect(state.board[ROWS - 1][3]).toBe(1);
    expect(state.board[ROWS - 2][3]).toBe(2);
    expect(state.current).toBe(1);
  });

  it("rejects a drop into a full column", () => {
    const state = play(Array.from({ length: ROWS }, () => 0));
    expect(dropDisc(state, 0)).toEqual({ ok: false, reason: "column-full" });
  });

  it("rejects columns outside the board", () => {
    expect(dropDisc(createGame(), -1)).toEqual({
      ok: false,
      reason: "out-of-range",
    });
    expect(dropDisc(createGame(), COLS)).toEqual({
      ok: false,
      reason: "out-of-range",
    });
  });

  it("detects a horizontal win", () => {
    const state = play([0, 0, 1, 1, 2, 2, 3]);
    expect(state.status.kind).toBe("won");
    if (state.status.kind === "won") {
      expect(state.status.winner).toBe(1);
      expect(state.status.line).toHaveLength(4);
      expect(state.status.line.every((p) => p.row === ROWS - 1)).toBe(true);
    }
  });

  it("detects a vertical win", () => {
    const state = play([0, 1, 0, 1, 0, 1, 0]);
    expect(state.status.kind).toBe("won");
    if (state.status.kind === "won") {
      expect(state.status.winner).toBe(1);
      expect(state.status.line.every((p) => p.col === 0)).toBe(true);
    }
  });

  it("detects diagonal wins in both directions", () => {
    const rising = [0, 1, 1, 2, 3, 2, 2, 3, 4, 3, 3];
    const mirrored = rising.map((col) => COLS - 1 - col);

    for (const columns of [rising, mirrored]) {
      const state = play(columns);
      expect(state.status.kind).toBe("won");
      if (state.status.kind === "won") {
        expect(state.status.winner).toBe(1);
        expect(state.status.line).toHaveLength(4);
      }
    }
  });

  it("detects a draw when the last disc fills the board without a winner", () => {
    // Column pairs alternate so no horizontal, vertical or diagonal run reaches four.
    const offsets = [0, 0, 1, 1, 0, 0, 1];
    const nearlyFull: Board = Array.from({ length: ROWS }, (_, row) =>
      Array.from(
        { length: COLS },
        (_, col): Cell =>
          row === 0 && col === 6
            ? null
            : (row + offsets[col]) % 2 === 0
              ? 1
              : 2,
      ),
    );

    const result = dropDisc({ ...createGame(2), board: nearlyFull }, 6);
    if (!result.ok) throw new Error("Final move should be accepted");
    expect(result.state.status.kind).toBe("draw");
  });

  it("rejects moves and undo once the game is over", () => {
    const state = play([0, 0, 1, 1, 2, 2, 3]);
    expect(dropDisc(state, 5)).toEqual({ ok: false, reason: "game-over" });
    expect(undoMove(state)).toBeNull();
  });

  it("undoes the last move and hands the turn back", () => {
    const undone = undoMove(play([3, 4]));
    expect(undone?.board[ROWS - 1][4]).toBeNull();
    expect(undone?.current).toBe(2);
    expect(undone?.moves).toHaveLength(1);
  });
});
