export const generatorDefs = [
  { id: 'tower', name: 'Apprentice Tower', baseCost: 10, growthRate: 1.14, production: 0.35, unlockRequirement: 0, art: 'assets/buildings/apprentice-tower.svg' },
  { id: 'well', name: 'Mana Well', baseCost: 105, growthRate: 1.16, production: 2.4, unlockRequirement: 65, art: 'assets/buildings/mana-well.svg' },
  { id: 'library', name: 'Arcane Library', baseCost: 900, growthRate: 1.17, production: 14.5, unlockRequirement: 600, art: 'assets/buildings/arcane-library.svg' },
  { id: 'forge', name: 'Enchantment Forge', baseCost: 8800, growthRate: 1.195, production: 88, unlockRequirement: 7800, art: 'assets/buildings/enchantment-forge.svg' },
  { id: 'observatory', name: 'Astral Observatory', baseCost: 105000, growthRate: 1.215, production: 610, unlockRequirement: 68000, art: 'assets/buildings/astral-observatory.svg' },
  { id: 'citadel', name: 'Runic Citadel', baseCost: 1850000, growthRate: 1.232, production: 4300, unlockRequirement: 1200000, art: 'assets/buildings/apprentice-tower.svg' },
  { id: 'nexus', name: 'Aether Nexus', baseCost: 36000000, growthRate: 1.245, production: 31000, unlockRequirement: 22000000, art: 'assets/buildings/mana-well.svg' },
  { id: 'rift', name: 'Chrono Rift Engine', baseCost: 820000000, growthRate: 1.258, production: 250000, unlockRequirement: 450000000, art: 'assets/buildings/arcane-library.svg' },
  { id: 'prism', name: 'Stellar Prism Array', baseCost: 19000000000, growthRate: 1.269, production: 1950000, unlockRequirement: 9500000000, art: 'assets/buildings/enchantment-forge.svg' },
  { id: 'throne', name: 'Empyrean Throne', baseCost: 420000000000, growthRate: 1.281, production: 15000000, unlockRequirement: 220000000000, art: 'assets/buildings/astral-observatory.svg' }
];

export function initializeGenerators(state) {
  for (const g of generatorDefs) state.generators[g.id] = state.generators[g.id] || 0;
}

export function generatorCost(def, owned, amount = 1) {
  let cost = 0;
  for (let i = 0; i < amount; i += 1) cost += def.baseCost * def.growthRate ** (owned + i);
  return cost;
}
