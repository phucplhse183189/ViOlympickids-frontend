import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/shared/lib/i18n";
import { AuthProvider } from "@/features/auth/context/auth";
import { ActiveChildProvider } from "@/features/dashboard/context/activeChild";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/lib/queryClient";
import { ThemeController } from "@/shared/ui/ThemeController";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeController />
      <BrowserRouter>
        <AuthProvider>
          <ActiveChildProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ActiveChildProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
