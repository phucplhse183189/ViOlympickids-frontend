import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KidsTopbarProps {
  stars?: number;
  avatarEmoji?: string;
  nickname?: string;
  backTo?: string;
}

export function KidsTopbar({
  stars = 150,
  avatarEmoji = "🦊",
  nickname = "Bé Yêu",
  backTo = "/student",
}: KidsTopbarProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3">
      {/* Back button */}
      <button
        onClick={() => navigate(backTo)}
        className="kids-btn flex items-center gap-2 bg-orange-400 text-white font-extrabold text-base rounded-3xl px-5 py-3 shadow-[0_5px_0_#c2550f] active:translate-y-[4px] active:shadow-none hover:bg-orange-500 transition-colors select-none"
      >
        <ArrowLeft size={20} strokeWidth={3} />
        <span className="hidden sm:inline">Bản đồ</span>
      </button>

      {/* Right: Stars + Avatar */}
      <div className="flex items-center gap-3">
        {/* Star bar */}
        <div className="flex items-center gap-1.5 bg-yellow-400 rounded-3xl px-4 py-2 shadow-[0_4px_0_#b45309] select-none">
          <span className="text-xl leading-none">⭐</span>
          <span className="text-white font-extrabold text-lg leading-none tabular-nums">
            {stars}
          </span>
        </div>

        {/* Avatar bubble */}
        <div className="relative flex items-center gap-2 bg-white rounded-3xl px-3 py-1.5 shadow-md select-none">
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-2xl leading-none border-2 border-sky-300">
            {avatarEmoji}
          </div>
          <span className="font-extrabold text-sm text-gray-700 hidden sm:inline pr-1">
            {nickname}
          </span>
          {/* Level badge */}
          <span className="absolute -top-2 -right-1 bg-purple-500 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            5
          </span>
        </div>
      </div>
    </header>
  );
}
