# Themes and UI System

Convene uses one token-based visual system instead of scattered page-specific colors. Theme definitions live in `frontend/src/constants/conveneTheme.js`, shared color constants live in `frontend/src/constants/colors.js`, typography constants live in `frontend/src/constants/typography.js`, and the generated CSS variables live in `frontend/src/styles/convene-theme.css`.

## Available palettes

- Warm Copper
- Forest Authority
- Obsidian Copper
- Plum Prestige
- Nordic Marigold
- Blue Daylight

The active palette is stored locally as `convene_palette` and applied to the document through `data-convene-palette`. Theme selection is available on the public landing page and in workspace Settings.

The favicon is intentionally fixed black and does not change with the selected palette. In-app marks and UI accents follow the active palette.

## Design rules

- Use token classes such as `text-token-primary`, `text-token-secondary`, `surface-card-token`, `field-token`, and `text-token-accent`.
- Define new colors in the shared constants/theme files before using them.
- Keep light/dark or palette-specific values in theme CSS rather than inline literals.
- Use shared typography utilities and constants for headings, labels, and body text.
- Preserve loading skeletons while data is unresolved; show empty states only after a request completes with no records.
