/**
 * SHADOWRUN: ANARCHY - LOCAL STORAGE PERSISTENCE & MULTI-SHEET ROSTER
 * 100% Client-side local storage with automatic fallback, multi-sheet collection, and safety snapshots
 */

import {
  STORAGE_KEY,
  STORAGE_ROSTER_KEY,
  STORAGE_ACTIVE_ID_KEY,
  STORAGE_BACKUP_PREFIX,
  createDefaultCharacter,
  normalizeCharacterSkills
} from "./constants.js";

/**
 * Loads the full character roster from localStorage.
 * Automatically migrates existing single-character data into the collection.
 */
export function loadRoster() {
  try {
    const rawRoster = localStorage.getItem(STORAGE_ROSTER_KEY);
    if (rawRoster) {
      const parsed = JSON.parse(rawRoster);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => {
          if (!c.id) {
            c.id = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
          return normalizeCharacterSkills(c);
        });
      }
    }

    // Migration fallback: check legacy single-character storage
    const rawSingle = localStorage.getItem(STORAGE_KEY);
    if (rawSingle) {
      const singleChar = JSON.parse(rawSingle);
      if (typeof singleChar === "object" && singleChar !== null) {
        if (!singleChar.id) {
          singleChar.id = `char_migrated_${Date.now()}`;
        }
        const normalized = normalizeCharacterSkills(singleChar);
        const roster = [normalized];
        saveRoster(roster);
        setActiveCharacterId(normalized.id);
        return roster;
      }
    }

    // Default first character if nothing stored yet
    const initialChar = createDefaultCharacter("Kage");
    const initialRoster = [initialChar];
    saveRoster(initialRoster);
    setActiveCharacterId(initialChar.id);
    return initialRoster;
  } catch (err) {
    console.error("Failed to load character roster from localStorage:", err);
    const fallback = [createDefaultCharacter("Kage")];
    return fallback;
  }
}

/**
 * Persists the entire roster array into localStorage
 */
export function saveRoster(roster) {
  try {
    if (!Array.isArray(roster)) {
      throw new Error("Invalid roster array provided to saveRoster.");
    }
    localStorage.setItem(STORAGE_ROSTER_KEY, JSON.stringify(roster));
    return true;
  } catch (err) {
    console.error("Failed to save roster to localStorage:", err);
    return false;
  }
}

/**
 * Gets the active character ID, ensuring it points to an existing character in the roster
 */
export function getActiveCharacterId() {
  try {
    const roster = loadRoster();
    const storedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    if (storedId && roster.some(c => c.id === storedId)) {
      return storedId;
    }
    if (roster.length > 0) {
      const defaultId = roster[0].id;
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, defaultId);
      return defaultId;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets the active character ID in localStorage
 */
export function setActiveCharacterId(id) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
    }
  } catch (err) {
    console.warn("Could not set active character ID:", err);
  }
}

/**
 * Loads the active character from the roster.
 */
export function loadCharacter() {
  try {
    const roster = loadRoster();
    const activeId = getActiveCharacterId();
    const activeChar = roster.find(c => c.id === activeId) || roster[0];
    if (activeChar) {
      return normalizeCharacterSkills(activeChar);
    }
    const fresh = createDefaultCharacter("Novo Runner");
    saveCharacter(fresh);
    return fresh;
  } catch (err) {
    console.error("Failed to load active character:", err);
    return createDefaultCharacter("Novo Runner");
  }
}

/**
 * Persists character data into the roster and updates active character
 */
export function saveCharacter(charData) {
  try {
    if (!charData || typeof charData !== "object") {
      throw new Error("Invalid character object provided to saveCharacter.");
    }

    if (!charData.id) {
      charData.id = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    charData.updatedAt = new Date().toISOString();
    const roster = loadRoster();
    const index = roster.findIndex(c => c.id === charData.id);

    if (index >= 0) {
      roster[index] = charData;
    } else {
      roster.push(charData);
    }

    saveRoster(roster);
    setActiveCharacterId(charData.id);

    // Save mirror of active sheet to legacy key for compatibility
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(charData));
    } catch {}

    return { success: true, timestamp: charData.updatedAt };
  } catch (err) {
    console.error("Failed to save character to localStorage:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Creates a brand new independent character in the roster
 */
export function createCharacterInRoster(nameOrAlias) {
  const newChar = createDefaultCharacter(nameOrAlias || "Novo Runner");
  const roster = loadRoster();
  roster.push(newChar);
  saveRoster(roster);
  setActiveCharacterId(newChar.id);
  saveCharacter(newChar);
  return newChar;
}

/**
 * Duplicates an existing character with a new unique ID and independent data
 */
export function duplicateCharacterInRoster(charId) {
  const roster = loadRoster();
  const source = roster.find(c => c.id === charId);
  if (!source) {
    throw new Error("Ficha de origem não encontrada para duplicação.");
  }

  // Deep clone
  const copy = JSON.parse(JSON.stringify(source));
  copy.id = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const currentAlias = copy.character?.alias || copy.character?.name || "Runner";
  copy.character.alias = `${currentAlias} (Cópia)`;
  copy.character.name = copy.character.alias;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();

  // Give new IDs to internal qualities if needed
  if (Array.isArray(copy.qualities)) {
    copy.qualities = copy.qualities.map((q, i) => ({
      ...q,
      id: `q_dup_${Date.now()}_${i}`
    }));
  }

  roster.push(copy);
  saveRoster(roster);
  return copy;
}

/**
 * Deletes a character from the roster by ID.
 * If deleting the active sheet, automatically switches to another sheet.
 * If the roster becomes empty, creates a fresh default sheet.
 */
export function deleteCharacterFromRoster(charId) {
  let roster = loadRoster();
  const activeId = getActiveCharacterId();
  
  roster = roster.filter(c => c.id !== charId);

  if (roster.length === 0) {
    const fresh = createDefaultCharacter("Novo Runner");
    roster.push(fresh);
  }

  saveRoster(roster);

  let newActiveId = activeId;
  if (activeId === charId) {
    newActiveId = roster[0].id;
    setActiveCharacterId(newActiveId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roster[0]));
    } catch {}
  }

  return {
    success: true,
    deletedId: charId,
    activeId: newActiveId,
    roster
  };
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
 * Clears active character & roster from localStorage
 */
export function clearLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_ROSTER_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
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
    return !!(localStorage.getItem(STORAGE_ROSTER_KEY) || localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}
