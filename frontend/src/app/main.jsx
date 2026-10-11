// Purpose: main implements this source module.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@/styles/globals.css";

const savedTheme = window.localStorage.getItem("convene_theme");
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
