import { generatorDefs } from './generators.js';

export const upgradeDefs = [
  { id: 'runes', name: 'Empowered Runes', cost: 350, mult: 1.35, text: 'Generators +35%', art: 'assets/icons/mana-crystal.svg' },
  { id: 'staff', name: 'Soul Staff', cost: 3200, mult: 1.75, text: 'Generators +75%', art: 'assets/icons/wizard-sigil.svg' },
  { id: 'leyline', name: 'Leyline Binding', cost: 25000, mult: 2.4, text: 'Generators +140%', art: 'assets/icons/arcane-star.svg' },
  { id: 'constellation', name: 'Constellation Lattice', cost: 4200000, mult: 3.1, text: 'Generators +210%', art: 'assets/icons/arcane-star.svg' },
  { id: 'echoforge', name: 'Echoforge Cores', cost: 950000000, mult: 4.4, text: 'Generators +340%', art: 'assets/icons/mana-crystal.svg' },
  { id: 'divinity', name: 'Crown of Divinity', cost: 180000000000, mult: 6.8, text: 'Generators +580%', art: 'assets/icons/wizard-sigil.svg' }
];

export function productionPerSecond(state, spellBoost = 1) {
  const base = generatorDefs.reduce((sum, g) => sum + state.generators[g.id] * g.production, 0);
  const upgrades = upgradeDefs.reduce((m, u) => m * (state.upgrades[u.id] ? u.mult : 1), 1);
  const achievementBoost = 1 + Object.keys(state.achievements).length * 0.02;
  const prestige = 1 + state.arcaneKnowledge * 0.05;
  return base * upgrades * achievementBoost * prestige * spellBoost;
}

export function knowledgeGain(totalMana) {
  return Math.floor((Math.sqrt(totalMana)) / 1000);
}

export function formatNumber(value) {
  if (value < 1000) return value.toFixed(1);
  const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi'];
  let idx = -1;
  let n = value;
  while (n >= 1000 && idx < units.length - 1) {
    n /= 1000;
    idx += 1;
  }
  return `${n.toFixed(2)}${units[idx]}`;
}
