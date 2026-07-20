import type { ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";

export interface CustomSelectOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface CustomSelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly CustomSelectOption<T>[];
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  contentClassName?: string;
}

export function CustomSelect<T extends string>({ value, onValueChange, options, ariaLabel, placeholder, disabled = false, error = false, className = "", contentClassName = "" }: CustomSelectProps<T>) {
  return <Select.Root value={value} disabled={disabled} onValueChange={(next) => onValueChange(next as T)}>
    <Select.Trigger aria-label={ariaLabel} aria-invalid={error || undefined} className={`group inline-flex h-10 min-w-0 w-full items-center justify-between gap-3 rounded-xl border bg-background px-3 text-left text-sm font-semibold text-foreground outline-none transition duration-200 hover:border-indigo-400/70 hover:bg-muted/40 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground data-[state=open]:border-indigo-500 data-[state=open]:ring-4 data-[state=open]:ring-indigo-500/10 ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-border focus:border-indigo-500 focus:ring-indigo-500/10"} ${className}`}>
      <Select.Value placeholder={placeholder} className="min-w-0 flex-1 truncate whitespace-nowrap" />
      <Select.Icon asChild><ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" /></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content position="popper" side="bottom" align="start" sideOffset={6} collisionPadding={12} className={`z-[300] max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-2xl shadow-slate-950/15 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 ${contentClassName}`}>
        <Select.Viewport>{options.map((option) => <Select.Item key={option.value} value={option.value} disabled={option.disabled} className="relative flex min-h-10 cursor-pointer select-none items-center gap-2 rounded-xl py-2 pl-3 pr-10 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-indigo-500/10 data-[highlighted]:text-indigo-700 dark:data-[highlighted]:text-indigo-300">
          {option.icon && <span className="shrink-0 text-muted-foreground">{option.icon}</span>}
          <span className="min-w-0"><Select.ItemText>{option.label}</Select.ItemText>{option.description && <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{option.description}</span>}</span>
          <Select.ItemIndicator className="absolute right-3 grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-white"><Check className="h-3.5 w-3.5" strokeWidth={3} /></Select.ItemIndicator>
        </Select.Item>)}</Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
