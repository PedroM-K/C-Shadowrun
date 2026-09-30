/**
 * SHADOWRUN: ANARCHY - CLANDESTINE OS APP CONTROLLER
 * Bootstraps the tactical terminal, wires events, tabs, modals, and PWA registration
 */

import { store } from "./state.js";
import { renderApp, showToast, openDiceModal, closeDiceModal, executeModalRoll } from "./ui.js";
import { exportCharacterToFile, readJsonFile } from "./importer-exporter.js";
import { calculateSkillDicePool } from "./rules.js";

function bootTerminal() {
  try {
    // Subscribe UI to store updates
    store.subscribe((char, derived) => {
      renderApp(char, derived);
    });

    store.init();

    // Wire navigation, header, modals and dynamic delegations
    setupNavigation();
    setupHeaderAndDataControls();
    setupModals();
    setupDelegatedEvents();
    registerServiceWorker();
    console.log("[SRA Terminal] Clandestine OS online and fully interactive.");
  } catch (err) {
    console.error("[SRA Terminal] Initialization error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootTerminal);
} else {
  bootTerminal();
}

/**
 * Sidebar Navigation & Mobile Drawer
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-link-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const sidebar = document.getElementById("terminal-sidebar");
  const mobileToggle = document.getElementById("btn-mobile-nav");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      navButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) targetPane.classList.add("active");

      // Close mobile drawer if open
      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  mobileToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });
}

/**
 * Header Controls & Data Management Panel
 */
function setupHeaderAndDataControls() {
  const footerStatus = document.getElementById("footer-save-status");

  window.addEventListener("sr:savestatus", (e) => {
    if (!footerStatus) return;
    const { status, timestamp } = e.detail;

    if (status === "saving") {
      footerStatus.innerHTML = `<span>STATUS:</span><span class="led-indicator led-amber"></span><span style="color: var(--term-amber);">GRAVANDO...</span>`;
    } else if (status === "saved") {
      const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
      footerStatus.innerHTML = `<span>STATUS:</span><span class="led-indicator led-green"></span><span style="color: var(--text-bright);">SALVO ÀS ${timeStr}</span>`;
    } else if (status === "error") {
      footerStatus.innerHTML = `<span>STATUS:</span><span class="led-indicator led-red"></span><span style="color: var(--term-red);">ERRO AO GRAVAR</span>`;
    }
  });

  // Export JSON triggers
  const triggerExport = () => {
    const char = store.get();
    const res = exportCharacterToFile(char);
    if (res.success) {
      showToast(`EXPORT COMPLETO // ${res.filename}`, "success");
    } else {
      showToast(`FALHA AO EXPORTAR: ${res.error}`, "error");
    }
  };

  document.getElementById("btn-header-export")?.addEventListener("click", triggerExport);
  document.getElementById("btn-data-export")?.addEventListener("click", triggerExport);

  // Import JSON triggers
  const fileInput = document.getElementById("file-import-input");
  const triggerImportClick = () => fileInput?.click();

  document.getElementById("btn-header-import")?.addEventListener("click", triggerImportClick);
  document.getElementById("btn-data-import")?.addEventListener("click", triggerImportClick);

  fileInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const confirmed = window.confirm(
        "CONFIRMAR IMPORTAÇÃO DE FICHA:\n\nA ficha ativa no terminal será substituída pelos dados do arquivo.\n(Um snapshot de segurança será gravado localmente)."
      );
      if (!confirmed) {
        fileInput.value = "";
        return;
      }

      const parsedData = await readJsonFile(file);
      store.set(parsedData, true);
      showToast(`RUNNER CARREGADO // ${parsedData.character.alias || parsedData.character.name}`, "success");
    } catch (err) {
      showToast(`ERRO: ${err.message}`, "error");
    } finally {
      fileInput.value = "";
    }
  });

  // Create New Runner
  document.getElementById("btn-data-new")?.addEventListener("click", () => {
    const confirmed = window.confirm(
      "CONFIRMAR CRIAÇÃO DE NOVO RUNNER:\n\nOs dados atuais serão arquivados em backup de segurança e a ficha será reiniciada com o perfil padrão."
    );
    if (confirmed) {
      store.resetToDefault();
      showToast("NOVO RUNNER INICIALIZADO", "success");
    }
  });

  // Wipe Local Cache
  document.getElementById("btn-data-wipe")?.addEventListener("click", () => {
    const confirmed = window.confirm(
      "PERIGO CRÍTICO // LIMPEZA DE TERMINAL:\n\nDeseja apagar todos os dados da ficha armazenados no navegador e restaurar para o estado inicial de fábrica?"
    );
    if (confirmed) {
      store.resetToDefault();
      showToast("CACHE LOCAL EXPURGADO", "info");
    }
  });

  // Quick Header D6 Roller
  document.getElementById("btn-header-dice")?.addEventListener("click", () => {
    openDiceModal({ title: "MATRIX D6 ROLLER", pool: 6 });
  });
}

