export async function preloadAssets(paths) {
  const jobs = paths.map((path) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ path, ok: true });
    img.onerror = () => resolve({ path, ok: false });
    img.src = path;
  }));
  return Promise.all(jobs);
}
