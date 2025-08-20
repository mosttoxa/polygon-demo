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
export function scanOnPlayerMove({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells, desertCells }) {
  if (typeof playerPosition === "number") {
    REVEALED.add(playerPosition);
    lastPlayerPos = playerPosition;
    // оновимо видимість: весь світ = те, що відкрито
    applyVisibilityAndRender({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells, desertCells });
  }
}

// спроба відкрити сусідню клітинку (НЕ рухаючись)
// повертає true, якщо вдалося
export function tryRevealCell(index, {
  playerPosition,
  numRows, numCols,
  gameFieldElement,
  monstersRef, bonusCells, yellowCells, eventCells, portalCells, desertCells,
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
  applyVisibilityAndRender({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells, desertCells });

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

let REVEAL_ALL = false;
export function setRevealAll(on) { REVEAL_ALL = !!on; }
export function toggleRevealAll() { REVEAL_ALL = !REVEAL_ALL; }
export function isRevealAll() { return REVEAL_ALL; }


// внутрішнє: застосувати видимість та перемалювати поле
function applyVisibilityAndRender({ playerPosition, numRows, numCols, gameFieldElement, monstersRef, bonusCells, yellowCells, eventCells, portalCells, desertCells }) {
  if (REVEAL_ALL) {
    // null => fieldRenderer НЕ накладає fog (див. перевірку VISIBLE && !VISIBLE.has)
    setVisible(null);
  } else {
    const visible = new Set(REVEALED);
    if (typeof playerPosition === "number") visible.add(playerPosition);
    setVisible(visible);
  }

  renderField({
    gameFieldElement,
    numRows, numCols,
    monsters: monstersRef.value,
    bonusCells, yellowCells, eventCells, portalCells,
    playerPosition,
    desertCells              
  });
}


// утиліта перевірки ортогональної суміжності
// утиліта перевірки 8-суміжності (включно з діагоналями)
function isAdjacent(a, b, numCols) {
  const ar = Math.floor(a / numCols), ac = a % numCols;
  const br = Math.floor(b / numCols), bc = b % numCols;
  const dr = Math.abs(ar - br), dc = Math.abs(ac - bc);
  // сусідня, якщо відстань за Чебишевим = 1 (і це не та сама клітинка)
  return (dr !== 0 || dc !== 0) && Math.max(dr, dc) === 1;
}

