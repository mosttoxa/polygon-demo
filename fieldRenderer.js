// fieldRenderer.js
// fieldRenderer.js
let VISIBLE = null;

export function setVisible(visibleSet) {
  VISIBLE = visibleSet instanceof Set ? visibleSet : null;
}

export function renderField({
  gameFieldElement,
  numRows,
  numCols,
  monsters,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  playerPosition,
  desertCells    
}) {
  // ✅ Страховка: візьмемо з DOM, якщо не передали аргументом
  const el = gameFieldElement ?? document.getElementById("game-field");
  if (!el) {
    console.warn("[renderField] #game-field не знайдено і gameFieldElement не переданий");
    return;
  }

  // Створюємо клітинки, якщо ще не створені
  if (el.children.length === 0) {
    for (let i = 0; i < numRows * numCols; i++) {
      const cell = document.createElement("div");
      cell.dataset.index = i;
      cell.classList.add("cell");
      el.appendChild(cell);
    }
  }

  el.querySelectorAll("div.cell").forEach(cell => {
    const index = parseInt(cell.dataset.index);
    cell.className = "cell";
    cell.textContent = "";

    if (VISIBLE && !VISIBLE.has(index)) cell.classList.add("fog");

    // ⬇️ нова зона
    if (desertCells && desertCells.has(index)) cell.classList.add("desert");

    if (bonusCells.has(index)) cell.classList.add("bonus");
    if (yellowCells.has(index)) cell.classList.add("yellow");
    if (eventCells.has(index)) { cell.textContent = "?!"; cell.style.backgroundColor = "#e0b0ff"; }
    if (portalCells.has(index)) { cell.textContent = "@";  cell.style.backgroundColor = "#add8e6"; }

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
  // якщо контейнера немає — тихо виходимо (гра продовжується)
  if (!logContainer) return;
  const line = document.createElement("div");
  line.textContent = text;
  logContainer.appendChild(line);
  logContainer.scrollTop = logContainer.scrollHeight;
}
