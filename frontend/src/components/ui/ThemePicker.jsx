// Purpose: provide a reusable selector for the app-wide Convene color presets.
import { Check, ChevronDown, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CONVENE_THEME_OPTIONS } from "@/constants/conveneTheme";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// Purpose: let users change the visual preset without duplicating page-level UI.
export function ThemePicker({ compact = false, className = "" }) {
  const themePalette = useAppStore((state) => state.themePalette);
  const setThemePalette = useAppStore((state) => state.setThemePalette);
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const selectedTheme =
    CONVENE_THEME_OPTIONS.find((option) => option.id === themePalette) ||
    CONVENE_THEME_OPTIONS[0];

  // Closes the palette menu after the user clicks elsewhere.
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Applies the selected palette and keeps the menu open state predictable.
  function handleThemeSelect(themeId) {
    setThemePalette(themeId);
    setOpen(false);
  }

  return (
    <div
      className={cn(
        "theme-picker",
        compact && "theme-picker-compact",
        className,
      )}
      ref={pickerRef}
    >
      <button
        type="button"
        className="theme-picker-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label="Choose color theme"
        title="Choose color theme"
      >
        <Palette size={compact ? 16 : 15} strokeWidth={1.8} />
        {!compact && <span>{selectedTheme.label}</span>}
        <ChevronDown
          size={13}
          className={cn("theme-picker-chevron", open && "is-open")}
        />
      </button>

      {open && (
        <div
          className="theme-picker-menu"
          role="menu"
          aria-label="Color themes"
        >
          <div className="theme-picker-heading">Choose a Convene tone</div>
          {CONVENE_THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn(
                "theme-picker-option",
                option.id === selectedTheme.id && "is-selected",
              )}
              onClick={() => handleThemeSelect(option.id)}
              role="menuitemradio"
              aria-checked={option.id === selectedTheme.id}
            >
              <span
                className="theme-picker-swatch"
                style={{ "--theme-swatch": option.swatch }}
              />
              <span className="theme-picker-copy">
                <span className="theme-picker-label">{option.label}</span>
                <span className="theme-picker-description">
                  {option.description}
                </span>
              </span>
              {option.id === selectedTheme.id && (
                <Check size={15} className="theme-picker-check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
