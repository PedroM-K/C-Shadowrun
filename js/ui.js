/**
 * SHADOWRUN: ANARCHY - CLANDESTINE OS UI RENDER ENGINE
 * Diegetic rendering of 2080 runner terminal, segmented LED meters, and tactical HUD
 */

import { store } from "./state.js";
import { METATYPES, ATTRIBUTES, SHADOW_AMP_TYPES, ATTRIBUTE_SKILL_PRESETS, ACTION_SKILL_ATTRIBUTES, OFFICIAL_SKILL_DESCRIPTIONS, getSkillDescription, SRA_QUALITIES_PRESETS } from "./constants.js";
import { calculateSkillDicePool } from "./rules.js";
import { rollD6Pool } from "./dice.js";

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast anim-fade";
  if (type === "success") {
    toast.style.borderColor = "var(--term-green)";
    toast.style.borderLeftColor = "var(--term-green)";
  } else if (type === "error") {
    toast.style.borderColor = "var(--term-red)";
    toast.style.borderLeftColor = "var(--term-red)";
  }

  toast.innerHTML = `<span class="led-indicator ${type === "error" ? "led-red" : "led-green"}" style="margin-right: 0.5rem;"></span>${escapeHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    toast.style.transition = "all 0.15s ease";
    setTimeout(() => toast.remove(), 160);
  }, 2800);
}

/**
 * Open Matrix D6 Dice Roller Modal
 */
export function openDiceModal(options = {}) {
  const { title = "MATRIX D6 ROLLER", pool = 6, attributeName = "", skillName = "" } = options;
  const modal = document.getElementById("modal-dice-roller");
  if (!modal) return;

  const modalTitle = document.getElementById("dice-modal-title");
  const poolInput = document.getElementById("dice-pool-input");
  const subtext = document.getElementById("dice-modal-subtext");
  const resultsContainer = document.getElementById("dice-modal-results");

  if (modalTitle) modalTitle.textContent = title;
  if (poolInput) poolInput.value = Math.max(1, pool);
  if (subtext) {
    subtext.textContent = (attributeName || skillName)
      ? `// ORIGEM: ${skillName || ""} ${attributeName ? `[${attributeName}]` : ""}`
      : "// TESTE DE RESERVA DE DADOS";
  }
  if (resultsContainer) {
    resultsContainer.innerHTML = `<div style="text-align: center; font-family: var(--font-mono); color: var(--text-muted); padding: 1.5rem;">// AGUARDANDO COMANDO DE ROLAGEM...</div>`;
  }

  modal.classList.add("active");
}

export function closeDiceModal() {
  const modal = document.getElementById("modal-dice-roller");
  if (modal) modal.classList.remove("active");
}

/**
 * Execute D6 Roll inside Modal
 */
export function executeModalRoll() {
  const poolInput = document.getElementById("dice-pool-input");
  const anarchyDieCb = document.getElementById("cb-anarchy-die");
  const resultsContainer = document.getElementById("dice-modal-results");

  const pool = parseInt(poolInput.value, 10) || 1;
  const useAnarchyDie = anarchyDieCb?.checked || false;

  const roll = rollD6Pool(pool, { useRuleOfSix: false, useAnarchyDie });

  // Render individual tactical dice boxes
  let diceHtml = `<div class="dice-results-grid">`;
  for (const die of roll.dice) {
    let classes = ["die-tactical-box", "anim-fill"];
    if (die.isHit) classes.push("hit");
    if (die.isOne) classes.push("one");
    if (die.isAnarchyDie) classes.push("anarchy-die");
    diceHtml += `<div class="${classes.join(" ")}" title="${die.isAnarchyDie ? "Dado de Anarquia" : "D6"}">${die.value}</div>`;
  }
  diceHtml += `</div>`;

  // Status Alerts (sem falha crítica e sem emojis)
  let statusBanner = "";
  if (roll.glitchStatus === "glitch") {
    statusBanner = `<div style="background: var(--term-amber-dim); border: 1px solid var(--term-amber); color: var(--term-amber); font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; padding: 0.45rem; text-align: center; border-radius: var(--radius-xs);">GLITCH DETECTADO (DADO DE ANARQUIA: 1)</div>`;
  }

  if (roll.anarchyDieHit) {
    statusBanner += `<div style="background: var(--term-purple-dim); border: 1px solid var(--term-purple); color: var(--term-purple); font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; padding: 0.45rem; text-align: center; border-radius: var(--radius-xs); margin-top: 0.4rem;">DADO DE ANARQUIA ACERTOU!</div>`;
  }


  resultsContainer.innerHTML = `
    <div style="display: flex; justify-content: space-around; align-items: center; background: var(--bg-elevated); padding: 0.85rem; border-radius: var(--radius-xs); border: 1px solid var(--border-panel); margin-bottom: 0.75rem;">
      <div style="text-align: center;">
        <div style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted);">SUCESSOS (HITS)</div>
        <div style="font-size: 2rem; font-family: var(--font-mono); font-weight: 800; color: var(--term-green);">${roll.hits}</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted);">UNS (1s)</div>
        <div style="font-size: 1.4rem; font-family: var(--font-mono); font-weight: 800; color: var(--term-red);">${roll.onesCount}</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted);">TOTAL DADOS</div>
        <div style="font-size: 1.4rem; font-family: var(--font-mono); font-weight: 800; color: var(--term-cyan);">${roll.dice.length}</div>
      </div>
    </div>
    ${statusBanner}
    ${diceHtml}
  `;
}

/**
 * Renders the multi-sheet manager modal and header indicator
 */
