import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, Play, RefreshCw } from 'lucide-react';
import RankingTable from '../components/RankingTable.jsx';
import { getMonthlyRanking, getAllTimeRanking } from '../services/scoreService.js';
import { formatMonthName } from '../utils/gameConfig.js';
import { sound } from '../utils/audio.js';

export default function Ranking({
  onBackToHome,
  onStartGame,
  config,
  currentDni
}) {
  const [monthlyResults, setMonthlyResults] = useState([]);
  const [allTimeResults, setAllTimeResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentMonth = config?.currentMonth || '2026-11';

  const loadRankings = async () => {
    setIsLoading(true);
    try {
      const [mList, hList] = await Promise.all([
        getMonthlyRanking(currentMonth),
        getAllTimeRanking()
      ]);
      setMonthlyResults(mList);
      setAllTimeResults(hList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [currentMonth]);

  return (
    <div className="min-h-[calc(100dvh-60px)] px-3 sm:px-4 py-4 sm:py-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-[#EADBCE] pb-3">
        <div>
          <button
            onClick={() => {
              sound.playClick();
              onBackToHome();
            }}
            className="text-xs text-[#6B6258] hover:text-[#383028] font-bold flex items-center gap-1.5 cursor-pointer mb-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>

          <h1 className="text-2xl sm:text-4xl font-black font-serif text-[#383028] tracking-tight flex items-center gap-2 leading-tight">
            <span className="text-[#27864B]">TABLA DE POSICIONES</span>
            <span className="text-xl sm:text-2xl">🏆</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6258]">
            Competencia oficial de Manolo's Pizzas – {formatMonthName(currentMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              loadRankings();
            }}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white border-2 border-[#EADBCE] text-[#6B6258] hover:text-[#383028] hover:bg-[#F3E5CC]/30 active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Actualizar ranking"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Main Button: Verde Italiano con Texto Blanco */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>¡JUGAR AHORA!</span>
          </button>
        </div>
      </div>

      {/* Monthly Prize Highlight Bar */}
      <div className="p-4 rounded-3xl bg-[#DCEFE1]/60 border-2 border-[#27864B]/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#F8D978] text-[#5C3818] flex items-center justify-center text-2xl shadow-xs shrink-0 border border-[#D97706]/30">
            🎁
          </div>
          <div>
            <div className="text-[11px] font-black uppercase text-[#27864B] tracking-wider">
              PREMIO ESPECIAL PARA EL PRIMER PUESTO DEL MES
            </div>
            <div className="text-sm sm:text-base font-black text-[#383028]">
              {config?.monthlyPrizeName}
            </div>
            <div className="text-xs text-[#6B6258] line-clamp-1">
              {config?.monthlyPrizeDescription}
            </div>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-white text-[#27864B] px-3.5 py-1.5 rounded-xl border border-[#27864B]/30 shadow-xs shrink-0">
          Cierre: Fin de Mes
        </span>
      </div>

      {/* Main Ranking Table Component */}
      <RankingTable
        monthlyResults={monthlyResults}
        allTimeResults={allTimeResults}
        currentMonthName={formatMonthName(currentMonth)}
        currentDni={currentDni}
      />
    </div>
  );
}
