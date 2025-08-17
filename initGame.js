// initGame.js
import { generateEntities } from "./entityGenerator.js";
import { renderField } from "./fieldRenderer.js";
import { rollDice, selectedDice } from "./dice.js";
import { updateStats } from "./playerStats.js";

export function initGame({
  gameField,          // ✅ передаємо DOM-елемент поля
  numRows,
  numCols,
  playerPositionRef,
  monstersRef,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  turnRef
}, logContainer) {

  // (необов'язково) скинути лічильник ходу
  if (turnRef) {
    turnRef.value = 1;
    const tc = document.getElementById("turn-counter");
    if (tc) tc.textContent = turnRef.value;
  }

  // поставити гравця в центр
  playerPositionRef.value = Math.floor((numRows * numCols) / 2);

  // згенерувати сутності (мутує передані Set/Map, і ще повертає посилання)
  const result = generateEntities(
    numRows,
    numCols,
    playerPositionRef.value,
    { bonusCells, yellowCells, eventCells, portalCells },
    logContainer
  );

  // записати монстрів (маси́в)
  monstersRef.value = result.monsters;

  // скинути вибір кубиків у UI
  selectedDice[0] = selectedDice[1] = selectedDice[2] = false;
  document.querySelectorAll(".selected-dice").forEach(el => el.classList.remove("selected-dice"));

  // кинути кубики та намалювати поле
  rollDice();

  renderField({
    gameFieldElement: gameField,     // ✅ більше НІЯКОГО renderContext тут
    numRows,
    numCols,
    monsters: monstersRef.value,
    bonusCells: result.bonusCells,
    yellowCells: result.yellowCells,
    eventCells: result.eventCells,
    portalCells: result.portalCells,
    playerPosition: playerPositionRef.value
  });

  updateStats(turnRef?.value);
}
