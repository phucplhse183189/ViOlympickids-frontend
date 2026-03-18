import React from "react";
import { BookOpen, Sparkles, ShoppingBag } from "lucide-react";
import "./BannerAd.css";

const BannerAdLeft: React.FC = () => (
  <div className="banner-ad banner-ad-left hidden xl:block">
    <div className="relative w-[180px] h-[calc(100vh-100px)] min-h-[750px] max-h-[900px] rounded-lg overflow-hidden shadow-2xl flex flex-col items-center bg-gradient-to-b from-[#e60000] to-[#b30000] border border-[#ff6666]/30 group cursor-pointer hover:shadow-[0_0_30px_rgba(230,0,0,0.4)] transition-all duration-300">
      {/* Decorative stars / sparks */}
      <div className="absolute top-10 left-4 text-yellow-300 opacity-70 animate-pulse">
        <Sparkles size={16} />
      </div>
      <div
        className="absolute top-40 right-4 text-white opacity-60 animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        <Sparkles size={20} />
      </div>
      <div
        className="absolute bottom-32 left-8 text-yellow-300 opacity-80 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      >
        <Sparkles size={14} />
      </div>

      {/* Header section with logos */}
      <div className="w-full pt-4 pb-2 flex justify-center items-center gap-2 px-2 border-b border-white/20 bg-white/10 backdrop-blur-sm z-10">
        <BookOpen size={16} className="text-white" />
        <span className="text-white font-black text-sm tracking-wider uppercase">
          Fahasa
        </span>
      </div>

      {/* Main text content */}
      <div className="flex-1 w-full flex flex-col items-center pt-8 px-3 text-center z-10">
        <h3 className="text-yellow-300 font-extrabold text-[13px] uppercase leading-tight mb-2 drop-shadow-md">
          SÁCH HAY CHO BÉ
        </h3>
        <h2 className="text-white font-black text-2xl uppercase leading-[1.1] mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          CÙNG CON<br/>TRƯỞNG THÀNH
        </h2>

        {/* Feature badges */}
        <div className="flex flex-col gap-3 w-full mb-10">
          <div className="bg-white rounded-lg py-2 px-2 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform cursor-pointer">
            <p className="text-[#b30000] font-bold text-[12px] leading-tight">
              TOP SÁCH BÁN CHẠY
            </p>
          </div>
          <div className="bg-white rounded-lg py-2 px-2 shadow-lg transform rotate-2 hover:rotate-0 transition-transform cursor-pointer">
            <p className="text-[#b30000] font-bold text-[12px] leading-tight">
              TRUYỆN TRANH <br/> <span className="text-orange-500 font-black">GIÁO DỤC</span>
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-100 to-white rounded-lg py-2 px-2 shadow-lg transform border border-yellow-300 -rotate-1 hover:rotate-0 transition-transform cursor-pointer">
            <p className="text-[#b30000] font-bold text-[12px] leading-tight">
              GIẢM ĐẾN <span className="text-red-600 font-black text-lg">50%</span>
            </p>
          </div>
        </div>

        {/* Golden circle graphic placeholder */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-tr from-white via-gray-100 to-gray-300 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.6)] border-4 border-red-300/50">
            <ShoppingBag size={40} className="text-[#b30000] drop-shadow-sm" />
          </div>
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-[#b30000] font-black text-sm py-3 px-6 rounded-full shadow-[0_4px_15px_rgba(250,204,21,0.4)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.6)] hover:-translate-y-1 transition-all uppercase tracking-wide border-2 border-white/50 w-full mb-6">
          MUA NGAY
        </button>

      </div>

      {/* Bottom glowing border effect */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80"></div>
    </div>
  </div>
);

export default BannerAdLeft;
