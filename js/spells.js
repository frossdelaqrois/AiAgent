export const spellDefs = [
  { id: 'magic-missile', name: 'Magic Missile', cooldown: 12, unlock: 30, effect: (state, mps) => mps * 15 + 20, art: 'assets/spells/fireball.svg', type: 'burst', school: 'Evocation', description: 'Instantly earns a burst of mana based on current production.' },
  { id: 'gem-resonance', name: 'Gem Resonance', cooldown: 36, unlock: 250, effect: () => 1.8, duration: 20, art: 'assets/spells/mana-surge.svg', type: 'boost', school: 'Incantation', description: 'Increases mana gains for a short duration.' },
  { id: 'spell-focus', name: 'Spell Focus', cooldown: 45, unlock: 1200, effect: () => 2.2, duration: 10, art: 'assets/spells/time-warp.svg', type: 'speed', school: 'Evocation', description: 'Accelerates spell cycling and cast tempo for combo windows.' },
  { id: 'conjure-lesser-elemental', name: 'Conjure Lesser Elemental', cooldown: 30, unlock: 6500, effect: () => 12, duration: 18, art: 'assets/spells/familiar.svg', type: 'autoclick', school: 'Summoning', description: 'Summons an elemental that autocasts clicks while active.' },
  { id: 'voidbolt', name: 'Voidbolt', cooldown: 90, unlock: 45000, effect: (state, mps) => mps * 65 + 2000, art: 'assets/spells/arcane-storm.svg', type: 'burst', school: 'Evocation', description: 'Instantly earns a large mana burst and scales with game progress.' },
  { id: 'kelphiors-black-beam', name: "Kelphior's Black Beam", cooldown: 120, unlock: 850000, effect: (state, mps) => mps * 140 + 450000, art: 'assets/spells/arcane-storm.svg', type: 'burst', school: 'Evocation', description: 'A late-game evocation with very high instant payout.' },
  { id: 'temporal-distortion', name: 'Temporal Distortion', cooldown: 150, unlock: 18000000, effect: () => 4.2, duration: 14, art: 'assets/spells/time-warp.svg', type: 'speed', school: 'Evocation', description: 'Warps time to speed up game ticks and spell loops.' },
  { id: 'void-automaton', name: 'Void Automaton', cooldown: 180, unlock: 320000000, effect: () => 320, duration: 20, art: 'assets/spells/familiar.svg', type: 'autoclick', school: 'Summoning', description: 'Maintains heavy autoclick pressure during long-duration combos.' }
];

export function isSpellReady(state, id, now = Date.now()) {
  return (state.cooldowns[id] || 0) <= now;
}
