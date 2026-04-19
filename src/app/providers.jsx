"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/contexts/ToastContext.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { SidebarProvider } from "@/contexts/SidebarContext.jsx";

export function Providers({ children }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  );
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <AuthProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
