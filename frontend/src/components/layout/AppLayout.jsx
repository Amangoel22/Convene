// Purpose: AppLayout implements this source module.
import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router";
import { useEffect } from "react";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";

export function AppLayout() {
  const themePalette = useAppStore((state) => state.themePalette);

  useEffect(() => {
    document.documentElement.dataset.theme = "convene";
    document.documentElement.dataset.convenePalette = themePalette;
  }, [themePalette]);

  return (
    <div className="app-background min-h-screen" data-theme="convene" data-convene-palette={themePalette}>
      <div className="flex min-h-screen w-full px-4 py-4 md:px-6 lg:px-8">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6 pl-0 lg:pl-64">
          <Navbar />
          <AnimatePresence mode="wait">
            <PageTransition>
              <ContentContainer>
                <Outlet />
              </ContentContainer>
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
