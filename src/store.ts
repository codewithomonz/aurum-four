import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyMove, dropRow, emptyBoard, evaluate } from "./game/connectFour";
import type { Board, Player, Result } from "./game/connectFour";
import { sfx } from "./sound";

export const PALETTE = ["#ff6b57", "#ffd54a", "#3ee0c4", "#d58bff"];
export type Pair<T> = [T, T];
type Phase = "setup" | "play" | "result";
type Move = { row: number; col: number };

interface GameState {
  phase: Phase;
  names: Pair<string>;
  colors: Pair<string>;
  scores: Pair<number>;
  board: Board;
  turn: Player;
  starter: Player;
  history: Move[];
  result: Result | null;
  shake: number | null;
  theme: "dark" | "light";
  muted: boolean;
  start: (names: Pair<string>, colors: Pair<string>) => void;
  drop: (col: number) => void;
  undo: () => void;
  restart: () => void;
  rematch: () => void;
  menu: () => void;
  resetScores: () => void;
  toggleTheme: () => void;
  toggleMute: () => void;
}

const fresh = (starter: Player) => ({
  board: emptyBoard(),
  turn: starter,
  history: [] as Move[],
  result: null as Result | null,
  shake: null as number | null,
});

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      names: ["Player 1", "Player 2"],
      colors: [PALETTE[0], PALETTE[1]],
      scores: [0, 0],
      starter: 1,
      theme: "dark",
      muted: false,
      ...fresh(1),

      start: (names, colors) =>
        set({ names, colors, starter: 1, phase: "play", ...fresh(1) }),

      drop: (col) => {
        const s = get();
        if (s.phase !== "play") return;
        const row = dropRow(s.board, col);
        if (row < 0) {
          set({ shake: col });
          sfx.error(s.muted);
          setTimeout(() => set({ shake: null }), 400);
          return;
        }
        const board = applyMove(s.board, col, s.turn)!;
        const result = evaluate(board);
        const history = [...s.history, { row, col }];
        sfx.drop(s.muted);
        if (result.status === "playing") {
          set({ board, history, turn: s.turn === 1 ? 2 : 1 });
          return;
        }
        const scores: Pair<number> = [...s.scores];
        if (result.status === "won") scores[result.winner - 1]++;
        set({ board, history, result, scores, phase: "result" });
        if (result.status === "won")
          setTimeout(() => sfx.win(get().muted), 700);
      },

      undo: () => {
        const s = get();
        const last = s.history[s.history.length - 1];
        if (s.phase !== "play" || !last) return;
        const board = s.board.map((r) => [...r]);
        board[last.row][last.col] = 0;
        set({
          board,
          history: s.history.slice(0, -1),
          turn: s.turn === 1 ? 2 : 1,
        });
      },

      restart: () => set({ phase: "play", ...fresh(get().starter) }),

      rematch: () => {
        const starter: Player = get().starter === 1 ? 2 : 1;
        set({ starter, phase: "play", ...fresh(starter) });
      },

      menu: () => set({ phase: "setup", ...fresh(1) }),
      resetScores: () => set({ scores: [0, 0] }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: "drop-duel",
      partialize: (s) => ({
        names: s.names,
        colors: s.colors,
        scores: s.scores,
        theme: s.theme,
        muted: s.muted,
      }),
    },
  ),
);
