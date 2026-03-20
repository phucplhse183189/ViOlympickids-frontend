import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RotateCcw, Monitor } from "lucide-react";
import { useGameSound } from "@/shared/lib/useGameSound";
import { twMerge } from "tailwind-merge";

// Type definitions
type CoinVal = 1 | 10 | 100;
interface CoinModel {
  id: string;
  value: CoinVal;
  status: "source" | "machine" | "merged";
}

// Helper to generate initial coins based on a number
function generateCoinsForNumber(num: number, prefix: string): CoinModel[] {
  const coins: CoinModel[] = [];
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;

  for (let i = 0; i < hundreds; i++) coins.push({ id: `${prefix}-100-${i}`, value: 100, status: "source" });
  for (let i = 0; i < tens; i++) coins.push({ id: `${prefix}-10-${i}`, value: 10, status: "source" });
  for (let i = 0; i < ones; i++) coins.push({ id: `${prefix}-1-${i}`, value: 1, status: "source" });

  return coins;
}

const CoinUI = ({ value, onClick, className }: { value: CoinVal, onClick?: () => void, className?: string }) => {
  const styles = {
    100: "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-yellow-200 text-yellow-900 shadow-[0_4px_0_#b45309]",
    10: "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-slate-100 text-slate-800 shadow-[0_4px_0_#64748b]",
    1: "bg-gradient-to-br from-orange-300 via-orange-400 to-amber-700 border-orange-200 text-amber-950 shadow-[0_4px_0_#9a3412]",
  };

  return (
    <button
      onClick={onClick}
      className={twMerge(
        `w-14 h-14 rounded-full border-2 flex items-center justify-center font-black text-xl hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer select-none`,
        styles[value],
        className
      )}
    >
      ${value}
    </button>
  );
};

