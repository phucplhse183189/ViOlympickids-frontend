import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

interface AdminHelpTipProps { content: ReactNode; label?: string }
export function AdminHelpTip({ content, label = "Trợ giúp" }: AdminHelpTipProps) {
  return <span className="group relative inline-flex"><button type="button" aria-label={label} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"><HelpCircle className="h-4 w-4" /></button><span role="tooltip" className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 origin-top-right translate-y-1 rounded-xl border border-border bg-popover p-3 text-xs leading-5 text-popover-foreground opacity-0 shadow-xl transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">{content}</span></span>;
}
