import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer as TimerIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import Chef from './Chef.jsx';
import { sound } from '../utils/audio.js';

// Catálogo oficial de los 8 ingredientes individuales para el juego de coincidencias
const MEMORY_INGREDIENTS = [
  { id: 'tomate', name: 'Tomate', icon: '🍅', color: '#E11D48', bg: '#FBE4DF' },
  { id: 'mozzarella', name: 'Mozzarella', icon: '🧀', color: '#B45309', bg: '#FEF3C7' },
  { id: 'aceitunas', name: 'Aceituna', icon: '🫒', color: '#4D7C0F', bg: '#ECFCCB' },
  { id: 'morron', name: 'Morrón', icon: '🫑', color: '#DC2626', bg: '#FEE2E2' },
  { id: 'champinones', name: 'Champiñón', icon: '🍄', color: '#78716C', bg: '#F5F5F4' },
  { id: 'cebolla', name: 'Cebolla', icon: '🧅', color: '#9333EA', bg: '#F3E8FF' },
  { id: 'choclo', name: 'Choclo', icon: '🌽', color: '#CA8A04', bg: '#FEF9C3' },
  { id: 'albahaca', name: 'Albahaca', icon: '🌿', color: '#15803D', bg: '#DCFCE7' }
];

// Exactamente 8 cartas (4 parejas)
const EXACT_PAIRS_COUNT = 4;
const EXACT_CARDS_COUNT = 8;

