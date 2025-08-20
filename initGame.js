// initGame.js
import { generateEntities } from "./entityGenerator.js";
import { renderField } from "./fieldRenderer.js";
import { rollDice, selectedDice } from "./dice.js";
import { updateStats } from "./playerStats.js";
import { seedDesert } from "./desert.js";            // ⬅️ нове

export function initGame({
  gameField,
  numRows,
  numCols,
  playerPositionRef,
  monstersRef,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  desertCells,                          // ⬅️ приймаємо
  turnRef
}, logContainer) {
  // ...
  // стартова позиція
  playerPositionRef.value = Math.floor((numRows * numCols) / 2);

  // стартова пустеля 3x3 у випадковому куті (один раз)
  seedDesert(desertCells, numRows, numCols);

  const result = generateEntities(
    numRows, numCols, playerPositionRef.value,
    { bonusCells, yellowCells, eventCells, portalCells },
    logContainer
  );
  monstersRef.value = result.monsters;

  // скидання вибору та кидок
  selectedDice[0] = selectedDice[1] = selectedDice[2] = false;
  document.querySelectorAll(".selected-dice").forEach(el => el.classList.remove("selected-dice"));
  rollDice();

  renderField({
    gameFieldElement: gameField,
    numRows, numCols,
    monsters: monstersRef.value,
    bonusCells: result.bonusCells,
    yellowCells: result.yellowCells,
    eventCells: result.eventCells,
    portalCells: result.portalCells,
    playerPosition: playerPositionRef.value,
    desertCells                          // ⬅️ передаємо
  });

  updateStats(turnRef?.value);
}
