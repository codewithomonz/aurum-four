import { create } from "zustand";
import { createGame, dropDisc, otherPlayer, undoMove } from "../game/logic";
import type { GameState, PlayerId } from "../game/types";
import { loadValue, saveValue } from "../lib/storage";
import { playSound, setMuted } from "../lib/sound";
import {
  AVATAR_KEYS,
  COLOR_KEYS,
  type AvatarKey,
  type ColorKey,
  type PlayerProfile,
} from "../theme/palette";

export type Phase = "menu" | "playing";
export type Theme = "dark" | "light";
type Players = Record<PlayerId, PlayerProfile>;

export interface Scores {
  wins: Record<PlayerId, number>;
  draws: number;
  /** Names the scores belong to. A different pair of names starts a fresh scoreboard. */
  owners: Record<PlayerId, string>;
}

export interface InvalidMove {
  col: number;
  /** Increments on every rejected move so the UI can re-trigger feedback. */
  nonce: number;
}

interface GameStore {
  phase: Phase;
  players: Players;
  game: GameState;
  scores: Scores;
  invalid: InvalidMove | null;
  theme: Theme;
  muted: boolean;
  updatePlayer: (id: PlayerId, patch: Partial<PlayerProfile>) => void;
  startGame: () => void;
  playColumn: (col: number) => void;
  undo: () => void;
  restart: () => void;
  rematch: () => void;
  backToMenu: () => void;
  resetScores: () => void;
  clearInvalid: () => void;
  toggleTheme: () => void;
  toggleMute: () => void;
}

export const DEFAULT_PLAYERS: Players = {
  1: { name: "Player 1", color: "gold", avatar: "crown" },
  2: { name: "Player 2", color: "ruby", avatar: "flame" },
};

const emptyScores = (players: Players): Scores => ({
  wins: { 1: 0, 2: 0 },
  draws: 0,
  owners: { 1: players[1].name, 2: players[2].name },
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isProfile = (value: unknown): value is PlayerProfile =>
  isRecord(value) &&
  typeof value.name === "string" &&
  COLOR_KEYS.includes(value.color as ColorKey) &&
  AVATAR_KEYS.includes(value.avatar as AvatarKey);

const isPlayers = (value: unknown): value is Players =>
  isRecord(value) && isProfile(value["1"]) && isProfile(value["2"]);

const isScores = (value: unknown): value is Scores =>
  isRecord(value) &&
  isRecord(value.wins) &&
  typeof value.wins["1"] === "number" &&
  typeof value.wins["2"] === "number" &&
  typeof value.draws === "number" &&
  isRecord(value.owners) &&
  typeof value.owners["1"] === "string" &&
  typeof value.owners["2"] === "string";

const isTheme = (value: unknown): value is Theme =>
  value === "dark" || value === "light";
const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const initialPlayers = loadValue<Players>(
  "players",
  DEFAULT_PLAYERS,
  isPlayers,
);
const initialMuted = loadValue<boolean>("muted", false, isBoolean);
setMuted(initialMuted);

export const useGameStore = create<GameStore>()((set, get) => ({
  phase: "menu",
  players: initialPlayers,
  game: createGame(),
  scores: loadValue<Scores>("scores", emptyScores(initialPlayers), isScores),
  invalid: null,
  theme: loadValue<Theme>("theme", "dark", isTheme),
  muted: initialMuted,

  updatePlayer: (id, patch) => {
    const { players } = get();
    // Two players can never share a disc color.
    if (patch.color && patch.color === players[otherPlayer(id)].color) return;
    const next: Players = { ...players, [id]: { ...players[id], ...patch } };
    set({ players: next });
    saveValue("players", next);
  },

  startGame: () => {
    const { players, scores } = get();
    const named: Players = {
      1: {
        ...players[1],
        name: players[1].name.trim() || DEFAULT_PLAYERS[1].name,
      },
      2: {
        ...players[2],
        name: players[2].name.trim() || DEFAULT_PLAYERS[2].name,
      },
    };
    const sameOwners =
      scores.owners[1] === named[1].name && scores.owners[2] === named[2].name;
    const nextScores = sameOwners ? scores : emptyScores(named);

    set({
      phase: "playing",
      players: named,
      scores: nextScores,
      game: createGame(1),
      invalid: null,
    });
    saveValue("players", named);
    saveValue("scores", nextScores);
    playSound("click");
  },

  playColumn: (col) => {
    const { game, scores } = get();
    const result = dropDisc(game, col);

    if (!result.ok) {
      if (result.reason === "column-full") {
        set({ invalid: { col, nonce: (get().invalid?.nonce ?? 0) + 1 } });
        playSound("invalid");
      }
      return;
    }

    const next = result.state;
    let nextScores = scores;
    if (next.status.kind === "won") {
      const winner = next.status.winner;
      nextScores = {
        ...scores,
        wins: { ...scores.wins, [winner]: scores.wins[winner] + 1 },
      };
    } else if (next.status.kind === "draw") {
      nextScores = { ...scores, draws: scores.draws + 1 };
    }

    set({ game: next, scores: nextScores, invalid: null });
    if (nextScores !== scores) saveValue("scores", nextScores);

    // Sounds are timed to the disc landing, not the click.
    window.setTimeout(() => playSound("drop"), 240);
    if (next.status.kind === "won")
      window.setTimeout(() => playSound("win"), 520);
    else if (next.status.kind === "draw")
      window.setTimeout(() => playSound("draw"), 520);
  },

  undo: () => {
    const previous = undoMove(get().game);
    if (!previous) return;
    set({ game: previous, invalid: null });
    playSound("undo");
  },

  restart: () => {
    set({ game: createGame(get().game.starter), invalid: null });
    playSound("click");
  },

  rematch: () => {
    set({ game: createGame(otherPlayer(get().game.starter)), invalid: null });
    playSound("click");
  },

  backToMenu: () => {
    set({ phase: "menu", invalid: null });
    playSound("click");
  },

  resetScores: () => {
    const next = emptyScores(get().players);
    set({ scores: next });
    saveValue("scores", next);
    playSound("click");
  },

  clearInvalid: () => set({ invalid: null }),

  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    set({ theme: next });
    saveValue("theme", next);
    playSound("click");
  },

  toggleMute: () => {
    const next = !get().muted;
    set({ muted: next });
    saveValue("muted", next);
    setMuted(next);
    if (!next) playSound("click");
  },
}));
