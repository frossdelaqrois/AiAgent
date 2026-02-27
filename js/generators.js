export const generatorDefs = [
  { id: 'tower', name: 'Apprentice Tower', baseCost: 12, growthRate: 1.15, production: 0.3, unlockRequirement: 0, art: 'assets/buildings/apprentice-tower.svg' },
  { id: 'well', name: 'Mana Well', baseCost: 120, growthRate: 1.17, production: 2.2, unlockRequirement: 70, art: 'assets/buildings/mana-well.svg' },
  { id: 'library', name: 'Arcane Library', baseCost: 950, growthRate: 1.18, production: 13, unlockRequirement: 650, art: 'assets/buildings/arcane-library.svg' },
  { id: 'forge', name: 'Enchantment Forge', baseCost: 8400, growthRate: 1.2, production: 80, unlockRequirement: 7000, art: 'assets/buildings/enchantment-forge.svg' },
  { id: 'observatory', name: 'Astral Observatory', baseCost: 90000, growthRate: 1.21, production: 530, unlockRequirement: 55000, art: 'assets/buildings/astral-observatory.svg' },
  { id: 'citadel', name: 'Runic Citadel', baseCost: 1250000, growthRate: 1.23, production: 3600, unlockRequirement: 800000, art: 'assets/buildings/apprentice-tower.svg' },
  { id: 'nexus', name: 'Aether Nexus', baseCost: 22000000, growthRate: 1.24, production: 24000, unlockRequirement: 12000000, art: 'assets/buildings/mana-well.svg' },
  { id: 'rift', name: 'Chrono Rift Engine', baseCost: 420000000, growthRate: 1.25, production: 170000, unlockRequirement: 240000000, art: 'assets/buildings/arcane-library.svg' },
  { id: 'prism', name: 'Stellar Prism Array', baseCost: 8000000000, growthRate: 1.26, production: 1200000, unlockRequirement: 4200000000, art: 'assets/buildings/enchantment-forge.svg' },
  { id: 'throne', name: 'Empyrean Throne', baseCost: 145000000000, growthRate: 1.27, production: 8500000, unlockRequirement: 75000000000, art: 'assets/buildings/astral-observatory.svg' }
];

export function initializeGenerators(state) {
  for (const g of generatorDefs) state.generators[g.id] = state.generators[g.id] || 0;
}

export function generatorCost(def, owned, amount = 1) {
  let cost = 0;
  for (let i = 0; i < amount; i += 1) cost += def.baseCost * def.growthRate ** (owned + i);
  return cost;
}
