import React, { useState, useEffect, useRef } from "react";
import { X, Play, Loader2, Info } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";

interface PreRollAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: () => void;
}

export const PreRollAdModal: React.FC<PreRollAdModalProps> = ({
  isOpen,
  onClose,
  onAdComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [canSkip, setCanSkip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setTimeLeft(15);
      setCanSkip(false);
      setIsPlaying(false);
      setHasStarted(false);
      return;
    }

    // Immediately skip if user is premium
    if (user?.tier === "premium") {
      onAdComplete();
      onClose();
      return;
    }
    
    // Auto-start ad logic
    const timer = setTimeout(() => {
        if(videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Auto-play prevented by browser", e);
                    setHasStarted(true); // Allow play button overlay to show
                });
            }
        }
    }, 500);

    // Failsafe: if video stuck loading/blocked for 4 seconds, allow skip
    const failsafe = setTimeout(() => {
        setCanSkip(true);
        setHasStarted(true);
    }, 4000);
    
    return () => {
        clearTimeout(timer);
        clearTimeout(failsafe);
    };
  }, [isOpen, user, onAdComplete, onClose]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        // Allow skip after 5 seconds
        if (prev === 10) {
          setCanSkip(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!isOpen || user?.tier === "premium") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 animate-fade-in-up">
        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white/80 text-sm border border-white/10">
            <Info size={16} />
            <span>Quảng cáo</span>
            <span className="text-white/40">|</span>
            <span className="font-mono">{timeLeft}s</span>
          </div>
          
          {canSkip && (
            <button
              onClick={() => {
                onAdComplete();
                onClose();
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full transition-all group"
            >
              <span>Bỏ qua quảng cáo</span>
              <X size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black w-full flex items-center justify-center">
            {/* Fallback pattern while loading */}
            {!hasStarted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p>Đang tải quảng cáo...</p>
                </div>
            )}
          
            {/* Placeholder Ad Video */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover z-0"
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                playsInline
                preload="auto"
                onPlay={() => {
                    setIsPlaying(true);
                    setHasStarted(true);
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                    setCanSkip(true);
                    setTimeLeft(0);
                    onAdComplete();
                    onClose();
                }}
                onError={() => {
                    console.log("Video failed to load");
                    setCanSkip(true);
                    setHasStarted(true);
                }}
            />

            {/* Play Button Overlay (if autoplay is blocked) */}
            {!isPlaying && hasStarted && (
                <button 
                  onClick={() => videoRef.current?.play()}
                  className="absolute inset-0 m-auto w-20 h-20 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 z-20"
                >
                    <Play size={40} className="ml-2" />
                </button>
            )}
        </div>

        {/* Bottom progress bar */}
        <div className="h-1.5 bg-gray-800 w-full relative">
            <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000 ease-linear"
                style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
            />
        </div>

        {/* Premium Upsell */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 to-purple-900 flex items-center justify-between">
            <div className="text-white">
                <h4 className="font-bold text-lg leading-tight">Bỏ qua mọi quảng cáo?</h4>
                <p className="text-indigo-200 text-sm">Nâng cấp lên gói VIP để học không gián đoạn.</p>
            </div>
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-indigo-950 font-black px-6 py-2.5 rounded-full shadow-lg hover:shadow-yellow-500/50 hover:-translate-y-0.5 transition-all">
                Nâng cấp ngay
            </button>
        </div>
      </div>
    </div>
  );
};