export function MatificCoinGame() {
  const navigate = useNavigate();
  const sound = useGameSound();

  // Problem Setup (e.g., 209 + 476)
  const num1 = 209;
  const num2 = 476;
  const targetSum = num1 + num2;

  const [coins, setCoins] = useState<CoinModel[]>(() => [
    ...generateCoinsForNumber(num1, "A"),
    ...generateCoinsForNumber(num2, "B")
  ]);

  const [machineAnimating, setMachineAnimating] = useState<CoinVal | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameState, setGameState] = useState<"playing" | "victory">("playing");

  // Interaction logic
  const handleCoinClick = (id: string, currentStatus: "source" | "machine") => {
    if (machineAnimating) return; // lock during merge animation
    sound.pickup();
    
    setCoins(prev => prev.map(c => c.id === id ? { ...c, status: currentStatus === "source" ? "machine" : "source" } : c));
  };

  // Grouping check (runs every time coins change)
  useEffect(() => {
    const checkGrouping = () => {
      const machineCoins = coins.filter(c => c.status === "machine");
      const ones = machineCoins.filter(c => c.value === 1);
      const tens = machineCoins.filter(c => c.value === 10);

      // Check for 10 ones
      if (ones.length >= 10) {
        setMachineAnimating(1);
        sound.click(); // trigger grouping sound
        setTimeout(() => {
          setCoins(prev => {
            let removedCount = 0;
            const newCoins = prev.filter(c => {
              if (c.status === "machine" && c.value === 1 && removedCount < 10) {
                removedCount++;
                return false;
              }
              return true;
            });
            // Add a new $10 coin to machine
            newCoins.push({ id: `merged-10-${Date.now()}`, value: 10, status: "machine" });
            return newCoins;
          });
          setMachineAnimating(null);
          sound.correctVoice(); // Happy ding!
        }, 1000);
      } 
      // Check for 10 tens
      else if (tens.length >= 10) {
        setMachineAnimating(10);
        sound.click();
        setTimeout(() => {
          setCoins(prev => {
            let removedCount = 0;
            const newCoins = prev.filter(c => {
              if (c.status === "machine" && c.value === 10 && removedCount < 10) {
                removedCount++;
                return false;
              }
              return true;
            });
            // Add a new $100 coin
            newCoins.push({ id: `merged-100-${Date.now()}`, value: 100, status: "machine" });
            return newCoins;
          });
          setMachineAnimating(null);
          sound.correctVoice();
        }, 1000);
      }
    };
    checkGrouping();
  }, [coins, sound]);

  const handleCheckAnswer = () => {
    if (parseInt(userAnswer) === targetSum) {
      sound.victoryVoice();
      setGameState("victory");
    } else {
      sound.wrongVoice();
      setUserAnswer("");
    }
  };

  const sourceCoins = coins.filter(c => c.status === "source");
  const machineCoins = coins.filter(c => c.status === "machine");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between z-10">
        <button onClick={() => navigate("/student")} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
          <ArrowLeft size={20} /> Quay lại
        </button>
        <div className="bg-violet-100 text-violet-800 font-black px-4 py-2 rounded-xl border-2 border-violet-200">
          Gộp và Tách - Phép Cộng
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Side: Question and Source Coins */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 flex gap-4 items-center">
             <div className="w-24 h-24 bg-teal-100 rounded-3xl flex items-center justify-center text-5xl shrink-0 shadow-inner">
               👾
             </div>
             <div>
               <h2 className="text-slate-500 font-bold mb-1">Khách hàng cần đổi xu:</h2>
               <div className="bg-sky-50 px-4 py-3 rounded-2xl border-2 border-sky-200 text-sky-900 font-black text-2xl flex items-center gap-4">
                  <span>{num1} + {num2}</span>
                  <span>=</span>
                  <input 
                    type="number" 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="?"
                    disabled={gameState === "victory"}
                    className="w-24 text-center bg-white border-2 border-sky-300 rounded-xl py-1 outline-none focus:border-sky-500 text-sky-700"
                  />
                  {gameState === "playing" && (
                    <button onClick={handleCheckAnswer} className="bg-green-500 text-white p-2 rounded-xl shadow-[0_4px_0_#166534] active:translate-y-1 active:shadow-none hover:-translate-y-1 transition-all">
                      <CheckCircle2 size={24} />
                    </button>
                  )}
               </div>
             </div>
          </div>

          <div className="bg-white flex-1 rounded-3xl p-6 shadow-sm border-2 border-slate-200">
            <h3 className="text-center font-extrabold text-slate-400 mb-4 uppercase tracking-wider">Kho Tiền Mặt (Chạm để chuyển tiền)</h3>
            <div className="flex flex-wrap gap-3 content-start">
               {sourceCoins.map(coin => (
                 <CoinUI key={coin.id} value={coin.value} onClick={() => handleCoinClick(coin.id, "source")} className="animate-fade-in-up" />
               ))}
               {sourceCoins.length === 0 && (
                 <div className="w-full text-center text-slate-300 font-bold py-10">Đã chuyển hết tiền vào máy!</div>
               )}
            </div>
          </div>
        </div>

        {/* Right Side: The Machine */}
        <div className="flex-1 bg-slate-800 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden border-8 border-slate-700 flex flex-col">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-center gap-3 mb-6 mt-4 z-10">
            <Monitor className="text-emerald-400" size={32} />
            <h2 className="text-white font-black text-2xl tracking-widest uppercase text-shadow-md">Máy Nhóm Xu</h2>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4 h-full relative z-10">
             {/* Hundreds Column */}
             <div className="bg-slate-900/50 rounded-3xl border-2 border-slate-700 flex flex-col items-center py-4 overflow-hidden relative">
               <div className="text-yellow-500 font-black mb-4 bg-slate-800 px-4 py-1 rounded-full text-sm">TRĂM ($100)</div>
               <div className="flex flex-wrap justify-center gap-2 p-2 w-full content-start overflow-y-auto custom-scrollbar">
                  {machineCoins.filter(c => c.value === 100).map(coin => (
                    <CoinUI key={coin.id} value={coin.value} onClick={() => handleCoinClick(coin.id, "machine")} className="animate-bounce-in" />
                  ))}
               </div>
             </div>
             
             {/* Tens Column */}
             <div className="bg-slate-900/50 rounded-3xl border-2 border-slate-700 flex flex-col items-center py-4 overflow-hidden relative">
               <div className="text-slate-300 font-black mb-4 bg-slate-800 px-4 py-1 rounded-full text-sm">CHỤC ($10)</div>
               <div className={twMerge("flex flex-wrap justify-center gap-2 p-2 w-full content-start overflow-y-auto custom-scrollbar transition-all", machineAnimating === 10 && "scale-50 blur-sm opacity-50")}>
                  {machineCoins.filter(c => c.value === 10).map(coin => (
                    <CoinUI key={coin.id} value={coin.value} onClick={() => handleCoinClick(coin.id, "machine")} className="animate-bounce-in" />
                  ))}
               </div>
               {machineAnimating === 10 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                 </div>
               )}
             </div>

             {/* Ones Column */}
             <div className="bg-slate-900/50 rounded-3xl border-2 border-slate-700 flex flex-col items-center py-4 overflow-hidden relative">
               <div className="text-orange-400 font-black mb-4 bg-slate-800 px-4 py-1 rounded-full text-sm">ĐƠN VỊ ($1)</div>
               <div className={twMerge("flex flex-wrap justify-center gap-2 p-2 w-full content-start overflow-y-auto custom-scrollbar transition-all", machineAnimating === 1 && "scale-50 blur-sm opacity-50")}>
                  {machineCoins.filter(c => c.value === 1).map(coin => (
                    <CoinUI key={coin.id} value={coin.value} onClick={() => handleCoinClick(coin.id, "machine")} className="animate-bounce-in" />
                  ))}
               </div>
               {machineAnimating === 1 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Victory Overlay */}
      {gameState === "victory" && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center shadow-2xl border-8 border-white max-w-md w-full animate-bounce-in">
             <div className="text-8xl mb-6 animate-kids-bounce-in">🎉</div>
             <h2 className="text-3xl font-black text-sky-600 mb-2">Chính xác tuyệt đối!</h2>
             <p className="text-slate-500 font-bold mb-8 text-center text-lg">{num1} + {num2} bằng đúng {targetSum}!</p>
             <button 
               onClick={() => {
                 setCoins([...generateCoinsForNumber(num1, "A"), ...generateCoinsForNumber(num2, "B")]);
                 setUserAnswer("");
                 setGameState("playing");
               }}
               className="bg-emerald-500 text-white font-black text-xl px-8 py-4 rounded-2xl w-full flex items-center justify-center gap-3 shadow-[0_6px_0_#047857] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all"
             >
               <RotateCcw /> CHƠI LẠI
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
