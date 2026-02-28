import { createInitialState } from './gameState.js';
import { productionPerSecond, formatNumber, upgradeDefs } from './economy.js';
import { generatorDefs } from './generators.js';
import { spellDefs, isSpellReady } from './spells.js';
import { canAscend, performAscension } from './prestige.js';
import { renderUI } from './uiRenderer.js';
import { createFloatingNumbers } from './animation.js';
import { saveGame, loadGame, calculateOfflineGain } from './saveSystem.js';
import { preloadAssets } from './assetLoader.js';
import { createAudioManager } from './audioManager.js';

let state = loadGame() || createInitialState();
for (const g of generatorDefs) {
  if (typeof state.generators[g.id] !== 'number') state.generators[g.id] = 0;
}
state.spells = state.spells || {};
state.spells.eternalEmbersStacks = state.spells.eternalEmbersStacks || 0;
state.spells.lastSpellCastAt = state.spells.lastSpellCastAt || 0;

const audio = createAudioManager();
audio.setMuted(true);

const refs = {
  mana: document.getElementById('mana-count'),
  lifetimeMana: document.getElementById('lifetime-mana'),
  knowledge: document.getElementById('knowledge'),
  mps: document.getElementById('mps'),
  generators: document.getElementById('generator-list'),
  spells: document.getElementById('spell-list'),
  upgrades: document.getElementById('upgrade-list'),
  achievements: document.getElementById('achievement-list'),
  manualCast: document.getElementById('manual-cast'),
  wizardImage: document.getElementById('wizard-image'),
  ascendBtn: document.getElementById('ascend-btn'),
  offlinePopup: document.getElementById('offline-popup'),
  offlineText: document.getElementById('offline-text'),
  offlineClose: document.getElementById('offline-close'),
  themeName: document.getElementById('theme-name'),
  layout: document.getElementById('layout'),
};

const floating = createFloatingNumbers(document.getElementById('floating-canvas'));
const assets = [
  'assets/characters/wizard.svg',
  ...generatorDefs.map((g) => g.art),
  ...spellDefs.map((s) => s.art),
  ...upgradeDefs.map((u) => u.art)
];

preloadAssets(assets).then(() => {
  refs.wizardImage.src = 'assets/characters/wizard.svg';
});

const activeSpells = {};
const manaHistory = [];
const boosts = { speed: 1, spellPower: 1 };

function countActiveSpells(now = Date.now()) {
  return Object.values(activeSpells).filter((entry) => entry.expiresAt > now).length;
}

function getLeylineMultiplier() {
  let weightedBase = 0;
  let weightedScaled = 0;
  for (const g of generatorDefs) {
    const owned = state.generators[g.id] || 0;
    const base = owned * g.production;
    weightedBase += base;
    weightedScaled += base * (1 + activeSpells['leyline-saturation'].perBuilding * owned);
  }
  if (weightedBase <= 0) return 1;
  return weightedScaled / weightedBase;
}

function totalProductionMultiplier(now) {
  let mult = 1;
  const compound = activeSpells['arcane-compound-interest'];
  if (compound && compound.expiresAt > now) mult *= compound.mult;
  const taxation = activeSpells['void-taxation'];
  if (taxation && taxation.expiresAt > now) mult *= taxation.mult;
  const leyline = activeSpells['leyline-saturation'];
  if (leyline && leyline.expiresAt > now) mult *= getLeylineMultiplier();
  const overload = activeSpells['runic-overload'];
  if (overload && overload.expiresAt > now) {
    const activeCount = Math.max(0, countActiveSpells(now) - 1);
    mult *= 1 + overload.perSpell * activeCount;
  }
  const reflection = activeSpells['infinite-reflection'];
  if (reflection && reflection.expiresAt > now) mult *= 1 + reflection.bonusPct;
  if (state.spells.eternalEmbersStacks > 0) mult *= 1 + state.spells.eternalEmbersStacks;
  return mult;
}

function getSpellPowerMultiplier(now, baseMps) {
  let mult = boosts.spellPower;
  const arbitrage = activeSpells['dimensional-arbitrage'];
  if (arbitrage && arbitrage.expiresAt > now) {
    mult *= 1 + Math.log10(baseMps + 10) * arbitrage.conversion;
  }
  return mult;
}

function pushManaHistory(now, gain) {
  manaHistory.push({ now, gain });
  while (manaHistory.length && now - manaHistory[0].now > 12000) {
    manaHistory.shift();
  }
}

function applyOfflineProgress() {
  const mps = productionPerSecond(state, 1);
  const { seconds, gain } = calculateOfflineGain(state, mps);
  if (seconds > 8 && gain > 1) {
    state.mana += gain;
    state.lifetimeMana += gain;
    refs.offlineText.textContent = `You were away ${Math.floor(seconds)}s and gathered ${formatNumber(gain)} mana (70% efficiency).`;
    refs.offlinePopup.classList.remove('hidden');
  }
}

function castManual() {
  const gain = 1 + Math.sqrt(state.arcaneKnowledge + 1);
  state.mana += gain;
  state.lifetimeMana += gain;
  state.totalClicks += 1;
  floating.push(`+${formatNumber(gain)}`, 120 + Math.random() * 80, 260, '#9ce7ff');
}

