import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/shared/lib/i18n";
import { AuthProvider } from "@/shared/lib/auth";
import { ActiveChildProvider } from "@/shared/lib/activeChild";

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
