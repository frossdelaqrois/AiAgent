import { WebGpuRenderer } from './webgpuRenderer.js';

const refs = {
  canvas: document.getElementById('tdWebglCanvas'),
  wave: document.getElementById('tdWave'),
  breaches: document.getElementById('tdBreaches'),
  dps: document.getElementById('tdDps'),
  spellBonus: document.getElementById('tdSpellBonus'),
  reward: document.getElementById('tdReward'),
  enemyInfo: document.getElementById('tdEnemyInfo'),
  distance: document.getElementById('tdDistance'),
  warning: document.getElementById('tdPowerWarning'),
  enemyUnit: document.getElementById('tdEnemyUnit'),
  damageLayer: document.getElementById('tdDamageLayer')
};

let engine;
let renderer;
let ready = false;

async function loadWasm() {
  const wasmMod = await import('../rust/td_wasm/pkg/td_wasm.js');
  await wasmMod.default();
  return wasmMod.TdEngine;
}

function drawHud(snapshot) {
  refs.wave.textContent = String(snapshot.wave || 1);
  refs.breaches.textContent = '0';
  refs.dps.textContent = `${Math.max(1, snapshot.towers.length) * 20}`;
  refs.spellBonus.textContent = `x${(1 + snapshot.towers.length * 0.08).toFixed(2)}`;
  refs.reward.textContent = `${Math.round(30 + snapshot.wave * 16)} power / ${Math.max(1, Math.floor(snapshot.wave * 1.2))} mana`;

  const leadEnemy = snapshot.enemies[0];
  const progress = leadEnemy ? Math.min(100, Math.max(0, (leadEnemy.x / refs.canvas.width) * 100)) : 0;
  refs.distance.textContent = `Distance to gate: ${(100 - progress).toFixed(0)}%`;
  refs.enemyInfo.textContent = snapshot.alive_enemies > 0
    ? `Wave ${snapshot.wave} invader • ${snapshot.alive_enemies} active • ${snapshot.queued_enemies} queued`
    : 'Lane is clear. Click the lane to place towers.';

  refs.warning.textContent = snapshot.health <= 6 ? 'Barrier unstable: add towers to prevent breaches.' : '';
}

async function boot() {
  if (!refs.canvas || !navigator.gpu) return;
  window.__RUST_TD_ACTIVE = true;

  if (refs.enemyUnit) refs.enemyUnit.style.display = 'none';
  if (refs.damageLayer) refs.damageLayer.style.display = 'none';

  const TdEngine = await loadWasm();
  engine = new TdEngine();
  renderer = await WebGpuRenderer.create(refs.canvas);
  ready = true;

  refs.canvas.addEventListener('click', (event) => {
    const rect = refs.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * refs.canvas.width;
    engine.place_tower(x);
  });

  let previous = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;

    engine.tick(dt);
    const snapshot = engine.snapshot();
    renderer.render(snapshot);
    drawHud(snapshot);

    if (snapshot.alive_enemies === 0 && snapshot.queued_enemies === 0 && ready) {
      engine.start_wave();
    }

    requestAnimationFrame(frame);
  };

  engine.start_wave();
  requestAnimationFrame(frame);
}

boot().catch((error) => {
  console.error(error);
  window.__RUST_TD_ACTIVE = false;
  if (refs.enemyInfo) refs.enemyInfo.textContent = `Rust TD unavailable: ${error.message}`;
});
