// monstersAI.js
export function moveMonstersRandom({ monstersRef, numRows, numCols }) {
  const monsters = monstersRef.value;
  if (!Array.isArray(monsters) || monsters.length === 0) return;

  // зайняті клітинки, щоб монстри не накладалися
  const occupied = new Set(monsters.map(m => m.pos));

  for (const m of monsters) {
    const steps = Math.max(0, Number(m.speed || 1)); // швидкість 1..N
    for (let s = 0; s < steps; s++) {
      const row = Math.floor(m.pos / numCols);
      const col = m.pos % numCols;

      // можливі напрямки в межах поля
      const options = [];
      if (col > 0) options.push(-1);
      if (col < numCols - 1) options.push(+1);
      if (row > 0) options.push(-numCols);
      if (row < numRows - 1) options.push(+numCols);
      if (options.length === 0) break;

      // випадковий напрямок, уникаємо колізій
      let moved = false;
      const shuffled = options.slice().sort(() => Math.random() - 0.5);
      for (const delta of shuffled) {
        const next = m.pos + delta;
        if (occupied.has(next)) continue;   // не ліземо на іншого монстра
        occupied.delete(m.pos);
        m.pos = next;
        occupied.add(m.pos);
        moved = true;
        break;
      }
      if (!moved) break; // нікуди рухатись
    }
  }
}
