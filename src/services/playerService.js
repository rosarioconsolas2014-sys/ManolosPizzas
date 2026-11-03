import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.js';

const LOCAL_PLAYERS_KEY = 'manolos_players_cache';

function getLocalPlayers() {
  try {
    const raw = localStorage.getItem(LOCAL_PLAYERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalPlayer(dni, data) {
  try {
    const map = getLocalPlayers();
    map[dni] = data;
    localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(map));
  } catch (e) {}
}

/**
 * Consulta un participante por su DNI en la colección 'players' de Firestore.
 */
export async function getParticipant(dni) {
  if (!dni) return null;
  const cleanDni = String(dni).trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  try {
    const docRef = doc(db, 'players', cleanDni);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      // Aseguramos normalización de campos requeridos
      const player = {
        id: snap.id,
        nombre: data.nombre || data.fullName || '',
        fullName: data.nombre || data.fullName || '',
        dni: data.dni || cleanDni,
        fechaRegistro: data.fechaRegistro || data.createdAt || new Date().toISOString(),
        totalAttempts: Number(data.totalAttempts ?? data.intentos) || 0,
        intentos: Number(data.totalAttempts ?? data.intentos) || 0,
        lastAttemptAt: data.lastAttemptAt || null
      };
      saveLocalPlayer(cleanDni, player);
      return player;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `players/${cleanDni}`);
  }

  // Fallback a almacenamiento local si está offline
  const localMap = getLocalPlayers();
  return localMap[cleanDni] || null;
}

/**
 * Registra o actualiza un participante en la colección 'players'.
 * Evita duplicados identificándolo unívocamente por su DNI.
 */
export async function registerOrUpdateParticipant(dni, fullName) {
  const cleanDni = String(dni).trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanName = String(fullName).trim();
  const now = new Date().toISOString();

  let existing = await getParticipant(cleanDni);
  let totalAttempts = existing?.totalAttempts ? existing.totalAttempts + 1 : 1;

  const playerData = {
    id: cleanDni,
    nombre: cleanName,
    fullName: cleanName,
    dni: cleanDni,
    fechaRegistro: existing?.fechaRegistro || existing?.createdAt || now,
    totalAttempts: totalAttempts,
    intentos: totalAttempts,
    lastAttemptAt: now
  };

  try {
    const docRef = doc(db, 'players', cleanDni);
    await setDoc(docRef, playerData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `players/${cleanDni}`);
  }

  saveLocalPlayer(cleanDni, playerData);
  return playerData;
}

/**
 * Obtiene el listado completo de participantes registrados en 'players'.
 */
export async function getAllParticipants() {
  try {
    const snap = await getDocs(collection(db, 'players'));
    const list = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        nombre: d.nombre || d.fullName || '',
        fullName: d.nombre || d.fullName || '',
        dni: d.dni || docSnap.id,
        fechaRegistro: d.fechaRegistro || d.createdAt,
        totalAttempts: Number(d.totalAttempts ?? d.intentos) || 0,
        lastAttemptAt: d.lastAttemptAt
      });
    });
    if (list.length > 0) return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'players');
  }

  const localMap = getLocalPlayers();
  return Object.values(localMap);
}
