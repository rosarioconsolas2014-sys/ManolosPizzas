import React, { useState } from 'react';
import { Trophy, Search, Calendar, Star } from 'lucide-react';
import { sound } from '../utils/audio.js';

export default function RankingTable({
  monthlyResults = [],
  allTimeResults = [],
  currentMonthName = 'Noviembre 2026',
  currentDni = null
}) {
  const [activeTab, setActiveTab] = useState('month'); // 'month' | 'allTime'
  const [searchQuery, setSearchQuery] = useState('');

  const rawList = activeTab === 'month' ? monthlyResults : allTimeResults;

  const filteredList = rawList.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.fullName?.toLowerCase().includes(q) ||
      item.dni?.toLowerCase().includes(q)
    );
  });

  const top3 = filteredList.slice(0, 3);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-3xl border-2 border-[#EADBCE] shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('month');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'month'
                ? 'bg-[#27864B] text-white shadow-xs'
                : 'text-[#6B6258] hover:text-[#383028]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>RANKING DEL MES ({currentMonthName})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('allTime');
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'allTime'
                ? 'bg-[#27864B] text-white shadow-xs'
                : 'text-[#6B6258] hover:text-[#383028]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>RANKING HISTÓRICO</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6258]" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#383028] placeholder-[#6B6258]/70 focus:outline-hidden focus:border-[#27864B] transition-colors"
          />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-end pt-4">
          {/* 2nd Place (Silver) */}
          {top3[1] && (
            <div className="order-2 md:order-1 bg-white border-2 border-slate-300 rounded-3xl p-4 shadow-sm text-center relative flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-black text-xl shadow-xs -mt-8 mb-2">
                🥈
              </div>
              <div className="text-[11px] font-bold text-[#6B6258] uppercase tracking-widest">
                2º PUESTO – PLATA
              </div>
              <div className="text-base font-black text-[#383028] truncate max-w-full mt-1">
                {top3[1].fullName}
              </div>
              <div className="text-xs font-mono text-[#6B6258]">
                DNI: {top3[1].dni}
              </div>
              <div className="mt-3 px-3.5 py-1 bg-[#FFFDF5] rounded-xl border border-slate-200">
                <span className="text-xl font-black font-mono text-[#27864B]">
                  {top3[1].totalScore?.toLocaleString()} pts
                </span>
              </div>
              <div className="mt-2 text-[10px] text-[#6B6258] flex items-center gap-2 font-medium">
                <span>⏱️ {top3[1].totalTimeSeconds}s</span>
                <span>🎯 {top3[1].accuracy}% prec.</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold / Italian Ribbon / Crown) */}
          {top3[0] && (
            <div className="order-1 md:order-2 bg-linear-to-b from-[#FFFBEA] via-white to-[#F8D978]/20 border-3 border-[#F8D978] rounded-3xl p-5 shadow-md text-center relative flex flex-col items-center ring-2 ring-[#27864B]/20 md:-translate-y-2 overflow-hidden">
              {/* Italian Flag Ribbon on Top Corner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#F8D978] to-[#FFF4D0] border-3 border-[#D97706] text-zinc-900 flex items-center justify-center font-black text-3xl shadow-md -mt-10 mb-2 relative">
                👑
                <div className="absolute -top-3 w-5 h-5 text-[#D97706] animate-bounce">
                  <Star className="w-full h-full fill-[#F8D978]" />
                </div>
              </div>
              <div className="text-xs font-black text-[#B45309] uppercase tracking-widest flex items-center gap-1">
                <span>🏆 1º PUESTO – CAMPEÓN</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#383028] truncate max-w-full mt-1">
                {top3[0].fullName}
              </div>
              <div className="text-xs font-mono text-[#6B6258]">
                DNI: {top3[0].dni}
              </div>
              <div className="mt-3 px-4 py-1.5 bg-[#F8D978] text-[#5C3818] rounded-2xl shadow-xs border border-[#D97706]/40">
                <span className="text-2xl font-black font-mono">
                  {top3[0].totalScore?.toLocaleString()} pts
                </span>
              </div>
              <div className="mt-2 text-xs text-[#27864B] font-bold flex items-center gap-3">
                <span>⏱️ {top3[0].totalTimeSeconds}s total</span>
                <span>🎯 {top3[0].accuracy}% precisión</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3[2] && (
            <div className="order-3 bg-white border-2 border-[#D4A373] rounded-3xl p-4 shadow-sm text-center relative flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#F3E5CC] border-2 border-[#D4A373] text-[#8A5A36] flex items-center justify-center font-black text-xl shadow-xs -mt-8 mb-2">
                🥉
              </div>
              <div className="text-[11px] font-bold text-[#8A5A36] uppercase tracking-widest">
                3º PUESTO – BRONCE
              </div>
              <div className="text-base font-black text-[#383028] truncate max-w-full mt-1">
                {top3[2].fullName}
              </div>
              <div className="text-xs font-mono text-[#6B6258]">
                DNI: {top3[2].dni}
              </div>
              <div className="mt-3 px-3.5 py-1 bg-[#FFFDF5] rounded-xl border border-[#D4A373]/50">
                <span className="text-xl font-black font-mono text-[#27864B]">
                  {top3[2].totalScore?.toLocaleString()} pts
                </span>
              </div>
              <div className="mt-2 text-[10px] text-[#6B6258] flex items-center gap-2 font-medium">
                <span>⏱️ {top3[2].totalTimeSeconds}s</span>
                <span>🎯 {top3[2].accuracy}% prec.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Ranking List Table */}
      <div className="bg-white rounded-3xl border-2 border-[#EADBCE] shadow-xs overflow-hidden">
        <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-[#EADBCE] bg-[#FFFDF5] flex items-center justify-between text-xs font-black uppercase text-[#6B6258]">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-8 text-center">POS</span>
            <span>CHEF PIZZERO</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">PRECISIÓN</span>
            <span className="hidden sm:inline">TIEMPO</span>
            <span>PUNTAJE</span>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-10 text-center text-[#6B6258]">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#F8D978]" />
            <p className="text-base font-bold text-[#383028]">
              No hay partidas registradas en esta vista todavía.
            </p>
            <p className="text-xs text-[#6B6258] mt-1">
              ¡Sé el primero en jugar y coronarte Campeón de Manolo's Pizzas!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EADBCE]/70 max-h-[500px] overflow-y-auto">
            {filteredList.map((entry, index) => {
              const pos = index + 1;
              const isUser = currentDni && entry.dni === currentDni;

              return (
                <div
                  key={entry.id || `${entry.dni}_${index}`}
                  className={`px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors ${
                    isUser
                      ? 'bg-[#DCEFE1]/60 border-l-4 border-[#27864B]'
                      : 'hover:bg-[#FFFDF5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                        pos === 1
                          ? 'bg-[#F8D978] text-[#5C3818] shadow-xs'
                          : pos === 2
                          ? 'bg-slate-200 text-slate-800'
                          : pos === 3
                          ? 'bg-[#F3E5CC] text-[#8A5A36]'
                          : 'bg-[#FFFDF5] border border-[#EADBCE] text-[#6B6258] font-mono'
                      }`}
                    >
                      {pos}
                    </span>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#383028] truncate flex items-center gap-1.5">
                        {entry.fullName}
                        {isUser && (
                          <span className="text-[10px] bg-[#27864B] text-white px-2 py-0.2 rounded-full font-black">
                            TÚ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#6B6258] flex items-center gap-2">
                        <span>DNI: {entry.dni}</span>
                        {entry.createdAt && (
                          <span className="hidden sm:inline">
                            • {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-mono font-bold text-[#27864B]">
                        {entry.accuracy || 100}%
                      </div>
                      <div className="text-[10px] text-[#6B6258]">precisión</div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-mono text-[#383028]">
                        {entry.totalTimeSeconds || 0}s
                      </div>
                      <div className="text-[10px] text-[#6B6258]">tiempo</div>
                    </div>

                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black font-mono text-[#27864B]">
                        {entry.totalScore?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#6B6258] font-mono">PUNTOS</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
