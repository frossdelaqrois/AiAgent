export function createInitialState() {
  return {
    mana: 0,
    lifetimeMana: 0,
    arcaneKnowledge: 0,
    generators: {},
    upgrades: {},
    achievements: {},
    spells: {},
    cooldowns: {},
    totalClicks: 0,
    theme: 'Novice Sanctum',
    lastUpdate: Date.now(),
    lastSaved: Date.now(),
    audioMuted: true,
  };
}

export const events = new EventTarget();

export function emit(type, detail = {}) {
  events.dispatchEvent(new CustomEvent(type, { detail }));
}
