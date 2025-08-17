// eventHandlers.js
import { logEvent } from "./fieldRenderer.js";
import { updateStats, randomStatKey } from "./playerStats.js";
import { resolveCombat } from "./combat.js";

export function createHandleCellClick({
  numCols,
  stats,
  monstersRef,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  playerPositionRef,
  renderContext,   // { numRows, numCols, gameFieldElement } — беремо тільки numRows/numCols
  logContainer
}) {
  return function handleCellClick(target) {
    const cur = playerPositionRef.value;
    const rowDiff = Math.abs(Math.floor(target / numCols) - Math.floor(cur / numCols));
    const colDiff = Math.abs((target % numCols) - (cur % numCols));

    // рух лише на 1 по Манхеттену та якщо є очки ходу
    if (rowDiff + colDiff !== 1 || stats.move <= 0) return;

    // 1) РУХ
    playerPositionRef.value = target;
    stats.move--;
    logEvent(`Біон перемістився на поле ${target}`, logContainer);

    // 2) ПОДІЇ / БОНУСИ / ЖОВТІ / ПОРТАЛ
    if (eventCells.has(target)) {
      const ev = eventCells.get(target);
      try { ev?.(); } catch (e) { console.warn("event error:", e); }
      eventCells.delete(target);
    } else if (bonusCells.has(target)) {
      const key = randomStatKey();
      stats[key] = Math.min(stats[key + "Max"], stats[key] + 1);
      bonusCells.delete(target);
      logEvent(`Біон отримав +1 до ${key} на полі ${target}`, logContainer);
    } else if (yellowCells.has(target)) {
      const key = randomStatKey();
      const delta = Math.random() < 0.5 ? -2 : 2;
      stats[key] = Math.max(0, Math.min(stats[key + "Max"], stats[key] + delta));
      yellowCells.delete(target);
      logEvent(`Біон отримав ${delta > 0 ? "+2" : "-2"} до ${key}`, logContainer);
    } else if (portalCells.has(target)) {
      // телепорт у випадкову клітинку
      const total = (renderContext?.numRows ?? 0) * (renderContext?.numCols ?? numCols);
      let newIndex;
      do { newIndex = Math.floor(Math.random() * total); } while (newIndex === target);
      playerPositionRef.value = newIndex;
      logEvent(`Енергетичний прокол переніс біона на поле ${newIndex}`, logContainer);
    }

    // 3) БІЙ (після можливого телепорту)
    monstersRef.value = resolveCombat({
      playerPosition: playerPositionRef.value,
      monstersRef,
      stats,
      logContainer
    });

    // 4) ОНОВЛЕННЯ СТАТІВ (UI)
    updateStats();
    // ВАЖЛИВО: рендер/видимість виконує script.js через scanOnPlayerMove(..)
  };
}
