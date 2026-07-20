import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover } from "radix-ui";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthFormat = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

interface Props { value: string; onChange: (value: string) => void; label?: string; className?: string }

export function AdminDatePicker({ value, onChange, label = "Chọn ngày", className = "" }: Props) {
  const selected = parseDate(value);
  const [month, setMonth] = useState(() => selected || new Date());
  useEffect(() => { if (selected) setMonth(selected); }, [value]);
  const cells = useMemo(() => calendarCells(month), [month]);

  return <div className={className}>
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" aria-label={label} className="group flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium outline-none transition hover:bg-muted/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 data-[state=open]:border-indigo-500 data-[state=open]:ring-4 data-[state=open]:ring-indigo-500/10">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:scale-110 group-data-[state=open]:text-indigo-500" />
          <span className={`min-w-0 flex-1 truncate text-left ${selected ? "text-foreground" : "text-muted-foreground"}`}>{selected ? dateFormat.format(selected) : label}</span>
          {value && <span role="button" tabIndex={0} aria-label="Xóa ngày" onClick={(event) => { event.stopPropagation(); onChange(""); }} onKeyDown={(event) => { if (event.key === "Enter") onChange(""); }} className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted"><X className="h-3.5 w-3.5" /></span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" side="bottom" avoidCollisions={false} sideOffset={8} className="z-[200] w-[300px] rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between px-1 pb-3">
            <MonthButton label="Tháng trước" onClick={() => setMonth((date) => shiftMonth(date, -1))}><ChevronLeft className="h-4 w-4" /></MonthButton>
            <span key={`${month.getFullYear()}-${month.getMonth()}`} className="animate-in fade-in slide-in-from-bottom-1 text-sm font-bold duration-200">{capitalize(monthFormat.format(month))}</span>
            <MonthButton label="Tháng sau" onClick={() => setMonth((date) => shiftMonth(date, 1))}><ChevronRight className="h-4 w-4" /></MonthButton>
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((day) => <span key={day} className="grid h-8 place-items-center text-[10px] font-bold text-muted-foreground">{day}</span>)}
            {cells.map((date, index) => date ? <Popover.Close asChild key={toValue(date)}><button type="button" onClick={() => onChange(toValue(date))} className={`grid h-9 place-items-center rounded-lg text-xs font-semibold transition hover:bg-indigo-500/10 hover:text-indigo-500 ${sameDay(date, selected) ? "bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 hover:text-white" : sameDay(date, new Date()) ? "ring-1 ring-inset ring-indigo-500/40 text-indigo-500" : "text-foreground"}`}>{date.getDate()}</button></Popover.Close> : <span key={`empty-${index}`} />)}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <Popover.Close asChild><button type="button" onClick={() => onChange(toValue(new Date()))} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-500 hover:bg-indigo-500/10">Hôm nay</button></Popover.Close>
            {value && <button type="button" onClick={() => onChange("")} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">Xóa</button>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>;
}

function MonthButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} aria-label={label} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90">{children}</button>; }
function parseDate(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null; const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); }
function toValue(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function shiftMonth(date: Date, amount: number) { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
function calendarCells(date: Date) { const y = date.getFullYear(); const m = date.getMonth(); const blanks = (new Date(y, m, 1).getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate(); return [...Array<null>(blanks).fill(null), ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1))]; }
function sameDay(a: Date | null, b: Date | null) { return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function capitalize(value: string) { return value.charAt(0).toLocaleUpperCase("vi") + value.slice(1); }
