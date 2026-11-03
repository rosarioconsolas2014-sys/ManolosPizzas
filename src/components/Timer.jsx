import React from 'react';
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react';

export default function Timer({ timeLeft = 30, totalTime = 40 }) {
  const percentage = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const isDanger = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className={`relative px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border-2 flex items-center gap-1.5 sm:gap-2.5 transition-colors shadow-xs ${
      isCritical
        ? 'bg-[#FBE4DF] border-[#D93636] text-[#D93636] ring-2 ring-[#D93636]/30'
        : isDanger
        ? 'bg-[#FBE4DF]/80 border-[#D93636]/60 text-[#D93636]'
        : 'bg-white border-[#EADBCE] text-[#383028]'
    }`}>
      <div className={`p-1 sm:p-1.5 rounded-xl shrink-0 ${
        isDanger ? 'bg-[#D93636] text-white animate-bounce' : 'bg-[#DCEFE1] text-[#27864B]'
      }`}>
        {isDanger ? <AlertTriangle className="w-4 h-4" /> : <TimerIcon className="w-4 h-4" />}
      </div>

      <div>
        <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#6B6258] leading-tight">
          TIEMPO
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-tight ${
            isDanger ? 'text-[#D93636]' : 'text-[#27864B]'
          }`}>
            {String(Math.max(0, Math.ceil(timeLeft))).padStart(2, '0')}s
          </span>
          <span className="text-[10px] sm:text-xs text-[#6B6258] font-mono">/ {totalTime}s</span>
        </div>
      </div>

      {/* Mini Progress Bar in Italian Green / Soft Red */}
      <div className="hidden sm:block w-20 h-2 bg-[#F3E5CC] rounded-full overflow-hidden border border-[#EADBCE]">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isDanger ? 'bg-[#D93636]' : 'bg-[#27864B]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
