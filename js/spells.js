export const spellDefs = [
  { id: 'fireball', name: 'Fireball', cooldown: 12, unlock: 30, effect: (state, mps) => mps * 15 + 20, art: 'assets/spells/fireball.svg', type: 'burst' },
  { id: 'surge', name: 'Mana Surge', cooldown: 36, unlock: 250, effect: () => 1.8, duration: 20, art: 'assets/spells/mana-surge.svg', type: 'boost' },
  { id: 'warp', name: 'Time Warp', cooldown: 45, unlock: 1200, effect: () => 2.2, duration: 10, art: 'assets/spells/time-warp.svg', type: 'speed' },
  { id: 'familiar', name: 'Familiar', cooldown: 30, unlock: 6500, effect: () => 12, duration: 18, art: 'assets/spells/familiar.svg', type: 'autoclick' },
  { id: 'storm', name: 'Arcane Storm', cooldown: 90, unlock: 45000, effect: (state, mps) => mps * 65 + 2000, art: 'assets/spells/arcane-storm.svg', type: 'burst' }
];

export function isSpellReady(state, id, now = Date.now()) {
  return (state.cooldowns[id] || 0) <= now;
}
