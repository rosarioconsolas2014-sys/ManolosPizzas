import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.js';
import { getCurrentMonthString } from '../utils/gameConfig.js';

const LOCAL_RESULTS_KEY = 'manolos_game_results_cache';
const LOCAL_RANKING_KEY = 'manolos_monthly_ranking_cache';

function getLocalResults() {
  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalResult(result) {
  try {
    const list = getLocalResults();
    const filtered = list.filter(r => r.id !== result.id);
    filtered.push(result);
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(filtered));
  } catch (e) {}
}

function getLocalMonthlyRanking() {
  try {
    const raw = localStorage.getItem(LOCAL_RANKING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalMonthlyRanking(entry) {
  try {
    const list = getLocalMonthlyRanking();
    const filtered = list.filter(r => r.id !== entry.id);
    filtered.push(entry);
    localStorage.setItem(LOCAL_RANKING_KEY, JSON.stringify(filtered));
  } catch (e) {}
}

/**
 * Guarda el resultado de una partida en 'gameResults' y actualiza automáticamente 'monthlyRanking'
 */
export async function saveGameResult(data) {
  const now = new Date();
  const anio = now.getFullYear();
  const mesNumero = now.getMonth() + 1;
  const mesClave = data.month || getCurrentMonthString(); // e.g. "2026-11"
  const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const playerId = String(data.dni || data.playerId).trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const nombre = String(data.fullName || data.nombre || '').trim();
  const nivel1 = Number(data.nivel1 ?? data.level1Score) || 0;
  const nivel2 = Number(data.nivel2 ?? data.level2Score) || 0;
  const nivel3 = Number(data.nivel3 ?? data.level3Score) || 0;
  const puntajeTotal = Number(data.puntajeTotal ?? data.totalScore) || 0;
  const tiempoTotal = Number(data.tiempoTotal ?? data.totalTimeSeconds) || 0;
  const accuracy = Number(data.accuracy) || 100;
  const completed = Boolean(data.completed !== false);

  // Documento para la colección 'gameResults'
  const gameRecord = {
    id: resultId,
    playerId: playerId,
    nombre: nombre,
    dni: playerId,
    nivel1: nivel1,
    nivel2: nivel2,
    nivel3: nivel3,
    puntajeTotal: puntajeTotal,
    tiempoTotal: tiempoTotal,
    fecha: now.toISOString(),
    mes: mesClave,
    mesNumero: mesNumero,
    anio: anio,
    accuracy: accuracy,
    completed: completed,
    // Alias para compatibilidad con componentes existentes
    fullName: nombre,
    totalScore: puntajeTotal,
    totalTimeSeconds: tiempoTotal,
    level1Score: nivel1,
    level2Score: nivel2,
    level3Score: nivel3,
    createdAt: now.toISOString()
  };

  saveLocalResult(gameRecord);

  // 1. Guardar en Firestore 'gameResults'
  try {
    const gameDocRef = doc(db, 'gameResults', resultId);
    await setDoc(gameDocRef, gameRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `gameResults/${resultId}`);
  }

  // 2. Actualizar automáticamente en Firestore 'monthlyRanking'
  const rankingDocId = `${mesClave}_${playerId}`;
  try {
    const rankingDocRef = doc(db, 'monthlyRanking', rankingDocId);
    const existingSnap = await getDoc(rankingDocRef);

    let shouldUpdateRanking = true;
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      const prevPuntaje = Number(existingData.puntaje ?? existingData.puntajeTotal) || 0;
      // Solo sobreescribir si el nuevo puntaje es mayor o igual con mejor tiempo
      if (prevPuntaje > puntajeTotal) {
        shouldUpdateRanking = false;
      }
    }

    if (shouldUpdateRanking) {
      const rankingEntry = {
        id: rankingDocId,
        playerId: playerId,
        nombre: nombre,
        dni: playerId,
        puntaje: puntajeTotal,
        mes: mesClave,
        anio: anio,
        tiempoTotal: tiempoTotal,
        accuracy: accuracy,
        fecha: now.toISOString(),
        // Alias
        totalScore: puntajeTotal,
        fullName: nombre,
        totalTimeSeconds: tiempoTotal,
        createdAt: now.toISOString()
      };

      await setDoc(rankingDocRef, rankingEntry, { merge: true });
      saveLocalMonthlyRanking(rankingEntry);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `monthlyRanking/${rankingDocId}`);
  }

  return gameRecord;
}

/**
 * Obtiene el ranking mensual desde la colección 'monthlyRanking' de Firestore
 */
export async function getMonthlyRanking(monthStr = getCurrentMonthString()) {
  try {
    const rankingRef = collection(db, 'monthlyRanking');
    const q = query(rankingRef, where('mes', '==', monthStr));
    const snap = await getDocs(q);
    const list = [];

    snap.forEach(d => {
      const data = d.data();
      const score = Number(data.puntaje ?? data.puntajeTotal ?? data.totalScore) || 0;
      const time = Number(data.tiempoTotal ?? data.totalTimeSeconds) || 0;
      list.push({
        ...data,
        id: d.id,
        playerId: data.playerId || data.dni,
        dni: data.dni || data.playerId,
        nombre: data.nombre || data.fullName,
        fullName: data.nombre || data.fullName,
        puntaje: score,
        totalScore: score,
        tiempoTotal: time,
        totalTimeSeconds: time,
        accuracy: data.accuracy || 100
      });
    });

    if (list.length > 0) {
      // Ordenar por puntaje descendente, y en caso de empate menor tiempo
      list.sort((a, b) => b.totalScore - a.totalScore || a.totalTimeSeconds - b.totalTimeSeconds);
      return list;
    }

    // Fallback: Si monthlyRanking está vacío, consultar gameResults
    const fallbackList = await getRankingFromGameResults(monthStr);
    if (fallbackList.length > 0) return fallbackList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'monthlyRanking');
  }

  // Fallback a almacenamiento local si estuviera sin conexión
  const localList = getLocalMonthlyRanking().filter(r => r.mes === monthStr);
  if (localList.length === 0) {
    const localGames = getLocalResults().filter(r => r.mes === monthStr);
    localGames.sort((a, b) => b.totalScore - a.totalScore || a.totalTimeSeconds - b.totalTimeSeconds);
    return localGames;
  }
  localList.sort((a, b) => (b.puntaje || b.totalScore) - (a.puntaje || a.totalScore));
  return localList;
}

async function getRankingFromGameResults(monthStr) {
  try {
    const resultsRef = collection(db, 'gameResults');
    const q = query(resultsRef, where('mes', '==', monthStr));
    const snap = await getDocs(q);
    const playerBestMap = new Map();

    snap.forEach(d => {
      const item = d.data();
      const pId = item.playerId || item.dni;
      const score = Number(item.puntajeTotal ?? item.totalScore) || 0;
      const currentBest = playerBestMap.get(pId);
      if (!currentBest || score > currentBest.totalScore) {
        playerBestMap.set(pId, {
          id: d.id,
          playerId: pId,
          dni: pId,
          nombre: item.nombre || item.fullName,
          fullName: item.nombre || item.fullName,
          puntaje: score,
          totalScore: score,
          tiempoTotal: item.tiempoTotal || item.totalTimeSeconds || 0,
          totalTimeSeconds: item.tiempoTotal || item.totalTimeSeconds || 0,
          accuracy: item.accuracy || 100,
          mes: monthStr,
          createdAt: item.fecha || item.createdAt
        });
      }
    });

    const list = Array.from(playerBestMap.values());
    list.sort((a, b) => b.totalScore - a.totalScore || a.totalTimeSeconds - b.totalTimeSeconds);
    return list;
  } catch (e) {
    return [];
  }
}

/**
 * Obtiene el ranking histórico acumulado de todos los tiempos desde 'gameResults'
 */
export async function getAllTimeRanking() {
  try {
    const resultsRef = collection(db, 'gameResults');
    const snap = await getDocs(resultsRef);
    const list = [];

    snap.forEach(d => {
      const data = d.data();
      const score = Number(data.puntajeTotal ?? data.totalScore ?? data.puntaje) || 0;
      const time = Number(data.tiempoTotal ?? data.totalTimeSeconds) || 0;
      list.push({
        ...data,
        id: d.id,
        playerId: data.playerId || data.dni,
        dni: data.dni || data.playerId,
        nombre: data.nombre || data.fullName,
        fullName: data.nombre || data.fullName,
        puntaje: score,
        totalScore: score,
        tiempoTotal: time,
        totalTimeSeconds: time,
        accuracy: data.accuracy || 100,
        createdAt: data.fecha || data.createdAt
      });
    });

    if (list.length > 0) {
      list.sort((a, b) => b.totalScore - a.totalScore || a.totalTimeSeconds - b.totalTimeSeconds);
      return list;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'gameResults');
  }

  const localList = getLocalResults();
  localList.sort((a, b) => (b.puntajeTotal || b.totalScore) - (a.puntajeTotal || a.totalScore) || (a.tiempoTotal || a.totalTimeSeconds) - (b.tiempoTotal || b.totalTimeSeconds));
  return localList;
}

/**
 * Consulta el campeón del mes actual (primer lugar en 'monthlyRanking')
 */
export async function getMonthlyChampion(monthStr = getCurrentMonthString()) {
  const ranking = await getMonthlyRanking(monthStr);
  return ranking.length > 0 ? ranking[0] : null;
}

/**
 * Elimina un resultado de partida de Firestore
 */
export async function deleteGameResult(resultId) {
  try {
    const docRef = doc(db, 'gameResults', resultId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gameResults/${resultId}`);
  }

  const localList = getLocalResults().filter(r => r.id !== resultId);
  localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(localList));
  return true;
}

/**
 * Reinicia el ranking mensual en Firestore
 */
export async function resetMonthlyRanking(monthStr = getCurrentMonthString()) {
  try {
    const rankingRef = collection(db, 'monthlyRanking');
    const q = query(rankingRef, where('mes', '==', monthStr));
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `monthlyRanking?month=${monthStr}`);
  }

  const localList = getLocalMonthlyRanking().filter(r => r.mes !== monthStr);
  localStorage.setItem(LOCAL_RANKING_KEY, JSON.stringify(localList));
  return true;
}
