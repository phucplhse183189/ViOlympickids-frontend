import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "@/shared/stores/themeStore";

export function ThemeToggle() {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
      aria-label="Chuyển giao diện sáng hoặc tối"
      title="Chuyển giao diện sáng/tối"
    >
      <motion.span initial={false} whileTap={{ rotate: 25, scale: 0.85 }}>
        <Sun className="hidden h-5 w-5 dark:block" />
        <Moon className="h-5 w-5 dark:hidden" />
      </motion.span>
    </button>
  );
}
