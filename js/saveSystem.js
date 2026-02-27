const KEY = 'idle-wizard-save-v2';

export function saveGame(state) {
  state.lastSaved = Date.now();
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadGame() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function calculateOfflineGain(state, productionRate) {
  const seconds = Math.max(0, (Date.now() - (state.lastSaved || Date.now())) / 1000);
  return { seconds, gain: productionRate * seconds * 0.7 };
}
