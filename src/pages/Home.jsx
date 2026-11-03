import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, HelpCircle, Award, Star, X } from 'lucide-react';
import Chef from '../components/Chef.jsx';
import { sound } from '../utils/audio.js';
import { formatMonthName } from '../utils/gameConfig.js';

export default function Home({
  onStartGame,
  onViewRanking,
  champion,
  config,
  topScore = 0
}) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-between px-4 py-6 md:py-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="w-full text-center space-y-3 relative z-10">
        {/* Italian Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-[#27864B] shadow-xs text-[#27864B] text-xs sm:text-sm font-black tracking-wider uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-[#27864B]" />
          <span>¡EL VIDEOJUEGO OFICIAL DE MANOLO'S PIZZAS!</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#D93636]" />
        </div>

        {/* Main Logo & Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight uppercase leading-tight">
            <span className="text-[#D93636]">MANOLO'S</span>{' '}
            <span className="text-[#27864B]">PIZZAS</span>
          </h1>
          <div className="text-lg sm:text-2xl md:text-3xl font-black tracking-wider text-[#383028] uppercase font-mono">
            THE PIZZA CHALLENGE
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#6B6258] max-w-xl mx-auto font-medium">
            ¿Tenés lo necesario para ser el mejor pizzero del mes? Atendé comandas a contrarreloj en 3 niveles y ganá premios reales de nuestra pizzería italiana.
          </p>
        </div>
      </div>

      {/* Centerpiece: Chef Manolo + Action Station */}
      <div className="my-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* Left Column: Monthly Champion Showcase Card */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-3xl p-5 border-2 border-[#EADBCE] shadow-sm relative overflow-hidden">
            {/* Italian Flag Strip along top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#F8D978] text-[#5C3818] shadow-xs">
                  <Trophy className="w-5 h-5 text-[#B45309]" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-[#27864B] tracking-wider">
                    COMPETENCIA MENSUAL
                  </div>
                  <div className="text-sm font-black text-[#383028]">
                    CAMPEÓN DEL MES
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-[#DCEFE1] text-[#27864B] px-2 py-0.5 rounded-full border border-[#27864B]/30">
                {formatMonthName(config?.currentMonth)}
              </span>
            </div>

            {/* Champion Info */}
            {champion ? (
              <div className="space-y-3 bg-[#FFFDF5] p-3.5 rounded-2xl border border-[#EADBCE]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#F8D978] to-[#FFF4D0] flex items-center justify-center text-2xl shadow-xs border-2 border-[#D97706]/40">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#B45309] font-bold uppercase">
                      LÍDER ACTUAL
                    </div>
                    <div className="text-base font-black text-[#383028] truncate">
                      {champion.fullName}
                    </div>
                    <div className="text-xs font-mono text-[#6B6258]">
                      Récord: <span className="text-[#27864B] font-bold">{champion.totalScore?.toLocaleString()} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] text-[#6B6258] text-xs">
                <Star className="w-8 h-8 text-[#F8D978] mx-auto mb-1 animate-pulse" />
                <p className="font-bold text-[#383028]">¡Puesto vacante!</p>
                <p className="text-[11px] text-[#6B6258]">Jugá ahora y convertite en el primer campeón del mes.</p>
              </div>
            )}

            {/* Monthly Prize Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#DCEFE1]/60 border-2 border-[#27864B]/40">
              <div className="flex items-center gap-2 text-xs font-black text-[#27864B] uppercase tracking-wider mb-1">
                <Award className="w-4 h-4 text-[#D97706]" />
                <span>PREMIO ESPECIAL DEL MES</span>
              </div>
              <div className="text-xs font-black text-[#383028] leading-snug">
                {config?.monthlyPrizeName || 'CENA COMPLETA PARA 4 + 1 AÑO DE PIZZAS'}
              </div>
              <div className="text-[11px] text-[#6B6258] mt-1 line-clamp-2 leading-tight">
                {config?.monthlyPrizeDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Chef Manolo Animation & Main CTA */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2">
          <Chef
            mood="greeting"
            speech="¡Benvenuto a Manolo's! ¿Estás listo para preparar las mejores pizzas italianas?"
            size="xl"
          />

          {/* Primary CTA Button: Verde Italiano con Texto Blanco */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="mt-6 w-full max-w-sm py-4 px-8 rounded-2xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-xl sm:text-2xl uppercase tracking-wider shadow-md border-2 border-[#1e6b3c] flex items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>¡JUGAR AHORA!</span>
          </motion.button>

          {/* Secondary Buttons: Blanco con Bordes Verdes */}
          <div className="mt-4 flex items-center gap-3 w-full max-w-sm">
            <button
              onClick={() => {
                sound.playClick();
                onViewRanking();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border-2 border-[#27864B] text-[#27864B] hover:bg-[#DCEFE1]/50 text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#D97706]" />
              <span>POSICIONES</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowHowToPlay(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border-2 border-[#EADBCE] text-[#383028] hover:border-[#6B6258] hover:bg-stone-50 text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#D93636]" />
              <span>CÓMO JUGAR</span>
            </button>
          </div>
        </div>

        {/* Right Column: High Score & 3 Levels Info */}
        <div className="lg:col-span-3 order-3 space-y-4">
          {/* High Score Card */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#EADBCE] shadow-sm text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#6B6258]">
              MEJOR PUNTAJE DEL MES
            </div>
            <div className="mt-1 text-3xl font-black font-mono text-[#27864B]">
              {(champion?.totalScore || topScore || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-[#6B6258] font-mono mt-0.5">PUNTOS RECORD</div>
          </div>

          {/* 3 Levels Teaser Box */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#EADBCE] shadow-sm space-y-2">
            <div className="text-xs font-black uppercase text-[#27864B] tracking-wider">
              3 NIVELES DE DESAFÍO:
            </div>

            {/* Level 1: Verde suave */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#DCEFE1]/60 border border-[#27864B]/30 text-xs">
              <span className="text-lg">🍳</span>
              <div>
                <div className="font-bold text-[#27864B]">Nivel 1: Ayudante</div>
                <div className="text-[10px] text-[#6B6258]">Pizzas clásicas y tiempo amplio</div>
              </div>
            </div>

            {/* Level 2: Amarillo mozzarella */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8D978]/30 border border-[#F8D978] text-xs">
              <span className="text-lg">🍕</span>
              <div>
                <div className="font-bold text-[#92400E]">Nivel 2: Maestro Pizzero</div>
                <div className="text-[10px] text-[#6B6258]">Pizzas mitad & mitad complejas</div>
              </div>
            </div>

            {/* Level 3: Rojo italiano suave */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FBE4DF] border border-[#D93636]/40 text-xs">
              <span className="text-lg">🏆</span>
              <div>
                <div className="font-bold text-[#D93636]">Nivel 3: Gran Chef</div>
                <div className="text-[10px] text-[#6B6258]">Velocidad extrema y penalizaciones</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-[#6B6258] py-2 border-t border-[#EADBCE] w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Manolo's Pizzas – Auténtica Pizzería Italiana</span>
        <span className="font-mono text-[#27864B] font-bold">Torneo Oficial Mensual</span>
      </div>

      {/* "Cómo Jugar" Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#383028]/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-2 border-[#EADBCE] rounded-3xl p-6 max-w-xl w-full shadow-2xl text-[#383028] relative max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)] rounded-t-3xl" />

              <button
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FFFDF5] border border-[#EADBCE] hover:bg-stone-100 text-[#6B6258] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="p-3 rounded-2xl bg-[#DCEFE1] text-[#27864B]">
                  <ChefHatIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#D93636] font-serif">
                    ¿CÓMO JUGAR?
                  </h2>
                  <p className="text-xs text-[#6B6258]">
                    Instrucciones maestras del Chef Manolo
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-[#383028]">
                <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE]">
                  <div className="font-bold text-[#27864B] mb-1 flex items-center gap-1.5">
                    <span>1.</span> Leé la comanda del cliente
                  </div>
                  <p className="text-[#6B6258] text-xs">
                    Cada cliente pide ingredientes específicos. En los niveles 2 y 3 deberás respetar la distribución por mitades (ej. Mitad Jamón y Mitad Cuatro Quesos).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE]">
                  <div className="font-bold text-[#27864B] mb-1 flex items-center gap-1.5">
                    <span>2.</span> Colocá los ingredientes sobre la pizza
                  </div>
                  <p className="text-[#6B6258] text-xs">
                    Tocá los ingredientes de la bandeja. En los niveles avanzados usá los botones "Toda", "Mitad Izq" o "Mitad Der" para posicionarlos correctamente.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE]">
                  <div className="font-bold text-[#27864B] mb-1 flex items-center gap-1.5">
                    <span>3.</span> Entregá al horno antes que termine el tiempo
                  </div>
                  <p className="text-[#6B6258] text-xs">
                    Presioná "ENTREGAR PEDIDO". Mientras más rápido y preciso seas, más puntos y bonificaciones de velocidad vas a acumular.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#DCEFE1]/60 border border-[#27864B]/40">
                  <div className="font-black text-[#27864B] mb-1">
                    SISTEMA DE PUNTOS:
                  </div>
                  <ul className="text-xs space-y-1 text-[#383028] font-mono">
                    <li>• Ingrediente correcto: <span className="text-[#27864B] font-bold">+100 pts</span></li>
                    <li>• Pedido perfecto: <span className="text-[#B45309] font-bold">+500 pts</span></li>
                    <li>• Bonificación de velocidad: <span className="text-[#27864B] font-bold">hasta +300 pts</span></li>
                    <li>• Errores y penalizaciones: <span className="text-[#D93636] font-bold">-100 pts</span> (Nivel 3)</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowHowToPlay(false);
                  onStartGame();
                }}
                className="mt-5 w-full py-3.5 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-sm uppercase tracking-wider shadow-md cursor-pointer transition-all"
              >
                ¡ENTENDIDO, QUIERO JUGAR!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChefHatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}
