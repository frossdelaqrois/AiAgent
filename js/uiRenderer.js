import { formatNumber, knowledgeGain, upgradeDefs } from './economy.js';
import { generatorDefs, generatorCost } from './generators.js';
import { spellDefs, isSpellReady } from './spells.js';

export function renderUI(state, refs, actions, computed) {
  refs.mana.textContent = `${formatNumber(state.mana)} Mana`;
  refs.lifetimeMana.textContent = formatNumber(state.lifetimeMana);
  refs.knowledge.textContent = formatNumber(state.arcaneKnowledge);
  refs.mps.textContent = formatNumber(computed.mps);
  refs.themeName.textContent = `Theme: ${state.theme}`;

  refs.generators.innerHTML = '';
  for (const g of generatorDefs) {
    if (state.lifetimeMana < g.unlockRequirement) continue;
    const cost = generatorCost(g, state.generators[g.id]);
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `<img src="${g.art}" alt="${g.name}"><div><strong>${g.name}</strong><div class="tooltip">Owned ${state.generators[g.id]} • +${formatNumber(g.production)}/s each</div><div class="tooltip">Cost ${formatNumber(cost)} mana</div></div><button ${state.mana < cost ? 'disabled' : ''}>Buy</button>`;
    row.querySelector('button').onclick = () => actions.buyGenerator(g.id, cost);
    refs.generators.appendChild(row);
  }

  refs.spells.innerHTML = '';
  for (const s of spellDefs) {
    if (state.lifetimeMana < s.unlock) continue;
    const ready = isSpellReady(state, s.id);
    const remain = Math.max(0, (state.cooldowns[s.id] - Date.now()) / 1000);
    const cooldownPct = ready ? 100 : Math.max(0, 100 - (remain / s.cooldown) * 100);
    const row = document.createElement('div');
    row.className = 'spell';
    row.innerHTML = `<strong>${s.name}</strong><div class="tooltip">${s.type} spell</div><button ${ready ? '' : 'disabled'}>${ready ? 'Cast' : `${remain.toFixed(1)}s`}</button><div class="cooldown"><span style="width:${cooldownPct}%"></span></div>`;
    row.querySelector('button').onclick = () => actions.castSpell(s.id);
    refs.spells.appendChild(row);
  }

  refs.upgrades.innerHTML = '';
  for (const u of upgradeDefs) {
    const owned = !!state.upgrades[u.id];
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `<img src="${u.art}" alt="${u.name}"><div><strong>${u.name}</strong><div class="tooltip">${u.text}</div><div class="tooltip">${formatNumber(u.cost)} mana</div></div><button ${owned || state.mana < u.cost ? 'disabled' : ''}>${owned ? 'Done' : 'Buy'}</button>`;
    row.querySelector('button').onclick = () => actions.buyUpgrade(u.id);
    refs.upgrades.appendChild(row);
  }

  refs.achievements.innerHTML = '';
  const nextAscension = knowledgeGain(state.lifetimeMana);
  const achievements = [
    { id: 'first', name: 'First Sigil', done: state.lifetimeMana >= 100, reward: '+2% global' },
    { id: 'auto', name: 'Automancer', done: Object.values(state.generators).reduce((a, b) => a + b, 0) >= 25, reward: '+2% global' },
    { id: 'prestige', name: 'Beyond Mortality', done: state.arcaneKnowledge > 0, reward: '+2% global' }
  ];
  for (const a of achievements) {
    if (a.done) state.achievements[a.id] = true;
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `<div><strong>${a.name}</strong><div class="tooltip">${a.reward}</div></div><button disabled>${a.done ? 'Unlocked' : 'Locked'}</button>`;
    refs.achievements.appendChild(row);
  }
  refs.ascendBtn.textContent = `Ascend (+${nextAscension} Knowledge)`;
}
