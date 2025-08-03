import { stats } from './playerStats.js';

export function renderField({
  gameFieldElement,
  numRows,
  numCols,
  monsters,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  playerPosition
}) {
  document.querySelectorAll("#game-field div").forEach(cell => {
    const index = parseInt(cell.dataset.index);
    cell.className = "cell";
    cell.textContent = "";

    if (bonusCells.has(index)) cell.classList.add("bonus");
    if (yellowCells.has(index)) cell.classList.add("yellow");
    if (eventCells.has(index)) {
      cell.textContent = "?!";
      cell.style.backgroundColor = "#e0b0ff";
    }
    if (portalCells.has(index)) {
      cell.textContent = "@";
      cell.style.backgroundColor = "#add8e6";
    }
    for (const m of monsters) {
      if (m.pos === index) {
        cell.classList.add("monster");
        cell.textContent = "👾";
      }
    }
    if (index === playerPosition) {
      cell.classList.add("opened");
      cell.textContent = "🔸";
    }
  });
}

export function logEvent(text, logContainer) {
  const line = document.createElement("div");
  line.textContent = text;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
}