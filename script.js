// script.js
import { stats, updateStats } from "./playerStats.js";
import { currentDice, selectedDice, rollDice } from "./dice.js";
import { renderField, logEvent, setVisible } from "./fieldRenderer.js";
import { resolveCombat } from "./combat.js";
import { handleRightClick } from "./rightClickHandler.js";
import { createHandleCellClick } from "./eventHandlers.js";
import { initGame } from "./initGame.js";
import { showQuestionIfNeeded } from "./popupQuestion.js";
import { moveMonstersRandom } from "./monstersAI.js";
import { computeFov } from "./fov.js";

document.addEventListener("DOMContentLoaded", () => {
  const gameField = document.getElementById("game-field");
  const logContainer = document.getElementById("combat-log");

  const numRows = 13;
  const numCols = 13;

  // Стан гри
  let diceUsed = false;
  const turnRef = { value: 1 };
  window.turnRef = turnRef;

  const playerPositionRef = { value: Math.floor((numRows * numCols) / 2) };
  window.playerPositionRef = playerPositionRef;

  const monstersRef = { value: [] };
  const bonusCells = new Set();
  const yellowCells = new Set();
  const eventCells = new Map();
  const portalCells = new Set();

  // Ініціалізація поля (DOM-осередки)
  for (let i = 0; i < numRows * numCols; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i;
    cell.classList.add("cell");
    gameField.appendChild(cell);
  }

  // Старт/рестарт гри (колбек)
  const restartGame = () => {
    initGame({
      gameField,
      numRows,
      numCols,
      playerPositionRef,
      monstersRef,
      bonusCells,
      yellowCells,
      eventCells,
      portalCells,
      turnRef
    }, logContainer);

    // Порахувати FOV і відрендерити
    const fov = computeFov(playerPositionRef.value, stats.visionRadius ?? 1, numRows, numCols);
    setVisible(fov);
    renderField({
      gameFieldElement: gameField,
      numRows, numCols,
      monsters: monstersRef.value,
      bonusCells, yellowCells, eventCells, portalCells,
      playerPosition: playerPositionRef.value
    });

    updateStats(turnRef.value);
  };

  // Перший запуск
  restartGame();

  // Обробник кліку по клітинці
  const handleCellClick = createHandleCellClick({
    numCols,
    stats,
    monstersRef,
    bonusCells,
    yellowCells,
    eventCells,
    portalCells,
    playerPositionRef,
    renderContext: {
      numRows,
      numCols,
      gameFieldElement: gameField
    },
    logContainer
    // discoveredCells / visibleCellsRef не передаємо — використовуємо setVisible з fieldRenderer
  });

  // Навішуємо слухачі кліків/правого кліку (тепер, коли DOM-клітинки створені)
  gameField.querySelectorAll(".cell").forEach(cell => {
    const i = Number(cell.dataset.index);
    cell.addEventListener("click", () => handleCellClick(i));
    cell.addEventListener("contextmenu", (e) => handleRightClick(e, i, monstersRef.value));
  });

  // Розподіл значень кубиків з клавіатури
  document.addEventListener("keydown", e => {
    const map = { m: "move", a: "attack", e: "energy" };
    const target = map[e.key];
    if (!target) return;
    const idx = selectedDice.findIndex(v => !v);
    if (idx === -1) return;
    const value = currentDice[idx];
    if (target === "energy") {
      stats.energy = Math.min(stats.energyMax, stats.energy + value);
    } else {
      stats[target] += value;
    }
    selectedDice[idx] = true;
    const dieEl = document.getElementById(`dice${idx + 1}`);
    if (dieEl) dieEl.classList.add("selected-dice");
    if (selectedDice.filter(v => v).length >= 2) diceUsed = true;
    updateStats(turnRef.value);
  });

  // Кнопка: кинути кубики
  document.getElementById("roll-button").addEventListener("click", () => {
    rollDice(logContainer);
  });

  // Логіка кінця ходу
  function endTurn() {
    if (!diceUsed) return alert("Розподіліть 2 кубики!");

    // Переходимо на наступний хід
    turnRef.value++;
    const tc = document.getElementById("turn-counter");
    if (tc) tc.textContent = turnRef.value;

    // Скидаємо стан кубиків
    diceUsed = false;
    selectedDice[0] = selectedDice[1] = selectedDice[2] = false;
    document.querySelectorAll(".selected-dice").forEach(el => el.classList.remove("selected-dice"));

    // Питання по ходу (може змінити стати/позицію)
    showQuestionIfNeeded({
      turnRef,
      stats,
      logContainer,
      playerPositionRef,
      numRows,
      numCols,
      onUpdate: () => {
        // миттєвий апдейт під час попапа
        updateStats(turnRef.value);
        const fov = computeFov(playerPositionRef.value, stats.visionRadius ?? 1, numRows, numCols);
        setVisible(fov);
        renderField({
          gameFieldElement: gameField,
          numRows, numCols,
          monsters: monstersRef.value,
          bonusCells, yellowCells, eventCells, portalCells,
          playerPosition: playerPositionRef.value
        });
      },
      afterPopup: () => {
        // 1) Рух монстрів
        moveMonstersRandom({ monstersRef, numRows, numCols, playerPositionRef });

        // 2) Бій
        resolveCombat({
          playerPosition: playerPositionRef.value,
          monstersRef,
          stats,
          logContainer
        });

        // 3) FOV + рендер
        const fov = computeFov(playerPositionRef.value, stats.visionRadius ?? 1, numRows, numCols);
        setVisible(fov);
        renderField({
          gameFieldElement: gameField,
          numRows, numCols,
          monsters: monstersRef.value,
          bonusCells, yellowCells, eventCells, portalCells,
          playerPosition: playerPositionRef.value
        });

        // 4) Підготувати кубики на новий хід
        rollDice(logContainer);

        // 5) Оновити стати
        updateStats(turnRef.value);
      }
    });
  }

  // Кнопка: завершити хід
  document.getElementById("end-turn-button").addEventListener("click", () => {
    endTurn();
  });
});
