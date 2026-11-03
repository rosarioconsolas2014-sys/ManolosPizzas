import { INGREDIENTS_BY_ID } from './gameConfig.js';

/**
 * Simplified mobile scoring engine:
 * - Each correct ingredient/answer: +100 points
 * - Perfect order bonus: +300 points
 * - Incorrect answers: 0 points (no negative penalties)
 * - Speed bonus: up to +100 points based on remaining time
 * 
 * @param {Object} challenge - Current order or minigame challenge
 * @param {string[]} selectedIngredients - List of ingredient IDs chosen by user
 * @param {number} timeLeft - Remaining seconds
 * @param {number} totalTime - Total allocated seconds
 * @returns {Object} Score evaluation breakdown
 */
export function evaluatePizza(challenge, selectedIngredients = [], timeLeft = 0, totalTime = 40) {
  // If it's a choose minigame (A vs B)
  if (challenge.type === 'choose') {
    const isCorrect = selectedIngredients[0] === 'optionA';
    const points = isCorrect ? 400 : 0;
    const speedBonus = isCorrect && timeLeft > 0 ? Math.round((timeLeft / totalTime) * 100) : 0;
    const totalScore = points + speedBonus;

    return {
      correctCount: isCorrect ? 1 : 0,
      totalRequired: 1,
      correctPoints: isCorrect ? 300 : 0,
      perfectBonus: isCorrect ? 100 : 0,
      speedBonus,
      totalScore,
      isPerfect: isCorrect,
      accuracy: isCorrect ? 100 : 0,
      details: [
        {
          name: 'Elección de Pizza',
          status: isCorrect ? 'correct' : 'incorrect',
          text: isCorrect ? '¡Elegiste la pizza correcta!' : 'No coincidía con el pedido'
        }
      ]
    };
  }

  // If it's a find minigame (Find 1 single target)
  if (challenge.type === 'find') {
    const target = challenge.targetIngredient;
    const isCorrect = selectedIngredients.includes(target);
    const speedBonus = isCorrect && timeLeft > 0 ? Math.round((timeLeft / totalTime) * 100) : 0;
    const totalScore = (isCorrect ? 300 : 0) + speedBonus;

    return {
      correctCount: isCorrect ? 1 : 0,
      totalRequired: 1,
      correctPoints: isCorrect ? 200 : 0,
      perfectBonus: isCorrect ? 100 : 0,
      speedBonus,
      totalScore,
      isPerfect: isCorrect,
      accuracy: isCorrect ? 100 : 0,
      details: [
        {
          name: INGREDIENTS_BY_ID[target]?.name || target,
          status: isCorrect ? 'correct' : 'missing',
          text: isCorrect ? '¡Encontrado al instante!' : 'Ingrediente no encontrado'
        }
      ]
    };
  }

  // Standard match minigame (Pizza builder: compare selected against required)
  const required = challenge.requiredIngredients || [];
  const selectedSet = new Set(selectedIngredients);
  const requiredSet = new Set(required);

  let correctCount = 0;
  const details = [];

  required.forEach(reqId => {
    const ing = INGREDIENTS_BY_ID[reqId] || { name: reqId };
    if (selectedSet.has(reqId)) {
      correctCount++;
      details.push({
        name: ing.name,
        status: 'correct',
        text: 'Correcto en la pizza (+100 pts)'
      });
    } else {
      details.push({
        name: ing.name,
        status: 'missing',
        text: 'Faltó agregar este ingrediente'
      });
    }
  });

  selectedIngredients.forEach(selId => {
    if (!requiredSet.has(selId)) {
      const ing = INGREDIENTS_BY_ID[selId] || { name: selId };
      details.push({
        name: ing.name,
        status: 'incorrect',
        text: 'No formaba parte del pedido (0 pts)'
      });
    }
  });

  // Calculate points
  const correctPoints = correctCount * 100;
  const isPerfect = correctCount === required.length && selectedIngredients.length === required.length;
  const perfectBonus = isPerfect ? 300 : 0;

  // Speed bonus up to +100
  const timeRatio = Math.max(0, Math.min(1, timeLeft / totalTime));
  const speedBonus = (correctCount > 0 && timeLeft > 0) ? Math.round(timeRatio * 100) : 0;

  const totalScore = correctPoints + perfectBonus + speedBonus;

  // Accuracy (0 - 100%)
  const totalItems = Math.max(required.length, selectedIngredients.length);
  const accuracy = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;

  return {
    correctCount,
    totalRequired: required.length,
    correctPoints,
    perfectBonus,
    speedBonus,
    totalScore,
    isPerfect,
    accuracy,
    details
  };
}
