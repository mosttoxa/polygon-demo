// eventHandlers.js
import { renderField, logEvent, setVisible } from "./fieldRenderer.js";
import { updateStats } from "./playerStats.js";
import { resolveCombat } from "./combat.js";
import { randomStatKey } from "./playerStats.js"; // ✅ звідси беремо randomStatKey
import { computeFov } from "./fov.js";


export function createHandleCellClick({
  numCols,
  stats,
  monstersRef,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  playerPositionRef,
  renderContext,     // { numRows, numCols, gameFieldElement }
  discoveredCells,   // Set (необов'язково)
  visibleCellsRef,   // { value: Set } (необов'язково)
  setVisible: _ignoredSetVisible, // залишаємо у сигнатурі для сумісності, але не використовуємо
  logContainer
}) {
  return function handleCellClick(target) {
    const rowDiff = Math.abs(Math.floor(target / numCols) - Math.floor(playerPositionRef.value / numCols));
    const colDiff = Math.abs((target % numCols) - (playerPositionRef.value % numCols));
    if (rowDiff + colDiff !== 1 || stats.move <= 0) return;

    // рух
    playerPositionRef.value = target;
    stats.move--;
    logEvent(`Біон перемістився на поле ${target}`, logContainer);

    // події/бонуси
    if (eventCells.has(target)) {
      const ev = eventCells.get(target);
      ev(); // має власний лог/ефекти
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
      let newIndex;
      const total = renderContext.numRows * renderContext.numCols;
      do { newIndex = Math.floor(Math.random() * total); } while (newIndex === target);
      playerPositionRef.value = newIndex;
      logEvent(`Енергетичний прокол переніс біона на поле ${newIndex}`, logContainer);
    }

    // бій (після можливого порталу)
    monstersRef.value = resolveCombat({
      playerPosition: playerPositionRef.value,
      monstersRef,
      stats,
      logContainer
    });

    // перерахунок видимості (FOV) та пам’яті відкритих клітин
    const fov = computeFov(
      playerPositionRef.value,
      stats.visionRadius ?? 1,
      renderContext.numRows,
      renderContext.numCols
    );
    if (discoveredCells) fov.forEach(i => discoveredCells.add(i));
    setVisible(fov); // <-- саме з fieldRenderer.js

    // рендер
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
