import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { DEFAULT_CONFIG } from '../utils/gameConfig.js';

const LOCAL_CONFIG_KEY = 'manolos_game_config_cache';

export async function getGameConfig() {
  try {
    const docRef = doc(db, 'config', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(data));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (error) {
    console.warn('Config fetch using cache fallback:', error?.message);
  }

  try {
    const cached = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (cached) return { ...DEFAULT_CONFIG, ...JSON.parse(cached) };
  } catch (e) {}

  return { ...DEFAULT_CONFIG };
}

export async function updateGameConfig(newConfig) {
  const merged = {
    ...DEFAULT_CONFIG,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(merged));

  try {
    const docRef = doc(db, 'config', 'settings');
    await setDoc(docRef, merged, { merge: true });
  } catch (error) {
    console.warn('Config update firestore notice:', error?.message);
  }

  return merged;
}
