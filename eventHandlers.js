import { randomStatKey } from "./utils.js";
import { resolveCombat } from "./combat.js";
import { renderField, logEvent } from "./fieldRenderer.js";
import { updateStats } from "./playerStats.js";

export function createHandleCellClick({
  numCols,
  stats,
  monstersRef,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  playerPositionRef,
  renderContext,
  logContainer
}) {
  return function handleCellClick(target) {
    const rowDiff = Math.abs(Math.floor(target / 13) - Math.floor(playerPositionRef.value / 13));
    const colDiff = Math.abs((target % 13) - (playerPositionRef.value % 13));

    if (rowDiff + colDiff !== 1 || stats.move <= 0) return;

    playerPositionRef.value = target;
    stats.move--;
    logEvent(`Біон перемістився на поле ${target}`, logContainer);

    if (portalCells.has(target)) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * 169);
      } while (newIndex === target);
      playerPositionRef.value = newIndex;
      logEvent(`Енергетичний прокол переніс біона на поле ${newIndex}`, logContainer);
    }

    if (eventCells.has(target)) {
  const effectFunction = eventCells.get(target);
  if (typeof effectFunction === "function") {
    effectFunction(); // викликаємо збережену функцію
  } else {
    logEvent("Невідома подія", logContainer);
  }
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
    }

    monstersRef.value = resolveCombat(
  playerPositionRef.value,
  monstersRef.value,
  logContainer
);



    renderField({
  gameFieldElement: renderContext.gameFieldElement,
  numRows: renderContext.numRows,
  numCols: renderContext.numCols,
  monsters: monstersRef.value,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  playerPosition: playerPositionRef.value
});


    updateStats();
  };
}
