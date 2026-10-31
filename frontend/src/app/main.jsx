// Purpose: main implements this source module.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@/styles/globals.css";
import { useAppStore } from "@/store/useAppStore";

const savedTheme = window.localStorage.getItem("convene_theme");
const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.dataset.theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme;

// Keeps the app aligned with OS appearance until the user explicitly chooses a theme.
window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (window.localStorage.getItem("convene_theme")) return;
  const theme = event.matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  useAppStore.setState({ theme });
});

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
