/**
 * SHADOWRUN: ANARCHY - STANDALONE TERMINAL CLIENT BUNDLE
 * 100% Client-side, runs on file:// protocol and web servers alike with ZERO CORS blocks.
 */
(function () {
  "use strict";

  // --- 1. CONSTANTS ---
  /**
 * SHADOWRUN: ANARCHY - SYSTEM CONSTANTS & PRESETS
 * Fully offline, standalone character sheet data definitions for Shadowrun: Anarchy
 */

  const SCHEMA_VERSION = 1;
  const SYSTEM_NAME = "Shadowrun: Anarchy";
  const STORAGE_KEY = "sra_sheet_active_char_v2";
  const STORAGE_ROSTER_KEY = "sra_characters_roster_v2";
  const STORAGE_ACTIVE_ID_KEY = "sra_active_character_id_v2";
  const STORAGE_BACKUP_PREFIX = "sra_sheet_backup_";

  const METATYPES = {
    Human: {
      name: "Humano",
      racialTrait: "+1 Ponto de Edge / Versatilidade",
      limits: { str: 6, agi: 6, wil: 6, log: 6, cha: 6, edg: 6 }
    },
    Elf: {
      name: "Elfo",
      racialTrait: "Visão na Penumbra (Low-Light), Charme Natural",
      limits: { str: 6, agi: 7, wil: 6, log: 6, cha: 8, edg: 5 }
    },
    Dwarf: {
      name: "Anão",
      racialTrait: "Visão Termográfica, +2 dados contra Patógenos e Toxinas",
      limits: { str: 8, agi: 6, wil: 7, log: 6, cha: 6, edg: 5 }
    },
    Ork: {
      name: "Ork",
      racialTrait: "Visão na Penumbra (Low-Light), Físico Robusto",
      limits: { str: 8, agi: 6, wil: 6, log: 5, cha: 5, edg: 5 }
    },
    Troll: {
      name: "Troll",
      racialTrait: "Visão Termográfica, +1 Armadura Dérmica natural, Alcance +1",
      limits: { str: 10, agi: 5, wil: 6, log: 5, cha: 4, edg: 5 }
    }
  };

  const AWAKENED_TYPES = [
    { id: "mundane", label: "Mundano (Mundane - Sem Magia/Ressonância)" },
    { id: "awakened_mage", label: "Desperto: Mago / Xamã (Awakened - Mage)" },
    { id: "awakened_adept", label: "Desperto: Adepto Físico (Adept)" },
    { id: "emerged_techno", label: "Emergido: Tecnomante (Emerged - Technomancer)" }
  ];

  const ATTRIBUTES = [
    { key: "str", label: "Força (STR)", short: "STR", description: "Capacidade física, dano corpo a corpo e monitor físico" },
    { key: "agi", label: "Agilidade (AGI)", short: "AGI", description: "Coordenação motora, tiro, furtividade e defesa" },
    { key: "wil", label: "Vontade (WIL)", short: "WIL", description: "Resistência mental, conjuração e monitor de atordoamento" },
    { key: "log", label: "Lógica (LOG)", short: "LOG", description: "Intelecto, hacking, eletrônica, engenharia e defesa" },
    { key: "cha", label: "Carisma (CHA)", short: "CHA", description: "Presença social, lábia, liderança e negociação" },
    { key: "edg", label: "Trunfo (EDG)", short: "EDG", description: "Sorte, determinação e reroll de dados nas sombras" },
    { key: "ess", label: "Essência (ESS)", short: "ESS", readOnly: true, description: "Integridade biológica (6.00 reduzida por Cyberware/Bioware)" }
  ];

  const DEFAULT_ANARCHY_SKILLS = [
    // 1. AGILIDADE (AGI)
    {
      id: "athletics",
      name: "Atletismo",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Correr, saltar, nadar e acrobacia."
    },
    {
      id: "firearms",
      name: "Armas de Fogo",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Pistolas, escopetas, submetralhadoras e fuzis."
    },
    {
      id: "projectiles",
      name: "Armas de Projéteis",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Arcos, bestas, armas de arremesso e certos ataques de criatura."
    },
    {
      id: "vehicle_weapons",
      name: "Armas de Veículo",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Armas montadas em veículos, armas montadas em drones e em suportes/tripés fixos."
    },
    {
      id: "heavy_weapons",
      name: "Armas Pesadas",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Metralhadoras, canhões de assalto, lança-mísseis e lança-granadas."
    },
    {
      id: "escape_artist",
      name: "Arte da Fuga",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Escapar de amarras e algemas, contorcionismo e despistar perseguidores."
    },
    {
      id: "close_combat",
      name: "Combate Corpo a Corpo",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Combate armado, combate desarmado e artes marciais."
    },
    {
      id: "stealth",
      name: "Furtividade",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Esgueirar, empalmar e prestidigitação."
    },
    {
      id: "pilot_other",
      name: "Pilotar (Outros)",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Barcos, aviões e praticamente qualquer coisa que se mova em algo diferente do chão."
    },
    {
      id: "pilot_ground",
      name: "Pilotar (Terrestres)",
      attr: "agi",
      category: "Agilidade",
      rating: 0,
      spec: "",
      description: "Carros, caminhões, motos e até tanques. Drones com rodas e esteiras também."
    },

    // 2. VONTADE (WIL)
    {
      id: "conjuring",
      name: "Convocação",
      attr: "wil",
      category: "Vontade",
      rating: 0,
      spec: "",
      description: "Invocação e banimento de espíritos. Apenas magistas. Impossível seu uso destreinado."
    },
    {
      id: "astral_combat",
      name: "Combate Astral",
      attr: "wil",
      category: "Vontade",
      rating: 0,
      spec: "",
      description: "Combate astral/de espíritos. Apenas plano astral. Apenas magistas."
    },
    {
      id: "close_combat_spirits",
      name: "Combate Corpo a Corpo (Espíritos)",
      attr: "wil",
      category: "Vontade",
      rating: 0,
      spec: "",
      description: "Apenas ao atacar espíritos (usa Vontade)."
    },
    {
      id: "sorcery",
      name: "Feitiçaria",
      attr: "wil",
      category: "Vontade",
      rating: 0,
      spec: "",
      description: "Conjuração, conjuração ritual, encantação e contramágica. Apenas magistas. Impossível seu uso destreinado."
    },
    {
      id: "survival",
      name: "Sobrevivência",
      attr: "wil",
      category: "Vontade",
      rating: 0,
      spec: "",
      description: "Sobrevivência na natureza, navegação e jejuar."
    },

    // 3. LÓGICA (LOG)
    {
      id: "biotech",
      name: "Biotecnologia",
      attr: "log",
      category: "Lógica",
      rating: 0,
      spec: "",
      description: "Primeiros socorros, medicina e cibertecnologia."
    },
    {
      id: "electronics",
      name: "Eletrônica",
      attr: "log",
      category: "Lógica",
      rating: 0,
      spec: "",
      description: "Hardware e software de computadores, reparo de ciberdeck."
    },
    {
      id: "engineering",
      name: "Engenharia",
      attr: "log",
      category: "Lógica",
      rating: 0,
      spec: "",
      description: "Reparo de automóveis, reparo de aeronaves e reparo de embarcações."
    },
    {
      id: "hacking",
      name: "Hackear",
      attr: "log",
      category: "Lógica",
      rating: 0,
      spec: "",
      description: "Hackear computadores e cibercombate."
    },
    {
      id: "tracking",
      name: "Rastrear",
      attr: "log",
      category: "Lógica",
      rating: 0,
      spec: "",
      description: "Rastreio físico, rastreio pela Matriz e perseguição."
    },
    {
      id: "tasking",
      name: "Tarefa",
      attr: "log",
      category: "Lógica",
      rating: 0,
      spec: "",
      description: "Invocar sprites, tecer formas complexas e tarefas da Matriz. Apenas tecnomantes. Impossível seu uso destreinado."
    },

    // 4. CARISMA (CHA)
    {
      id: "disguise",
      name: "Disfarce",
      attr: "cha",
      category: "Carisma",
      rating: 0,
      spec: "",
      description: "Camuflagem, cosméticos, fantasias e alteração digital."
    },
    {
      id: "intimidation",
      name: "Intimidação",
      attr: "cha",
      category: "Carisma",
      rating: 0,
      spec: "",
      description: "Influência, interrogatório e tortura."
    },
    {
      id: "negotiation",
      name: "Negociação",
      attr: "cha",
      category: "Carisma",
      rating: 0,
      spec: "",
      description: "Barganha, contratos e diplomacia."
    },
    {
      id: "con",
      name: "Trapaça",
      attr: "cha",
      category: "Carisma",
      rating: 0,
      spec: "",
      description: "Trapaça e charlatanismo, atuação, performance e etiqueta."
    }
  ];

  const ATTRIBUTE_SKILL_PRESETS = {
    agi: [
      { name: "Atletismo", desc: "correr, saltar, nadar e acrobacia." },
      { name: "Armas de Fogo", desc: "pistolas, escopetas, submetralhadoras e fuzis." },
      { name: "Armas de Projéteis", desc: "arcos, bestas, armas de arremesso e certos ataques de criatura." },
      { name: "Armas de Veículo", desc: "armas montadas em veículos, armas montadas em drones, e armas em suportes/tripés fixos." },
      { name: "Armas Pesadas", desc: "metralhadoras, canhões de assalto, lança-mísseis e lança-granadas." },
      { name: "Arte da Fuga", desc: "escapar de amarras e algemas, contorcionismo e despistar perseguidores." },
      { name: "Combate Corpo a Corpo", desc: "combate corpo a corpo armado, combate corpo a corpo desarmado e artes marciais." },
      { name: "Furtividade", desc: "esgueirar, empalmar e prestidigitação." },
      { name: "Pilotar (Outros)", desc: "barcos, aviões e praticamente qualquer coisa que se mova em algo diferente do chão." },
      { name: "Pilotar (Terrestres)", desc: "carros, caminhões, motos e até tanques. Drones com rodas e esteiras também." }
    ],
    wil: [
      { name: "Convocação", desc: "a invocação e o banimento de espíritos. Apenas magistas. Impossível seu uso destreinado." },
      { name: "Combate Astral", desc: "combate astral/de espíritos. Apenas plano astral. Apenas magistas." },
      { name: "Combate Corpo a Corpo", desc: "apenas ao atacar espíritos." },
      { name: "Feitiçaria", desc: "Conjuração, conjuração ritual, encantação e contramágica. Apenas magistas. Impossível seu uso destreinado." },
      { name: "Sobrevivência", desc: "sobrevivência na natureza, navegação e jejuar." }
    ],
    log: [
      { name: "Biotecnologia", desc: "primeiros socorros, medicina e cibertecnologia." },
      { name: "Eletrônica", desc: "hardware e software de computadores, reparo de ciberdeck." },
      { name: "Engenharia", desc: "reparo de automóveis, reparo de aeronaves e reparo de embarcações." },
      { name: "Hackear", desc: "hackear computadores e cibercombate." },
      { name: "Perícias de Conhecimento", desc: "idiomas, conhecimento de interesse e conhecimento profissional." },
      { name: "Rastrear", desc: "rastreio físico, rastreio pela Matriz e perseguição." },
      { name: "Tarefa", desc: "invocar sprites, tecer formas complexas e outras tarefas da Matriz. Apenas tecnomantes. Impossível seu uso destreinado." }
    ],
    cha: [
      { name: "Disfarce", desc: "camuflagem, cosméticos, fantasias e alteração digital." },
      { name: "Intimidação", desc: "influência, interrogatório e tortura." },
      { name: "Negociação", desc: "barganha, contratos e diplomacia." },
      { name: "Trapaça", desc: "trapaça e charlatanismo, atuação, performance e etiqueta." }
    ]
  };

  const ACTION_SKILL_ATTRIBUTES = [
    { key: "agi", name: "Agilidade", short: "AGI" },
    { key: "wil", name: "Vontade", short: "WIL" },
    { key: "log", name: "Lógica", short: "LOG" },
    { key: "cha", name: "Carisma", short: "CHA" }
  ];

  const OFFICIAL_SKILL_DESCRIPTIONS = {};
  Object.entries(ATTRIBUTE_SKILL_PRESETS).forEach(([attrKey, list]) => {
    list.forEach(item => {
      OFFICIAL_SKILL_DESCRIPTIONS[`${attrKey}_${item.name}`] = item.desc;
      if (!OFFICIAL_SKILL_DESCRIPTIONS[item.name]) {
        OFFICIAL_SKILL_DESCRIPTIONS[item.name] = item.desc;
      }
    });
  });

  function getSkillDescription(name, attr) {
    if (attr && ATTRIBUTE_SKILL_PRESETS[attr]) {
      const found = ATTRIBUTE_SKILL_PRESETS[attr].find(p => p.name === name);
      if (found) return found.desc;
    }
    return OFFICIAL_SKILL_DESCRIPTIONS[name] || "";
  }


  /**
   * Normalizes character skills array.
   * Cleans up old all-zero 25-skill arrays to allow clean user-added skills per attribute.
   */
  function normalizeCharacterSkills(char) {
    if (!char) return char;
    if (!Array.isArray(char.skills)) {
      char.skills = [];
      return char;
    }

    // Se o personagem tiver 20 ou mais perícias e todas com rating 0 e sem especialização
    // (caso clássico da ficha padrão antiga que pré-populava 25 perícias), limpa para começar dinâmico
    if (char.skills.length >= 20 && char.skills.every(s => (s.rating || 0) === 0 && !s.spec)) {
      char.skills = [];
    }

    return char;
  }

  const SHADOW_AMP_TYPES = [
    { id: "spell", label: "Feitiço (Spell)" },
    { id: "telesma", label: "Telesma (Foco / Item Mágico)" },
    { id: "adept_power", label: "Poder de Adepto (Adept Power)" },
    { id: "cyberware", label: "Cibernético (Cyberware)" },
    { id: "bioware", label: "Biônico (Bioware)" },
    { id: "cyberdeck", label: "Ciberdeck (Hardware de Matriz)" },
    { id: "program", label: "Programa (Software de Matriz)" },
    { id: "creature_power", label: "Poder de Criatura (Espírito / PDM)" }
  ];

  const SRA_QUALITIES_PRESETS = [
    // Qualidades Positivas
    { name: "Ambidestro", type: "positive", effect: "+1 dado ao atacar com armas em ambas as mãos." },
    { name: "Ás do Volante", type: "positive", effect: "+2 dados em testes de pilotagem em perseguições ou manobras evasivas." },
    { name: "Calar a Boca", type: "positive", effect: "Gaste 1 Ponto de Trama para interromper a Narração de um oponente." },
    { name: "Código de Honra", type: "positive", effect: "+1 dado em testes sociais com indivíduos que respeitam seu código moral." },
    { name: "Durão", type: "positive", effect: "+1 caixa de dano adicional no Monitor Físico ou de Atordoamento." },
    { name: "Firme Sob Fogo", type: "positive", effect: "Ignora a primeira penalidade de -1 dado de ferimento durante tiroteios." },
    { name: "Guerreiro Nato", type: "positive", effect: "+1 dado em testes de Combate Corpo a Corpo." },
    { name: "Mente Blindada", type: "positive", effect: "+2 dados para resistir a manipulações mentais e invasões da Matriz." },
    { name: "Primeiros Socorros Rápidos", type: "positive", effect: "Pode estabilizar ferimentos graves sem kit médico cirúrgico completo." },
    { name: "Reflexos Rápidos", type: "positive", effect: "Ganha +1 ação narrativa preventiva ou bônus na iniciativa de combate." },
    { name: "Resistência a Toxinas", type: "positive", effect: "+2 dados em testes para resistir a patógenos, drogas e venenos." },
    { name: "Sentidos Aguçados", type: "positive", effect: "+2 dados em testes de Percepção para um sentido específico (visão/audição)." },
    { name: "Sorte Grande", type: "positive", effect: "Recupera 1 Ponto de Trunfo (Edge) adicional após descansar." },
    { name: "Visão Astral", type: "positive", effect: "Capacidade de perceber o plano astral e auras sem conjuração ativa." },

    // Qualidades Negativas
    { name: "Alvo Marcado", type: "negative", effect: "Rosto notório e procurado; -2 dados em disfarce e discrição pública." },
    { name: "Código Rígido", type: "negative", effect: "Incapaz de agir de forma desonrosa, atacar pelas costas ou ferir inocentes." },
    { name: "Dívida Pesada", type: "negative", effect: "Deve grande soma a agiotas ou sindicatos do crime; cobranças constantes." },
    { name: "Fobia", type: "negative", effect: "Sofre -2 dados em todas as ações na presença imediata do objeto do seu pavor." },
    { name: "Inimigo Jurado", type: "negative", effect: "Uma corporação, gangue ou fixer rival persegue você ativamente." },
    { name: "Pavio Curto", type: "negative", effect: "Deve ser bem-sucedido em teste de Vontade para não reagir com violência a ofensas." },
    { name: "Problemas com a Lei", type: "negative", effect: "Atenção constante de patrulhas policiais e seguranças corporativos." },
    { name: "Reputação Ruim", type: "negative", effect: "-2 dados em testes de Negociação e primeiros contatos com novos fixers." },
    { name: "Sensível à Matriz", type: "negative", effect: "Sofre +1 de dano de atordoamento adicional em ataques de biofeedback." },
    { name: "SINner (Cidadão Legal)", type: "negative", effect: "Possui registro civil e biometria na rede; muito mais fácil de rastrear." },
    { name: "Vício / Dependência", type: "negative", effect: "-2 dados em todas as paradas de dados se passar 24h sem a substância." }
  ];

  /**
   * Creates a completely blank, zeroed character sheet
   * ready for full custom player creation.
   */
  function createDefaultCharacter(customAlias = "") {
    const charId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initialName = customAlias || "";
    return {
      id: charId,
      version: SCHEMA_VERSION,
      system: SYSTEM_NAME,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      character: {
        name: initialName,
        alias: initialName,
        metatype: "Human",
        archetype: "",
        awakenedType: "mundane",
        gender: "",
        age: "",
        height: "",
        weight: "",
        karma: 0,
        totalKarma: 0,
        nuyen: 0,
        plotPoints: 0,
        maxPlotPoints: 5
      },
      // Core Attributes at base 1
      attributes: {
        str: { base: 1, mod: 0 },
        agi: { base: 1, mod: 0 },
        wil: { base: 1, mod: 0 },
        log: { base: 1, mod: 0 },
        cha: { base: 1, mod: 0 },
        edg: { base: 1, mod: 0 }
      },
      // Condition Tracks zeroed
      condition: {
        physicalDamage: 0,
        stunDamage: 0,
        armorDamage: 0,
        armorRating: 9,
        edgeCurrent: 1
      },
      // Empty narrative lists
      cues: [],
      dispositions: [],
      // Skills dynamically added by attribute
      skills: [],
      knowledgeSkills: [],
      shadowAmps: [],
      // 3 Qualidades Padrão SRA (2 positivas e 1 negativa)
      qualities: [
        { id: "q_pos_1", name: "", type: "positive", effect: "" },
        { id: "q_pos_2", name: "", type: "positive", effect: "" },
        { id: "q_neg_1", name: "", type: "negative", effect: "" }
      ],
      weapons: [],
      armor: [],
      gear: [],
      contacts: [],
      vehicles: [],
      notes: ""
    };
  }


  // --- 2. RULES ENGINE ---
  /**
 * SHADOWRUN: ANARCHY - RULES & DERIVED CALCULATIONS ENGINE
 * Mathematical rules and pool calculations for Shadowrun: Anarchy system
 */


  /**
   * Returns total attribute score (base + mod)
   */
  function getAttributeTotal(charData, attrKey) {
    if (!charData?.attributes?.[attrKey]) return 0;
    const attr = charData.attributes[attrKey];
    return (Number(attr.base) || 0) + (Number(attr.mod) || 0);
  }

  /**
   * Calculates Essence remaining based on Cyberware and Bioware Shadow Amps.
   * Standard Shadowrun starts at 6.00 Essence.
   */
  function calculateEssence(charData) {
    const amps = Array.isArray(charData?.shadowAmps) ? charData.shadowAmps : [];
    let totalEssenceLoss = 0;

    for (const amp of amps) {
      if (amp.type === "cyberware" || amp.type === "bioware") {
        const cost = Math.max(0, Number(amp.essenceCost) || 0);
        totalEssenceLoss += cost;
      }
    }

    const remaining = Math.max(0, 6.0 - totalEssenceLoss);
    return {
      remaining: Number(remaining.toFixed(2)),
      totalLoss: Number(totalEssenceLoss.toFixed(2))
    };
  }

  /**
   * Physical Damage Track in Shadowrun: Anarchy:
   * SRA Rule (p. 64): 8 + ceil(STR / 2)
   */
  function calculatePhysicalTrackMax(charData) {
    const str = getAttributeTotal(charData, "str");
    return 8 + Math.ceil(str / 2);
  }

  /**
   * Stun Damage Track in Shadowrun: Anarchy:
   * SRA Rule (p. 64): 8 + ceil(WIL / 2)
   */
  function calculateStunTrackMax(charData) {
    const wil = getAttributeTotal(charData, "wil");
    return 8 + Math.ceil(wil / 2);
  }

  /**
   * Armor Track in Shadowrun: Anarchy:
   * Base armor equipped + metatype bonus (Troll +1 Dermal) + Cyberware dermal plating
   */
  function calculateArmorTrackMax(charData) {
    const storedArmor = Number(charData?.condition?.armorRating);
    let baseArmor = Number.isFinite(storedArmor) && storedArmor > 0 ? storedArmor : 9;

    // Troll bonus (+1 Dermal Armor)
    if (charData?.character?.metatype === "Troll") {
      baseArmor += 1;
    }

    // Shadow amps with dermal armor
    const amps = Array.isArray(charData?.shadowAmps) ? charData.shadowAmps : [];
    for (const amp of amps) {
      const text = (amp.name + " " + (amp.effect || "")).toLowerCase();
      if (text.includes("dermal") || text.includes("dérmica") || text.includes("blindagem")) {
        const bonus = Number(amp.level) || 1;
        baseArmor += bonus;
      }
    }

    return Math.max(0, baseArmor);
  }

  /**
   * Wound Penalties in Shadowrun: Anarchy (p. 64):
   * -1 modifier for every full 3 boxes marked on Physical or Stun tracks.
   */
  function calculateWoundPenalty(charData) {
    const physDamage = Math.max(0, Number(charData?.condition?.physicalDamage) || 0);
    const stunDamage = Math.max(0, Number(charData?.condition?.stunDamage) || 0);

    const physPenalty = Math.floor(physDamage / 3);
    const stunPenalty = Math.floor(stunDamage / 3);

    return -(physPenalty + stunPenalty);
  }

  /**
   * Defense Pool in Shadowrun: Anarchy (p. 43):
   * Standard Physical Defense: Agility + Logic + Wound Penalty
   */
  function calculateDefensePool(charData) {
    const agi = getAttributeTotal(charData, "agi");
    const log = getAttributeTotal(charData, "log");
    const wounds = calculateWoundPenalty(charData);

    // Check wired reflexes / combat sense amp bonus
    let ampBonus = 0;
    const amps = Array.isArray(charData?.shadowAmps) ? charData.shadowAmps : [];
    for (const amp of amps) {
      const text = (amp.name + " " + (amp.effect || "")).toLowerCase();
      if (text.includes("wired reflexes") || text.includes("reflexos com fio") || text.includes("defesa")) {
        ampBonus += Number(amp.level) || 1;
      }
    }

    const total = Math.max(0, agi + log + ampBonus + wounds);
    return {
      base: agi + log,
      ampBonus,
      wounds,
      total
    };
  }

  /**
   * Mental / Spell Defense Pool in Shadowrun: Anarchy:
   * Willpower + Logic + Wound Penalty
   */
  function calculateMentalDefensePool(charData) {
    const wil = getAttributeTotal(charData, "wil");
    const log = getAttributeTotal(charData, "log");
    const wounds = calculateWoundPenalty(charData);
    const total = Math.max(0, wil + log + wounds);
    return {
      base: wil + log,
      wounds,
      total
    };
  }

  /**
   * Calculates Skill Dice Pool for Shadowrun: Anarchy:
   * Attribute + Skill Rating (+2 if Specialization active) + Wound Penalty
   */
  function calculateSkillDicePool(charData, skill, useSpecialization = false) {
    if (!skill) return 0;
    const rating = Number(skill.rating) || 0;
    const attrVal = getAttributeTotal(charData, skill.attr);
    const specBonus = (useSpecialization && skill.spec) ? 2 : 0;
    const wounds = calculateWoundPenalty(charData);

    return Math.max(0, rating + attrVal + specBonus + wounds);
  }

  /**
   * Summarizes all derived stats for clean reactive rendering
   */
  function calculateDerivedStats(charData) {
    const essence = calculateEssence(charData);
    const physMax = calculatePhysicalTrackMax(charData);
    const stunMax = calculateStunTrackMax(charData);
    const armorMax = calculateArmorTrackMax(charData);
    const woundPenalty = calculateWoundPenalty(charData);
    const defense = calculateDefensePool(charData);
    const mentalDefense = calculateMentalDefensePool(charData);

    return {
      essence,
      physMax,
      stunMax,
      armorMax,
      woundPenalty,
      defense,
      mentalDefense
    };
  }


  // --- 3. D6 DICE ROLLER ---
  /**
 * SHADOWRUN: ANARCHY - MATRIX D6 DICE ROLLER ENGINE
 * Rolls d6 pools, counts hits (5-6), handles the SRA Anarchy Die (Dado de Anarquia),
 * Glitches, and Edge exploding sixes (Rule of Six).
 */

  function rollD6Pool(poolSize, options = {}) {
    const { useRuleOfSix = false, useAnarchyDie = false } = options;
    const diceCount = Math.max(1, Math.floor(poolSize));
    const dice = [];
    let onesCount = 0;
    let hits = 0;
    let anarchyDieResult = null;

    function rollDie() {
      return Math.floor(Math.random() * 6) + 1;
    }

    // Roll standard dice
    for (let i = 0; i < diceCount; i++) {
      const isAnarchyDie = useAnarchyDie && i === 0;
      const val = rollDie();

      const dieObj = {
        value: val,
        isHit: val >= 5,
        isOne: val === 1,
        isAnarchyDie,
        exploded: false
      };

      if (isAnarchyDie) {
        anarchyDieResult = dieObj;
      }

      dice.push(dieObj);
      if (val >= 5) hits++;
      if (val === 1) onesCount++;
    }

    // Edge / Rule of Six (Push the Limit)
    if (useRuleOfSix) {
      let explodedIndices = [];
      for (let i = 0; i < dice.length; i++) {
        if (dice[i].value === 6) explodedIndices.push(i);
      }

      let explosionRounds = 0;
      while (explodedIndices.length > 0 && explosionRounds < 10) {
        explosionRounds++;
        const nextExplosions = [];
        for (const _ of explodedIndices) {
          const extraVal = rollDie();
          const extraDie = {
            value: extraVal,
            isHit: extraVal >= 5,
            isOne: extraVal === 1,
            isAnarchyDie: false,
            exploded: true
          };
          dice.push(extraDie);
          if (extraVal >= 5) hits++;
          if (extraVal === 1) onesCount++;
          if (extraVal === 6) nextExplosions.push(dice.length - 1);
        }
        explodedIndices = nextExplosions;
      }
    }

    // Glitch detection:
    // In Anarchy: if Anarchy die is 1 -> Anarchy Glitch!
    // In standard rules: if more than half of dice rolled are 1s -> Glitch!
    const isThresholdGlitch = onesCount > (dice.length / 2);
    const isAnarchyGlitch = useAnarchyDie && anarchyDieResult?.value === 1;
    const isGlitch = isAnarchyGlitch || isThresholdGlitch;

    let glitchStatus = isGlitch ? "glitch" : "none";

    return {
      poolSize,
      dice,
      hits,
      onesCount,
      glitchStatus,
      isAnarchyGlitch,
      anarchyDieHit: useAnarchyDie && (anarchyDieResult?.value >= 5),
      useRuleOfSix,
      useAnarchyDie,
      timestamp: new Date().toLocaleTimeString()
    };
  }


  // --- 4. LOCAL PERSISTENCE & MULTI-SHEET ROSTER ---
  /**
   * SHADOWRUN: ANARCHY - LOCAL STORAGE PERSISTENCE & MULTI-SHEET ROSTER
   * 100% Client-side local storage with automatic fallback, multi-sheet collection, and safety snapshots
   */

  function loadRoster() {
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

  function saveRoster(roster) {
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

  function getActiveCharacterId() {
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

  function setActiveCharacterId(id) {
    try {
      if (id) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
      }
    } catch (err) {
      console.warn("Could not set active character ID:", err);
    }
  }

  function loadCharacter() {
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

  function saveCharacter(charData) {
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

  function createCharacterInRoster(nameOrAlias) {
    const newChar = createDefaultCharacter(nameOrAlias || "Novo Runner");
    const roster = loadRoster();
    roster.push(newChar);
    saveRoster(roster);
    setActiveCharacterId(newChar.id);
    saveCharacter(newChar);
    return newChar;
  }

  function duplicateCharacterInRoster(charId) {
    const roster = loadRoster();
    const source = roster.find(c => c.id === charId);
    if (!source) {
      throw new Error("Ficha de origem não encontrada para duplicação.");
    }

    const copy = JSON.parse(JSON.stringify(source));
    copy.id = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const currentAlias = copy.character?.alias || copy.character?.name || "Runner";
    copy.character.alias = `${currentAlias} (Cópia)`;
    copy.character.name = copy.character.alias;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();

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

  function deleteCharacterFromRoster(charId) {
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

  function backupCharacter(charData) {
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

  function clearLocalData() {
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

  function hasSavedData() {
    try {
      return !!(localStorage.getItem(STORAGE_ROSTER_KEY) || localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  }


  // --- 5. JSON IMPORT / EXPORT ---
  /**
 * SHADOWRUN: ANARCHY - JSON IMPORT & EXPORT ENGINE
 * Handles safe file downloads, file uploads, schema validation, and data migration
 */


  /**
   * Validates whether an imported object has a valid Shadowrun: Anarchy character structure
   */
  function validateCharacterData(data) {
    const errors = [];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { valid: false, errors: ["O arquivo JSON não contém um objeto de dados válido."] };
    }

    // Version check
    if (typeof data.version !== "number") {
      errors.push("Campo obrigatório 'version' ausente ou inválido.");
    }

    // Character identity structure
    if (!data.character || typeof data.character !== "object") {
      errors.push("Estrutura 'character' ausente ou corrompida.");
    }

    // Attributes structure
    if (!data.attributes || typeof data.attributes !== "object") {
      errors.push("Estrutura 'attributes' ausente ou corrompida.");
    }

    // Arrays structure check
    const expectedArrays = ["skills", "shadowAmps", "qualities", "weapons", "gear", "contacts"];
    for (const arrKey of expectedArrays) {
      if (data[arrKey] && !Array.isArray(data[arrKey])) {
        errors.push(`O campo '${arrKey}' deve ser uma lista (array).`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Migration engine to support legacy or future version adaptations
   */
  function migrateCharacterData(rawData) {
    const defaultTemplate = createDefaultCharacter();
    const currentVersion = rawData.version || 1;

    // Clone deeply
    const migrated = JSON.parse(JSON.stringify(rawData));

    // Ensure system identifier
    migrated.system = migrated.system || SYSTEM_NAME;

    // Fill in any missing Anarchy fields safely
    migrated.character = {
      ...defaultTemplate.character,
      ...(migrated.character || {})
    };

    migrated.attributes = {
      ...defaultTemplate.attributes,
      ...(migrated.attributes || {})
    };

    for (const key of ["str", "agi", "wil", "log", "cha", "edg"]) {
      if (!migrated.attributes[key]) {
        migrated.attributes[key] = { base: 1, mod: 0 };
      } else {
        migrated.attributes[key].base = Number(migrated.attributes[key].base) || 1;
        migrated.attributes[key].mod = Number(migrated.attributes[key].mod) || 0;
      }
    }

    migrated.condition = {
      ...defaultTemplate.condition,
      ...(migrated.condition || {})
    };

    // Anarchy narrative elements
    migrated.cues = Array.isArray(migrated.cues) ? migrated.cues : defaultTemplate.cues;
    migrated.dispositions = Array.isArray(migrated.dispositions) ? migrated.dispositions : defaultTemplate.dispositions;

    migrated.skills = Array.isArray(migrated.skills) ? migrated.skills : defaultTemplate.skills;
    normalizeCharacterSkills(migrated);
    migrated.knowledgeSkills = Array.isArray(migrated.knowledgeSkills) ? migrated.knowledgeSkills : [];
    migrated.shadowAmps = Array.isArray(migrated.shadowAmps) ? migrated.shadowAmps : defaultTemplate.shadowAmps;
    migrated.qualities = Array.isArray(migrated.qualities) ? migrated.qualities : [];
    migrated.weapons = Array.isArray(migrated.weapons) ? migrated.weapons : [];
    migrated.armor = Array.isArray(migrated.armor) ? migrated.armor : [];
    migrated.gear = Array.isArray(migrated.gear) ? migrated.gear : [];
    migrated.contacts = Array.isArray(migrated.contacts) ? migrated.contacts : [];
    migrated.vehicles = Array.isArray(migrated.vehicles) ? migrated.vehicles : [];
    migrated.notes = typeof migrated.notes === "string" ? migrated.notes : "";

    migrated.version = SCHEMA_VERSION;

    return migrated;
  }

  /**
   * Triggers a client-side file download of the character JSON
   */
  function exportCharacterToFile(charData) {
    try {
      const charName = charData?.character?.alias || charData?.character?.name || "anarchy-runner";
      const safeFilename = charName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const filename = `${safeFilename || "runner"}.json`;
      const jsonString = JSON.stringify(charData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (err) {
      console.error("Export failed:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Reads and parses an uploaded JSON file from an input[type=file]
   */
  function readJsonFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error("Nenhum arquivo selecionado."));
      }

      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        return reject(new Error("Formato inválido. Por favor selecione um arquivo '.json'."));
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const validation = validateCharacterData(parsed);

          if (!validation.valid) {
            return reject(new Error("Arquivo JSON incompatível com a ficha:\n" + validation.errors.join("\n")));
          }

          const migrated = migrateCharacterData(parsed);
          resolve(migrated);
        } catch (err) {
          reject(new Error("Erro ao interpretar arquivo JSON. Verifique se o arquivo está corrompido: " + err.message));
        }
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo no navegador."));
      };

      reader.readAsText(file, "UTF-8");
    });
  }


  // --- 6. REACTIVE STATE STORE ---
  /**
 * SHADOWRUN: ANARCHY - REACTIVE STATE STORE
 * Central reactive store with debounced auto-save and subscriber broadcasts
 */




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

    getRoster() {
      return loadRoster();
    }

    getActiveId() {
      return this.character?.id || getActiveCharacterId();
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

    update(mutationFn, triggerSave = true, meta = { type: "mutation" }) {
      if (typeof mutationFn === "function") {
        mutationFn(this.character);
      }
      this.notify(meta);
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

    switchCharacter(charId) {
      if (this.character && this.character.id === charId) {
        return this.character;
      }
      this.forceSaveNow();
      setActiveCharacterId(charId);
      this.character = loadCharacter();
      this.notify({ type: "switch_character", characterId: charId });
      return this.character;
    }

    createCharacter(nameOrAlias = "Novo Runner") {
      this.forceSaveNow();
      const newChar = createCharacterInRoster(nameOrAlias);
      this.character = newChar;
      this.notify({ type: "roster_change", action: "create", characterId: newChar.id });
      return newChar;
    }

    duplicateCharacter(charId, switchToCopy = true) {
      this.forceSaveNow();
      const targetId = charId || this.character?.id;
      const copy = duplicateCharacterInRoster(targetId);
      if (switchToCopy) {
        setActiveCharacterId(copy.id);
        this.character = copy;
        saveCharacter(copy);
      }
      this.notify({ type: "roster_change", action: "duplicate", characterId: copy.id });
      return copy;
    }

    deleteCharacter(charId) {
      const targetId = charId || this.character?.id;
      const result = deleteCharacterFromRoster(targetId);
      if (this.character && this.character.id === targetId) {
        this.character = loadCharacter();
      }
      this.notify({ type: "roster_change", action: "delete", characterId: targetId });
      return result;
    }

    resetToDefault() {
      if (this.character) {
        backupCharacter(this.character);
      }
      const fresh = createDefaultCharacter("Novo Runner");
      saveCharacter(fresh);
      this.character = fresh;
      this.notify({ type: "full_replace" });
      return fresh;
    }
  }

  const store = new CharacterStore();
  window.SRA_STORE = store;
  window.SRA_STATE = store;


  // --- 7. TACTICAL UI RENDERING ---
  /**
 * SHADOWRUN: ANARCHY - CLANDESTINE OS UI RENDER ENGINE
 * Diegetic rendering of 2080 runner terminal, segmented LED meters, and tactical HUD
 */





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

  function showToast(message, type = "info") {
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
  function openDiceModal(options = {}) {
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

  function closeDiceModal() {
    const modal = document.getElementById("modal-dice-roller");
    if (modal) modal.classList.remove("active");
  }

  /**
   * Execute D6 Roll inside Modal
   */
  function executeModalRoll() {
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
  function renderSheetsModal(roster = [], activeId = "") {
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
  function renderApp(char, derived, eventMeta = {}) {
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

      // Se estiver editando o máximo da armadura, atualiza o track imediatamente
      // sem reconstruir o restante da aba nem roubar o foco do campo.
      if (target && target.classList.contains("armor-max-input")) {
        const armorMax = Math.max(1, Math.min(30, parseInt(target.value, 10) || 1));
        const armorDamage = Math.min(
          Math.max(0, Number(char.condition?.armorDamage) || 0),
          armorMax
        );
        renderTacticalTrack("armor", armorMax, armorDamage, "armor-cell", "val-armor-count");
        target.value = armorMax;
      }

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
        cuesContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;"></div>`;
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
        dispContainer.innerHTML = `<div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); padding: 0.5rem 0;"></div>`;
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

    // Damage Tracks
    const armorRatingInput = document.getElementById("armor-rating-input");
    if (armorRatingInput && document.activeElement !== armorRatingInput) {
      armorRatingInput.value = Math.max(1, Number(char.condition?.armorRating) || 9);
    }
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
      if (gear.length === 0) {
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


  // --- 8. APP CONTROLLER & EVENT DELEGATION ---
  /**
 * SHADOWRUN: ANARCHY - CLANDESTINE OS APP CONTROLLER
 * Bootstraps the tactical terminal, wires events, tabs, modals, and PWA registration
 */





  function bootTerminal() {
    try {
      // Subscribe UI to store updates
      store.subscribe((char, derived, eventMeta) => {
        renderApp(char, derived, eventMeta);
      });

      store.init();

      // Wire navigation, header, modals and dynamic delegations
      setupNavigation();
      setupHeaderAndDataControls();
      setupModals();
      setupDelegatedEvents();
      setupMatrixRain();
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
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");

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
          sidebarBackdrop?.classList.remove("active");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    mobileToggle?.addEventListener("click", () => {
      const isOpen = sidebar?.classList.toggle("open");
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.toggle("active", !!isOpen);
      }
    });

    sidebarBackdrop?.addEventListener("click", () => {
      sidebar?.classList.remove("open");
      sidebarBackdrop.classList.remove("active");
    });
  }

  /**
   * Header Controls & Multi-Sheet Data Management
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

    // Manual Save Action
    const handleSaveSheet = () => {
      const res = store.forceSaveNow();
      if (res.success) {
        const char = store.get();
        const alias = char.character?.alias || char.character?.name || "Runner";
        showToast(`FICHA SALVA COM SUCESSO // ${alias}`, "success");
        renderSheetsModal(store.getRoster(), store.getActiveId());
      } else {
        showToast("ERRO AO SALVAR FICHA LOCALMENTE", "error");
      }
    };
    document.getElementById("btn-header-save")?.addEventListener("click", handleSaveSheet);

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
    document.getElementById("btn-modal-export")?.addEventListener("click", triggerExport);

    // Import JSON triggers
    const fileInput = document.getElementById("file-import-input");
    const triggerImportClick = () => fileInput?.click();

    document.getElementById("btn-header-import")?.addEventListener("click", triggerImportClick);
    document.getElementById("btn-data-import")?.addEventListener("click", triggerImportClick);
    document.getElementById("btn-modal-import")?.addEventListener("click", triggerImportClick);

    fileInput?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const confirmed = window.confirm(
          "CONFIRMAR IMPORTAÇÃO DE FICHA:\n\nA ficha do arquivo será adicionada à sua coleção de fichas sem apagar suas outras fichas."
        );
        if (!confirmed) {
          fileInput.value = "";
          return;
        }

        const parsedData = await readJsonFile(file);
        if (!parsedData.id) {
          parsedData.id = `char_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        }
        saveCharacter(parsedData);
        store.switchCharacter(parsedData.id);
        showToast(`RUNNER IMPORTADO // ${parsedData.character.alias || parsedData.character.name}`, "success");
      } catch (err) {
        showToast(`ERRO: ${err.message}`, "error");
      } finally {
        fileInput.value = "";
      }
    });

    // Create New Runner
    const handleNewRunner = () => {
      const alias = window.prompt("CRIAR NOVA FICHA // Digite o nome ou Nom de Guerre do Runner:", "Novo Runner");
      if (alias !== null) {
        const newChar = store.createCharacter(alias.trim() || "Novo Runner");
        showToast(`NOVA FICHA CRIADA // ${newChar.character.alias || newChar.character.name}`, "success");
      }
    };
    document.getElementById("btn-header-new")?.addEventListener("click", handleNewRunner);
    document.getElementById("btn-data-new")?.addEventListener("click", handleNewRunner);

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
   * Modal Controllers (Dice Roller, Sheets Manager, Backdrop Click, Esc Key)
   */
  function setupModals() {
    // Dice Modal
    document.getElementById("btn-close-dice-modal")?.addEventListener("click", closeDiceModal);
    document.getElementById("btn-modal-roll-action")?.addEventListener("click", executeModalRoll);

    // Sheets Manager Modal
    const sheetsModal = document.getElementById("modal-sheets-manager");
    const openSheetsModal = () => {
      if (sheetsModal) {
        renderSheetsModal(store.getRoster(), store.getActiveId());
        sheetsModal.classList.add("active");
        setTimeout(() => {
          document.getElementById("input-new-sheet-name")?.focus();
        }, 50);
      }
    };

    const closeSheetsModal = () => {
      sheetsModal?.classList.remove("active");
    };

    document.getElementById("btn-header-sheets")?.addEventListener("click", openSheetsModal);
    document.getElementById("btn-sidebar-sheets")?.addEventListener("click", openSheetsModal);
    document.getElementById("btn-close-sheets-modal")?.addEventListener("click", closeSheetsModal);

    // Create sheet in modal
    document.getElementById("btn-modal-create-sheet")?.addEventListener("click", () => {
      const input = document.getElementById("input-new-sheet-name");
      const val = input ? input.value.trim() : "";
      const newChar = store.createCharacter(val || "Novo Runner");
      if (input) input.value = "";
      showToast(`NOVA FICHA CRIADA // ${newChar.character.alias || newChar.character.name}`, "success");
      renderSheetsModal(store.getRoster(), store.getActiveId());
    });

    document.getElementById("input-new-sheet-name")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("btn-modal-create-sheet")?.click();
      }
    });

    // Delegated events for cards inside Sheets Modal
    sheetsModal?.addEventListener("click", (e) => {
      const target = e.target.closest("button");
      if (!target) return;

      if (target.id === "btn-modal-save-now") {
        const res = store.forceSaveNow();
        if (res.success) {
          showToast("FICHA SALVA COM SUCESSO", "success");
          renderSheetsModal(store.getRoster(), store.getActiveId());
        }
        return;
      }

      if (target.classList.contains("btn-open-sheet")) {
        const charId = target.getAttribute("data-id");
        if (charId) {
          store.switchCharacter(charId);
          const char = store.get();
          showToast(`FICHA ABERTA // ${char.character?.alias || char.character?.name}`, "success");
          closeSheetsModal();
        }
        return;
      }

      if (target.classList.contains("btn-duplicate-sheet")) {
        const charId = target.getAttribute("data-id");
        if (charId) {
          const copy = store.duplicateCharacter(charId, true);
          showToast(`FICHA DUPLICADA COM SUCESSO // ${copy.character?.alias}`, "success");
          renderSheetsModal(store.getRoster(), store.getActiveId());
        }
        return;
      }

      if (target.classList.contains("btn-delete-sheet")) {
        const charId = target.getAttribute("data-id");
        const roster = store.getRoster();
        const targetChar = roster.find(c => c.id === charId);
        const targetName = targetChar ? (targetChar.character?.alias || targetChar.character?.name || "Runner") : "este Runner";
        const confirmed = window.confirm(
          `CONFIRMAR EXCLUSÃO DA FICHA:\n\nDeseja excluir permanentemente a ficha "${targetName}"?\nEsta ação não poderá ser desfeita.`
        );
        if (confirmed && charId) {
          store.deleteCharacter(charId);
          showToast(`FICHA "${targetName}" EXCLUÍDA`, "info");
          renderSheetsModal(store.getRoster(), store.getActiveId());
        }
        return;
      }
    });

    // Universal backdrop and ESC handling
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
        char.knowledgeSkills.push({ id: `ks_${Date.now()}`, name: "Novo Conhecimento / Idioma" });
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
          range: "Perto",
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

    // Qualidades Add (SRA)
    document.getElementById("btn-add-quality")?.addEventListener("click", () => {
      store.update(char => {
        if (!char.qualities) char.qualities = [];
        const posCount = char.qualities.filter(q => q.type === "positive").length;
        const negCount = char.qualities.filter(q => q.type === "negative").length;
        const defaultType = posCount < 2 ? "positive" : (negCount < 1 ? "negative" : "positive");
        char.qualities.push({
          id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: "",
          type: defaultType,
          effect: ""
        });
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
        const cur = char.condition.edgeCurrent ?? 1;
        char.condition.edgeCurrent = Math.max(0, cur - 1);
      });
    });
    document.getElementById("btn-edge-inc")?.addEventListener("click", () => {
      store.update(char => {
        const cur = char.condition.edgeCurrent ?? 1;
        char.condition.edgeCurrent = cur + 1;
      });
    });

    // Delegated Click Interactions (Track Cells, Steppers, Rolls, Removals)
    mainDeck.addEventListener("click", (e) => {
      const target = e.target;

      // Armor maximum steppers
      if (target.classList.contains("btn-armor-max-inc") || target.classList.contains("btn-armor-max-dec")) {
        const current = Math.max(1, Math.min(30, Number(store.get()?.condition?.armorRating) || 9));
        const delta = target.classList.contains("btn-armor-max-inc") ? 1 : -1;
        const value = Math.max(1, Math.min(30, current + delta));

        store.update(char => {
          if (!char.condition) char.condition = {};
          char.condition.armorRating = value;
          char.condition.armorDamage = Math.min(
            Math.max(0, Number(char.condition.armorDamage) || 0),
            value
          );
        });

        return;
      }

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

        // Atualiza somente a linha da perícia, preservando o foco do campo de especialização.
        const row = target.closest(".skill-tactical-item");
        const char = store.get();
        const skill = char?.skills?.[idx];

        if (row && skill) {
          const val = row.querySelector(".stepper-tactical .val");
          const poolBox = row.querySelector(".pool-box");
          const rollBtn = row.querySelector(".btn-roll-skill");
          const pool = calculateSkillDicePool(char, skill, true);

          if (val) val.textContent = skill.rating;
          if (poolBox) poolBox.textContent = `${pool}d6`;
          if (rollBtn) rollBtn.setAttribute("data-pool", pool);
        }

        return;
      }
      if (target.classList.contains("btn-skill-dec")) {
        const idx = parseInt(target.getAttribute("data-index"), 10);
        store.update(char => {
          if (char.skills[idx]) char.skills[idx].rating = Math.max(0, (char.skills[idx].rating || 0) - 1);
        });

        // Atualiza somente a linha da perícia, preservando o foco do campo de especialização.
        const row = target.closest(".skill-tactical-item");
        const char = store.get();
        const skill = char?.skills?.[idx];

        if (row && skill) {
          const val = row.querySelector(".stepper-tactical .val");
          const poolBox = row.querySelector(".pool-box");
          const rollBtn = row.querySelector(".btn-roll-skill");
          const pool = calculateSkillDicePool(char, skill, true);

          if (val) val.textContent = skill.rating;
          if (poolBox) poolBox.textContent = `${pool}d6`;
          if (rollBtn) rollBtn.setAttribute("data-pool", pool);
        }

        return;
      }

      // Action Skills Remove
      const removeSkillBtn = target.closest(".btn-remove-skill");
      if (removeSkillBtn) {
        const idx = parseInt(removeSkillBtn.getAttribute("data-index"), 10);
        store.update(char => {
          if (char.skills && char.skills[idx] !== undefined) {
            char.skills.splice(idx, 1);
          }
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

      // Knowledge Skills Removal
      if (target.classList.contains("btn-remove-ks")) {

        const idx = parseInt(target.getAttribute("data-index"), 10);
        store.update(char => char.knowledgeSkills?.splice(idx, 1));
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

      // Weapons Remove
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
        const amp = store.get()?.shadowAmps?.[idx];
        const value = target.closest(".stepper-tactical")?.querySelector(".val");
        if (value && amp) value.textContent = `Nv ${amp.level || 1}`;
        return;
      }
      if (target.classList.contains("btn-amp-lvl-dec")) {
        const idx = parseInt(target.getAttribute("data-index"), 10);
        store.update(char => {
          if (char.shadowAmps?.[idx]) char.shadowAmps[idx].level = Math.max(1, (char.shadowAmps[idx].level || 1) - 1);
        });
        const amp = store.get()?.shadowAmps?.[idx];
        const value = target.closest(".stepper-tactical")?.querySelector(".val");
        if (value && amp) value.textContent = `Nv ${amp.level || 1}`;
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
        const contact = store.get()?.contacts?.[idx];
        const value = target.closest(".stepper-tactical")?.querySelector(".val");
        if (value && contact) value.textContent = contact.connection ?? 1;
        return;
      }
      if (target.classList.contains("btn-conn-dec")) {
        const idx = parseInt(target.getAttribute("data-index"), 10);
        store.update(char => {
          if (char.contacts?.[idx]) char.contacts[idx].connection = Math.max(1, (char.contacts[idx].connection || 1) - 1);
        });
        const contact = store.get()?.contacts?.[idx];
        const value = target.closest(".stepper-tactical")?.querySelector(".val");
        if (value && contact) value.textContent = contact.connection ?? 1;
        return;
      }
      if (target.classList.contains("btn-loy-inc")) {
        const idx = parseInt(target.getAttribute("data-index"), 10);
        store.update(char => {
          if (char.contacts?.[idx]) char.contacts[idx].loyalty = Math.min(6, (char.contacts[idx].loyalty || 1) + 1);
        });
        const contact = store.get()?.contacts?.[idx];
        const value = target.closest(".stepper-tactical")?.querySelector(".val");
        if (value && contact) value.textContent = contact.loyalty ?? 1;
        return;
      }
      if (target.classList.contains("btn-loy-dec")) {
        const idx = parseInt(target.getAttribute("data-index"), 10);
        store.update(char => {
          if (char.contacts?.[idx]) char.contacts[idx].loyalty = Math.max(1, (char.contacts[idx].loyalty || 1) - 1);
        });
        const contact = store.get()?.contacts?.[idx];
        const value = target.closest(".stepper-tactical")?.querySelector(".val");
        if (value && contact) value.textContent = contact.loyalty ?? 1;
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

      // Condition Track Quick Actions
      if (target.classList.contains("btn-track-inc")) {
        const track = target.getAttribute("data-track");
        store.update(char => {
          const key = `${track}Damage`;
          const derived = store.getDerived();
          const maxKey = track === "armor" ? "armorMax" : (track === "physical" ? "physMax" : "stunMax");
          const max = derived[maxKey] || 10;
          char.condition[key] = Math.min(max, (char.condition[key] || 0) + 1);
        });
        return;
      }
      if (target.classList.contains("btn-track-dec")) {
        const track = target.getAttribute("data-track");
        store.update(char => {
          const key = `${track}Damage`;
          char.condition[key] = Math.max(0, (char.condition[key] || 0) - 1);
        });
        return;
      }
      if (target.classList.contains("btn-track-clear")) {
        const track = target.getAttribute("data-track");
        store.update(char => {
          char.condition[`${track}Damage`] = 0;
        });
        return;
      }
    });

    // Delegated Input/Change Handlers
    mainDeck.addEventListener("input", (e) => {
      const target = e.target;

      if (target.classList.contains("armor-max-input")) {
        const value = Math.max(1, Math.min(30, parseInt(target.value, 10) || 1));
        target.value = value;
        store.update(char => {
          if (!char.condition) char.condition = {};
          char.condition.armorRating = value;
          char.condition.armorDamage = Math.min(
            Math.max(0, Number(char.condition.armorDamage) || 0),
            value
          );
        }, true, { isTyping: true, sourceTarget: target });
        return;
      }

      // Compatibilidade com fichas antigas que ainda tenham a classe anterior.
      if (target.classList.contains("armor-rating-input")) {
        const value = Math.max(1, Math.min(30, parseInt(target.value, 10) || 1));
        target.value = value;
        store.update(char => {
          if (!char.condition) char.condition = {};
          char.condition.armorRating = value;
          char.condition.armorDamage = Math.min(
            Math.max(0, Number(char.condition.armorDamage) || 0),
            value
          );
        }, true, { isTyping: true, sourceTarget: target });
        return;
      }

      const idx = parseInt(target.getAttribute("data-index"), 10);
      if (isNaN(idx)) return;

      const typingMeta = { isTyping: true, sourceTarget: target };

      if (target.classList.contains("skill-spec-input")) {
        store.update(char => { if (char.skills?.[idx]) char.skills[idx].spec = target.value; }, true, typingMeta);
        return;
      }
      if (target.classList.contains("skill-custom-name-input")) {
        store.update(char => { if (char.skills?.[idx]) char.skills[idx].name = target.value; }, true, typingMeta);
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
      if (target.classList.contains("wep-range-input")) {
        store.update(char => { if (char.weapons?.[idx]) char.weapons[idx].range = target.value; }, true, typingMeta);
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

      // Qualidades Fields (Texto Livre)
      if (target.classList.contains("quality-name-input")) {
        store.update(char => {
          if (char.qualities?.[idx]) {
            char.qualities[idx].name = target.value;
          }
        }, true, typingMeta);
        return;
      }

      if (target.classList.contains("quality-effect-input")) {
        store.update(char => {
          if (char.qualities?.[idx]) {
            char.qualities[idx].effect = target.value;
          }
        }, true, typingMeta);
        return;
      }

    });

    mainDeck.addEventListener("change", (e) => {
      const target = e.target;

      // Quality Type Select
      if (target.classList.contains("quality-type-select")) {
        const idx = parseInt(target.getAttribute("data-index"), 10);
        if (!isNaN(idx)) {
          store.update(char => {
            if (char.qualities?.[idx]) {
              char.qualities[idx].type = target.value;
            }
          });
        }
        return;
      }

      const picker = target.closest(".skill-picker-select");
      if (picker) {
        const attrKey = picker.getAttribute("data-attr") || "agi";
        const selectedVal = picker.value;
        if (!selectedVal) return;

        const attrPresets = ATTRIBUTE_SKILL_PRESETS[attrKey] || [];
        const presetObj = attrPresets.find(p => p.name === selectedVal);

        const attrNames = {
          str: "Força",
          agi: "Agilidade",
          wil: "Vontade",
          log: "Lógica",
          cha: "Carisma"
        };

        store.update(char => {
          if (!char.skills) char.skills = [];

          if (selectedVal === "__custom__") {
            char.skills.push({
              id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              name: "Nova Perícia",
              attr: attrKey,
              category: attrNames[attrKey] || attrKey,
              rating: 1,
              spec: "",
              description: "Perícia personalizada",
              isCustom: true
            });
          } else {
            char.skills.push({
              id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              name: selectedVal,
              attr: attrKey,
              category: attrNames[attrKey] || attrKey,
              rating: 1,
              spec: "",
              description: presetObj ? presetObj.desc : (getSkillDescription(selectedVal, attrKey) || ""),
              isCustom: false
            });
          }
        });
        picker.selectedIndex = 0;
        return;
      }

      const idx = parseInt(target.getAttribute("data-index"), 10);
      if (isNaN(idx)) return;

      if (target.classList.contains("amp-type-select")) {
        store.update(char => { if (char.shadowAmps?.[idx]) char.shadowAmps[idx].type = target.value; });
        return;
      }

    });
  }

  /**
   * Matrix Binary Rain Background Animation
   * Lightweight, high-performance canvas loop rendering falling binary (0 & 1) and hex fragments
   */
  function setupMatrixRain() {
    const canvas = document.getElementById("matrix-rain-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = "0101010101100101ABCDEF01";
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));
    }

    window.addEventListener("resize", resize);

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS para estabilidade e baixo consumo

    function draw(currentTime) {
      requestAnimationFrame(draw);

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Efeito de rastro translúcido escuro
      ctx.fillStyle = "rgba(5, 6, 8, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (y > 0) {
          // Cabeça da coluna mais brilhante, cauda verde fosforescente
          if (Math.random() > 0.88) {
            ctx.fillStyle = "#ffffff";
          } else if (Math.random() > 0.5) {
            ctx.fillStyle = "#00ff66";
          } else {
            ctx.fillStyle = "#009933";
          }
          ctx.fillText(text, x, y);
        }

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    requestAnimationFrame(draw);
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

  console.log("[SRA Terminal] Clandestine OS active and initialized successfully.");
})();