export function renderSheetsModal(roster = [], activeId = "") {
  const countHeaderEl = document.getElementById("header-sheets-count");
  if (countHeaderEl) {
    countHeaderEl.textContent = roster.length;
  }
  const countSidebarEl = document.getElementById("sidebar-sheets-count");
  if (countSidebarEl) {
    countSidebarEl.textContent = roster.length;
  }

  const modalList = document.getElementById("modal-roster-list");
  if (!modalList) return;

  const activeChar = roster.find(c => c.id === activeId) || roster[0];
  const activeSummary = document.getElementById("modal-active-sheet-summary");
  if (activeSummary && activeChar) {
    const alias = activeChar.character?.alias || activeChar.character?.name || "Sem Nome";
    const meta = METATYPES[activeChar.character?.metatype]?.name || activeChar.character?.metatype || "Humano";
    const arch = activeChar.character?.archetype || "Shadowrunner";
    const karma = activeChar.character?.karma ?? 0;
    const nuyen = activeChar.character?.nuyen ?? 0;
    const updateTime = activeChar.updatedAt ? new Date(activeChar.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--";

    activeSummary.innerHTML = `
      <div class="active-sheet-banner bracket-box">
        <div class="active-sheet-header">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="sys-tag" style="color: var(--term-green); border-color: var(--term-green-border); background: var(--term-green-dim);">● FICHA ATIVA NO TERMINAL</span>
            <strong style="color: var(--term-green); font-size: 1.15rem; font-family: var(--font-heading); letter-spacing: 1px;">${escapeHtml(alias.toUpperCase())}</strong>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button type="button" id="btn-modal-save-now" class="btn-term btn-term-primary btn-term-sm" title="Salvar alterações desta ficha">💾 SALVAR AGORA</button>
          </div>
        </div>
        <div class="active-sheet-stats">
          <div><span class="label">METATIPO:</span> <strong>${escapeHtml(meta)}</strong></div>
          <div><span class="label">ARQUÉTIPO:</span> <strong>${escapeHtml(arch)}</strong></div>
          <div><span class="label">KARMA:</span> <strong style="color: var(--term-purple);">${karma}</strong></div>
          <div><span class="label">NUYEN:</span> <strong style="color: var(--term-amber);">¥${nuyen}</strong></div>
          <div><span class="label">ÚLTIMA ATUALIZAÇÃO:</span> <span>${updateTime}</span></div>
        </div>
      </div>
    `;
  }

  if (roster.length === 0) {
    modalList.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-family: var(--font-mono); padding: 1.5rem;">// NENHUMA FICHA ENCONTRADA.</div>`;
    return;
  }

  modalList.innerHTML = roster.map((charItem, idx) => {
    const isActive = charItem.id === activeId;
    const itemAlias = charItem.character?.alias || charItem.character?.name || `Runner #${idx + 1}`;
    const itemReal = charItem.character?.name && charItem.character?.name !== itemAlias ? `(${escapeHtml(charItem.character.name)})` : "";
    const itemMeta = METATYPES[charItem.character?.metatype]?.name || charItem.character?.metatype || "Humano";
    const itemArch = charItem.character?.archetype || "Shadowrunner";
    const itemUpdated = charItem.updatedAt ? new Date(charItem.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : "---";
    const qualCount = Array.isArray(charItem.qualities) ? charItem.qualities.filter(q => q.name?.trim()).length : 0;

    return `
      <div class="sheet-roster-card bracket-box ${isActive ? "active-roster-card" : ""}" data-id="${charItem.id}">
        <div class="sheet-roster-info">
          <div class="sheet-roster-title-row">
            <span class="sheet-roster-num">#${String(idx + 1).padStart(2, "0")}</span>
            <strong class="sheet-roster-alias ${isActive ? "text-green" : ""}">${escapeHtml(itemAlias)}</strong>
            ${itemReal ? `<span class="sheet-roster-real">${itemReal}</span>` : ""}
            ${isActive ? `<span class="sys-tag sheet-active-badge">ATIVA</span>` : ""}
          </div>
          <div class="sheet-roster-meta-row">
            <span>${escapeHtml(itemMeta)}</span>
            <span>//</span>
            <span>${escapeHtml(itemArch)}</span>
            <span>//</span>
            <span>${qualCount} Qualidade(s)</span>
            <span>//</span>
            <span class="sheet-roster-date">Salvo: ${itemUpdated}</span>
          </div>
        </div>

        <div class="sheet-roster-actions">
          ${!isActive ? `
            <button type="button" class="btn-term btn-term-primary btn-term-sm btn-open-sheet" data-id="${charItem.id}" title="Abrir esta ficha no terminal">
              ABRIR
            </button>
          ` : `
            <span class="sys-tag" style="color: var(--term-green); font-size: 0.72rem;">ABERTA</span>
          `}
          <button type="button" class="btn-term btn-term-sm btn-duplicate-sheet" data-id="${charItem.id}" title="Duplicar esta ficha">
            DUPLICAR
          </button>
          <button type="button" class="btn-term btn-term-danger btn-term-sm btn-delete-sheet" data-id="${charItem.id}" title="Excluir esta ficha"${roster.length <= 1 ? " disabled style='opacity: 0.4; cursor: not-allowed;'" : ""}>
            EXCLUIR
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Main UI Render function invoked on store state change
 */
export function renderApp(char, derived, eventMeta = {}) {
  if (!char) return;

  const alias = char.character.alias || char.character.name || "---";
  const metatype = METATYPES[char.character.metatype]?.name || char.character.metatype || "---";
  const archetype = char.character.archetype ? char.character.archetype.toUpperCase() : "---";

  // Header & Sidebar Live Sync
  const headerUser = document.getElementById("header-user-display");
  const sidebarAlias = document.getElementById("sidebar-alias-display");
  const sidebarMeta = document.getElementById("sidebar-meta-display");
  const sidebarArch = document.getElementById("sidebar-arch-display");

  if (headerUser) headerUser.textContent = alias.toUpperCase();
  if (sidebarAlias) sidebarAlias.textContent = alias.toUpperCase();
  if (sidebarMeta) sidebarMeta.textContent = metatype.toUpperCase();
  if (sidebarArch) sidebarArch.textContent = archetype;

  // Sync multi-sheet roster modal & counts
  if (typeof store.getRoster === "function") {
    const roster = store.getRoster();
    renderSheetsModal(roster, char.id);
  }

  // Se o usuário está digitando ativamente, NÃO recriar elementos DOM para não perder foco
  if (eventMeta?.isTyping) {
    const target = eventMeta.sourceTarget;
    // Se digitou especialização de perícia, atualiza cirurgicamente a pool da linha
    if (target && target.classList.contains("skill-spec-input")) {
      const row = target.closest(".skill-tactical-item");
      const idx = parseInt(target.getAttribute("data-index"), 10);
      if (row && !isNaN(idx) && char.skills?.[idx]) {
        const pool = calculateSkillDicePool(char, char.skills[idx], true);
        const poolBox = row.querySelector(".pool-box");
        const rollBtn = row.querySelector(".btn-roll-skill");
        if (poolBox) poolBox.textContent = `${pool}d6`;
        if (rollBtn) rollBtn.setAttribute("data-pool", pool);
      }
    }
    // Se digitou custo de essência em shadow amp
    if (target && target.classList.contains("amp-ess-input")) {
      const essenceDisplay = document.getElementById("amps-essence-display");
      const essencePercent = document.getElementById("amps-essence-percent");
      const essenceSegments = document.getElementById("essence-bar-segments");
      if (essenceDisplay) essenceDisplay.textContent = `${derived.essence.remaining.toFixed(2)} / 6.00`;
      if (essencePercent) {
        const pct = Math.round((derived.essence.remaining / 6.0) * 100);
        essencePercent.textContent = `${pct}% INTATOS`;
      }
      if (essenceSegments) {
        let segHtml = "";
        for (let i = 1; i <= 12; i++) {
          const active = i <= Math.round(derived.essence.remaining * 2);
          segHtml += `<div class="meter-segment ${active ? "filled essence-segment" : ""}"></div>`;
        }
        essenceSegments.innerHTML = segHtml;
      }
    }
    return;
  }

  // 01 // Overview & Cues
  renderOverviewTab(char);

  // 02 // Attributes & Segmented LED Meters
  renderAttributesTab(char, derived);

  // 03 // Skills
  renderSkillsTab(char, derived);

  // 04 // Combat & Damage Tracks
  renderCombatTab(char, derived);

  // 05 // Weapons Arsenal
  renderWeaponsTab(char);

  // 06 // Shadow Amps & Essence Meter
  renderShadowAmpsTab(char, derived);

  // 07 // Gear & Vehicles
  renderGearTab(char);

  // 08 // Contacts & Qualities
  renderContactsTab(char);

  // 09 // Mission Notes
  renderNotesTab(char);
}

function renderOverviewTab(char) {
  const fields = [
    "name", "alias", "metatype", "archetype", "awakenedType",
    "gender", "age", "height", "weight", "karma", "nuyen"
  ];

  for (const f of fields) {
    const el = document.getElementById(`char-${f}`);
    if (el && document.activeElement !== el) {
      el.value = char.character[f] ?? "";
    }
  }

  // Anarchy Points Hero Value
  const plotHero = document.getElementById("val-plot-points-hero");
  const plotVal = document.getElementById("val-plot-points");
  const pts = char.character.plotPoints ?? 0;
  if (plotHero) plotHero.textContent = String(pts).padStart(2, "0");
  if (plotVal) plotVal.textContent = pts;

  // Cues List
  const cuesContainer = document.getElementById("cues-list-container");
  if (cuesContainer) {
    const cues = char.cues || [];
    if (cuesContainer.contains(document.activeElement) && cuesContainer.querySelectorAll(".cue-input").length === cues.length) {
      // Usuário está digitando dentro do container de dicas: não recriar DOM
    } else if (cues.length === 0) {
      cuesContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUMA DICA CADASTRADA. CLIQUE EM [+ DICA] PARA ADICIONAR.</div>`;
    } else {
      cuesContainer.innerHTML = cues.map((cue, idx) => `
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem;">
          <span style="color: var(--term-green); font-family: var(--font-mono); font-weight: 700;">“</span>
          <input type="text" class="field-input cue-input" data-index="${idx}" value="${escapeHtml(cue)}" placeholder="Frase de efeito do runner..." style="font-style: italic; flex: 1;" />
          <button class="btn-term btn-term-sm btn-remove-cue" data-index="${idx}" title="Remover Dica">✕</button>
        </div>
      `).join("");
    }
  }

  // Dispositions List
  const dispContainer = document.getElementById("dispositions-list-container");
  if (dispContainer) {
    const disps = char.dispositions || [];
    if (dispContainer.contains(document.activeElement) && dispContainer.querySelectorAll(".disp-input").length === disps.length) {
      // Usuário está digitando dentro do container de disposições: não recriar DOM
    } else if (disps.length === 0) {
    } else {
      dispContainer.innerHTML = disps.map((disp, idx) => `
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem;">
          <span class="led-indicator led-green" style="margin-left: 0.25rem;"></span>
          <input type="text" class="field-input disp-input" data-index="${idx}" value="${escapeHtml(disp)}" placeholder="Traço de personalidade..." style="flex: 1;" />
          <button class="btn-term btn-term-sm btn-remove-disp" data-index="${idx}" title="Remover Disposição">✕</button>
        </div>
      `).join("");
    }
  }

  // Qualidades do Runner (SRA)
  renderQualities(char);
}

function renderQualities(char) {
  const container = document.getElementById("qualities-list-container");
  const statusBadge = document.getElementById("qualities-status-badge");

  if (!container) return;

  // Garante que o array exista e inicie com os 3 slots canônicos do SRA se estiver vazio
  if (!Array.isArray(char.qualities) || char.qualities.length === 0) {
    char.qualities = [
      { id: "q_pos_1", name: "", type: "positive", effect: "" },
      { id: "q_pos_2", name: "", type: "positive", effect: "" },
      { id: "q_neg_1", name: "", type: "negative", effect: "" }
    ];
  }

  // Atualiza badge de contagem de qualidades
  const posCount = char.qualities.filter(q => q.type === "positive").length;
  const negCount = char.qualities.filter(q => q.type === "negative").length;
  if (statusBadge) {
    if (posCount === 2 && negCount === 1) {
      statusBadge.textContent = "✓ SRA EQUILIBRADO (2 POSITIVAS // 1 NEGATIVA)";
      statusBadge.style.color = "var(--term-green)";
    } else {
      statusBadge.textContent = `SRA: 2 POS / 1 NEG (ATUAL: ${posCount}P / ${negCount}N)`;
      statusBadge.style.color = "var(--term-amber)";
    }
  }

  // Preserva foco apenas se o usuário estiver ativamente digitando em um input de texto ou textarea
  const activeEl = document.activeElement;
  if (container.contains(activeEl) && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
    const inputCount = container.querySelectorAll(".quality-name-input").length;
    if (inputCount === char.qualities.length) {
      return;
    }
  }

  container.innerHTML = char.qualities.map((q, idx) => {
    const isPos = q.type !== "negative";
    const slotNum = String(idx + 1).padStart(2, "0");

    return `
      <div class="quality-card ${isPos ? "quality-positive" : "quality-negative"} bracket-box">
        <div class="quality-card-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <select class="quality-type-select" data-index="${idx}" title="Alternar tipo de qualidade SRA">
              <option value="positive" ${isPos ? "selected" : ""}>+ POSITIVA</option>
              <option value="negative" ${!isPos ? "selected" : ""}>- NEGATIVA</option>
            </select>
            <span class="quality-slot-label">// SLOT ${slotNum}</span>
          </div>
          <button type="button" class="btn-term btn-term-danger btn-term-sm btn-remove-quality" data-index="${idx}" title="Remover Qualidade">✕</button>
        </div>

        <div class="quality-card-body">
          <div class="field-block" style="margin-bottom: 0.15rem;">
            <div class="field-label" style="font-size: 0.65rem;">NOME DA QUALIDADE</div>
            <input 
              type="text" 
              class="field-input quality-name-input" 
              data-index="${idx}" 
              autocomplete="off" 
              spellcheck="false"
              value="${escapeHtml(q.name || "")}" 
              placeholder="${isPos ? "Nome da qualidade positiva..." : "Nome da qualidade negativa..."}" 
              style="font-weight: 700; color: ${isPos ? "var(--term-green)" : "var(--term-red)"}; font-size: 0.88rem;"
            />
          </div>

          <div class="field-block" style="margin-bottom: 0;">
            <div class="field-label" style="font-size: 0.65rem;">REGRA CONCRETA / EFEITO MECÂNICO</div>
            <textarea 
              class="field-input quality-effect-input" 
              data-index="${idx}" 
              placeholder="Descreva a regra concreta (ex: +2 dados em testes de percepção, ou penalidade ao sofrer dano)..."
            >${escapeHtml(q.effect || "")}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join("");
}


function renderAttributesTab(char, derived) {
  const primaryContainer = document.getElementById("attributes-primary-container");
  const specialContainer = document.getElementById("attributes-special-container");
  const oldContainer = document.getElementById("attributes-grid-container");

  if (!primaryContainer && !specialContainer && !oldContainer) return;

  const renderCard = (attrDef) => {
    const isEssence = attrDef.key === "ess";
    let baseVal = 0;
    let totalVal = 0;

    if (isEssence) {
      totalVal = derived.essence.remaining;
    } else {
      const attrData = char.attributes[attrDef.key] || { base: 1, mod: 0 };
      baseVal = attrData.base || 1;
      totalVal = baseVal + (attrData.mod || 0);
    }

    // Generate 10 Segmented LED bars
    const maxBar = 10;
    let segmentsHtml = "";
    for (let s = 1; s <= maxBar; s++) {
      const filled = isEssence ? s <= Math.round(totalVal * 1.66) : s <= totalVal;
      segmentsHtml += `<div class="meter-segment ${filled ? "filled" : ""} ${isEssence ? "essence-segment" : ""}"></div>`;
    }

    return `
      <div class="attr-meter-card bracket-box">
        <div class="attr-meter-header">
          <span class="name">${escapeHtml(attrDef.label)}</span>
          <span class="score">${totalVal}</span>
        </div>
        <div class="segmented-meter">${segmentsHtml}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.35rem;">
          ${escapeHtml(attrDef.description)}
        </div>
        ${!isEssence ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.35rem; border-top: 1px solid var(--border-subtle);">
            <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted);">BASE:</span>
            <div class="stepper-tactical">
              <button class="btn-attr-dec" data-key="${attrDef.key}">-</button>
              <span class="val">${baseVal}</span>
              <button class="btn-attr-inc" data-key="${attrDef.key}">+</button>
            </div>
          </div>
        ` : `
          <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--term-cyan); margin-top: auto; padding-top: 0.35rem; border-top: 1px solid var(--border-subtle);">
            PERDA BIO: -${derived.essence.totalLoss.toFixed(2)}
          </div>
        `}
      </div>
    `;
  };

  if (primaryContainer) {
    const primaryAttrs = ATTRIBUTES.filter(a => a.key !== "edg" && a.key !== "ess");
    primaryContainer.innerHTML = primaryAttrs.map(renderCard).join("");
  }
  if (specialContainer) {
    const specialAttrs = ATTRIBUTES.filter(a => a.key === "edg" || a.key === "ess");
    specialContainer.innerHTML = specialAttrs.map(renderCard).join("");
  }
  if (oldContainer && !primaryContainer) {
    oldContainer.innerHTML = ATTRIBUTES.map(renderCard).join("");
  }
}

function renderSkillsTab(char, derived) {
  const container = document.getElementById("skills-list-container");
  if (container) {
    const skills = char.skills || [];
    if (container.contains(document.activeElement) && container.querySelectorAll(".skill-tactical-item").length === skills.length) {
      // Foco ativo mantido no container de perícias
    } else {
      let htmlOutput = "";

      const attributesList = [...ACTION_SKILL_ATTRIBUTES];
      if (skills.some(s => (s.attr || "").toLowerCase() === "str")) {
        attributesList.push({ key: "str", name: "Força", short: "STR" });
      }

      attributesList.forEach(attrDef => {
        const attrKey = attrDef.key;
        const attrSkills = skills
          .map((skill, originalIndex) => ({ skill, originalIndex }))
          .filter(({ skill }) => (skill.attr || "").toLowerCase() === attrKey);

        const attrScore = char.attributes?.[attrKey]?.base || 1;
        const presets = ATTRIBUTE_SKILL_PRESETS[attrKey] || [];
        const addedNames = new Set(attrSkills.map(s => s.skill.name));
        const availablePresets = presets.filter(p => !addedNames.has(p.name));

        htmlOutput += `
          <div class="skills-category-header category-${attrKey}">
            <div class="cat-title-block">
              <span class="cat-prefix">//</span>
              <span class="cat-title">${attrDef.name.toUpperCase()}</span>
              <span class="cat-attr-pill" title="Atributo ${attrDef.name}">[${attrDef.short}: ${attrScore}]</span>
            </div>
            <div class="cat-line"></div>
            <div class="cat-picker-wrap">
              <select class="skill-picker-select" data-attr="${attrKey}" title="Selecionar e adicionar perícia de ${attrDef.name}">
                <option value="" disabled selected>+ ADICIONAR PERÍCIA...</option>
                ${availablePresets.map(p => `
                  <option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>
                `).join("")}
                <option value="__custom__">+ Outra / Personalizada...</option>
              </select>
            </div>
          </div>
        `;

        if (attrSkills.length === 0) {
          htmlOutput += `
            <div class="skill-category-empty">
              <span class="empty-icon">⬡</span> Nenhuma perícia de ${attrDef.name} adicionada. Selecione no menu acima para incluir.
            </div>
          `;
        } else {
          attrSkills.forEach(({ skill, originalIndex }) => {
            const pool = calculateSkillDicePool(char, skill, true);
            const isKnownPreset = presets.some(p => p.name === skill.name);
            const isCustom = skill.isCustom || (!isKnownPreset && skill.name && skill.name !== "Nova Perícia");
            const desc = skill.description || getSkillDescription(skill.name, attrKey);

            htmlOutput += `
              <div class="skill-tactical-item" data-index="${originalIndex}">
                <div class="skill-name-col">
                  ${isCustom ? `
                    <input 
                      type="text" 
                      class="field-input skill-custom-name-input" 
                      data-index="${originalIndex}" 
                      value="${escapeHtml(skill.name || "")}" 
                      placeholder="Nome da perícia personalizada..." 
                      style="font-size: 0.85rem; padding: 0.2rem 0.45rem;" 
                    />
                  ` : `
                    <div class="name">${escapeHtml(skill.name)}</div>
                  `}
                  ${desc ? `<div class="skill-desc">${escapeHtml(desc)}</div>` : ""}
                </div>
                <div class="attr-tag attr-tag-${escapeHtml(skill.attr)}">[${escapeHtml(attrDef.short)}]</div>
                <div>
                  <input 
                    type="text" 
                    class="field-input field-input-mono skill-spec-input" 
                    data-index="${originalIndex}" 
                    value="${escapeHtml(skill.spec || "")}" 
                    placeholder="Especialização (+2)..." 
                    style="padding: 0.25rem 0.5rem; font-size: 0.8rem;"
                  />
                </div>
                <div class="stepper-tactical">
                  <button type="button" class="btn-skill-dec" data-index="${originalIndex}">-</button>
                  <span class="val">${skill.rating}</span>
                  <button type="button" class="btn-skill-inc" data-index="${originalIndex}">+</button>
                </div>
                <div class="pool-box" title="Reserva Final de D6">${pool}d6</div>
                <div>
                  <button 
                    type="button"
                    class="btn-term btn-term-primary btn-term-sm btn-roll-skill" 
                    data-skill-name="${escapeHtml(skill.name)}" 
                    data-pool="${pool}" 
                    data-attr="${escapeHtml(attrDef.name)}"
                  >
                    🎲 ROLAR
                  </button>
                </div>
                <div>
                  <button type="button" class="btn-term btn-term-sm btn-remove-skill" data-index="${originalIndex}" title="Remover Perícia">✕</button>
                </div>
              </div>
            `;
          });
        }
      });

      container.innerHTML = htmlOutput;
    }
  }

  // Knowledge Skills (Sem rolagem)
  const ksContainer = document.getElementById("knowledge-skills-container");
  if (ksContainer) {
    const kSkills = char.knowledgeSkills || [];
    if (ksContainer.contains(document.activeElement) && ksContainer.querySelectorAll(".ks-name-input").length === kSkills.length) {
      // Foco ativo mantido nas perícias de conhecimento
    } else if (kSkills.length === 0) {
      ksContainer.innerHTML = `
        <div class="skill-category-empty">
          <span class="empty-icon">⬡</span> Nenhum idioma ou conhecimento registrado. Clique em [+ CONHECIMENTO] para adicionar.
        </div>
      `;
    } else {
      ksContainer.innerHTML = kSkills.map((ks, idx) => `
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem;">
          <input 
            type="text" 
            class="field-input ks-name-input" 
            data-index="${idx}" 
            value="${escapeHtml(ks.name)}" 
            placeholder="Perícia de Conhecimento / Idioma..." 
            style="flex: 1;" 
          />
          <button type="button" class="btn-term btn-term-sm btn-remove-ks" data-index="${idx}" title="Remover Conhecimento">✕</button>
        </div>
      `).join("");
    }
  }
}


function renderCombatTab(char, derived) {
  // Metric numbers
  const woundVal = document.getElementById("wound-penalty-display");
  if (woundVal) {
    const penalty = derived.woundPenalty;
    woundVal.textContent = penalty === 0 ? "0" : `${penalty} DADOS`;
    woundVal.style.color = penalty < 0 ? "var(--term-red)" : "var(--term-green)";
  }

  // Sincroniza input de valor máximo de armadura
  const armorRatingInput = document.getElementById("armor-rating-input");
  if (armorRatingInput && document.activeElement !== armorRatingInput) {
    armorRatingInput.value = Math.max(1, Number(char.condition?.armorRating) || 9);
  }

  // Damage Tracks com agrupamento visual de 3 em 3
  renderTacticalTrack("armor", derived.armorMax, char.condition.armorDamage || 0, "armor-cell", "val-armor-count");
  renderTacticalTrack("physical", derived.physMax, char.condition.physicalDamage || 0, "phys-cell", "val-phys-count");
  renderTacticalTrack("stun", derived.stunMax, char.condition.stunDamage || 0, "stun-cell", "val-stun-count");

  // Atualiza status pills e dicas contextuais
  updateConditionPills(char, derived);

  // Edge
  const edgeVal = document.getElementById("val-edge-count");
  if (edgeVal) {
    const currentEdge = char.condition.edgeCurrent ?? 1;
    edgeVal.textContent = currentEdge;
  }
}

function updateConditionPills(char, derived) {
  const armorPill = document.getElementById("armor-status-pill");
  const armorDmg = char.condition?.armorDamage || 0;
  const armorMax = derived.armorMax || 9;
  if (armorPill) {
    if (armorDmg === 0) {
      armorPill.textContent = "ÍNTEGRA";
      armorPill.className = "condition-status-pill pill-status-ok";
    } else if (armorDmg >= armorMax) {
      armorPill.textContent = "DESTRUÍDA";
      armorPill.className = "condition-status-pill pill-status-danger";
    } else {
      armorPill.textContent = `AVARIADA`;
      armorPill.className = "condition-status-pill pill-status-warn";
    }
  }

  const physPill = document.getElementById("phys-status-pill");
  const physDmg = char.condition?.physicalDamage || 0;
  const physMax = derived.physMax || 10;
  if (physPill) {
    if (physDmg === 0) {
      physPill.textContent = "ÍNTEGRO";
      physPill.className = "condition-status-pill pill-status-ok";
    } else if (physDmg >= physMax) {
      physPill.textContent = "INCAPACITADO";
      physPill.className = "condition-status-pill pill-status-danger";
    } else {
      const p = Math.floor(physDmg / 3);
      if (p > 0) {
        physPill.textContent = `FERIDO (-${p}D)`;
        physPill.className = p >= 2 ? "condition-status-pill pill-status-danger" : "condition-status-pill pill-status-warn";
      } else {
        physPill.textContent = "ARRANHADO";
        physPill.className = "condition-status-pill pill-status-ok";
      }
    }
  }

  const stunPill = document.getElementById("stun-status-pill");
  const stunDmg = char.condition?.stunDamage || 0;
  const stunMax = derived.stunMax || 10;
  if (stunPill) {
    if (stunDmg === 0) {
      stunPill.textContent = "LÚCIDO";
      stunPill.className = "condition-status-pill pill-status-ok";
    } else if (stunDmg >= stunMax) {
      stunPill.textContent = "COLAPSADO";
      stunPill.className = "condition-status-pill pill-status-danger";
    } else {
      const p = Math.floor(stunDmg / 3);
      if (p > 0) {
        stunPill.textContent = `ATORDOADO (-${p}D)`;
        stunPill.className = p >= 2 ? "condition-status-pill pill-status-danger" : "condition-status-pill pill-status-warn";
      } else {
        stunPill.textContent = "FADIGADO";
        stunPill.className = "condition-status-pill pill-status-ok";
      }
    }
  }
}

function renderTacticalTrack(trackType, maxBoxes, currentDamage, cellClass, counterId) {
  const container = document.getElementById(`track-${trackType}-boxes`);
  const counter = document.getElementById(counterId);

  if (counter) counter.textContent = `${currentDamage} / ${maxBoxes}`;
  if (!container) return;

  let tripletsHtml = "";
  let currentTripletCells = "";

  for (let i = 1; i <= maxBoxes; i++) {
    const isMarked = i <= currentDamage;
    const isThreshold = (trackType !== "armor") && (i % 3 === 0);
    const penaltyTag = isThreshold ? `-${i / 3}D` : "";

    currentTripletCells += `
      <div 
        class="track-cell ${cellClass} ${isMarked ? "marked" : ""}" 
        data-track="${trackType}" 
        data-index="${i}"
        title="Caixa ${i} (Clique para marcar/limpar)"
      >
        <span>${i}</span>
        ${isThreshold ? `<span class="cell-penalty-sub">${penaltyTag}</span>` : ""}
      </div>
    `;

    if (i % 3 === 0 || i === maxBoxes) {
      tripletsHtml += `<div class="track-triplet">${currentTripletCells}</div>`;
      currentTripletCells = "";
    }
  }

  container.innerHTML = tripletsHtml;
}


function renderWeaponsTab(char) {
  const container = document.getElementById("weapons-list-container");
  if (!container) return;

  const weapons = char.weapons || [];
  if (container.contains(document.activeElement) && container.querySelectorAll(".weapon-tactical-card").length === weapons.length) {
    return;
  }
  if (weapons.length === 0) {
    container.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); padding: 2rem; text-align: center; border: 1px dashed var(--border-panel); border-radius: var(--radius-xs);">// ARSENAL VAZIO.</div>`;
    return;
  }

  container.innerHTML = weapons.map((w, idx) => `
    <div class="weapon-tactical-card bracket-box">
      <div class="weapon-card-header">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
          <span class="weapon-reg-id">WEAPON // 00${idx + 1}</span>
          <input type="text" class="field-input wep-name-input" data-index="${idx}" value="${escapeHtml(w.name)}" style="font-weight: 700; color: var(--term-green); flex: 1;" placeholder="Nome da Arma..." />
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn-term btn-term-danger btn-term-sm btn-remove-weapon" data-index="${idx}">
            ✕ EXCLUIR
          </button>
        </div>
      </div>

      <div class="weapon-metrics-grid">
        <div>
          <div class="field-label">DANO (DV)</div>
          <input type="text" class="field-input field-input-mono wep-dmg-input" data-index="${idx}" value="${escapeHtml(w.damage || "")}" placeholder="Ex: 8P" />
        </div>
        <div>
          <div class="field-label">ALCANCE</div>
          <input type="text" class="field-input wep-range-input" data-index="${idx}" value="${escapeHtml(w.range || "")}" placeholder="Ex: Perto / Médio" />
        </div>
      </div>

      <div style="margin-top: 0.35rem;">
        <input type="text" class="field-input wep-notes-input" data-index="${idx}" value="${escapeHtml(w.notes || "")}" placeholder="Acessórios táticos (Smartlink, Laser, Silenciador)..." />
      </div>
    </div>
  `).join("");
}

function renderShadowAmpsTab(char, derived) {
  const container = document.getElementById("shadow-amps-container");
  const essenceCounter = document.getElementById("amps-essence-display");
  const essencePercent = document.getElementById("amps-essence-percent");
  const essenceSegments = document.getElementById("essence-bar-segments");

  if (essenceCounter) essenceCounter.textContent = `${derived.essence.remaining.toFixed(2)} / 6.00`;
  if (essencePercent) {
    const pct = Math.round((derived.essence.remaining / 6.0) * 100);
    essencePercent.textContent = `${pct}% INTATOS`;
  }

  // 12 Essence segments
  if (essenceSegments) {
    let segHtml = "";
    for (let i = 1; i <= 12; i++) {
      const active = i <= Math.round(derived.essence.remaining * 2);
      segHtml += `<div class="meter-segment ${active ? "filled essence-segment" : ""}"></div>`;
    }
    essenceSegments.innerHTML = segHtml;
  }

  if (!container) return;

  const amps = char.shadowAmps || [];
  if (container.contains(document.activeElement) && container.querySelectorAll(".amp-diagnostic-item").length === amps.length) {
    return;
  }
  if (amps.length === 0) {
    container.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); padding: 2rem; text-align: center; border: 1px dashed var(--border-panel); border-radius: var(--radius-xs);">// NENHUMA AMPLIFICAÇÃO INSTALADA (ESSÊNCIA 100% PURA). CLIQUE EM [+ NOVA AMP] PARA INSTALAR CYBERWARE, BIOWARE, FEITIÇOS OU FORMAS.</div>`;
    return;
  }

  container.innerHTML = amps.map((amp, idx) => `
    <div class="amp-diagnostic-item">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 2;">
          <span class="sys-tag" style="color: var(--term-green);">[●] INSTALLED</span>
          <input type="text" class="field-input amp-name-input" data-index="${idx}" value="${escapeHtml(amp.name)}" style="font-weight: 700; color: var(--text-bright);" placeholder="Nome da Amplificação..." />
        </div>

        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <select class="field-input amp-type-select" data-index="${idx}" style="width: 140px; font-size: 0.78rem;">
            ${SHADOW_AMP_TYPES.map(t => `<option value="${t.id}" ${amp.type === t.id ? "selected" : ""}>${t.label}</option>`).join("")}
          </select>
          <div class="stepper-tactical">
            <button class="btn-amp-lvl-dec" data-index="${idx}">-</button>
            <span class="val">Nv ${amp.level || 1}</span>
            <button class="btn-amp-lvl-inc" data-index="${idx}">+</button>
          </div>
          <button class="btn-term btn-term-danger btn-term-sm btn-remove-amp" data-index="${idx}">✕</button>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; align-items: center; font-family: var(--font-mono); font-size: 0.75rem; margin-bottom: 0.4rem;">
        <span style="color: var(--text-muted);">CUSTO DE ESSÊNCIA:</span>
        <input type="number" step="0.1" min="0" max="6" class="field-input field-input-mono amp-ess-input" data-index="${idx}" value="${amp.essenceCost ?? 0}" style="width: 70px; padding: 0.2rem 0.4rem;" />
      </div>

      <div>
        <textarea class="field-input amp-effect-input" data-index="${idx}" placeholder="Especificações técnicas e efeitos nas regras...">${escapeHtml(amp.effect || "")}</textarea>
      </div>
    </div>
  `).join("");
}

