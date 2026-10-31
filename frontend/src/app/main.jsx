// Purpose: main implements this source module.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@/styles/globals.css";
import "@/styles/convene-theme.css";
import { getInitialConveneTheme } from "@/constants/conveneTheme";

// Applies the single Convene visual system before the first render to avoid a theme flash.
document.documentElement.dataset.theme = "convene";
document.documentElement.dataset.convenePalette = getInitialConveneTheme();

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
