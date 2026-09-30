/**
 * SHADOWRUN: ANARCHY - LOCAL STORAGE PERSISTENCE
 * 100% Client-side local storage with automatic fallback and safety snapshots
 */

import { STORAGE_KEY, STORAGE_BACKUP_PREFIX, createDefaultCharacter } from "./constants.js";

/**
 * Loads the active character from localStorage.
 * If none exists, creates and returns the default character.
 */
export function loadCharacter() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultChar = createDefaultCharacter();
      saveCharacter(defaultChar);
      return defaultChar;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      console.warn("Corrupted character data in localStorage, using default template.");
      return createDefaultCharacter();
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load character from localStorage:", err);
    return createDefaultCharacter();
  }
}

/**
 * Persists character data into localStorage
 */
export function saveCharacter(charData) {
  try {
    if (!charData || typeof charData !== "object") {
      throw new Error("Invalid character object provided to saveCharacter.");
    }
    charData.updatedAt = new Date().toISOString();
    const serialized = JSON.stringify(charData);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, timestamp: charData.updatedAt };
  } catch (err) {
    console.error("Failed to save character to localStorage:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Backs up character snapshot before destructive operations
 */
export function backupCharacter(charData) {
  try {
    const name = (charData?.character?.alias || charData?.character?.name || "runner")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const key = `${STORAGE_BACKUP_PREFIX}${name}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(charData));
    return key;
  } catch (err) {
    console.warn("Could not save backup snapshot:", err);
    return null;
  }
}

/**
 * Clears active character from localStorage
 */
export function clearLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error("Failed to clear local storage:", err);
    return false;
  }
}

/**
 * Checks if saved data exists
 */
export function hasSavedData() {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
