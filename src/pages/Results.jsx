import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import Chef from '../components/Chef.jsx';
import { sound } from '../utils/audio.js';
import { saveGameResult } from '../services/scoreService.js';
import { maskDni } from '../utils/gameConfig.js';

export default function Results({
  player,
  gameSummary,
  onPlayAgain,
  onViewRanking
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const targetScore = gameSummary?.totalScore || 0;

  useEffect(() => {
    sound.playVictory();

    // Italian Flag Confetti colors: Verde Italiano, Blanco, Rojo Italiano, Amarillo Mozzarella
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#27864B', '#FFFFFF', '#D93636', '#F8D978'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    const durationMs = 1800;
    const steps = 40;
    const intervalMs = durationMs / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      const progress = stepCount / steps;
      const current = Math.round(targetScore * progress);
      setAnimatedScore(current);
      sound.playCoinTick();

      if (stepCount >= steps) {
        clearInterval(interval);
        setAnimatedScore(targetScore);
      }
    }, intervalMs);

    if (player && gameSummary) {
      saveGameResult({
        dni: player.dni,
        fullName: player.fullName,
        level1Score: gameSummary.level1Score,
        level2Score: gameSummary.level2Score,
        level3Score: gameSummary.level3Score,
        totalScore: gameSummary.totalScore,
        totalTimeSeconds: gameSummary.totalTimeSeconds,
        accuracy: gameSummary.accuracy,
        completed: true
      }).then(() => {
        setIsSaved(true);
      });
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100dvh-60px)] flex flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-8 max-w-3xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white border-2 border-[#EADBCE] rounded-3xl p-4 sm:p-8 shadow-md relative text-center overflow-hidden"
      >
        {/* Italian Ribbon Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

        {/* Celebrating Chef Manolo */}
        <div className="mb-2">
          <Chef
            mood="celebrating"
            speech="¡Mamma mia! ¡Completaste los tres niveles de Manolo's Pizzas con honor!"
            size="md"
          />
        </div>

        {/* Header Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFE1] border border-[#27864B]/30 text-[#27864B] text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#27864B]" />
            <span>DESAFÍO COMPLETADO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-serif text-[#383028] uppercase tracking-tight leading-tight">
            ¡FELICITACIONES, MAESTRO PIZZERO!
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6258] font-medium">
            Chef <span className="text-[#27864B] font-bold">{player?.fullName}</span> (DNI: {maskDni(player?.dni)})
          </p>
        </div>

        {/* Main Score Card: Amarillo Mozzarella con detalles verdes */}
        <div className="my-6 p-5 sm:p-6 rounded-3xl bg-[#F8D978]/30 border-2 border-[#F8D978] shadow-xs max-w-md mx-auto">
          <div className="text-xs font-black uppercase tracking-wider text-[#92400E]">
            PUNTAJE FINAL OBTENIDO
          </div>
          <div className="mt-1 text-5xl sm:text-6xl font-black font-mono text-[#27864B]">
            {animatedScore.toLocaleString()}
          </div>
          <div className="text-xs text-[#6B6258] font-mono mt-1">PUNTOS TOTALES</div>
        </div>

        {/* Level Breakdown Grid in White Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-left">
          <div className="p-3 bg-[#DCEFE1]/50 rounded-2xl border border-[#27864B]/30">
            <div className="text-[10px] font-bold text-[#27864B] uppercase">
              NIVEL 1 – AYUDANTE
            </div>
            <div className="text-xl font-black font-mono text-[#27864B]">
              +{gameSummary?.level1Score || 0} pts
            </div>
          </div>

          <div className="p-3 bg-[#F8D978]/25 rounded-2xl border border-[#F8D978]">
            <div className="text-[10px] font-bold text-[#92400E] uppercase">
              NIVEL 2 – MAESTRO
            </div>
            <div className="text-xl font-black font-mono text-[#B45309]">
              +{gameSummary?.level2Score || 0} pts
            </div>
          </div>

          <div className="p-3 bg-[#FBE4DF] rounded-2xl border border-[#D93636]/40">
            <div className="text-[10px] font-bold text-[#D93636] uppercase">
              NIVEL 3 – GRAN CHEF
            </div>
            <div className="text-xl font-black font-mono text-[#D93636]">
              +{gameSummary?.level3Score || 0} pts
            </div>
          </div>

          <div className="p-3 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE]">
            <div className="text-[10px] font-bold text-[#6B6258] uppercase">
              TIEMPO TOTAL
            </div>
            <div className="text-xl font-black font-mono text-[#383028]">
              {gameSummary?.totalTimeSeconds || 0}s
            </div>
          </div>

          <div className="p-3 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] col-span-1 sm:col-span-2">
            <div className="text-[10px] font-bold text-[#6B6258] uppercase">
              PRECISIÓN GLOBAL
            </div>
            <div className="text-xl font-black font-mono text-[#27864B]">
              {gameSummary?.accuracy || 100}% de precisión
            </div>
          </div>
        </div>

        {/* Persistence Notice */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-mono text-[#27864B] font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#27864B]" />
          <span>
            {isSaved ? 'Resultado registrado en el Ranking de Manolo\'s Pizzas' : 'Guardando resultado en el ranking...'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Main Button: Verde Italiano */}
          <button
            onClick={() => {
              sound.playClick();
              onViewRanking();
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-[#F8D978]" />
            <span>VER TABLA DE POSICIONES</span>
          </button>

          {/* Secondary Button: Blanco con bordes verdes */}
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-[#DCEFE1]/50 border-2 border-[#27864B] text-[#27864B] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>VOLVER A JUGAR</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
