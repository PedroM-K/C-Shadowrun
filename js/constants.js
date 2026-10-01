/**
 * SHADOWRUN: ANARCHY - SYSTEM CONSTANTS & PRESETS
 * Fully offline, standalone character sheet data definitions for Shadowrun: Anarchy
 */

export const SCHEMA_VERSION = 1;
export const SYSTEM_NAME = "Shadowrun: Anarchy";
export const STORAGE_KEY = "sra_sheet_active_char_v2";
export const STORAGE_BACKUP_PREFIX = "sra_sheet_backup_";

export const METATYPES = {
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

export const AWAKENED_TYPES = [
  { id: "mundane", label: "Mundano (Mundane - Sem Magia/Ressonância)" },
  { id: "awakened_mage", label: "Desperto: Mago / Xamã (Awakened - Mage)" },
  { id: "awakened_adept", label: "Desperto: Adepto Físico (Adept)" },
  { id: "emerged_techno", label: "Emergido: Tecnomante (Emerged - Technomancer)" }
];

export const ATTRIBUTES = [
  { key: "str", label: "Força (STR)", short: "STR", description: "Capacidade física, dano corpo a corpo e monitor físico" },
  { key: "agi", label: "Agilidade (AGI)", short: "AGI", description: "Coordenação motora, tiro, furtividade e defesa" },
  { key: "wil", label: "Vontade (WIL)", short: "WIL", description: "Resistência mental, conjuração e monitor de atordoamento" },
  { key: "log", label: "Lógica (LOG)", short: "LOG", description: "Intelecto, hacking, eletrônica, engenharia e defesa" },
  { key: "cha", label: "Carisma (CHA)", short: "CHA", description: "Presença social, lábia, liderança e negociação" },
  { key: "edg", label: "Trunfo (EDG)", short: "EDG", description: "Sorte, determinação e reroll de dados nas sombras" },
  { key: "ess", label: "Essência (ESS)", short: "ESS", readOnly: true, description: "Integridade biológica (6.00 reduzida por Cyberware/Bioware)" }
];

export const DEFAULT_ANARCHY_SKILLS = [
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

/**
 * Normalizes character skills array to match DEFAULT_ANARCHY_SKILLS
 * preserving existing ratings and specs while applying new attributes and descriptions.
 */
export function normalizeCharacterSkills(char) {
  if (!char) return char;
  if (!Array.isArray(char.skills)) {
    char.skills = DEFAULT_ANARCHY_SKILLS.map(s => ({ ...s, rating: 0, spec: "" }));
    return char;
  }

  const existingMap = new Map();
  for (const s of char.skills) {
    if (s.id) existingMap.set(s.id, s);
    if (s.id === "vehicle") {
      existingMap.set("pilot_ground", s);
    }
  }

  char.skills = DEFAULT_ANARCHY_SKILLS.map(defaultSkill => {
    const existing = existingMap.get(defaultSkill.id);
    return {
      ...defaultSkill,
      rating: existing ? (Number(existing.rating) || 0) : 0,
      spec: existing?.spec || ""
    };
  });

  return char;
}

export const SHADOW_AMP_TYPES = [
  { id: "cyberware", label: "Cyberware (Cibernético)" },
  { id: "bioware", label: "Bioware (Biológico)" },
  { id: "spell", label: "Feitiço (Spell)" },
  { id: "adept_power", label: "Poder de Adepto (Adept Power)" },
  { id: "complex_form", label: "Forma Complexa (Complex Form)" },
  { id: "gear_amp", label: "Equipamento Especial (Amp)" }
];

/**
 * Creates a completely blank, zeroed character sheet
 * ready for full custom player creation.
 */
export function createDefaultCharacter() {
  return {
    version: SCHEMA_VERSION,
    system: SYSTEM_NAME,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    character: {
      name: "",
      alias: "",
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
    // All skills zeroed
    skills: DEFAULT_ANARCHY_SKILLS.map(s => ({ ...s, rating: 0, spec: "" })),
    knowledgeSkills: [],
    shadowAmps: [],
    qualities: [],
    weapons: [],
    armor: [],
    gear: [],
    contacts: [],
    vehicles: [],
    notes: ""
  };
}
