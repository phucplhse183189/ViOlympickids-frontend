import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  showAfter?: number;
  adsVisible?: boolean;
}

export function BackToTop({ showAfter = 520, adsVisible = false }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > showAfter);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [showAfter]);

  return <AnimatePresence>{visible && <motion.button
    type="button"
    aria-label="Lên đầu trang"
    title="Lên đầu trang"
    initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.85 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.9 }}
    whileHover={reduceMotion ? undefined : { y: -3 }}
    whileTap={reduceMotion ? undefined : { scale: 0.92 }}
    onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
    className={`back-to-top ${adsVisible ? "back-to-top--ads-visible" : ""} fixed bottom-5 right-4 z-50 grid h-12 w-12 place-items-center rounded-full border border-slate-300/80 bg-white/85 text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.16)] backdrop-blur-sm outline-none transition-all duration-500 hover:border-slate-400 hover:bg-transparent hover:shadow-md focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:bottom-7 sm:right-7`}
  >
    <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
  </motion.button>}</AnimatePresence>;
}
