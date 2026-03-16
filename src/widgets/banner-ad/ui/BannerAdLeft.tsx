import React from "react";
import { Sparkles, Medal } from "lucide-react";
import "./BannerAd.css";

const BannerAdLeft: React.FC = () => (
  <div className="banner-ad banner-ad-left hidden xl:block">
    <div className="relative w-[180px] h-[600px] rounded-lg overflow-hidden shadow-2xl flex flex-col items-center bg-gradient-to-b from-[#4a72ff] to-[#1e3a8a] border border-[#7a9dff]/30 group cursor-pointer hover:shadow-[0_0_30px_rgba(74,114,255,0.4)] transition-all duration-300">
      {/* Decorative stars / sparks */}
      <div className="absolute top-10 left-4 text-yellow-300 opacity-70 animate-pulse">
        <Sparkles size={16} />
      </div>
      <div
        className="absolute top-40 right-4 text-blue-200 opacity-60 animate-pulse"
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
      <div className="w-full pt-4 pb-2 flex justify-center items-center gap-2 px-2 border-b border-white/10 bg-white/5 backdrop-blur-sm z-10">
        <span className="text-white font-bold text-sm tracking-wider">
          ViOlympic
        </span>
        <span className="text-white/50 text-xs">|</span>
        <span className="text-white font-bold text-xs">Kids</span>
      </div>

      {/* Main text content */}
      <div className="flex-1 w-full flex flex-col items-center pt-6 px-3 text-center z-10">
        <h3 className="text-yellow-400 font-extrabold text-[15px] uppercase leading-tight mb-2 drop-shadow-md">
          HÀNH TRANG CHO BÉ
        </h3>
        <h2 className="text-white font-black text-2xl uppercase leading-[1.1] mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          BƯỚC VÀO LỚP 1 TỰ TIN
        </h2>

        {/* Feature badges */}
        <div className="flex flex-col gap-3 w-full mb-8">
          <div className="bg-white rounded-lg py-1.5 px-2 shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
            <p className="text-[#1e3a8a] font-bold text-[11px] leading-tight">
              PHÁT TRIỂN TƯ DUY TOÁN HỌC
            </p>
          </div>
          <div className="bg-white rounded-lg py-1.5 px-2 shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
            <p className="text-[#1e3a8a] font-bold text-[11px] leading-tight">
              HỌC MÀ CHƠI - CHƠI MÀ HỌC XUYÊN SUỐT{" "}
              <span className="text-orange-500 font-black">HÀNG TUẦN</span>
            </p>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-white rounded-lg py-1.5 px-2 shadow-lg transform border border-orange-200 -rotate-1 hover:rotate-0 transition-transform">
            <p className="text-[#1e3a8a] font-bold text-[11px] leading-tight">
              HÀNG NGÀN{" "}
              <span className="text-red-600 font-black">QUÀ TẶNG</span> HẤP DẪN
            </p>
          </div>
        </div>

        {/* Golden star graphic placeholder (using CSS + icon for now) */}
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-tr from-yellow-500 via-yellow-300 to-yellow-100 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(253,224,71,0.6)] border-4 border-white/20">
            <Medal size={48} className="text-yellow-700 drop-shadow-sm" />
          </div>
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1e3a8a] font-black text-sm py-2.5 px-6 rounded-full shadow-[0_4px_15px_rgba(250,204,21,0.4)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.6)] hover:-translate-y-1 transition-all uppercase tracking-wide border-2 border-white/50 w-full mb-4">
          THAM GIA NGAY
        </button>

        {/* QR Code placeholder */}
        <div className="bg-white p-1 rounded-md shadow-md mb-4 bg-opacity-90">
          <svg width="40" height="40" viewBox="0 0 48 48">
            <rect width="48" height="48" fill="#fff" />
            <rect x="8" y="8" width="8" height="8" fill="#1e3a8a" />
            <rect x="32" y="8" width="8" height="8" fill="#1e3a8a" />
            <rect x="8" y="32" width="8" height="8" fill="#1e3a8a" />
            <rect x="24" y="24" width="8" height="8" fill="#1e3a8a" />
            <rect x="12" y="12" width="4" height="4" fill="#1e3a8a" />
          </svg>
        </div>
      </div>

      {/* Bottom glowing border effect */}
      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
    </div>
  </div>
);

export default BannerAdLeft;
