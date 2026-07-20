import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props { page: number; pageSize: number; total: number; onChange: (page: number) => void }

export function AdminPagination({ page, pageSize, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  if (pages <= 1 && total === 0) return null;
  const visible = Array.from({ length: pages }, (_, index) => index + 1).filter((value) => value === 1 || value === pages || Math.abs(value - page) <= 1);
  return <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-xs text-muted-foreground">Hiển thị <strong className="text-foreground">{start}–{end}</strong> trong {total} kết quả</p>
    <nav className="flex items-center gap-1" aria-label="Phân trang">
      <PageButton disabled={page === 1} onClick={() => onChange(page - 1)} label="Trang trước"><ChevronLeft className="h-4 w-4" /></PageButton>
      {visible.map((value, index) => <span key={value} className="contents">{index > 0 && value - visible[index - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}<button onClick={() => onChange(value)} aria-current={value === page ? "page" : undefined} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${value === page ? "bg-indigo-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{value}</button></span>)}
      <PageButton disabled={page === pages} onClick={() => onChange(page + 1)} label="Trang sau"><ChevronRight className="h-4 w-4" /></PageButton>
    </nav>
  </div>;
}

function PageButton({ disabled, onClick, label, children }: { disabled: boolean; onClick: () => void; label: string; children: React.ReactNode }) { return <button disabled={disabled} onClick={onClick} aria-label={label} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35">{children}</button>; }
