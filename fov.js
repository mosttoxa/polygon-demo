// fov.js
export function computeFov(centerIndex, radius, numRows, numCols) {
  // страховки проти некоректних значень
  const rad = Math.max(0, Math.floor(Number(radius) || 0));
  const total = numRows * numCols;
  if (centerIndex < 0 || centerIndex >= total) return new Set();

  const set = new Set();
  const cr = Math.floor(centerIndex / numCols);
  const cc = centerIndex % numCols;

  for (let dr = -rad; dr <= rad; dr++) {
    const r = cr + dr;
    if (r < 0 || r >= numRows) continue;

    for (let dc = -rad; dc <= rad; dc++) {
      const c = cc + dc;
      if (c < 0 || c >= numCols) continue;

      const idx = r * numCols + c;
      set.add(idx);
    }
  }

  return set;
}
