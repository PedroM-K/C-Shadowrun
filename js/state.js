/**
 * SHADOWRUN: ANARCHY - REACTIVE STATE STORE
 * Central reactive store with debounced auto-save and subscriber broadcasts
 */

import { loadCharacter, saveCharacter, backupCharacter } from "./storage.js";
import { createDefaultCharacter } from "./constants.js";
import { calculateDerivedStats } from "./rules.js";

class CharacterStore {
  constructor() {
    this.character = null;
    this.listeners = new Set();
    this.saveTimeout = null;
    this.isDirty = false;
    this.lastSaved = null;
  }

  init() {
    this.character = loadCharacter();
    this.notify();
    return this.character;
  }

  get() {
    return this.character;
  }

  getDerived() {
    return calculateDerivedStats(this.character);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(eventMeta = {}) {
    const derived = this.getDerived();
    for (const listener of this.listeners) {
      try {
        listener(this.character, derived, eventMeta);
      } catch (err) {
        console.error("Error in state subscriber:", err);
      }
    }
  }

  set(newCharData, triggerSave = true) {
    this.character = newCharData;
    this.notify({ type: "full_replace" });
    if (triggerSave) {
      this.triggerAutoSave();
    }
  }

  update(mutationFn, triggerSave = true) {
    if (typeof mutationFn === "function") {
      mutationFn(this.character);
    }
    this.notify({ type: "mutation" });
    if (triggerSave) {
      this.triggerAutoSave();
    }
  }

  triggerAutoSave() {
    this.isDirty = true;
    this.notifySaveStatus("saving");

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      const res = saveCharacter(this.character);
      if (res.success) {
        this.isDirty = false;
        this.lastSaved = new Date();
        this.notifySaveStatus("saved");
      } else {
        this.notifySaveStatus("error");
      }
    }, 350); // 350ms debounce for smooth typing
  }

  forceSaveNow() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    const res = saveCharacter(this.character);
    if (res.success) {
      this.isDirty = false;
      this.lastSaved = new Date();
      this.notifySaveStatus("saved");
    } else {
      this.notifySaveStatus("error");
    }
    return res;
  }

  notifySaveStatus(status) {
    window.dispatchEvent(
      new CustomEvent("sr:savestatus", {
        detail: { status, timestamp: this.lastSaved }
      })
    );
  }

  resetToDefault() {
    if (this.character) {
      backupCharacter(this.character);
    }
    const fresh = createDefaultCharacter();
    this.set(fresh, true);
    return fresh;
  }
}

export const store = new CharacterStore();
