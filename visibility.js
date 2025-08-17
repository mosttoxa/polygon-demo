// visibility.js
/*export function chebyshevDist(a, b, numCols) {
  const ax = a % numCols, ay = Math.floor(a / numCols);
  const bx = b % numCols, by = Math.floor(b / numCols);
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

/**
 * Повертає Set індексів, що потрапляють у радіус видимості.
 * Використовує Chebyshev (квадрат “алмаз” можна поміняти на Манхеттен за бажанням).
 */
/*export function computeVisible({ playerPos, numRows, numCols, radius }) {
  const vis = new Set();
  if (radius < 0) return vis;
  const total = numRows * numCols;
  for (let i = 0; i < total; i++) {
    if (chebyshevDist(playerPos, i, numCols) <= radius) vis.add(i);
  }
  return vis;
}
