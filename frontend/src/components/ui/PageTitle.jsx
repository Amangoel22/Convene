// Purpose: PageTitle gives operational pages one shared display-heading style.
import { COLORS } from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { useAppStore } from "@/store/useAppStore";

// Renders a theme-aware page heading using the shared design constants.
export function PageTitle({ children, className = "", size = "page" }) {
  const theme = useAppStore((state) => state.theme);
  const dark = theme === "dark";

  return (
    <h1
      className={`workspace-page-title ${className}`.trim()}
      style={{
        fontSize: size === "hero" ? TYPOGRAPHY.fontSize.pageTitleHero : TYPOGRAPHY.fontSize.pageTitle,
        fontWeight: TYPOGRAPHY.fontWeight.pageTitle,
        letterSpacing: TYPOGRAPHY.letterSpacing.pageTitle,
        lineHeight: TYPOGRAPHY.lineHeight.pageTitle,
        "--page-title-start": dark ? COLORS.pageTitleStartDark : COLORS.pageTitleStart,
        "--page-title-end": dark ? COLORS.pageTitleEndDark : COLORS.pageTitleEnd,
      }}
    >
      {children}
    </h1>
  );
}