function castSpell(id) {
  const spell = spellDefs.find((s) => s.id === id);
  if (!spell || !isSpellReady(state, id)) return;
  const now = Date.now();
  const baseMps = productionPerSecond(state, totalProductionMultiplier(now));
  const spellPower = getSpellPowerMultiplier(now, baseMps);

  state.cooldowns[id] = now + spell.cooldown * 1000;
  state.spells.lastSpellCastAt = now;

  if (activeSpells['eternal-embers'] && activeSpells['eternal-embers'].expiresAt > now && id !== 'eternal-embers') {
    state.spells.eternalEmbersStacks += activeSpells['eternal-embers'].stackGain;
  }

  if (spell.type === 'echo') {
    const config = spell.effect(state);
    const windowMs = config.window * 1000;
    const recent = manaHistory
      .filter((x) => now - x.now <= windowMs)
      .reduce((sum, x) => sum + x.gain, 0);
    const gain = recent * config.efficiency * spellPower;
    state.mana += gain;
    state.lifetimeMana += gain;
    floating.push(`+${formatNumber(gain)}`, 170, 220, '#d7a4ff');
    return;
  }

  if (spell.type === 'sacrifice') {
    const config = spell.effect(state);
    const drain = state.mana * config.drain;
    state.mana -= drain;
    activeSpells[id] = {
      expiresAt: now + spell.duration * 1000,
      mult: 1 + (config.mult - 1) * spellPower
    };
    floating.push(`-${formatNumber(drain)}`, 170, 220, '#ff9cb3');
    return;
  }

  if (spell.type === 'compound') {
    const config = spell.effect(state);
    activeSpells[id] = {
      expiresAt: now + config.duration * 1000,
      rate: config.rate,
      mult: 1
    };
    return;
  }

  if (spell.type === 'reflection') {
    const config = spell.effect(state);
    activeSpells[id] = {
      expiresAt: now + spell.duration * 1000,
      bonusPct: config.bonusPct * spellPower
    };
    return;
  }

  if (spell.type === 'speed') {
    activeSpells[id] = {
      expiresAt: now + spell.duration * 1000,
      speed: spell.effect(state) * spellPower
    };
    boosts.speed = activeSpells[id].speed;
    return;
  }

  if (spell.type === 'fragment') {
    const config = spell.effect(state);
    activeSpells[id] = {
      expiresAt: now + spell.duration * 1000,
      fragments: config.fragments,
      critChance: config.critChance,
      critMult: config.critMult * spellPower
    };
    return;
  }

  if (spell.type === 'embers') {
    const config = spell.effect(state);
    activeSpells[id] = {
      expiresAt: now + spell.duration * 1000,
      stackGain: config.stackGain * spellPower,
      decayPerSecond: config.decayPerSecond
    };
    return;
  }

  const config = spell.effect(state);
  activeSpells[id] = { expiresAt: now + spell.duration * 1000, ...config };
}

const actions = {
  buyGenerator(id, cost) {
    if (state.mana < cost) return;
    state.mana -= cost;
    state.generators[id] += 1;
  },
  buyUpgrade(id) {
    const def = upgradeDefs.find((u) => u.id === id);
    if (!def || state.mana < def.cost || state.upgrades[id]) return;
    state.mana -= def.cost;
    state.upgrades[id] = true;
  },
  castSpell,
};

refs.manualCast.addEventListener('click', castManual);
refs.ascendBtn.addEventListener('click', () => {
  if (!canAscend(state)) return;
  state = performAscension(state);
  state.spells = { eternalEmbersStacks: 0, lastSpellCastAt: 0 };
  boosts.speed = 1;
  boosts.spellPower = 1;
  for (const id of Object.keys(activeSpells)) delete activeSpells[id];
  saveGame(state);
});
refs.offlineClose.addEventListener('click', () => refs.offlinePopup.classList.add('hidden'));
document.getElementById('mobile-tabs').addEventListener('click', (e) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  refs.layout.className = `layout mobile-${e.target.dataset.tab}`;
});

applyOfflineProgress();

let last = performance.now();
function loop(nowTick) {
  const now = Date.now();
  if (activeSpells['chrono-acceleration-field']?.expiresAt > now) {
    boosts.speed = activeSpells['chrono-acceleration-field'].speed;
  } else {
    boosts.speed = 1;
  }

  for (const [id, data] of Object.entries(activeSpells)) {
    if (data.expiresAt <= now) {
      delete activeSpells[id];
      if (id === 'arcane-compound-interest') {
        // explicit reset via removal
      }
    }
  }

  const dt = Math.min((nowTick - last) / 1000, 0.25) * boosts.speed;
  last = nowTick;

  if (activeSpells['arcane-compound-interest']) {
    const compound = activeSpells['arcane-compound-interest'];
    compound.mult *= 1 + compound.rate * dt;
  }

  if (state.spells.eternalEmbersStacks > 0) {
    const decay = activeSpells['eternal-embers']?.decayPerSecond || 0.006;
    state.spells.eternalEmbersStacks = Math.max(0, state.spells.eternalEmbersStacks - decay * dt);
  }

  const productionMult = totalProductionMultiplier(now);
  const baseMps = productionPerSecond(state, productionMult);

  let gain = baseMps * dt;
  if (activeSpells['astral-fragmentation']) {
    const frag = activeSpells['astral-fragmentation'];
    let crits = 0;
    for (let i = 0; i < frag.fragments; i += 1) {
      if (Math.random() < frag.critChance * dt) crits += 1;
    }
    if (crits > 0) {
      const bonusMult = 1 + ((frag.critMult - 1) * crits) / frag.fragments;
      gain *= bonusMult;
    }
  }

  state.mana += gain;
  state.lifetimeMana += gain;
  pushManaHistory(now, gain);

  const computedMps = productionPerSecond(state, totalProductionMultiplier(now));
  renderUI(state, refs, actions, { mps: computedMps });
  floating.tick(dt);
  requestAnimationFrame(loop);
}

setInterval(() => saveGame(state), 10000);
window.addEventListener('beforeunload', () => saveGame(state));
requestAnimationFrame(loop);
