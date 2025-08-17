// scan.js
import { setVisible, renderField, logEvent } from "./fieldRenderer.js";
import { stats, updateStats } from "./playerStats.js";

// ---------------- CONFIG ----------------
// "spend"  – кожне відкриття коштує 1 енергії (витрачає енергію)
// "linked" – бюджет = floor(energy / 2) на поточний хід, енергія НЕ витрачається
export const SCAN_MODE = "linked"; // або "spend"

// скільки коштує 1 відкриття у режимі "spend"
const SPEND_COST = 1;

// ---------------------------------------

const REVEALED = new Set();       // постійно відкриті клітинки (накопичуються)
let turnRevealUsed = 0;           // скільки відкрито на П поточному ході
let lastPlayerPos = null;         // щоб гарантувати відкритою клітинку гравця

// повертає скільки ще можна відкрити на цьому ході
export function getScanBudgetLeft() {
  if (SCAN_MODE === "spend") {
    // можна відкрити стільки, скільки енергії є (з урахуванням вартості)
    return Math.floor(stats.energy / SPEND_COST);
  } else { // "linked"
    return Math.max(0, Math.floor((stats.energy || 0) / 5) - turnRevealUsed);
  }
}

// викликати на початку КОЖНОГО ходу
export function scanOnTurnStart({ playerPosition }) {
  turnRevealUsed = 0;
  // гарантуємо, що позиція гравця завжди відкрита
  if (typeof playerPosition === "number") {
    REVEALED.add(playerPosition);
    lastPlayerPos = playerPosition;
  }
}

// викликати після кожного руху гравця
export function scanOnPlayerMove({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells }) {
  if (typeof playerPosition === "number") {
    REVEALED.add(playerPosition);
    lastPlayerPos = playerPosition;
    // оновимо видимість: весь світ = те, що відкрито
    applyVisibilityAndRender({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells });
  }
}

// спроба відкрити сусідню клітинку (НЕ рухаючись)
// повертає true, якщо вдалося
export function tryRevealCell(index, {
  playerPosition,
  numRows, numCols,
  gameFieldElement,
  monstersRef, bonusCells, yellowCells, eventCells, portalCells,
  logContainer
}) {
  // тільки ортогональні сусіди (Манхеттен)
  if (!isAdjacent(playerPosition, index, numCols)) return false;
  if (REVEALED.has(index)) return false;

  // перевіряємо бюджет
  if (SCAN_MODE === "spend") {
    if (stats.energy < SPEND_COST) return false;
    stats.energy -= SPEND_COST; // витрачаємо
  } else { // linked
    if (getScanBudgetLeft() <= 0) return false;
    turnRevealUsed += 1; // не витрачаємо енергію, тільки ліміт на хід
  }

  REVEALED.add(index);
  if (logContainer) logEvent(`Сканер відкрив клітинку ${index}${SCAN_MODE === "spend" ? ` (-${SPEND_COST}⚡)` : ""}`, logContainer);

  // оновлюємо видимість і рендеримо
  applyVisibilityAndRender({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells });

  // показати актуальну енергію (у режимі "spend" вона зменшилась)
  updateStats();
  return true;
}

// повністю очищає відкриття (наприклад, при повному рестарті рівня)
export function resetRevealed() {
  REVEALED.clear();
  turnRevealUsed = 0;
  lastPlayerPos = null;
}

// внутрішнє: застосувати видимість та перемалювати поле
function applyVisibilityAndRender({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells }) {
  // формуємо видиме як сукупність відкритих + поточна позиція гравця
  const visible = new Set(REVEALED);
  if (typeof playerPosition === "number") visible.add(playerPosition);
  setVisible(visible);

  renderField({
    gameFieldElement,
    numRows, numCols,
    monsters: monstersRef.value,
    bonusCells, yellowCells, eventCells, portalCells,
    playerPosition
  });
}

// утиліта перевірки ортогональної суміжності
function isAdjacent(a, b, numCols) {
  const ar = Math.floor(a / numCols), ac = a % numCols;
  const br = Math.floor(b / numCols), bc = b % numCols;
  return (Math.abs(ar - br) + Math.abs(ac - bc)) === 1;
}
