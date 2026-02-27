import { createInitialState } from './gameState.js';
import { knowledgeGain } from './economy.js';
import { initializeGenerators } from './generators.js';

export function canAscend(state) {
  return knowledgeGain(state.lifetimeMana) > 0;
}

export function performAscension(state) {
  const gain = knowledgeGain(state.lifetimeMana);
  if (gain <= 0) return state;
  const fresh = createInitialState();
  initializeGenerators(fresh);
  fresh.arcaneKnowledge = state.arcaneKnowledge + gain;
  fresh.theme = fresh.arcaneKnowledge >= 10 ? 'Astral Dominion' : fresh.arcaneKnowledge >= 4 ? 'Celestial Vault' : 'Novice Sanctum';
  return fresh;
}
