"use client";
import { Header } from "./Header.jsx";
import { AppSidebar } from "./AppSidebar.jsx";
import { useSidebar } from "@/contexts/SidebarContext.jsx";
import { cn } from "@/lib/utils.js";

export function Layout({ children }) {
  const { collapsed, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AppSidebar />
      <main
        className={cn(
          "pt-14 transition-all duration-300",
          isMobile ? "pl-0" : collapsed ? "pl-16" : "pl-56"
        )}
      >
        {children}
      </main>
    </div>
  );
}
