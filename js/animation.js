export function createFloatingNumbers(canvas) {
  const ctx = canvas.getContext('2d');
  const items = [];

  function push(text, x, y, color = '#8de8ff') {
    items.push({ text, x, y, life: 1, color });
  }

  function tick(dt) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const it = items[i];
      it.life -= dt * 0.8;
      it.y -= dt * 24;
      if (it.life <= 0) {
        items.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = it.life;
      ctx.fillStyle = it.color;
      ctx.font = 'bold 18px Inter';
      ctx.fillText(it.text, it.x, it.y);
    }
    ctx.globalAlpha = 1;
  }

  return { push, tick };
}
