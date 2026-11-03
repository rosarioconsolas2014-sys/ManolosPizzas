import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';

export default function LevelProgress({ currentLevel = 1, completedLevels = [] }) {
  const levels = [
    {
      num: 1,
      name: 'Ayudante',
      subtitle: 'Fácil',
      icon: '🍳',
      bgActive: 'bg-[#DCEFE1] border-[#27864B] text-[#27864B]',
      badgeActive: 'bg-[#27864B] text-white',
      badgeDone: 'bg-[#27864B] text-white'
    },
    {
      num: 2,
      name: 'Maestro Pizzero',
      subtitle: 'Medio',
      icon: '🍕',
      bgActive: 'bg-[#F8D978]/40 border-[#D97706] text-[#92400E]',
      badgeActive: 'bg-[#D97706] text-white',
      badgeDone: 'bg-[#27864B] text-white'
    },
    {
      num: 3,
      name: 'Gran Chef',
      subtitle: 'Difícil',
      icon: '🏆',
      bgActive: 'bg-[#FBE4DF] border-[#D93636] text-[#D93636]',
      badgeActive: 'bg-[#D93636] text-white',
      badgeDone: 'bg-[#27864B] text-white'
    }
  ];

  return (
    <div className="w-full max-w-xl mx-auto py-2 px-3 bg-white rounded-2xl border-2 border-[#EADBCE] shadow-xs">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {levels.map((lvl, index) => {
          const isDone = completedLevels.includes(lvl.num);
          const isCurrent = currentLevel === lvl.num;
          const isLocked = !isDone && !isCurrent;

          return (
            <React.Fragment key={lvl.num}>
              <div
                className={`flex-1 flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? `${lvl.bgActive} shadow-xs ring-2 ring-[#27864B]/20`
                    : isDone
                    ? 'bg-[#DCEFE1]/50 border-[#27864B]/40 text-[#27864B]'
                    : 'bg-[#FFFDF5] border-[#EADBCE] text-[#6B6258] opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                    isDone
                      ? 'bg-[#27864B] text-white'
                      : isCurrent
                      ? lvl.badgeActive
                      : 'bg-[#F3E5CC] text-[#6B6258]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span>{lvl.icon}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-black uppercase truncate text-[#383028]">
                    {lvl.name}
                  </div>
                  <div className="text-[9px] font-mono text-[#6B6258]">
                    {isDone ? 'COMPLETADO' : isCurrent ? 'EN JUEGO' : lvl.subtitle}
                  </div>
                </div>
              </div>

              {index < levels.length - 1 && (
                <div className="w-2 sm:w-4 h-0.5 bg-[#EADBCE] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
