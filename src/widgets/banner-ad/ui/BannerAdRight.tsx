import React from "react";
import { PenTool, Edit3 } from "lucide-react";
import "./BannerAd.css";

const BannerAdRight: React.FC = () => (
  <div className="banner-ad banner-ad-right hidden xl:block">
    <div className="relative w-[180px] h-[calc(100vh-100px)] min-h-[750px] max-h-[900px] rounded-lg overflow-hidden shadow-2xl flex flex-col items-center bg-gradient-to-b from-[#0055a4] via-[#0066cc] to-[#004080] border border-[#3399ff]/50 group cursor-pointer hover:shadow-[0_0_30px_rgba(0,85,164,0.4)] transition-all duration-300">
      {/* Decorative leaf/shape elements */}
      <div className="absolute top-8 left-4 w-6 h-6 bg-blue-300/30 rounded-full blur-sm"></div>
      <div className="absolute top-24 right-4 w-8 h-8 bg-white/40 rounded-full blur-md animate-pulse"></div>
      <div className="absolute top-2 left-2 text-white/20 text-4xl font-black transform -rotate-12">
        +
      </div>
      <div className="absolute bottom-20 right-2 text-white/20 text-5xl font-black transform rotate-12">
        ×
      </div>

      {/* Header section with logos */}
      <div className="w-full pt-4 pb-2 flex justify-center items-center gap-2 px-2 bg-white/10 backdrop-blur-sm z-10 shadow-sm border-b border-white/20">
        <div className="flex items-center gap-1">
          <Edit3 size={16} className="text-white" />
          <span className="text-white font-black text-sm tracking-tighter uppercase">
            Thiên Long
          </span>
        </div>
      </div>

      {/* Main text content */}
      <div className="flex-1 w-full flex flex-col items-center pt-8 px-3 text-center z-10">
        {/* Curved Title Badge */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-yellow-400 rounded-lg transform rotate-2 w-[130px] left-1/2 -translate-x-1/2"></div>
          <div className="relative bg-white text-[#0055a4] font-black text-lg px-4 py-1.5 rounded-lg border-2 border-yellow-400 shadow-md transform -rotate-3 z-10 whitespace-nowrap">
            HỌC CỤ ĐỈNH
          </div>
          <div
            className="relative text-yellow-400 font-black text-2xl uppercase mt-2 tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            style={{ WebkitTextStroke: "1px #0055a4" }}
          >
            ĐIỂM 10
          </div>
        </div>

        <p className="text-[#0055a4] font-bold text-[12px] leading-tight mb-6 uppercase bg-white/90 px-2 py-2 rounded w-full shadow-sm">
          Đồng hành cùng bé
          <br />
          Tới trường
        </p>

        {/* Feature list */}
        <div className="flex flex-col gap-3 w-full mb-8">
          <div className="bg-white rounded py-2 px-2 shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-[#0055a4] font-bold text-[12px] leading-tight">
              BÚT MỰC, BÚT MÀU
            </p>
          </div>
          <div className="bg-white rounded py-2 px-2 shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-[#0055a4] font-bold text-[12px] leading-tight">
              VỞ Ô LY CAO CẤP
            </p>
          </div>
          <div className="bg-white rounded py-2 px-2 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow cursor-pointer">
            <p className="text-[#0055a4] font-bold text-[12px] leading-tight">
              COMBO TIẾT KIỆM
            </p>
          </div>
        </div>

        {/* Target Graphic placeholder */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-20"></div>
          <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] border-4 border-blue-200">
            <PenTool size={40} className="text-[#0055a4] stroke-[2.5]" />
          </div>
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-b from-yellow-300 to-yellow-500 text-[#0055a4] font-black text-[12px] py-3 px-2 rounded-full shadow-[0_4px_10px_rgba(250,204,21,0.4)] hover:shadow-[0_6px_15px_rgba(250,204,21,0.6)] hover:-translate-y-1 transition-all uppercase tracking-wide border-2 border-white/50 w-[95%] mb-6">
          SẮM NGAY
        </button>

      </div>
      
      {/* Bottom glowing border effect */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80"></div>
    </div>
  </div>
);

export default BannerAdRight;
