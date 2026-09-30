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
  { key: "edg", label: "Edge (EDG)", short: "EDG", description: "Sorte, determinação e reroll de dados nas sombras" },
  { key: "ess", label: "Essência (ESS)", short: "ESS", readOnly: true, description: "Integridade biológica (6.00 reduzida por Cyberware/Bioware)" }
];

export const DEFAULT_ANARCHY_SKILLS = [
  // Físicas / Combate
  { id: "athletics", name: "Atletismo (Athletics)", attr: "str", category: "Físico", rating: 0, spec: "" },
  { id: "close_combat", name: "Combate Corpo a Corpo (Close Combat)", attr: "agi", category: "Combate", rating: 0, spec: "" },
  { id: "firearms", name: "Armas de Fogo (Firearms)", attr: "agi", category: "Combate", rating: 0, spec: "" },
  { id: "heavy_weapons", name: "Armas Pesadas (Heavy Weapons)", attr: "agi", category: "Combate", rating: 0, spec: "" },
  { id: "projectiles", name: "Projéteis (Projectiles)", attr: "agi", category: "Combate", rating: 0, spec: "" },
  { id: "stealth", name: "Furtividade (Stealth)", attr: "agi", category: "Físico", rating: 0, spec: "" },
  { id: "vehicle", name: "Veículos (Piloting/Driving)", attr: "agi", category: "Veículos", rating: 0, spec: "" },

  // Mágicas / Sobrenaturais
  { id: "sorcery", name: "Feitiçaria (Sorcery)", attr: "wil", category: "Magia", rating: 0, spec: "" },
  { id: "conjuring", name: "Conjuração de Espíritos (Conjuring)", attr: "wil", category: "Magia", rating: 0, spec: "" },
  { id: "astral_combat", name: "Combate Astral (Astral Combat)", attr: "wil", category: "Magia", rating: 0, spec: "" },

  // Técnicas / Matriz
  { id: "biotech", name: "Biotecnologia / Medicina (Biotech)", attr: "log", category: "Técnico", rating: 0, spec: "" },
  { id: "electronics", name: "Eletrônica (Electronics)", attr: "log", category: "Técnico", rating: 0, spec: "" },
  { id: "engineering", name: "Engenharia / Reparos (Engineering)", attr: "log", category: "Técnico", rating: 0, spec: "" },
  { id: "hacking", name: "Hacking / Cybercombate", attr: "log", category: "Técnico", rating: 0, spec: "" },
  { id: "tracking", name: "Rastreamento / Investigação (Tracking)", attr: "log", category: "Técnico", rating: 0, spec: "" },
  { id: "tasking", name: "Tasking / Tecnomancia", attr: "log", category: "Técnico", rating: 0, spec: "" },

  // Sociais
  { id: "con", name: "Lábia / Trapaça (Con)", attr: "cha", category: "Social", rating: 0, spec: "" },
  { id: "disguise", name: "Disfarce (Disguise)", attr: "cha", category: "Social", rating: 0, spec: "" },
  { id: "intimidation", name: "Intimidação (Intimidation)", attr: "cha", category: "Social", rating: 0, spec: "" },
  { id: "negotiation", name: "Negociação / Etiqueta", attr: "cha", category: "Social", rating: 0, spec: "" }
];

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
      armorRating: 0,
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
