// monstersAI.js

// відстань Чебишева: дозволяє коректно рахувати “у радіусі” з діагоналями
function chebyshevDist(a, b, numCols) {
  const ax = a % numCols, ay = Math.floor(a / numCols);
  const bx = b % numCols, by = Math.floor(b / numCols);
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

// крок, що зменшує Манхеттенську відстань до цілі (з урахуванням меж і колізій)
function stepTowards(pos, target, numRows, numCols, occupied) {
  const pr = Math.floor(pos / numCols), pc = pos % numCols;
  const tr = Math.floor(target / numCols), tc = target % numCols;
  const deltas = [];

  // кандидати, що скорочують Манхеттен
  const dr = Math.sign(tr - pr);
  const dc = Math.sign(tc - pc);

  // пріоритет: горизонт/вертикаль, потім альтернативи (щоб не застрягати)
  if (dc !== 0) deltas.push(dc);               // +1 або -1 (вліво/вправо)
  if (dr !== 0) deltas.push(dr * numCols);     // +numCols або -numCols (вниз/вгору)

  // якщо пряма дорога зайнята — спробуємо інші напрямки
  deltas.push(-1, +1, -numCols, +numCols);

  for (const d of deltas) {
    const nr = Math.floor((pos + d) / numCols);
    const nc = (pos + d) % numCols;
    if (nc < 0 || nc >= numCols || nr < 0 || nr >= numRows) continue;
    const next = pos + d;
    if (occupied.has(next)) continue;
    occupied.delete(pos);
    occupied.add(next);
    return next;
  }
  return pos; // нема куди рухатись
}

// випадковий крок (як було), з униканням колізій
function randomStep(pos, numRows, numCols, occupied) {
  const row = Math.floor(pos / numCols);
  const col = pos % numCols;
  const options = [];
  if (col > 0) options.push(-1);
  if (col < numCols - 1) options.push(+1);
  if (row > 0) options.push(-numCols);
  if (row < numRows - 1) options.push(+numCols);
  if (options.length === 0) return pos;

  const shuffled = options.slice().sort(() => Math.random() - 0.5);
  for (const delta of shuffled) {
    const next = pos + delta;
    if (occupied.has(next)) continue;
    occupied.delete(pos);
    occupied.add(next);
    return next;
  }
  return pos;
}

/**
 * Рух монстрів з переслідуванням:
 * - якщо біон у радіусі aggroRange (Чебишев) → погоня кроками, що зменшують Манхеттен;
 * - інакше — випадковий блукаючий рух (як раніше);
 * - враховуємо speed монстра (1..N) та колізії між монстрами.
 */
export function moveMonstersHunt({ monstersRef, numRows, numCols, playerPositionRef }) {
  const monsters = monstersRef.value;
  if (!Array.isArray(monsters) || monsters.length === 0) return;

  const occupied = new Set(monsters.map(m => m.pos));
  const target = playerPositionRef.value;

  for (const m of monsters) {
    const steps = Math.max(0, Number(m.speed || 1));
    for (let s = 0; s < steps; s++) {
      const inAggro = chebyshevDist(m.pos, target, numCols) <= (m.aggroRange ?? 0);
      const next = inAggro
        ? stepTowards(m.pos, target, numRows, numCols, occupied)
        : randomStep(m.pos, numRows, numCols, occupied);
      m.pos = next;
    }
  }
}

// Залишаємо і випадковий рух (може стати в пригоді)
export function moveMonstersRandom({ monstersRef, numRows, numCols }) {
  const monsters = monstersRef.value;
  if (!Array.isArray(monsters) || monsters.length === 0) return;

  const occupied = new Set(monsters.map(m => m.pos));

  for (const m of monsters) {
    const steps = Math.max(0, Number(m.speed || 1));
    for (let s = 0; s < steps; s++) {
      m.pos = randomStep(m.pos, numRows, numCols, occupied);
    }
  }
}
