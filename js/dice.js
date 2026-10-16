/**
 * SHADOWRUN: ANARCHY - MATRIX D6 DICE ROLLER ENGINE
 * Rolls d6 pools, counts hits (5-6), handles the SRA Anarchy Die (Dado de Anarquia),
 * Glitches, and Edge exploding sixes (Rule of Six).
 */

export function rollD6Pool(poolSize, options = {}) {
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
