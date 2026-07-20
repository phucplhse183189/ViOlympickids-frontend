import { Link } from "react-router-dom";

interface BrandMarkProps {
  to?: string;
  compactOnMobile?: boolean;
}

export function BrandMark({ to = "/", compactOnMobile = false }: BrandMarkProps) {
  return (
    <Link to={to} className="group flex shrink-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20">
      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white shadow-sm transition group-hover:border-blue-200 group-hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
        <img src="/robot-head.png" alt="" className="h-8 w-8 object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      </span>
      <span className={`${compactOnMobile ? "hidden sm:inline" : "inline"} whitespace-nowrap text-xl font-black tracking-tight sm:text-2xl`}>
        <span className="text-blue-500">ViOlympic</span><span className="text-orange-500">Kids</span>
      </span>
    </Link>
  );
}
