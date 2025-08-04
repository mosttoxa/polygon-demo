// initGame.js

import { generateEntities } from "./entityGenerator.js";
import { renderField } from "./fieldRenderer.js";
import { rollDice, selectedDice } from "./dice.js";
import { updateStats } from "./playerStats.js";

export function initGame({
  numRows,
  numCols,
  gameFieldElement,
  playerPositionRef,
  monstersRef,
  bonusCells,
  yellowCells,
  eventCells,
  portalCells,
  turnRef
}, logContainer) {
  // Скидання лічильника ходу
  
  //document.getElementById("turn-counter").textContent = turnRef.value;

  // Центруємо гравця
  playerPositionRef.value = Math.floor((numRows * numCols) / 2);

  // Очищення та генерація нових сутностей
  const { monsters, bonusCells: b, yellowCells: y, eventCells: e, portalCells: p } =
    generateEntities(numRows, numCols, playerPositionRef.value, {
      bonusCells,
      yellowCells,
      eventCells,
      portalCells
    }, logContainer);

  // Запис нових монстрів
  monstersRef.value = monsters;

  // Скидання кубиків
  selectedDice[0] = false;
  selectedDice[1] = false;
  selectedDice[2] = false;
  document.querySelectorAll(".selected-dice").forEach(el => el.classList.remove("selected-dice"));

  // Новий кидок
  rollDice();

  // Візуалізація поля
  renderField({
    gameFieldElement,
    numRows,
    numCols,
    monsters,
    bonusCells: b,
    yellowCells: y,
    eventCells: e,
    portalCells: p,
    playerPosition: playerPositionRef.value
  });

  // Оновлення статистики
  updateStats();
}
