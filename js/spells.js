export const spellDefs = [
  {
    id: 'arcane-compound-interest',
    name: 'Arcane Compound Interest',
    cooldown: 45,
    unlock: 500,
    duration: 40,
    effect: (state) => ({
      rate: 0.0005 + state.arcaneKnowledge * 0.00001,
      duration: 40 + Math.floor(state.arcaneKnowledge * 0.08)
    }),
    art: 'assets/spells/mana-surge.svg',
    type: 'compound',
    school: 'Idle Scaling',
    description: 'Compounds mana production every second while active. Resets when it expires.'
  },
  {
    id: 'temporal-echo',
    name: 'Temporal Echo',
    cooldown: 30,
    unlock: 1800,
    effect: () => ({ window: 10, efficiency: 1.5 }),
    art: 'assets/spells/time-warp.svg',
    type: 'echo',
    school: 'Hybrid',
    description: 'Replays your recent mana gains at amplified efficiency.'
  },
  {
    id: 'void-taxation',
    name: 'Void Taxation',
    cooldown: 55,
    unlock: 9000,
    duration: 15,
    effect: () => ({ drain: 0.2, mult: 4 }),
    art: 'assets/spells/arcane-storm.svg',
    type: 'sacrifice',
    school: 'Risk–Reward',
    description: 'Sacrifice current mana for a major temporary generation surge.'
  },
  {
    id: 'leyline-saturation',
    name: 'Leyline Saturation',
    cooldown: 70,
    unlock: 26000,
    duration: 30,
    effect: () => ({ perBuilding: 0.01 }),
    art: 'assets/spells/mana-surge.svg',
    type: 'leyline',
    school: 'Idle',
    description: 'Each building scales with how many of that same building you own.'
  },
  {
    id: 'astral-fragmentation',
    name: 'Astral Fragmentation',
    cooldown: 60,
    unlock: 75000,
    duration: 20,
    effect: () => ({ fragments: 5, critChance: 0.2, critMult: 10 }),
    art: 'assets/spells/arcane-storm.svg',
    type: 'fragment',
    school: 'Burst',
    description: 'Splits production into fragments that can critically spike mana.'
  },
  {
    id: 'eternal-embers',
    name: 'Eternal Embers',
    cooldown: 24,
    unlock: 140000,
    duration: 45,
    effect: () => ({ stackGain: 0.02, decayPerSecond: 0.003 }),
    art: 'assets/spells/fireball.svg',
    type: 'embers',
    school: 'Persistent Stack',
    description: 'Manual spell casts build global production stacks that decay slowly.'
  },
  {
    id: 'chrono-acceleration-field',
    name: 'Chrono Acceleration Field',
    cooldown: 85,
    unlock: 420000,
    duration: 20,
    effect: () => 1.5,
    art: 'assets/spells/time-warp.svg',
    type: 'speed',
    school: 'Utility',
    description: 'Increases production tick speed for fast combo windows.'
  },
  {
    id: 'dimensional-arbitrage',
    name: 'Dimensional Arbitrage',
    cooldown: 75,
    unlock: 1100000,
    duration: 30,
    effect: () => ({ conversion: 0.05 }),
    art: 'assets/spells/familiar.svg',
    type: 'arbitrage',
    school: 'Conversion',
    description: 'Converts idle throughput into temporary spell power amplification.'
  },
  {
    id: 'runic-overload',
    name: 'Runic Overload',
    cooldown: 110,
    unlock: 2500000,
    duration: 25,
    effect: () => ({ perSpell: 0.4 }),
    art: 'assets/spells/mana-surge.svg',
    type: 'overload',
    school: 'Scaling Burst',
    description: 'Gain production for every different active spell currently running.'
  },
  {
    id: 'infinite-reflection',
    name: 'Infinite Reflection',
    cooldown: 125,
    unlock: 9000000,
    duration: 35,
    effect: (state) => ({ bonusPct: Math.log10(state.lifetimeMana + 10) / 100 }),
    art: 'assets/spells/arcane-storm.svg',
    type: 'reflection',
    school: 'Meta Scaling',
    description: 'Boosts production based on the logarithm of lifetime mana.'
  }
];

export function isSpellReady(state, id, now = Date.now()) {
  return (state.cooldowns[id] || 0) <= now;
}
