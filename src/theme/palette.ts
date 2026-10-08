export type ColorKey = "gold" | "ruby" | "emerald" | "sapphire" | "amethyst";
export type AvatarKey = "crown" | "star" | "bolt" | "diamond" | "flame";

export interface PlayerProfile {
  name: string;
  color: ColorKey;
  avatar: AvatarKey;
}

interface DiscColor {
  label: string;
  light: string;
  glow: string;
  dark: string;
}

export const DISC_COLORS: Record<ColorKey, DiscColor> = {
  gold: { label: "Gold", light: "#FBE7A1", glow: "#E8B84B", dark: "#B07A10" },
  ruby: { label: "Ruby", light: "#FF9A9A", glow: "#F0506E", dark: "#A3182B" },
  emerald: {
    label: "Emerald",
    light: "#8FF0C0",
    glow: "#2FD39A",
    dark: "#0B7A55",
  },
  sapphire: {
    label: "Sapphire",
    light: "#9CC8FF",
    glow: "#4F8BFF",
    dark: "#1D4ED8",
  },
  amethyst: {
    label: "Amethyst",
    light: "#D2B6FF",
    glow: "#9B6BFF",
    dark: "#6D28D9",
  },
};

export const COLOR_KEYS = Object.keys(DISC_COLORS) as ColorKey[];

export const AVATAR_LABELS: Record<AvatarKey, string> = {
  crown: "Crown",
  star: "Star",
  bolt: "Bolt",
  diamond: "Diamond",
  flame: "Flame",
};

export const AVATAR_KEYS = Object.keys(AVATAR_LABELS) as AvatarKey[];

export function discBackground(color: ColorKey): string {
  const { light, glow, dark } = DISC_COLORS[color];
  return `radial-gradient(circle at 32% 28%, ${light} 0%, ${glow} 38%, ${dark} 100%)`;
}
