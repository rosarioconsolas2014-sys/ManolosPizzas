import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export default function ScoreBoard({ totalScore = 0, currentLevelScore = 0, levelNumber = 1 }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Total Score Box: Amarillo Mozzarella con detalles verdes */}
      <div className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-white border-2 border-[#EADBCE] shadow-xs flex items-center gap-1.5 sm:gap-2.5">
        <div className="p-1 sm:p-1.5 rounded-xl bg-[#F8D978] text-[#383028] shadow-xs shrink-0">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#B45309]" />
        </div>
        <div>
          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#6B6258] flex items-center gap-1 leading-tight">
            <span>PUNTOS</span>
            <Sparkles className="w-2.5 h-2.5 text-[#27864B]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#27864B] leading-tight">
            {totalScore.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Level Score Tag */}
      <div className="hidden md:flex flex-col justify-center px-3 py-2 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE] text-xs shadow-xs">
        <span className="text-[10px] font-bold text-[#6B6258] uppercase">
          NIVEL {levelNumber}
        </span>
        <span className="font-mono font-bold text-[#27864B]">
          +{currentLevelScore} pts
        </span>
      </div>
    </div>
  );
}
