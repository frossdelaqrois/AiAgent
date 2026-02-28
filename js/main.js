import { WebGpuRenderer } from './webgpuRenderer.js';

const refs = {
  gold: document.getElementById('gold'),
  health: document.getElementById('health'),
  wave: document.getElementById('wave'),
  enemies: document.getElementById('enemies'),
  status: document.getElementById('status'),
  canvas: document.getElementById('battlefield'),
  startWave: document.getElementById('start-wave'),
  placeTower: document.getElementById('place-tower'),
  reset: document.getElementById('reset')
};

let engine;
let renderer;
let placeMode = false;

function setStatus(text) {
  refs.status.textContent = text;
}

function updateHud(snapshot) {
  refs.gold.textContent = snapshot.gold;
  refs.health.textContent = snapshot.health;
  refs.wave.textContent = snapshot.wave;
  refs.enemies.textContent = `${snapshot.alive_enemies} (+${snapshot.queued_enemies})`;
}

async function loadWasm() {
  const wasmMod = await import('../rust/td_wasm/pkg/td_wasm.js');
  await wasmMod.default();
  return wasmMod.TdEngine;
}

async function boot() {
  if (!navigator.gpu) {
    setStatus('WebGPU not supported in this browser. Try a Chromium build with WebGPU enabled.');
    return;
  }

  setStatus('Initializing Rust + WebGPU...');
  const TdEngine = await loadWasm();

  engine = new TdEngine();
  renderer = await WebGpuRenderer.create(refs.canvas);

  refs.startWave.addEventListener('click', () => {
    engine.start_wave();
    setStatus('Wave started.');
  });

  refs.placeTower.addEventListener('click', () => {
    placeMode = !placeMode;
    setStatus(placeMode ? 'Click the battlefield to place a tower.' : 'Tower placement canceled.');
  });

  refs.canvas.addEventListener('click', (event) => {
    if (!placeMode) return;
    const rect = refs.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * refs.canvas.width;
    const ok = engine.place_tower(x);
    setStatus(ok ? 'Tower placed.' : 'Could not place tower (gold/spacing issue).');
    placeMode = false;
  });

  refs.reset.addEventListener('click', () => {
    engine.reset();
    setStatus('Game reset.');
  });

  let previous = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    engine.tick(dt);
    const snapshot = engine.snapshot();
    renderer.render(snapshot);
    updateHud(snapshot);
    if (snapshot.health <= 0) setStatus('Defeat. Press reset to try again.');
    requestAnimationFrame(frame);
  };

  setStatus('Ready. Start a wave and defend the gate.');
  requestAnimationFrame(frame);
}

boot().catch((err) => {
  console.error(err);
  setStatus(`Startup failed: ${err.message}. Build wasm first (see README).`);
});
