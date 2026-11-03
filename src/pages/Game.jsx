import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LEVELS, INGREDIENTS_BY_ID } from '../utils/gameConfig.js';
import { evaluatePizza } from '../utils/scoring.js';
import { sound } from '../utils/audio.js';
import Chef from '../components/Chef.jsx';
import OrderCard from '../components/OrderCard.jsx';
import PizzaBuilder from '../components/PizzaBuilder.jsx';
import Ingredient from '../components/Ingredient.jsx';
import IngredientIcon from '../components/IngredientIcon.jsx';
import Timer from '../components/Timer.jsx';
import ScoreBoard from '../components/ScoreBoard.jsx';
import LevelProgress from '../components/LevelProgress.jsx';
import MemoryGame from '../components/MemoryGame.jsx';
import { getGameConfig } from '../services/configService.js';
import { ArrowRight, Check, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Game({
  player,
  onCompleteGame,
  onAbortGame
}) {
  const [currentLevelNum, setCurrentLevelNum] = useState(1);
  const [levelScores, setLevelScores] = useState({ 1: 0, 2: 0, 3: 0 });
  const [completedLevels, setCompletedLevels] = useState([]);
  
  // Current Challenge
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Array of IDs
  const [chosenOption, setChosenOption] = useState(null); // For 'choose' (A vs B)

  // Timer
  const [timeLeft, setTimeLeft] = useState(45);
  const [totalLevelTime, setTotalLevelTime] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const [totalTimeAccumulated, setTotalTimeAccumulated] = useState(0);

  // Level Evaluation Modal
  const [levelEvaluation, setLevelEvaluation] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [chefMood, setChefMood] = useState('cooking');
  const [chefSpeech, setChefSpeech] = useState('');
  const [config, setConfig] = useState(null);

  const timerRef = useRef(null);
  const levelConfig = LEVELS.find(l => l.level === currentLevelNum) || LEVELS[0];

  // Start Level with New Challenge
  const startLevel = (lvlNum) => {
    const cfg = LEVELS.find(l => l.level === lvlNum) || LEVELS[0];
    const challengeIdx = Math.floor(Math.random() * cfg.challenges.length);
    const challenge = cfg.challenges[challengeIdx];

    setCurrentChallenge(challenge);
    setSelectedIngredients([]);
    setChosenOption(null);
    setTimeLeft(cfg.timeSeconds);
    setTotalLevelTime(cfg.timeSeconds);
    setLevelEvaluation(null);
    setShowLevelModal(false);
    setIsBaking(false);
    setIsTimerRunning(true);
    setChefMood('cooking');

    if (challenge.type === 'find') {
      const targetName = INGREDIENTS_BY_ID[challenge.targetIngredient]?.name || 'ingrediente';
      setChefSpeech(`¡Ayudante! ¡Pásame ${targetName} rápido!`);
    } else if (challenge.type === 'choose') {
      setChefSpeech('¿Cuál de estas dos pizzas coincide con el pedido?');
    } else {
      setChefSpeech(`Comanda de ${challenge.clientName}. ¡A trabajar la masa!`);
    }

    sound.playBell();
  };

  useEffect(() => {
    sound.startArcadeMusic();
    getGameConfig().then(cfg => {
      if (cfg) setConfig(cfg);
    });
    startLevel(1);

    return () => {
      sound.stopMusic();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev === 10) {
          setChefMood('worried');
          setChefSpeech('¡Quedan 10 segundos! ¡Apurá la pala!');
          sound.playError();
        }
        return prev - 1;
      });
      setTotalTimeAccumulated(t => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const handleTimeOut = () => {
    setIsTimerRunning(false);
    sound.playError();
    setChefMood('worried');
    setChefSpeech('¡Se acabó el tiempo! Entregando lo que tenemos...');
    setTimeout(() => {
      evaluateCurrentOrder(0);
    }, 800);
  };

  // Toggle ingredient selection (touch on/off)
  const handleToggleIngredient = (ingredientId) => {
    if (isBaking || showLevelModal) return;

    // Special case for 'find' minigame
    if (currentChallenge?.type === 'find') {
      setSelectedIngredients([ingredientId]);
      sound.playIngredientPop();
      // Auto submit upon finding
      setTimeout(() => {
        submitChallenge([ingredientId]);
      }, 300);
      return;
    }

    // Standard match minigame: toggle on or off
    setSelectedIngredients(prev => {
      if (prev.includes(ingredientId)) {
        sound.playClick();
        return prev.filter(id => id !== ingredientId);
      } else {
        sound.playIngredientPop();
        return [...prev, ingredientId];
      }
    });
  };

  const handleClearAll = () => {
    sound.playClick();
    setSelectedIngredients([]);
  };

  // Submit challenge
  const handleSubmitPizza = () => {
    if (isBaking || !isTimerRunning) return;
    submitChallenge(selectedIngredients);
  };

  const submitChallenge = (selected) => {
    setIsTimerRunning(false);
    setIsBaking(true);
    sound.playOvenSizzle();
    setChefMood('cooking');
    setChefSpeech('¡Pizza al horno de piedra! Evaluando comanda...');

    setTimeout(() => {
      evaluateCurrentOrder(timeLeft, selected);
    }, 1200);
  };

  // Choose option A or B in minigame 4
  const handleSelectOption = (optionKey) => {
    setChosenOption(optionKey);
    submitChallenge([optionKey]);
  };

  const evaluateCurrentOrder = (remainingTime, selected = selectedIngredients) => {
    setIsBaking(false);
    const result = evaluatePizza(
      currentChallenge,
      selected,
      remainingTime,
      totalLevelTime
    );

    setLevelEvaluation(result);
    setShowLevelModal(true);

    setLevelScores(prev => ({
      ...prev,
      [currentLevelNum]: result.totalScore
    }));
    setCompletedLevels(prev => [...new Set([...prev, currentLevelNum])]);

    if (result.isPerfect || result.correctCount > 0) {
      sound.playOrderSuccess();
      setChefMood('happy');
      setChefSpeech('¡Buen trabajo! ¡Comanda entregada en su punto!');
    } else {
      sound.playError();
      setChefMood('worried');
      setChefSpeech('No coincidieron los ingredientes. ¡A practicar en el siguiente!');
    }
  };

  const handleProceedNext = () => {
    sound.playClick();
    if (currentLevelNum === 1) {
      setCurrentLevelNum(2);
      startLevel(2);
    } else if (currentLevelNum === 2) {
      // Avanzar al Nivel 3: Memoria de Ingredientes
      setShowLevelModal(false);
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentLevelNum(3);
    } else {
      sound.stopMusic();
      const finalTotalScore = (levelScores[1] || 0) + (levelScores[2] || 0) + (levelEvaluation?.totalScore || 0);
      onCompleteGame({
        level1Score: levelScores[1] || 0,
        level2Score: levelScores[2] || 0,
        level3Score: levelEvaluation?.totalScore || 0,
        totalScore: finalTotalScore,
        totalTimeSeconds: totalTimeAccumulated,
        accuracy: Math.round(
          ((levelScores[1] > 0 ? 100 : 50) + (levelScores[2] > 0 ? 100 : 50) + (levelEvaluation?.accuracy || 80)) / 3
        )
      });
    }
  };

  const handleCompleteMemoryLevel3 = (memResult) => {
    sound.stopMusic();
    const l1 = levelScores[1] || 0;
    const l2 = levelScores[2] || 0;
    const l3 = Number(memResult?.score) || 0;
    const totalScore = l1 + l2 + l3;
    const totalTime = totalTimeAccumulated + (Number(memResult?.timeSeconds) || 0);
    const acc = Math.round(((l1 > 0 ? 100 : 70) + (l2 > 0 ? 100 : 70) + (memResult?.accuracy || 80)) / 3);

    onCompleteGame({
      level1Score: l1,
      level2Score: l2,
      level3Score: l3,
      totalScore: totalScore,
      totalTimeSeconds: totalTime,
      accuracy: acc
    });
  };

  // Si está en Nivel 3, renderizamos el juego de Memoria directamente
  if (currentLevelNum === 3) {
    return (
      <div className="min-h-[calc(100dvh-60px)] flex flex-col justify-start px-2 sm:px-4 py-2 sm:py-4 max-w-4xl mx-auto w-full">
        <MemoryGame
          cardCount={config?.memoryCardCount || 12}
          timeLimit={config?.level3Time || 40}
          pointsPerMatch={config?.memoryPointsPerMatch || 200}
          completionBonus={config?.memoryCompletionBonus || 500}
          speedBonusPerSecond={config?.memorySpeedBonusPerSecond || 10}
          errorPenalty={config?.memoryErrorPenalty || 20}
          onComplete={handleCompleteMemoryLevel3}
          onAbort={onAbortGame}
        />
      </div>
    );
  }

  const cumulativeTotal = (levelScores[1] || 0) + (levelScores[2] || 0) + (levelScores[3] || 0);

  // Tray options for current challenge
  const trayOptions = (currentChallenge?.trayOptions || []).map(id => INGREDIENTS_BY_ID[id]).filter(Boolean);

  return (
    <div className="min-h-[calc(100dvh-60px)] flex flex-col justify-between px-3 sm:px-4 py-2 sm:py-3 max-w-lg mx-auto w-full space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
      {/* 1. TOP STICKY BAR: Score, Level Badge & Timer */}
      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border-2 border-[#EADBCE] shadow-xs">
        <ScoreBoard
          totalScore={cumulativeTotal}
          currentLevelScore={levelScores[currentLevelNum] || 0}
          levelNumber={currentLevelNum}
        />

        <div className="text-center">
          <span className="text-[10px] font-black uppercase text-[#27864B] bg-[#DCEFE1] px-2.5 py-1 rounded-full border border-[#27864B]/30 font-mono">
            {levelConfig.badge}
          </span>
        </div>

        <Timer
          timeLeft={timeLeft}
          totalTime={totalLevelTime}
        />
      </div>

      {/* 2. CUSTOMER ORDER TICKET (Compact & Clear) */}
      <OrderCard
        challenge={currentChallenge}
        currentLevel={currentLevelNum}
      />

      {/* 3. GAMEPLAY CANVAS (Pizza Builder OR Minigame 4 A/B Selector) */}
      {currentChallenge?.type === 'choose' ? (
        /* MINIJUEGO: ¿Cuál es la Pizza Correcta? (Opción A vs Opción B) */
        <div className="bg-white p-4 rounded-2xl border-2 border-[#EADBCE] shadow-xs space-y-3">
          <div className="text-xs font-black uppercase text-[#27864B] text-center">
            Toca la pizza que coincide con la comanda:
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Opción A */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectOption('optionA')}
              className="p-3 bg-[#FFFDF5] border-2 border-[#EADBCE] hover:border-[#27864B] rounded-2xl flex flex-col items-center gap-2 cursor-pointer shadow-2xs"
            >
              <div className="text-3xl">🍕</div>
              <span className="text-xs font-black text-[#383028]">Opción A</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {currentChallenge.optionA?.ingredients.map(id => (
                  <span key={id} className="p-0.5" title={INGREDIENTS_BY_ID[id]?.name}>
                    <IngredientIcon id={id} icon={INGREDIENTS_BY_ID[id]?.icon} size="sm" />
                  </span>
                ))}
              </div>
            </motion.button>

            {/* Opción B */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectOption('optionB')}
              className="p-3 bg-[#FFFDF5] border-2 border-[#EADBCE] hover:border-[#27864B] rounded-2xl flex flex-col items-center gap-2 cursor-pointer shadow-2xs"
            >
              <div className="text-3xl">🍕</div>
              <span className="text-xs font-black text-[#383028]">Opción B</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {currentChallenge.optionB?.ingredients.map(id => (
                  <span key={id} className="p-0.5" title={INGREDIENTS_BY_ID[id]?.name}>
                    <IngredientIcon id={id} icon={INGREDIENTS_BY_ID[id]?.icon} size="sm" />
                  </span>
                ))}
              </div>
            </motion.button>
          </div>
        </div>
      ) : (
        /* STANDARD & FIND MINIGAMES: Interactive Pizza on Wooden Peel */
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#EADBCE] shadow-xs flex flex-col items-center">
          <PizzaBuilder
            selectedIngredients={selectedIngredients}
            onToggleIngredient={handleToggleIngredient}
            onClearAll={handleClearAll}
            onSubmitPizza={handleSubmitPizza}
            isBaking={isBaking}
            submitDisabled={selectedIngredients.length === 0}
          />
        </div>
      )}

      {/* 4. INGREDIENT TRAY: 3 to 4 columns grid tailored for mobile thumb taps */}
      {currentChallenge?.type !== 'choose' && (
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#EADBCE] shadow-xs">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#27864B] flex items-center gap-1">
              <span>🥫</span>
              <span>
                {currentChallenge?.type === 'find' ? '¡TOCA EL INGREDIENTE RÁPIDO!' : 'INGREDIENTES DISPONIBLES:'}
              </span>
            </span>
            <span className="text-[9px] text-[#6B6258] font-bold">
              Toca para agregar o quitar
            </span>
          </div>

          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {trayOptions.map(ing => {
              const isSelected = selectedIngredients.includes(ing.id);
              return (
                <Ingredient
                  key={ing.id}
                  ingredient={ing}
                  onToggle={handleToggleIngredient}
                  isSelected={isSelected}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 5. LEVEL EVALUATION MODAL (Instant clear feedback) */}
      <AnimatePresence>
        {showLevelModal && levelEvaluation && (
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
              className="bg-white border-2 border-[#EADBCE] rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl text-[#383028] relative text-center overflow-hidden"
            >
              {/* Italian Flag Strip Ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

              <div className="w-14 h-14 rounded-2xl bg-[#DCEFE1] border-2 border-[#27864B]/40 mx-auto flex items-center justify-center text-3xl shadow-xs -mt-1 mb-2">
                {levelEvaluation.isPerfect ? '⭐' : '🍕'}
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#27864B]">
                RESULTADO – {levelConfig.badge}
              </h3>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#383028] mt-0.5">
                {levelEvaluation.isPerfect ? '¡PEDIDO PERFECTO!' : '¡PEDIDO ENTREGADO!'}
              </h2>

              {/* Points Earned Banner */}
              <div className="my-3.5 p-3 bg-[#F8D978]/30 rounded-2xl border-2 border-[#F8D978]">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#92400E]">
                  PUNTOS GANADOS
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-[#27864B]">
                  +{levelEvaluation.totalScore}
                </div>
              </div>

              {/* Simple breakdown */}
              <div className="space-y-1 text-xs text-left p-3 bg-[#FFFDF5] rounded-xl border border-[#EADBCE] font-mono mb-4">
                <div className="flex justify-between text-[#383028]">
                  <span>Aciertos:</span>
                  <span className="text-[#27864B] font-bold">+{levelEvaluation.correctPoints} pts</span>
                </div>
                {levelEvaluation.perfectBonus > 0 && (
                  <div className="flex justify-between text-[#92400E]">
                    <span>Bono pedido perfecto:</span>
                    <span className="font-bold">+{levelEvaluation.perfectBonus} pts</span>
                  </div>
                )}
                {levelEvaluation.speedBonus > 0 && (
                  <div className="flex justify-between text-[#27864B]">
                    <span>Bono rapidez:</span>
                    <span className="font-bold">+{levelEvaluation.speedBonus} pts</span>
                  </div>
                )}
              </div>

              {/* Continue Button: Verde Italiano */}
              <button
                type="button"
                onClick={handleProceedNext}
                className="w-full py-3.5 rounded-2xl bg-[#27864B] hover:bg-[#1e6b3c] active:bg-[#16552e] text-white font-black text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>
                  {currentLevelNum < 3 ? `CONTINUAR AL NIVEL ${currentLevelNum + 1}` : 'VER RESULTADO FINAL'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
