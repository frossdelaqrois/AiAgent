export function createAudioManager() {
  const cache = new Map();
  let muted = true;

  function setMuted(value) { muted = value; }

  function play(key, src) {
    if (muted) return;
    if (!cache.has(key)) {
      const audio = new Audio(src);
      audio.preload = 'none';
      cache.set(key, audio);
    }
    const a = cache.get(key);
    a.currentTime = 0;
    a.play().catch(() => {});
  }

  return { setMuted, play };
}