/**
 * Modal Controllers (Dice Roller, Backdrop Click, Esc Key)
 */
function setupModals() {
  document.getElementById("btn-close-dice-modal")?.addEventListener("click", closeDiceModal);
  document.getElementById("btn-modal-roll-action")?.addEventListener("click", executeModalRoll);

  document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.remove("active");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.active").forEach(m => m.classList.remove("active"));
    }
  });
}

/**
 * Event Delegation on Terminal Deck
 */
function setupDelegatedEvents() {
  const mainDeck = document.querySelector(".terminal-main-deck");
  if (!mainDeck) return;

  // Identity inputs
  document.querySelectorAll(".identity-field").forEach(input => {
    input.addEventListener("input", (e) => {
      const field = e.target.getAttribute("data-field");
      if (field) {
        store.update(char => {
          char.character[field] = e.target.value;
        }, true, { isTyping: true, sourceTarget: e.target });
      }
    });
  });

  // Plot Points Steppers
  document.getElementById("btn-plot-dec")?.addEventListener("click", () => {
    store.update(char => {
      char.character.plotPoints = Math.max(0, (char.character.plotPoints || 0) - 1);
    });
  });
  document.getElementById("btn-plot-inc")?.addEventListener("click", () => {
    store.update(char => {
      const max = char.character.maxPlotPoints || 5;
      char.character.plotPoints = Math.min(max, (char.character.plotPoints || 0) + 1);
    });
  });

  // Cues & Dispositions Add
  document.getElementById("btn-add-cue")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.cues) char.cues = [];
      char.cues.push("Nova frase de efeito do runner...");
    });
  });
  document.getElementById("btn-add-disp")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.dispositions) char.dispositions = [];
      char.dispositions.push("Novo traço de personalidade");
    });
  });

  // Heal All Damage
  document.getElementById("btn-heal-all")?.addEventListener("click", () => {
    store.update(char => {
      char.condition.physicalDamage = 0;
      char.condition.stunDamage = 0;
      char.condition.armorDamage = 0;
    });
    showToast("VITAIS E ARMADURA RESTAURADOS", "success");
  });

  // Knowledge skills Add
  document.getElementById("btn-add-ks")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.knowledgeSkills) char.knowledgeSkills = [];
      char.knowledgeSkills.push({ id: `ks_${Date.now()}`, name: "Novo Conhecimento / Idioma", rating: 2 });
    });
  });

  // Weapons Add
  document.getElementById("btn-add-weapon")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.weapons) char.weapons = [];
      char.weapons.push({
        id: `wep_${Date.now()}`,
        name: "Nova Arma Registrada",
        damage: "6P",
        ap: "0",
        range: "Perto",
        ammo: "10 / 10",
        notes: ""
      });
    });
  });

  // Amps Add
  document.getElementById("btn-add-amp")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.shadowAmps) char.shadowAmps = [];
      char.shadowAmps.push({
        id: `amp_${Date.now()}`,
        name: "Nova Amplificação",
        type: "cyberware",
        level: 1,
        essenceCost: 0.5,
        effect: "Especificações do efeito..."
      });
    });
  });

  // Gear, Vehicles, Contacts, Qualities Add
  document.getElementById("btn-add-gear")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.gear) char.gear = [];
      char.gear.push({ id: `g_${Date.now()}`, name: "Novo Item", qty: 1, notes: "" });
    });
  });

  document.getElementById("btn-add-veh")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.vehicles) char.vehicles = [];
      char.vehicles.push({ id: `v_${Date.now()}`, name: "Novo Veículo", handling: 3, speed: 3, armor: 6, type: "Moto", notes: "" });
    });
  });

  document.getElementById("btn-add-contact")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.contacts) char.contacts = [];
      char.contacts.push({ id: `ct_${Date.now()}`, name: "Novo Contato", connection: 2, loyalty: 2, role: "Fixer", notes: "" });
    });
  });

  document.getElementById("btn-add-quality")?.addEventListener("click", () => {
    store.update(char => {
      if (!char.qualities) char.qualities = [];
      char.qualities.push({ id: `q_${Date.now()}`, name: "Nova Qualidade", type: "positive", effect: "Regras..." });
    });
  });

  // Notes Field
  document.getElementById("char-notes")?.addEventListener("input", (e) => {
    store.update(char => {
      char.notes = e.target.value;
    }, true, { isTyping: true, sourceTarget: e.target });
  });

  // Edge Stepper
  document.getElementById("btn-edge-dec")?.addEventListener("click", () => {
    store.update(char => {
      const cur = char.condition.edgeCurrent ?? 3;
      char.condition.edgeCurrent = Math.max(0, cur - 1);
    });
  });
  document.getElementById("btn-edge-inc")?.addEventListener("click", () => {
    store.update(char => {
      const max = char.attributes.edg?.base || 3;
      const cur = char.condition.edgeCurrent ?? 3;
      char.condition.edgeCurrent = Math.min(max, cur + 1);
    });
  });

  // Quick Defense Rolls
  document.getElementById("btn-roll-defense")?.addEventListener("click", () => {
    const derived = store.getDerived();
    openDiceModal({
      title: "DEFESA FÍSICA (AGI + LOG)",
      pool: derived.defense.total,
      skillName: "Defesa Tática",
      attributeName: `Ferimentos: ${derived.defense.wounds}`
    });
  });

  document.getElementById("btn-roll-spell-defense")?.addEventListener("click", () => {
    const derived = store.getDerived();
    openDiceModal({
      title: "DEFESA MENTAL / FEITIÇOS",
      pool: derived.mentalDefense.total,
      skillName: "Defesa Arcana (WIL + LOG)"
    });
  });

  // Delegated Click Interactions (Track Cells, Steppers, Rolls, Removals)
  mainDeck.addEventListener("click", (e) => {
    const target = e.target;

    // Track damage cell click
    const cell = target.closest(".track-cell");
    if (cell) {
      const track = cell.getAttribute("data-track");
      const index = parseInt(cell.getAttribute("data-index"), 10);

      store.update(char => {
        const key = `${track}Damage`;
        const currentVal = char.condition[key] || 0;
        char.condition[key] = (currentVal === index) ? index - 1 : index;
      });
      return;
    }

    // Attributes Steppers
    if (target.classList.contains("btn-attr-inc")) {
      const key = target.getAttribute("data-key");
      store.update(char => {
        if (!char.attributes[key]) char.attributes[key] = { base: 1, mod: 0 };
        char.attributes[key].base = Math.min(12, (char.attributes[key].base || 1) + 1);
      });
      return;
    }
    if (target.classList.contains("btn-attr-dec")) {
      const key = target.getAttribute("data-key");
      store.update(char => {
        if (!char.attributes[key]) char.attributes[key] = { base: 1, mod: 0 };
        char.attributes[key].base = Math.max(1, (char.attributes[key].base || 1) - 1);
      });
      return;
    }

    // Skill Steppers & Rolls
    if (target.classList.contains("btn-skill-inc")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.skills[idx]) char.skills[idx].rating = Math.min(12, (char.skills[idx].rating || 0) + 1);
      });
      return;
    }
    if (target.classList.contains("btn-skill-dec")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.skills[idx]) char.skills[idx].rating = Math.max(0, (char.skills[idx].rating || 0) - 1);
      });
      return;
    }

    const rollSkillBtn = target.closest(".btn-roll-skill");
    if (rollSkillBtn) {
      const skillName = rollSkillBtn.getAttribute("data-skill-name");
      const pool = parseInt(rollSkillBtn.getAttribute("data-pool"), 10) || 1;
      const attr = rollSkillBtn.getAttribute("data-attr");
      openDiceModal({
        title: `PERÍCIA // ${skillName.toUpperCase()}`,
        pool,
        skillName,
        attributeName: attr
      });
      return;
    }

    // Knowledge Skills Steppers & Rolls
    if (target.classList.contains("btn-ks-inc")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.knowledgeSkills?.[idx]) char.knowledgeSkills[idx].rating = (char.knowledgeSkills[idx].rating || 1) + 1;
      });
      return;
    }
    if (target.classList.contains("btn-ks-dec")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.knowledgeSkills?.[idx]) char.knowledgeSkills[idx].rating = Math.max(1, (char.knowledgeSkills[idx].rating || 1) - 1);
      });
      return;
    }
    if (target.classList.contains("btn-remove-ks")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.knowledgeSkills?.splice(idx, 1));
      return;
    }
    const rollKsBtn = target.closest(".btn-roll-ks");
    if (rollKsBtn) {
      const name = rollKsBtn.getAttribute("data-name");
      const rating = parseInt(rollKsBtn.getAttribute("data-rating"), 10) || 1;
      const log = store.get()?.attributes?.log?.base || 3;
      const wounds = store.getDerived().woundPenalty;
      const pool = Math.max(1, rating + log + wounds);
      openDiceModal({
        title: `CONHECIMENTO // ${name.toUpperCase()}`,
        pool,
        skillName: name,
        attributeName: "Lógica"
      });
      return;
    }

    // Cues & Dispositions Remove
    if (target.classList.contains("btn-remove-cue")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.cues?.splice(idx, 1));
      return;
    }
    if (target.classList.contains("btn-remove-disp")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.dispositions?.splice(idx, 1));
      return;
    }

    // Weapons Attacks & Remove
    const rollWepBtn = target.closest(".btn-roll-weapon");
    if (rollWepBtn) {
      const idx = parseInt(rollWepBtn.getAttribute("data-index"), 10);
      const wep = store.get()?.weapons?.[idx];
      const char = store.get();
      const isMelee = (wep?.range || "").toLowerCase().includes("corpo") || (wep?.range || "").toLowerCase().includes("melee");
      const skillId = isMelee ? "close_combat" : "firearms";
      const skill = char.skills.find(s => s.id === skillId);
      const pool = calculateSkillDicePool(char, skill, true);

      openDiceModal({
        title: `DISPARO // ${wep?.name?.toUpperCase() || "ARMA"}`,
        pool,
        skillName: skill?.name || "Armas de Fogo",
        attributeName: `DANO: ${wep?.damage || "DV"} | PA: ${wep?.ap || "0"}`
      });
      return;
    }
    if (target.classList.contains("btn-remove-weapon")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.weapons?.splice(idx, 1));
      return;
    }

    // Amps Steppers & Remove
    if (target.classList.contains("btn-amp-lvl-inc")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.shadowAmps?.[idx]) char.shadowAmps[idx].level = (char.shadowAmps[idx].level || 1) + 1;
      });
      return;
    }
    if (target.classList.contains("btn-amp-lvl-dec")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.shadowAmps?.[idx]) char.shadowAmps[idx].level = Math.max(1, (char.shadowAmps[idx].level || 1) - 1);
      });
      return;
    }
    if (target.classList.contains("btn-remove-amp")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.shadowAmps?.splice(idx, 1));
      return;
    }

    // Contacts Steppers & Remove
    if (target.classList.contains("btn-conn-inc")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.contacts?.[idx]) char.contacts[idx].connection = Math.min(6, (char.contacts[idx].connection || 1) + 1);
      });
      return;
    }
    if (target.classList.contains("btn-conn-dec")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.contacts?.[idx]) char.contacts[idx].connection = Math.max(1, (char.contacts[idx].connection || 1) - 1);
      });
      return;
    }
    if (target.classList.contains("btn-loy-inc")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.contacts?.[idx]) char.contacts[idx].loyalty = Math.min(6, (char.contacts[idx].loyalty || 1) + 1);
      });
      return;
    }
    if (target.classList.contains("btn-loy-dec")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => {
        if (char.contacts?.[idx]) char.contacts[idx].loyalty = Math.max(1, (char.contacts[idx].loyalty || 1) - 1);
      });
      return;
    }
    if (target.classList.contains("btn-remove-contact")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.contacts?.splice(idx, 1));
      return;
    }

    // Gear, Vehicles, Qualities Remove
    if (target.classList.contains("btn-remove-gear")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.gear?.splice(idx, 1));
      return;
    }
    if (target.classList.contains("btn-remove-veh")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.vehicles?.splice(idx, 1));
      return;
    }
    if (target.classList.contains("btn-remove-quality")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      store.update(char => char.qualities?.splice(idx, 1));
      return;
    }
  });

  // Delegated Input/Change Handlers
  mainDeck.addEventListener("input", (e) => {
    const target = e.target;
    const idx = parseInt(target.getAttribute("data-index"), 10);
    if (isNaN(idx)) return;

    const typingMeta = { isTyping: true, sourceTarget: target };

    if (target.classList.contains("skill-spec-input")) {
      store.update(char => { if (char.skills?.[idx]) char.skills[idx].spec = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("cue-input")) {
      store.update(char => { if (char.cues) char.cues[idx] = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("disp-input")) {
      store.update(char => { if (char.dispositions) char.dispositions[idx] = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("ks-name-input")) {
      store.update(char => { if (char.knowledgeSkills?.[idx]) char.knowledgeSkills[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("amp-name-input")) {
      store.update(char => { if (char.shadowAmps?.[idx]) char.shadowAmps[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("amp-ess-input")) {
      store.update(char => { if (char.shadowAmps?.[idx]) char.shadowAmps[idx].essenceCost = parseFloat(target.value) || 0; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("amp-effect-input")) {
      store.update(char => { if (char.shadowAmps?.[idx]) char.shadowAmps[idx].effect = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("wep-name-input")) {
      store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("wep-dmg-input")) {
      store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].damage = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("wep-ap-input")) {
      store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].ap = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("wep-range-input")) {
      store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].range = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("wep-ammo-input")) {
      store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].ammo = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("wep-notes-input")) {
      store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].notes = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("gear-name-input")) {
      store.update(char => { if (char.gear?.[idx]) char.gear[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("gear-qty-input")) {
      store.update(char => { if (char.gear?.[idx]) char.gear[idx].qty = parseInt(target.value, 10) || 1; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("gear-notes-input")) {
      store.update(char => { if (char.gear?.[idx]) char.gear[idx].notes = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("veh-name-input")) {
      store.update(char => { if (char.vehicles?.[idx]) char.vehicles[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("veh-hand-input")) {
      store.update(char => { if (char.vehicles?.[idx]) char.vehicles[idx].handling = parseInt(target.value, 10) || 0; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("veh-spd-input")) {
      store.update(char => { if (char.vehicles?.[idx]) char.vehicles[idx].speed = parseInt(target.value, 10) || 0; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("veh-arm-input")) {
      store.update(char => { if (char.vehicles?.[idx]) char.vehicles[idx].armor = parseInt(target.value, 10) || 0; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("veh-type-input")) {
      store.update(char => { if (char.vehicles?.[idx]) char.vehicles[idx].type = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("contact-name-input")) {
      store.update(char => { if (char.contacts?.[idx]) char.contacts[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("contact-role-input")) {
      store.update(char => { if (char.contacts?.[idx]) char.contacts[idx].role = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("contact-notes-input")) {
      store.update(char => { if (char.contacts?.[idx]) char.contacts[idx].notes = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("quality-name-input")) {
      store.update(char => { if (char.qualities?.[idx]) char.qualities[idx].name = target.value; }, true, typingMeta);
      return;
    }
    if (target.classList.contains("quality-effect-input")) {
      store.update(char => { if (char.qualities?.[idx]) char.qualities[idx].effect = target.value; }, true, typingMeta);
      return;
    }
  });

  mainDeck.addEventListener("change", (e) => {
    const target = e.target;
    const idx = parseInt(target.getAttribute("data-index"), 10);
    if (isNaN(idx)) return;

    if (target.classList.contains("amp-type-select")) {
      store.update(char => { if (char.shadowAmps?.[idx]) char.shadowAmps[idx].type = target.value; });
      return;
    }
    if (target.classList.contains("quality-type-select")) {
      store.update(char => { if (char.qualities?.[idx]) char.qualities[idx].type = target.value; });
      return;
    }
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(reg => console.log("[SRA Terminal] Service Worker linked:", reg.scope))
        .catch(err => console.warn("[SRA Terminal] SW registration skipped in file protocol:", err));
    });
  }
}
