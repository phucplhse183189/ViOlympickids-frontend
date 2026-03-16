import React from "react";
import { Target } from "lucide-react";
import "./BannerAd.css";

const BannerAdRight: React.FC = () => (
  <div className="banner-ad banner-ad-right hidden xl:block">
    <div className="relative w-[180px] h-[600px] rounded-lg overflow-hidden shadow-2xl flex flex-col items-center bg-gradient-to-b from-[#bdffb0] via-[#85eba1] to-[#40df80] border border-[#aoffa0]/50 group cursor-pointer hover:shadow-[0_0_30px_rgba(46,204,64,0.4)] transition-all duration-300">
      {/* Decorative leaf/shape elements */}
      <div className="absolute top-8 left-4 w-6 h-6 bg-green-400/30 rounded-full blur-sm"></div>
      <div className="absolute top-24 right-4 w-8 h-8 bg-white/40 rounded-full blur-md animate-pulse"></div>
      <div className="absolute top-2 left-2 text-green-700/20 text-4xl font-black transform -rotate-12">
        +
      </div>
      <div className="absolute bottom-20 right-2 text-green-700/20 text-5xl font-black transform rotate-12">
        ×
      </div>

      {/* Header section with logos */}
      <div className="w-full pt-4 pb-2 flex justify-center items-center gap-2 px-2 bg-white/20 backdrop-blur-sm z-10 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold text-[10px]">ViO</span>
          </div>
          <span className="text-green-800 font-black text-sm tracking-tighter">
            Kids
          </span>
        </div>
      </div>

      {/* Main text content */}
      <div className="flex-1 w-full flex flex-col items-center pt-6 px-3 text-center z-10">
        {/* Curved Title Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500 rounded-lg transform rotate-2 w-[120px] left-1/2 -translate-x-1/2"></div>
          <div className="relative bg-white text-green-600 font-black text-lg px-4 py-1.5 rounded-lg border-2 border-red-500 shadow-md transform -rotate-3 z-10">
            VỮNG VÀNG
          </div>
          <div
            className="relative text-red-600 font-black text-2xl uppercase mt-1 tracking-tighter drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]"
            style={{ WebkitTextStroke: "1px white" }}
          >
            TƯ DUY
          </div>
        </div>

        <p className="text-green-900 font-bold text-[11px] leading-tight mb-4 uppercase bg-white/50 px-2 py-1 rounded w-full">
          Khơi nguồn đam mê
          <br />
          Toán học từ nhỏ
        </p>

        {/* Feature list */}
        <div className="flex flex-col gap-2 w-full mb-6">
          <div className="bg-white rounded py-2 px-2 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <p className="text-green-800 font-bold text-[11px] leading-tight">
              Thực hành lý thuyết
            </p>
          </div>
          <div className="bg-white rounded py-2 px-2 shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition-shadow">
            <p className="text-green-800 font-bold text-[11px] leading-tight">
              Làm bài tập mỗi ngày
            </p>
          </div>
          <div className="bg-white rounded py-2 px-2 shadow-sm border-l-4 border-red-400 hover:shadow-md transition-shadow">
            <p className="text-green-800 font-bold text-[11px] leading-tight">
              Thi đua cùng bạn bè
            </p>
          </div>
        </div>

        {/* Target Graphic placeholder */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] border-4 border-green-100">
            <Target size={40} className="text-green-500 stroke-[2.5]" />
          </div>
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-b from-orange-400 to-red-500 text-white font-black text-[11px] py-3 px-2 rounded-full shadow-[0_4px_10px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_15px_rgba(220,38,38,0.6)] hover:-translate-y-1 transition-all uppercase tracking-wide border-2 border-white/50 w-[95%] mb-4">
          TRẢI NGHIỆM NGAY!
        </button>

        {/* Mascot / Icon bottom right */}
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-green-200 z-20 overflow-hidden">
          <img
            src="/robot-head.png"
            alt="Mascot"
            className="w-14 h-14 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  </div>
);

export default BannerAdRight;
