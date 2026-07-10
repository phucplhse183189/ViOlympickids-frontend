import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/shared/lib/i18n";
import { AuthProvider } from "@/features/auth/context/auth";
import { ActiveChildProvider } from "@/features/dashboard/context/activeChild";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ActiveChildProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ActiveChildProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
