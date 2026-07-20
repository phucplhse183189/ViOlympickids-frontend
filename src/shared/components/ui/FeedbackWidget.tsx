import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageSquare, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";

export function FeedbackWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  if (!user) return null;
  function completed() { setSuccess(true); window.setTimeout(() => { setOpen(false); setSuccess(false); }, 1800); }
  return <div className="fixed bottom-6 right-6 z-50">
    <AnimatePresence>{!open && <motion.button initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .7 }} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: .94 }} onClick={() => setOpen(true)} className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25" title="Gửi góp ý"><MessageSquare className="h-6 w-6" /></motion.button>}</AnimatePresence>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .96 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} className="absolute bottom-0 right-0 max-h-[min(760px,calc(100vh-32px))] w-[min(430px,calc(100vw-32px))] overflow-y-auto rounded-[26px] border border-border bg-background shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur"><div><h3 className="font-extrabold text-foreground">Gửi góp ý</h3><p className="text-xs text-muted-foreground">Đánh giá và chọn đúng thể loại</p></div><button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></div>{success ? <div className="grid min-h-72 place-items-center p-8 text-center"><div><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" /><h4 className="mt-4 text-xl font-extrabold">Cảm ơn bạn!</h4><p className="mt-2 text-sm text-muted-foreground">Góp ý đã được ghi nhận và chuyển đến quản trị viên.</p></div></div> : <FeedbackForm onSuccess={completed} onCancel={() => setOpen(false)} />}</motion.div>}</AnimatePresence>
  </div>;
}
