import { generatorDefs } from './generators.js';

export const upgradeDefs = [
  { id: 'runes', name: 'Empowered Runes', cost: 380, mult: 1.3, text: 'Generators +30%', art: 'assets/icons/mana-crystal.svg' },
  { id: 'staff', name: 'Soul Staff', cost: 3400, mult: 1.65, text: 'Generators +65%', art: 'assets/icons/wizard-sigil.svg' },
  { id: 'leyline', name: 'Leyline Binding', cost: 31000, mult: 2.1, text: 'Generators +110%', art: 'assets/icons/arcane-star.svg' },
  { id: 'aether-lens', name: 'Aether Lens', cost: 260000, mult: 1.9, text: 'Generators +90%', art: 'assets/icons/mana-crystal.svg' },
  { id: 'constellation', name: 'Constellation Lattice', cost: 5600000, mult: 2.6, text: 'Generators +160%', art: 'assets/icons/arcane-star.svg' },
  { id: 'runic-surge', name: 'Runic Surge Reactor', cost: 78000000, mult: 2.25, text: 'Generators +125%', art: 'assets/icons/wizard-sigil.svg' },
  { id: 'echoforge', name: 'Echoforge Cores', cost: 1550000000, mult: 3.3, text: 'Generators +230%', art: 'assets/icons/mana-crystal.svg' },
  { id: 'astral-loom', name: 'Astral Loom', cost: 23000000000, mult: 2.7, text: 'Generators +170%', art: 'assets/icons/arcane-star.svg' },
  { id: 'divinity', name: 'Crown of Divinity', cost: 480000000000, mult: 4.8, text: 'Generators +380%', art: 'assets/icons/wizard-sigil.svg' }
];

export function productionPerSecond(state, spellBoost = 1) {
  const base = generatorDefs.reduce((sum, g) => sum + state.generators[g.id] * g.production, 0);
  const upgrades = upgradeDefs.reduce((m, u) => m * (state.upgrades[u.id] ? u.mult : 1), 1);
  const achievementBoost = 1 + Object.keys(state.achievements).length * 0.02;
  const prestige = 1 + state.arcaneKnowledge * 0.05;
  return base * upgrades * achievementBoost * prestige * spellBoost;
}

export function knowledgeGain(totalMana) {
  if (totalMana < 5e4) return 0;
  const early = Math.sqrt(totalMana) / 1300;
  const late = Math.log10(totalMana + 1) ** 3.2;
  return Math.floor(early + late - 7.5);
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
