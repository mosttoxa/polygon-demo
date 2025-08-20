// desert.js
// Формуємо стартову пустелю 3×3 у ВИПАДКОВОМУ куті
export function seedDesert(desertCells, numRows, numCols) {
  if (desertCells.size > 0) return; // вже є
  const corners = [
    { r0: 0, c0: 0 },                                           // топ-лівий
    { r0: 0, c0: Math.max(0, numCols - 3) },                    // топ-правий
    { r0: Math.max(0, numRows - 3), c0: 0 },                    // низ-лівий
    { r0: Math.max(0, numRows - 3), c0: Math.max(0, numCols-3)} // низ-правий
  ];
  const pick = corners[Math.floor(Math.random() * corners.length)];
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const r = pick.r0 + dr, c = pick.c0 + dc;
      if (r >= 0 && r < numRows && c >= 0 && c < numCols) {
        desertCells.add(r * numCols + c);
      }
    }
  }
}

// Сусіди 8-напрямків
function neigh8(idx, numRows, numCols) {
  const r = Math.floor(idx / numCols), c = idx % numCols;
  const res = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= numRows || nc < 0 || nc >= numCols) continue;
      res.push(nr * numCols + nc);
    }
  }
  return res;
}

// Додаємо до пустелі до "limit" нових клітин з її периметра
export function expandDesert({ desertCells, numRows, numCols, limit = 1, avoid = null }) {
  const avoidSet = avoid ?? new Set();
  // знайти кандидатів — сусіди пустелі, що ще не пустеля
  const candidates = new Set();
  for (const d of desertCells) {
    for (const n of neigh8(d, numRows, numCols)) {
      if (!desertCells.has(n) && !avoidSet.has(n)) candidates.add(n);
    }
  }
  if (candidates.size === 0) return;

  // випадково додаємо до limit клітин
  const arr = Array.from(candidates);
  for (let k = 0; k < limit && arr.length > 0; k++) {
    const i = Math.floor(Math.random() * arr.length);
    const pick = arr.splice(i, 1)[0];
    desertCells.add(pick);
  }
}
