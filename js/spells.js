export const spellDefs = [
  { id: 'magic-missile', name: 'Magic Missile', cooldown: 10, unlock: 25, effect: (state, mps) => mps * 12 + 35, art: 'assets/spells/fireball.svg', type: 'burst', school: 'Evocation', description: 'Instantly earns a burst of mana based on current production.' },
  { id: 'gem-resonance', name: 'Gem Resonance', cooldown: 34, unlock: 220, effect: () => 1.7, duration: 22, art: 'assets/spells/mana-surge.svg', type: 'boost', school: 'Incantation', description: 'Increases mana gains for a short duration.' },
  { id: 'spell-focus', name: 'Spell Focus', cooldown: 48, unlock: 1500, effect: () => 2, duration: 12, art: 'assets/spells/time-warp.svg', type: 'speed', school: 'Evocation', description: 'Accelerates spell cycling and cast tempo for combo windows.' },
  { id: 'conjure-lesser-elemental', name: 'Conjure Lesser Elemental', cooldown: 38, unlock: 8000, effect: () => 11, duration: 16, art: 'assets/spells/familiar.svg', type: 'autoclick', school: 'Summoning', description: 'Summons an elemental that autocasts clicks while active.' },
  { id: 'voidbolt', name: 'Voidbolt', cooldown: 95, unlock: 70000, effect: (state, mps) => mps * 55 + 3500, art: 'assets/spells/arcane-storm.svg', type: 'burst', school: 'Evocation', description: 'Instantly earns a large mana burst and scales with game progress.' },
  { id: 'kelphiors-black-beam', name: "Kelphior's Black Beam", cooldown: 130, unlock: 1800000, effect: (state, mps) => mps * 120 + 750000, art: 'assets/spells/arcane-storm.svg', type: 'burst', school: 'Evocation', description: 'A late-game evocation with very high instant payout.' },
  { id: 'temporal-distortion', name: 'Temporal Distortion', cooldown: 160, unlock: 48000000, effect: () => 3.7, duration: 12, art: 'assets/spells/time-warp.svg', type: 'speed', school: 'Evocation', description: 'Warps time to speed up game ticks and spell loops.' },
  { id: 'void-automaton', name: 'Void Automaton', cooldown: 210, unlock: 900000000, effect: () => 280, duration: 18, art: 'assets/spells/familiar.svg', type: 'autoclick', school: 'Summoning', description: 'Maintains heavy autoclick pressure during long-duration combos.' }
];

export function isSpellReady(state, id, now = Date.now()) {
  return (state.cooldowns[id] || 0) <= now;
}
