/**
 * SHADOWRUN: ANARCHY - RULES & DERIVED CALCULATIONS ENGINE
 * Mathematical rules and pool calculations for Shadowrun: Anarchy system
 */

import { METATYPES } from "./constants.js";

/**
 * Returns total attribute score (base + mod)
 */
export function getAttributeTotal(charData, attrKey) {
  if (!charData?.attributes?.[attrKey]) return 0;
  const attr = charData.attributes[attrKey];
  return (Number(attr.base) || 0) + (Number(attr.mod) || 0);
}

/**
 * Calculates Essence remaining based on Cyberware and Bioware Shadow Amps.
 * Standard Shadowrun starts at 6.00 Essence.
 */
export function calculateEssence(charData) {
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
export function calculatePhysicalTrackMax(charData) {
  const str = getAttributeTotal(charData, "str");
  return 8 + Math.ceil(str / 2);
}

/**
 * Stun Damage Track in Shadowrun: Anarchy:
 * SRA Rule (p. 64): 8 + ceil(WIL / 2)
 */
export function calculateStunTrackMax(charData) {
  const wil = getAttributeTotal(charData, "wil");
  return 8 + Math.ceil(wil / 2);
}

/**
 * Armor Track in Shadowrun: Anarchy:
 * Base armor equipped + metatype bonus (Troll +1 Dermal) + Cyberware dermal plating
 */
export function calculateArmorTrackMax(charData) {
  let baseArmor = Number(charData?.condition?.armorRating) || 9;

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
export function calculateWoundPenalty(charData) {
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
export function calculateDefensePool(charData) {
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
export function calculateMentalDefensePool(charData) {
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
export function calculateSkillDicePool(charData, skill, useSpecialization = false) {
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
export function calculateDerivedStats(charData) {
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
