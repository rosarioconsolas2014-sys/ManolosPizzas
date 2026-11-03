import React from 'react';
import { Volume2, VolumeX, Trophy, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio.js';

export default function Navbar({
  currentView,
  setCurrentView,
  player,
  isMuted,
  setIsMuted
}) {
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF5]/95 backdrop-blur-md border-b-2 border-[#EADBCE] shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => {
            sound.playClick();
            setCurrentView('home');
          }}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-2xl flex items-center justify-center shadow-xs border-2 border-[#27864B] group-hover:rotate-6 transition-transform">
            <span className="text-xl sm:text-2xl filter drop-shadow-xs">🍕</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-[#D93636] font-serif uppercase">
                MANOLO'S
              </span>
              <span className="text-[10px] sm:text-[11px] font-black bg-[#27864B] text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                PIZZAS
              </span>
            </div>
            <div className="text-[9px] sm:text-[11px] font-bold text-[#6B6258] tracking-widest hidden xs:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27864B]" />
              <span className="text-[#27864B]">THE PIZZA CHALLENGE</span>
            </div>
          </div>
        </button>

        {/* Player Status Badge if registered */}
        {player && (
          <div className="hidden sm:flex items-center gap-2 bg-white border border-[#27864B]/30 rounded-full px-3.5 py-1 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-[#27864B] animate-pulse" />
            <span className="text-xs font-bold text-[#6B6258]">
              Chef <span className="text-[#27864B] font-extrabold">{player.fullName}</span>
            </span>
            <span className="text-[10px] font-mono bg-[#DCEFE1] text-[#27864B] px-1.5 py-0.5 rounded-md font-bold">
              DNI: {player.dni}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Audio toggle button */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Activar Sonido y Música Arcade' : 'Silenciar'}
            className={`p-2 rounded-xl border-2 transition-all active:scale-90 flex items-center gap-1.5 cursor-pointer ${
              isMuted
                ? 'bg-white text-[#6B6258] border-[#EADBCE] hover:bg-[#F3E5CC]/40'
                : 'bg-[#DCEFE1] text-[#27864B] border-[#27864B] shadow-xs'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-xs font-bold hidden lg:inline">
              {isMuted ? 'MUDO' : 'AUDIO ON'}
            </span>
          </button>

          {/* Ranking Button */}
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('ranking');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border-2 transition-all active:scale-95 cursor-pointer ${
              currentView === 'ranking'
                ? 'bg-[#27864B] text-white border-[#27864B] shadow-sm'
                : 'bg-white text-[#27864B] border-[#27864B]/40 hover:border-[#27864B] hover:bg-[#DCEFE1]/50 shadow-xs'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#F8D978]" />
            <span className="hidden md:inline">POSICIONES</span>
          </button>

          {/* Como Jugar */}
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('howToPlay');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 border-2 transition-all active:scale-95 cursor-pointer ${
              currentView === 'howToPlay'
                ? 'bg-[#27864B] text-white border-[#27864B]'
                : 'bg-white text-[#6B6258] border-[#EADBCE] hover:border-[#6B6258] hover:bg-stone-50 shadow-xs'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#D93636]" />
            <span className="hidden lg:inline">CÓMO JUGAR</span>
          </button>

          {/* Admin Panel */}
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('admin');
            }}
            title="Panel de Administración"
            className={`p-2 rounded-xl border-2 transition-all active:scale-95 cursor-pointer ${
              currentView === 'admin'
                ? 'bg-[#D93636] text-white border-[#D93636] shadow-sm'
                : 'bg-white text-[#D93636] border-[#FBE4DF] hover:border-[#D93636] hover:bg-[#FBE4DF]/50 shadow-xs'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
