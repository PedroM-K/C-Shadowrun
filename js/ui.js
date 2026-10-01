/**
 * SHADOWRUN: ANARCHY - CLANDESTINE OS UI RENDER ENGINE
 * Diegetic rendering of 2080 runner terminal, segmented LED meters, and tactical HUD
 */

import { store } from "./state.js";
import { METATYPES, ATTRIBUTES, SHADOW_AMP_TYPES } from "./constants.js";
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
  const ruleOfSixCb = document.getElementById("cb-rule-of-six");
  const anarchyDieCb = document.getElementById("cb-anarchy-die");
  const resultsContainer = document.getElementById("dice-modal-results");

  const pool = parseInt(poolInput.value, 10) || 1;
  const useRuleOfSix = ruleOfSixCb?.checked || false;
  const useAnarchyDie = anarchyDieCb?.checked || false;

  const roll = rollD6Pool(pool, { useRuleOfSix, useAnarchyDie });

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

  // Status Alerts
  let statusBanner = "";
  if (roll.glitchStatus === "critical_glitch") {
    statusBanner = `<div style="background: var(--term-red-dim); border: 1px solid var(--term-red); color: #ff6b81; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; padding: 0.5rem; text-align: center; border-radius: var(--radius-xs);">⚠️ FALHA CRÍTICA (CRITICAL GLITCH): 0 Sucessos com Complicação Severa!</div>`;
  } else if (roll.glitchStatus === "glitch") {
    statusBanner = `<div style="background: var(--term-amber-dim); border: 1px solid var(--term-amber); color: var(--term-amber); font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; padding: 0.45rem; text-align: center; border-radius: var(--radius-xs);">⚠️ GLITCH DETECTADO </div>`;
  }

  if (roll.anarchyDieHit) {
    statusBanner += `<div style="background: var(--term-purple-dim); border: 1px solid var(--term-purple); color: var(--term-purple); font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; padding: 0.45rem; text-align: center; border-radius: var(--radius-xs); margin-top: 0.4rem;">★  SEU DADO DE FALHA ACERTOU!</div>`;
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
      dispContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUMA DISPOSIÇÃO CADASTRADA. CLIQUE EM [+ DISPOSIÇÃO].</div>`;
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
}

function renderAttributesTab(char, derived) {
  const container = document.getElementById("attributes-grid-container");
  if (!container) return;

  container.innerHTML = ATTRIBUTES.map(attrDef => {
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
  }).join("");
}

function renderSkillsTab(char, derived) {
  const container = document.getElementById("skills-list-container");
  if (container) {
    const skills = char.skills || [];
    if (container.contains(document.activeElement) && container.querySelectorAll(".skill-tactical-item").length === skills.length) {
      // Foco ativo mantido no container de perícias
    } else {
      let currentCategory = "";
      let htmlOutput = "";

      skills.forEach((skill, idx) => {
        const pool = calculateSkillDicePool(char, skill, true);
        const cat = skill.category || "Geral";

        if (cat !== currentCategory) {
          currentCategory = cat;
          const attrUpper = (skill.attr || "").toUpperCase();
          htmlOutput += `
            <div class="skills-category-header category-${escapeHtml(skill.attr || 'default')}">
              <span class="cat-title">// ${escapeHtml(currentCategory.toUpperCase())} (${escapeHtml(attrUpper)})</span>
              <span class="cat-line"></span>
            </div>
          `;
        }

        htmlOutput += `
          <div class="skill-tactical-item" data-index="${idx}">
            <div class="skill-name-col">
              <div class="name">${escapeHtml(skill.name)}</div>
              ${skill.description ? `<div class="skill-desc">${escapeHtml(skill.description)}</div>` : ""}
            </div>
            <div class="attr-tag attr-tag-${escapeHtml(skill.attr)}">[${escapeHtml((skill.attr || "").toUpperCase())}]</div>
            <div>
              <input 
                type="text" 
                class="field-input field-input-mono skill-spec-input" 
                data-index="${idx}" 
                value="${escapeHtml(skill.spec || "")}" 
                placeholder="Especialização (+2)..." 
                style="padding: 0.25rem 0.5rem; font-size: 0.8rem;"
              />
            </div>
            <div class="stepper-tactical">
              <button class="btn-skill-dec" data-index="${idx}">-</button>
              <span class="val">${skill.rating}</span>
              <button class="btn-skill-inc" data-index="${idx}">+</button>
            </div>
            <div class="pool-box" title="Reserva Final de D6">${pool}d6</div>
            <div>
              <button 
                class="btn-term btn-term-primary btn-term-sm btn-roll-skill" 
                data-skill-name="${escapeHtml(skill.name)}" 
                data-pool="${pool}" 
                data-attr="${escapeHtml(skill.attr)}"
              >
                🎲 ROLAR
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = htmlOutput;
    }
  }

  // Knowledge Skills
  const ksContainer = document.getElementById("knowledge-skills-container");
  if (ksContainer) {
    const kSkills = char.knowledgeSkills || [];
    if (ksContainer.contains(document.activeElement) && ksContainer.querySelectorAll(".ks-name-input").length === kSkills.length) {
      // Foco ativo mantido nas perícias de conhecimento
    } else if (kSkills.length === 0) {
      ksContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUM CONHECIMENTO REGISTRADO. CLIQUE EM [+ CONHECIMENTO] PARA ADICIONAR IDIOMAS OU SABERES.</div>`;
    } else {
      ksContainer.innerHTML = kSkills.map((ks, idx) => `
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem;">
          <input type="text" class="field-input ks-name-input" data-index="${idx}" value="${escapeHtml(ks.name)}" placeholder="Perícia de Conhecimento / Idioma..." style="flex: 2;" />
          <div class="stepper-tactical">
            <button class="btn-ks-dec" data-index="${idx}">-</button>
            <span class="val">${ks.rating || 1}</span>
            <button class="btn-ks-inc" data-index="${idx}">+</button>
          </div>
          <button class="btn-term btn-term-primary btn-term-sm btn-roll-ks" data-name="${escapeHtml(ks.name)}" data-rating="${ks.rating || 1}">🎲 ROLAR</button>
          <button class="btn-term btn-term-sm btn-remove-ks" data-index="${idx}">✕</button>
        </div>
      `).join("");
    }
  }
}

function renderCombatTab(char, derived) {
  // Metric numbers
  const defVal = document.getElementById("val-defense-pool");
  const spellDefVal = document.getElementById("val-spell-defense-pool");
  const woundVal = document.getElementById("wound-penalty-display");

  if (defVal) defVal.textContent = derived.defense.total;
  if (spellDefVal) spellDefVal.textContent = derived.mentalDefense.total;
  if (woundVal) {
    const penalty = derived.woundPenalty;
    woundVal.textContent = penalty === 0 ? "0" : `${penalty} DADOS`;
    woundVal.style.color = penalty < 0 ? "var(--term-red)" : "var(--term-green)";
  }

  // Damage Tracks
  renderTacticalTrack("armor", derived.armorMax, char.condition.armorDamage || 0, "armor-cell", "val-armor-count");
  renderTacticalTrack("physical", derived.physMax, char.condition.physicalDamage || 0, "phys-cell", "val-phys-count");
  renderTacticalTrack("stun", derived.stunMax, char.condition.stunDamage || 0, "stun-cell", "val-stun-count");

  // Edge
  const edgeVal = document.getElementById("val-edge-count");
  if (edgeVal) {
    const currentEdge = char.condition.edgeCurrent ?? (char.attributes.edg?.base || 1);
    const maxEdge = char.attributes.edg?.base || 1;
    edgeVal.textContent = `${currentEdge} / ${maxEdge}`;
  }
}

function renderTacticalTrack(trackType, maxBoxes, currentDamage, cellClass, counterId) {
  const container = document.getElementById(`track-${trackType}-boxes`);
  const counter = document.getElementById(counterId);

  if (counter) counter.textContent = `${currentDamage} / ${maxBoxes}`;
  if (!container) return;

  let cellsHtml = "";
  for (let i = 1; i <= maxBoxes; i++) {
    const isMarked = i <= currentDamage;
    const isThreshold = (trackType !== "armor") && (i % 3 === 0);
    const penaltyTag = isThreshold ? `-${i / 3}` : "";

    cellsHtml += `
      <div 
        class="track-cell ${cellClass} ${isMarked ? "marked" : ""} ${isThreshold ? "threshold-penalty" : ""}" 
        data-track="${trackType}" 
        data-index="${i}"
        data-penalty="${penaltyTag}"
        title="Célula ${i} (Clique para marcar/limpar)"
      >
        ${i}
      </div>
    `;
  }

  container.innerHTML = cellsHtml;
}

function renderWeaponsTab(char) {
  const container = document.getElementById("weapons-list-container");
  if (!container) return;

  const weapons = char.weapons || [];
  if (container.contains(document.activeElement) && container.querySelectorAll(".weapon-tactical-card").length === weapons.length) {
    return;
  }
  if (weapons.length === 0) {
    container.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); padding: 2rem; text-align: center; border: 1px dashed var(--border-panel); border-radius: var(--radius-xs);">// ARSENAL VAZIO. CLIQUE EM [+ REGISTRAR ARMA] PARA ADICIONAR SUAS ARMAS DE FOGO OU CORPO A CORPO.</div>`;
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
          <button class="btn-term btn-term-primary btn-term-sm btn-roll-weapon" data-index="${idx}" data-name="${escapeHtml(w.name)}">
            🎲 TESTE DE DISPARO
          </button>
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
          <div class="field-label">PENETRAÇÃO (AP)</div>
          <input type="text" class="field-input field-input-mono wep-ap-input" data-index="${idx}" value="${escapeHtml(w.ap || "0")}" placeholder="Ex: -1" />
        </div>
        <div>
          <div class="field-label">ALCANCE</div>
          <input type="text" class="field-input wep-range-input" data-index="${idx}" value="${escapeHtml(w.range || "")}" placeholder="Ex: Perto / Médio" />
        </div>
        <div>
          <div class="field-label">MUNIÇÃO</div>
          <input type="text" class="field-input field-input-mono wep-ammo-input" data-index="${idx}" value="${escapeHtml(w.ammo || "")}" placeholder="Ex: 15 / 15" />
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
    container.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); padding: 2rem; text-align: center; border: 1px dashed var(--border-panel); border-radius: var(--radius-xs);">// NENHUMA AMPLIFICAÇÃO INSTALADA (ESSÊNCIA 100% PURA: 6.00 / 6.00). CLIQUE EM [+ NOVA AMP] PARA INSTALAR CYBERWARE, BIOWARE, FEITIÇOS OU FORMAS.</div>`;
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
      gearContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// INVENTÁRIO VAZIO. CLIQUE EM [+ ITEM] PARA ADICIONAR.</div>`;
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
      vehContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUM VEÍCULO OU DRONE REGISTRADO. CLIQUE EM [+ VEÍCULO].</div>`;
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

  // Qualities
  const qualitiesContainer = document.getElementById("qualities-list-container");
  if (qualitiesContainer) {
    const qualities = char.qualities || [];
    if (qualitiesContainer.contains(document.activeElement) && qualitiesContainer.querySelectorAll(".quality-name-input").length === qualities.length) {
      // Preservar foco em qualidades
    } else if (qualities.length === 0) {
      qualitiesContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;">// NENHUMA QUALIDADE REGISTRADA. CLIQUE EM [+ QUALIDADE].</div>`;
    } else {
      qualitiesContainer.innerHTML = qualities.map((q, idx) => `
        <div class="weapon-tactical-card bracket-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <input type="text" class="field-input quality-name-input" data-index="${idx}" value="${escapeHtml(q.name)}" style="font-weight: 700; color: var(--term-green); flex: 2;" placeholder="Qualidade..." />
            <select class="field-input quality-type-select" data-index="${idx}" style="width: 130px; margin-left: 0.5rem;">
              <option value="positive" ${q.type === "positive" ? "selected" : ""}>Positiva (+)</option>
              <option value="negative" ${q.type === "negative" ? "selected" : ""}>Negativa (-)</option>
            </select>
            <button class="btn-term btn-term-danger btn-term-sm btn-remove-quality" data-index="${idx}" style="margin-left: 0.5rem;">✕</button>
          </div>
          <div>
            <textarea class="field-input quality-effect-input" data-index="${idx}" placeholder="Descrição das regras da qualidade...">${escapeHtml(q.effect || "")}</textarea>
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
