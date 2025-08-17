/*export function logEvent(text, logContainer) {
    const line = document.createElement("div");
    line.textContent = text;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }


export function randomStatKey() {
  const keys = ["energy", "move", "attack"];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function generateEntities(numRows, numCols, playerPosition) {
  const total = numRows * numCols;
  const monsters = [];
  const bonusCells = new Set();
  const yellowCells = new Set();
  const eventCells = new Map();
  const portalCells = new Set();
  const taken = new Set([playerPosition]);

  const place = (setOrMap, val = null) => {
    let idx;
    do {
      idx = Math.floor(Math.random() * total);
    } while (taken.has(idx));
    taken.add(idx);
    if (val !== null) setOrMap.set(idx, val);
    else setOrMap.add(idx);
    return idx;
  };

  for (let i = 0; i < 10; i++) {
    monsters.push({ pos: place(taken), hp: 10, damage: 3 });
  }
  for (let i = 0; i < 10; i++) place(bonusCells);
  for (let i = 0; i < 10; i++) place(yellowCells);
  for (let i = 0; i < 5; i++) place(eventCells, i);
  for (let i = 0; i < 3; i++) place(portalCells);

  return { monsters, bonusCells, yellowCells, eventCells, portalCells };
}
