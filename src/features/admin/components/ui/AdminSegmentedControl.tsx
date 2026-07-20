import { motion } from "framer-motion";

interface Segment<T extends string> { value: T; label: string }
export function AdminSegmentedControl<T extends string>({ value, onChange, items, layoutId = "admin-segment" }: { value: T; onChange: (value: T) => void; items: Segment<T>[]; layoutId?: string }) {
  return <div className="inline-flex rounded-xl border border-border bg-muted/70 p-1">{items.map((item) => <button key={item.value} type="button" onClick={() => onChange(item.value)} className={`relative rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${value === item.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{value === item.value && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg bg-card shadow-sm" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}<span className="relative">{item.label}</span></button>)}</div>;
}
