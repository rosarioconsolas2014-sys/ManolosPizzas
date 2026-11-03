import { doc, getDoc, setDoc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { DEFAULT_COMPETITION_CONFIG, getCurrentMonthString } from '../utils/gameConfig.js';

const LOCAL_CONFIG_KEY = 'manolos_competition_config_cache';
const LOCAL_HISTORY_KEY = 'manolos_competitions_history_cache';

export async function getGameConfig() {
  // 1. Primary: Try reading from settings/gameConfig
  try {
    const gameConfigDoc = await getDoc(doc(db, 'settings', 'gameConfig'));
    if (gameConfigDoc.exists()) {
      const data = gameConfigDoc.data();
      const merged = normalizeConfigData(data);
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.warn('settings/gameConfig fetch notice:', error?.message);
  }

  // 2. Secondary: Try reading from settings/competition
  try {
    const compDoc = await getDoc(doc(db, 'settings', 'competition'));
    if (compDoc.exists()) {
      const data = compDoc.data();
      const merged = normalizeConfigData(data);
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.warn('settings/competition fetch notice:', error?.message);
  }

  // 3. Tertiary: Try legacy config/settings
  try {
    const oldDoc = await getDoc(doc(db, 'config', 'settings'));
    if (oldDoc.exists()) {
      const data = oldDoc.data();
      const merged = normalizeConfigData(data);
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {}

  // 4. Fallback to localStorage cache
  try {
    const cached = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (cached) return normalizeConfigData(JSON.parse(cached));
  } catch (e) {}

  return { ...DEFAULT_COMPETITION_CONFIG };
}

function normalizeConfigData(raw) {
  const merged = { ...DEFAULT_COMPETITION_CONFIG, ...raw };

  // Harmonize new and legacy fields
  merged.adminPasscode = raw.adminPasscode || DEFAULT_COMPETITION_CONFIG.adminPasscode;
  merged.competitionEnabled = raw.competitionEnabled !== undefined
    ? Boolean(raw.competitionEnabled)
    : (raw.status !== 'pausado' && raw.gameActive !== false);
  merged.competitionTitle = raw.competitionTitle || raw.eventName || DEFAULT_COMPETITION_CONFIG.competitionTitle;
  merged.startDate = raw.startDate || DEFAULT_COMPETITION_CONFIG.startDate;
  merged.endDate = raw.endDate || DEFAULT_COMPETITION_CONFIG.endDate;
  merged.eventDate = raw.eventDate || DEFAULT_COMPETITION_CONFIG.eventDate;
  merged.eventTime = raw.eventTime || DEFAULT_COMPETITION_CONFIG.eventTime;
  merged.eventLocation = raw.eventLocation || raw.location || DEFAULT_COMPETITION_CONFIG.eventLocation;
  merged.eventAddress = raw.eventAddress || raw.address || DEFAULT_COMPETITION_CONFIG.eventAddress;
  merged.maxAttempts = Number(raw.maxAttempts ?? raw.maxAttemptsPerPlayer ?? 3);
  merged.unlimitedAttempts = Boolean(raw.unlimitedAttempts || merged.maxAttempts === 0);
  merged.prizeTitle = raw.prizeTitle || raw.prizeName || raw.monthlyPrizeName || DEFAULT_COMPETITION_CONFIG.prizeTitle;
  merged.prizeSubtitle = raw.prizeSubtitle || raw.prizeDescription || raw.monthlyPrizeDescription || DEFAULT_COMPETITION_CONFIG.prizeSubtitle;
  merged.prizeImage = raw.prizeImage || raw.prizeImageUrl || '';
  merged.prizeQuantity = Number(raw.prizeQuantity ?? 1);
  merged.eventDescription = raw.eventDescription || raw.description || DEFAULT_COMPETITION_CONFIG.eventDescription;

  // Sync legacy aliases
  merged.eventName = merged.competitionTitle;
  merged.publicTitle = raw.publicTitle || merged.competitionTitle;
  merged.prizeName = merged.prizeTitle;
  merged.monthlyPrizeName = merged.prizeTitle;
  merged.prizeDescription = merged.prizeSubtitle;
  merged.monthlyPrizeDescription = merged.prizeSubtitle;
  merged.prizeImageUrl = merged.prizeImage;
  merged.location = merged.eventLocation;
  merged.address = merged.eventAddress;
  merged.description = merged.eventDescription;
  merged.gameActive = merged.competitionEnabled;
  merged.status = merged.competitionEnabled ? (raw.status || 'activo') : 'pausado';

  return merged;
}

export async function updateGameConfig(newConfig) {
  const normalized = normalizeConfigData(newConfig);
  normalized.updatedAt = new Date().toISOString();

  localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(normalized));

  // 1. Write primary settings/gameConfig document
  try {
    await setDoc(doc(db, 'settings', 'gameConfig'), normalized, { merge: true });
  } catch (error) {
    console.warn('Error saving to settings/gameConfig:', error?.message);
    throw error;
  }

  // 2. Synchronize mirrors for backwards compatibility
  try {
    await setDoc(doc(db, 'settings', 'competition'), normalized, { merge: true });
    await setDoc(doc(db, 'config', 'settings'), {
      monthlyPrizeName: normalized.prizeTitle,
      monthlyPrizeDescription: normalized.prizeSubtitle,
      maxAttemptsPerPlayer: normalized.unlimitedAttempts ? 0 : normalized.maxAttempts,
      gameActive: normalized.competitionEnabled,
      currentMonth: `${normalized.competitionYear}-${String(normalized.competitionMonth).padStart(2, '0')}`
    }, { merge: true });
  } catch (error) {
    console.warn('Mirror sync warning:', error?.message);
  }

  return normalized;
}

export async function verifyAdminPasscode(enteredCode) {
  if (!enteredCode) return false;
  const clean = String(enteredCode).trim();
  try {
    const cfg = await getGameConfig();
    const targetPasscode = cfg?.adminPasscode || DEFAULT_COMPETITION_CONFIG.adminPasscode;
    return clean === targetPasscode;
  } catch (e) {
    return clean === DEFAULT_COMPETITION_CONFIG.adminPasscode;
  }
}

/**
 * Guarda una edición finalizada en el historial permanente 'competitionsHistory'
 */
export async function archiveCompetition(competitionData) {
  const record = {
    ...competitionData,
    archivedAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'competitionsHistory'), record);
  } catch (e) {
    console.warn('archiveCompetition firestore notice:', e?.message);
  }

  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(list));
  } catch (e) {}

  return record;
}

/**
 * Obtiene el historial de competencias anteriores
 */
export async function getCompetitionsHistory() {
  try {
    const snap = await getDocs(collection(db, 'competitionsHistory'));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    if (list.length > 0) {
      list.sort((a, b) => new Date(b.archivedAt || 0) - new Date(a.archivedAt || 0));
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(list));
      return list;
    }
  } catch (e) {
    console.warn('getCompetitionsHistory notice:', e?.message);
  }

  try {
    const cached = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return [];
}

/**
 * Determina el rol del usuario autenticado:
 * - 'ADMINISTRADOR': tiene permiso completo para editar, pausar, resetear y configurar.
 * - 'SUPERVISOR': solo lectura para ver participantes, resultados y rankings.
 */
export async function getUserRole(user) {
  if (!user) return 'ANONIMO';
  if (user.email === 'rosarioconsolas2014@gmail.com') return 'ADMINISTRADOR';

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      return data.role === 'supervisor' ? 'SUPERVISOR' : 'ADMINISTRADOR';
    }
  } catch (e) {}

  // Por defecto, cualquier cuenta admin creada o autenticada en el panel
  return 'ADMINISTRADOR';
}
