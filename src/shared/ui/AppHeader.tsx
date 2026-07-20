import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/shared/ui/BrandMark";

interface AppHeaderProps {
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export function AppHeader({ backLabel, onBack, actions }: AppHeaderProps) {
  return (
    <header className="relative z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-[#07101f]/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <BrandMark compactOnMobile={Boolean(onBack)} />
          {onBack && (
            <>
              <span className="hidden h-7 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
              <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"><ArrowLeft size={18} /><span>{backLabel}</span></button>
            </>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
