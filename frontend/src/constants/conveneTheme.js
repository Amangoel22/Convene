import { STORAGE_KEYS } from "@/constants/storage";

// Purpose: define the selectable visual presets exposed to public and authenticated users.
export const CONVENE_THEME_OPTIONS = [
  {
    id: "warm-copper",
    label: "Warm Copper",
    description: "The current Convene palette",
    swatch: "#B85C38",
  },
  {
    id: "forest-authority",
    label: "Forest Authority",
    description: "Sage, pine, and mint",
    swatch: "#0F766E",
  },
  {
    id: "obsidian-copper",
    label: "Obsidian Copper",
    description: "Industrial charcoal and rust",
    swatch: "#D94E1F",
  },
  {
    id: "plum-prestige",
    label: "Plum Prestige",
    description: "Violet, aubergine, and lilac",
    swatch: "#8B5CF6",
  },
  {
    id: "nordic-marigold",
    label: "Nordic Marigold",
    description: "Birch, charcoal, and ochre",
    swatch: "#D97706",
  },
  {
    id: "blue-daylight",
    label: "Blue Daylight",
    description: "The original light workspace",
    swatch: "#3B6FD4",
  },
];

// Purpose: provide one safe default for first-time visitors and invalid saved values.
export const CONVENE_DEFAULT_THEME = "warm-copper";

// Purpose: validate a stored or selected preset before it reaches the document root.
export function isConveneTheme(value) {
  return CONVENE_THEME_OPTIONS.some((option) => option.id === value);
}

// Purpose: read the persisted palette without allowing an old value to break rendering.
export function getInitialConveneTheme() {
  if (typeof window === "undefined") return CONVENE_DEFAULT_THEME;
  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.themePalette);
  return isConveneTheme(storedTheme) ? storedTheme : CONVENE_DEFAULT_THEME;
}