export default function MemoryGame({
  cardCount, // se preserva compatibilidad pero se fuerza 8 cartas
  timeLimit = 40,
  pointsPerMatch = 200,
  completionBonus = 500,
  speedBonusPerSecond = 10,
  errorPenalty = 20,
  onComplete,
  onAbort
}) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]); // Array de índices volteados actualmente (máx 2)
  const [matchedIds, setMatchedIds] = useState([]); // Array de IDs de ingredientes emparejados
  const [isLocked, setIsLocked] = useState(false); // Bloqueo de toques durante animación
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);

  // Tiempo y puntaje
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [chefMood, setChefMood] = useState('cooking');
  const [chefSpeech, setChefSpeech] = useState('¡Encontrá las 4 parejas de ingredientes italianos antes de que se acabe el tiempo!');

  const timerRef = useRef(null);

  // Inicialización y mezcla aleatoria de cartas
  useEffect(() => {
    // 1. Elegir aleatoriamente 4 ingredientes de los 8 disponibles
    const shuffledPool = [...MEMORY_INGREDIENTS].sort(() => Math.random() - 0.5);
    const selectedIngredients = shuffledPool.slice(0, EXACT_PAIRS_COUNT);

    // 2. Crear exactamente 2 cartas por ingrediente (total 8 cartas)
    const deck = [];
    selectedIngredients.forEach((ing, pIdx) => {
      deck.push({
        uid: `${ing.id}_cardA_${pIdx}`,
        id: ing.id,
        name: ing.name,
        icon: ing.icon,
        color: ing.color,
        bg: ing.bg
      });
      deck.push({
        uid: `${ing.id}_cardB_${pIdx}`,
        id: ing.id,
        name: ing.name,
        icon: ing.icon,
        color: ing.color,
        bg: ing.bg
      });
    });

    // 3. Mezclar aleatoriamente las posiciones de las 8 cartas (Fisher-Yates)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setIsLocked(false);
    setAttempts(0);
    setErrors(0);
    setTimeLeft(timeLimit);
    setIsGameOver(false);
    setGameResult(null);

    sound.playBell();
  }, [timeLimit]);

  // Reloj de cuenta regresiva
  useEffect(() => {
    if (isGameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev === 10) {
          setChefMood('worried');
          setChefSpeech('¡Quedan 10 segundos! ¡Memoria a toda velocidad!');
          sound.playError();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver]);

  // Manejo de toques en cartas con bloqueo estricto
  const handleCardClick = (index) => {
    // Bloquear si el juego terminó o se está evaluando una pareja
    if (isLocked || isGameOver) return;

    // Evitar seleccionar una carta ya volteada en el turno actual
    if (flippedIndices.includes(index)) return;

    // Evitar seleccionar una carta que ya forma parte de una pareja descubierta
    const clickedCard = cards[index];
    if (matchedIds.includes(clickedCard.id)) return;

    // No permitir descubrir más de 2 cartas simultáneamente
    if (flippedIndices.length >= 2) return;

    sound.playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Al seleccionar la segunda carta, evaluar coincidencia
    if (newFlipped.length === 2) {
      setIsLocked(true); // Bloquear nuevos toques inmediatamente
      setAttempts(a => a + 1);

      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // ¡COINCIDENCIA!
        sound.playIngredientPop();
        setChefMood('happy');
        setChefSpeech(`¡Perfetto! ¡Encontraste la pareja de ${firstCard.name}!`);

        const newMatched = [...matchedIds, firstCard.id];
        setMatchedIds(newMatched);

        // Desbloquear brevemente para mantener la fluidez
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);

          // Verificar si se completaron las 4 parejas
          if (newMatched.length === EXACT_PAIRS_COUNT) {
            handleVictory(newMatched.length, attempts + 1, errors);
          }
        }, 400);
      } else {
        // NO COINCIDEN
        setErrors(e => e + 1);
        sound.playError();
        setChefMood('thinking');
        setChefSpeech('Mmm, esos dos no coinciden. ¡Fijate bien!');

        // Volver a ocultar suavemente después de ~900ms
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleVictory = (finalPairs, finalAttempts, finalErrors) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOver(true);

    const matchPoints = finalPairs * pointsPerMatch;
    const speedBonus = timeLeft * speedBonusPerSecond;
    const penalty = finalErrors * errorPenalty;
    const finalScore = Math.max(0, matchPoints + completionBonus + speedBonus - penalty);
    const accuracy = Math.round((finalPairs / Math.max(1, finalAttempts)) * 100);

    setGameResult({
      victory: true,
      pairs: finalPairs,
      totalPairs: EXACT_PAIRS_COUNT,
      attempts: finalAttempts,
      errors: finalErrors,
      timeLeft,
      matchPoints,
      completionBonus,
      speedBonus,
      penalty,
      totalScore: finalScore,
      accuracy
    });

    setChefMood('celebration');
    setChefSpeech('¡Magnífico! ¡Completaste todas las parejas de Gran Chef!');
    sound.playVictory();
  };

  const handleTimeOut = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOver(true);

    const finalPairs = matchedIds.length;
    const matchPoints = finalPairs * pointsPerMatch;
    const penalty = errors * errorPenalty;
    const finalScore = Math.max(0, matchPoints - penalty);
    const accuracy = attempts > 0 ? Math.round((finalPairs / attempts) * 100) : 0;

    setGameResult({
      victory: false,
      pairs: finalPairs,
      totalPairs: EXACT_PAIRS_COUNT,
      attempts,
      errors,
      timeLeft: 0,
      matchPoints,
      completionBonus: 0,
      speedBonus: 0,
      penalty,
      totalScore: finalScore,
      accuracy
    });

    setChefMood('sad');
    setChefSpeech('¡Se agotó el tiempo! Buen intento en la cocina.');
    sound.playGameOver();
  };

  const handleProceed = () => {
    if (!gameResult) return;
    sound.playClick();
    onComplete({
      score: gameResult.totalScore,
      timeSeconds: timeLimit - gameResult.timeLeft,
      accuracy: gameResult.accuracy,
      details: gameResult
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 px-2 sm:px-4 py-2">
      {/* Top Banner / HUD */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border-2 border-[#EADBCE] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#DCEFE1] border-2 border-[#27864B] text-[#27864B] flex items-center justify-center font-black text-xl shadow-xs">
            🧠
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-[#27864B] tracking-wider">
              NIVEL 3 – GRAN CHEF PROFESIONAL
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#383028]">
              Juego de Coincidencias de Ingredientes
            </h2>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Parejas counter */}
          <div className="bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 sm:px-3 py-1.5 text-center">
            <div className="text-[9px] uppercase font-bold text-[#6B6258]">PAREJAS</div>
            <div className="text-sm font-black text-[#27864B] font-mono">
              {matchedIds.length} / {EXACT_PAIRS_COUNT}
            </div>
          </div>

          {/* Intentos counter */}
          <div className="bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 sm:px-3 py-1.5 text-center">
            <div className="text-[9px] uppercase font-bold text-[#6B6258]">INTENTOS</div>
            <div className="text-sm font-black text-[#383028] font-mono">
              {attempts}
            </div>
          </div>

          {/* Reloj */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-mono font-black text-sm ${
            timeLeft <= 10
              ? 'bg-[#FBE4DF] border-[#D93636] text-[#D93636] animate-pulse'
              : 'bg-[#DCEFE1] border-[#27864B] text-[#27864B]'
          }`}>
            <TimerIcon className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Chef Helper Dialogue */}
      <div className="flex items-center gap-3 bg-[#FFFDF5] p-2.5 sm:p-3 rounded-2xl border border-[#EADBCE]">
        <Chef mood={chefMood} size="sm" />
        <div className="text-xs sm:text-sm font-medium text-[#383028] italic">
          "{chefSpeech}"
        </div>
      </div>

      {/* Grid de 8 cartas: 4 columnas x 2 filas */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-3.5 max-w-lg sm:max-w-xl mx-auto w-full pt-1 pb-2">
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index);
          const isMatched = matchedIds.includes(card.id);
          const isOpen = isFlipped || isMatched;

          return (
            <div
              key={card.uid}
              onClick={() => handleCardClick(index)}
              className="perspective-card w-full aspect-square sm:aspect-[4/5] cursor-pointer select-none"
            >
              <div
                className={`card-inner-3d ${isOpen ? 'is-flipped' : ''}`}
              >
                {/* REVERSO DE LA CARTA (Face Down / Oculta) - Verde Italiano Oficial de Manolo's */}
                <div
                  className="card-face card-face-back border-2 border-[#EADBCE] bg-linear-to-br from-[#27864B] to-[#1e6b3c] shadow-sm hover:brightness-105 active:scale-98 transition-all p-2"
                >
                  {/* Patrón decorativo sin porciones de pizza */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white text-xl sm:text-2xl shadow-2xs">
                    👨‍🍳
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-black tracking-wider text-white uppercase mt-1.5 font-serif text-center drop-shadow-xs">
                    MANOLO'S
                  </div>
                  <div className="text-[8px] font-mono tracking-widest text-white/70 uppercase">
                    CHALLENGE
                  </div>
                </div>

                {/* FRENTE DE LA CARTA (Face Up / Ingrediente Descubierto) */}
                <div
                  className={`card-face card-face-front border-2 p-2 transition-all ${
                    isMatched
                      ? 'border-[#27864B] bg-[#DCEFE1]/70 ring-2 ring-[#27864B]/40 shadow-xs'
                      : 'border-[#EADBCE] bg-white ring-2 ring-[#F8D978]/50 shadow-sm'
                  }`}
                >
                  {/* Ingrediente individual grande y centrado */}
                  <div className="my-auto flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-5xl select-none filter drop-shadow-xs leading-none">
                      {card.icon}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-[#383028] uppercase text-center mt-1.5 leading-tight tracking-tight">
                      {card.name}
                    </span>
                  </div>

                  {/* Indicador sutil de confirmación al emparejar */}
                  {isMatched && (
                    <div className="absolute top-1.5 right-1.5 text-[#27864B] bg-white rounded-full p-0.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-[#27864B] text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Modal on Level Completion / Game Over */}
      <AnimatePresence>
        {isGameOver && gameResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#383028]/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-3 border-[#EADBCE] rounded-3xl p-6 max-w-md w-full shadow-2xl text-[#383028] relative text-center overflow-hidden"
            >
              {/* Top Italian Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-3 shadow-xs border-2 mt-2 bg-[#DCEFE1] border-[#27864B]">
                {gameResult.victory ? '🏆' : '⏱️'}
              </div>

              <h3 className="text-2xl font-black font-serif text-[#383028]">
                {gameResult.victory ? '¡MEMORIA DE GRAN CHEF!' : '¡TIEMPO AGOTADO!'}
              </h3>
              <p className="text-xs text-[#6B6258] mt-1">
                {gameResult.victory
                  ? `Completaste las ${gameResult.totalPairs} parejas en ${timeLimit - gameResult.timeLeft} segundos.`
                  : `Encontraste ${gameResult.pairs} de ${gameResult.totalPairs} parejas de ingredientes.`}
              </p>

              {/* Score breakdown */}
              <div className="mt-4 p-4 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE] space-y-2 text-xs text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6B6258]">Puntos por parejas ({gameResult.pairs}):</span>
                  <span className="font-bold text-[#27864B]">+{gameResult.matchPoints}</span>
                </div>
                {gameResult.completionBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6258]">Bonus comanda completa:</span>
                    <span className="font-bold text-[#B45309]">+{gameResult.completionBonus}</span>
                  </div>
                )}
                {gameResult.speedBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6258]">Bonus velocidad ({gameResult.timeLeft}s rest.):</span>
                    <span className="font-bold text-[#27864B]">+{gameResult.speedBonus}</span>
                  </div>
                )}
                {gameResult.penalty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6258]">Penalización fallos ({gameResult.errors}):</span>
                    <span className="font-bold text-[#D93636]">-{gameResult.penalty}</span>
                  </div>
                )}
                <div className="border-t border-[#EADBCE] pt-2 flex justify-between text-sm font-black">
                  <span className="text-[#383028]">PUNTAJE NIVEL 3:</span>
                  <span className="text-[#27864B] font-mono text-base">
                    {gameResult.totalScore.toLocaleString()} pts
                  </span>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={handleProceed}
                className="mt-5 w-full py-3.5 px-6 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-sm uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>VER RESULTADOS FINALES</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
