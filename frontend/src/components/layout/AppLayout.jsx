import { AnimatePresence } from "framer-motion";
import { Outlet } from "react-router";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";

export function AppLayout() {
  const theme = useAppStore((state) => state.theme);

  return (
    <div className="app-background min-h-screen" data-theme={theme}>
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6 lg:px-8">
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
