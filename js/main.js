import { createInitialState } from './gameState.js';
import { productionPerSecond, formatNumber, upgradeDefs } from './economy.js';
import { generatorDefs, initializeGenerators } from './generators.js';
import { spellDefs, isSpellReady } from './spells.js';
import { canAscend, performAscension } from './prestige.js';
import { renderUI } from './uiRenderer.js';
import { createFloatingNumbers } from './animation.js';
import { saveGame, loadGame, calculateOfflineGain } from './saveSystem.js';
import { preloadAssets } from './assetLoader.js';
import { createAudioManager } from './audioManager.js';

let state = loadGame() || createInitialState();
initializeGenerators(state);
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

const boosts = { production: 1, speed: 1, autoClick: 0, expiresAt: 0 };

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
  const gain = 1 + Math.sqrt(state.arcaneKnowledge + 1) + boosts.autoClick;
  state.mana += gain;
  state.lifetimeMana += gain;
  state.totalClicks += 1;
  floating.push(`+${formatNumber(gain)}`, 120 + Math.random() * 80, 260, '#9ce7ff');
}

function castSpell(id) {
  const spell = spellDefs.find((s) => s.id === id);
  if (!spell || !isSpellReady(state, id)) return;
  const now = Date.now();
  state.cooldowns[id] = now + spell.cooldown * 1000;
  const mps = productionPerSecond(state, boosts.production);
  if (spell.type === 'burst') {
    const gain = spell.effect(state, mps);
    state.mana += gain;
    state.lifetimeMana += gain;
    floating.push(`+${formatNumber(gain)}`, 170, 220, '#d7a4ff');
  } else {
    boosts.expiresAt = Math.max(boosts.expiresAt, now + spell.duration * 1000);
    if (spell.type === 'boost') boosts.production = spell.effect();
    if (spell.type === 'speed') boosts.speed = spell.effect();
    if (spell.type === 'autoclick') boosts.autoClick = spell.effect();
  }
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
  boosts.production = 1; boosts.speed = 1; boosts.autoClick = 0;
  saveGame(state);
});
refs.offlineClose.addEventListener('click', () => refs.offlinePopup.classList.add('hidden'));
document.getElementById('mobile-tabs').addEventListener('click', (e) => {
  if (!(e.target instanceof HTMLButtonElement)) return;
  refs.layout.className = `layout mobile-${e.target.dataset.tab}`;
});

applyOfflineProgress();

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.25) * boosts.speed;
  last = now;
  if (Date.now() > boosts.expiresAt) boosts.production = 1, boosts.speed = 1, boosts.autoClick = 0;

  const mps = productionPerSecond(state, boosts.production);
  const gain = mps * dt;
  state.mana += gain;
  state.lifetimeMana += gain;

  if (boosts.autoClick > 0) {
    const autoGain = boosts.autoClick * dt;
    state.mana += autoGain;
    state.lifetimeMana += autoGain;
  }

  renderUI(state, refs, actions, { mps });
  floating.tick(dt);
  requestAnimationFrame(loop);
}

setInterval(() => saveGame(state), 10000);
window.addEventListener('beforeunload', () => saveGame(state));
requestAnimationFrame(loop);