function renderGearTab(char) {
  // Gear Items
  const gearContainer = document.getElementById("gear-list-container");
  if (gearContainer) {
    const gear = char.gear || [];
    if (gearContainer.contains(document.activeElement) && gearContainer.querySelectorAll(".gear-name-input").length === gear.length) {
      // Preservar foco em itens
    } else if (gear.length === 0) {
      gearContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// INVENTÁRIO VAZIO.</div>`;
    } else {
      gearContainer.innerHTML = gear.map((g, idx) => `
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem;">
          <span class="sys-tag" style="color: var(--term-green);">[0${idx + 1}]</span>
          <input type="text" class="field-input gear-name-input" data-index="${idx}" value="${escapeHtml(g.name)}" placeholder="Item..." style="flex: 2;" />
          <input type="number" min="1" class="field-input field-input-mono gear-qty-input" data-index="${idx}" value="${g.qty || 1}" style="width: 60px;" placeholder="Qtd" />
          <input type="text" class="field-input gear-notes-input" data-index="${idx}" value="${escapeHtml(g.notes || "")}" placeholder="Especificações..." style="flex: 3;" />
          <button class="btn-term btn-term-sm btn-remove-gear" data-index="${idx}">✕</button>
        </div>
      `).join("");
    }
  }

  // Vehicles
  const vehContainer = document.getElementById("vehicles-list-container");
  if (vehContainer) {
    const vehicles = char.vehicles || [];
    if (vehContainer.contains(document.activeElement) && vehContainer.querySelectorAll(".veh-name-input").length === vehicles.length) {
      // Preservar foco em veículos
    } else if (vehicles.length === 0) {
      vehContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUM VEÍCULO OU DRONE REGISTRADO.</div>`;
    } else {
      vehContainer.innerHTML = vehicles.map((v, idx) => `
        <div class="weapon-tactical-card bracket-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <input type="text" class="field-input veh-name-input" data-index="${idx}" value="${escapeHtml(v.name)}" style="font-weight: 700; color: var(--term-green); flex: 2;" placeholder="Veículo/Drone..." />
            <button class="btn-term btn-term-danger btn-term-sm btn-remove-veh" data-index="${idx}">✕</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-top: 0.35rem;">
            <div>
              <div class="field-label">MANEJO</div>
              <input type="number" class="field-input field-input-mono veh-hand-input" data-index="${idx}" value="${v.handling || 3}" />
            </div>
            <div>
              <div class="field-label">VELOCIDADE</div>
              <input type="number" class="field-input field-input-mono veh-spd-input" data-index="${idx}" value="${v.speed || 3}" />
            </div>
            <div>
              <div class="field-label">ARMADURA</div>
              <input type="number" class="field-input field-input-mono veh-arm-input" data-index="${idx}" value="${v.armor || 6}" />
            </div>
            <div>
              <div class="field-label">CATEGORIA</div>
              <input type="text" class="field-input veh-type-input" data-index="${idx}" value="${escapeHtml(v.type || "")}" placeholder="Ex: Moto/Drone" />
            </div>
          </div>
        </div>
      `).join("");
    }
  }
}

function renderContactsTab(char) {
  // Contacts
  const contactsContainer = document.getElementById("contacts-list-container");
  if (contactsContainer) {
    const contacts = char.contacts || [];
    if (contactsContainer.contains(document.activeElement) && contactsContainer.querySelectorAll(".contact-name-input").length === contacts.length) {
      // Preservar foco em contatos
    } else if (contacts.length === 0) {
      contactsContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUM CONTATO REGISTRADO. CLIQUE EM [+ CONTATO] PARA ADICIONAR FIXERS OU MÉDICOS.</div>`;
    } else {
      contactsContainer.innerHTML = contacts.map((c, idx) => `
        <div class="weapon-tactical-card bracket-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <input type="text" class="field-input contact-name-input" data-index="${idx}" value="${escapeHtml(c.name)}" style="font-weight: 700; color: var(--term-green); flex: 2;" placeholder="Contato..." />
            <input type="text" class="field-input contact-role-input" data-index="${idx}" value="${escapeHtml(c.role || "")}" placeholder="Papel / Ocupação..." style="flex: 2; margin-left: 0.5rem;" />
            <button class="btn-term btn-term-danger btn-term-sm btn-remove-contact" data-index="${idx}" style="margin-left: 0.5rem;">✕</button>
          </div>
          <div style="display: flex; gap: 1.5rem; margin: 0.4rem 0;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="field-label" style="margin: 0;">CONEXÃO:</span>
              <div class="stepper-tactical">
                <button class="btn-conn-dec" data-index="${idx}">-</button>
                <span class="val">${c.connection || 1}</span>
                <button class="btn-conn-inc" data-index="${idx}">+</button>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="field-label" style="margin: 0;">LEALDADE:</span>
              <div class="stepper-tactical">
                <button class="btn-loy-dec" data-index="${idx}">-</button>
                <span class="val">${c.loyalty || 1}</span>
                <button class="btn-loy-inc" data-index="${idx}">+</button>
              </div>
            </div>
          </div>
          <div>
            <input type="text" class="field-input contact-notes-input" data-index="${idx}" value="${escapeHtml(c.notes || "")}" placeholder="Local de encontro e observações..." />
          </div>
        </div>
      `).join("");
    }
  }


}

function renderNotesTab(char) {
  const notesEl = document.getElementById("char-notes");
  if (notesEl && document.activeElement !== notesEl) {
    notesEl.value = char.notes || "";
  }
}
