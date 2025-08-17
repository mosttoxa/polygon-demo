// script.js
import { stats, updateStats, tryUnlockDice } from "./playerStats.js";
import { currentDice, selectedDice, rollDice } from "./dice.js";
import { renderField } from "./fieldRenderer.js";
import { resolveCombat } from "./combat.js";
import { handleRightClick } from "./rightClickHandler.js";
import { createHandleCellClick } from "./eventHandlers.js";
import { initGame } from "./initGame.js";
import { showQuestionIfNeeded } from "./popupQuestion.js";
import { moveMonstersRandom } from "./monstersAI.js";

// 🔎 новий сканер
import {
  scanOnTurnStart,
  scanOnPlayerMove,
  tryRevealCell,
  getScanBudgetLeft,
} from "./scan.js";

document.addEventListener("DOMContentLoaded", () => {
  const gameField = document.getElementById("game-field");
  const logContainer = document.getElementById("combat-log");

  const numRows = 13;
  const numCols = 13;

  // Стан гри
  let diceUsed = false;
  let currentRollCount = Math.max(1, Math.min(6, stats.maxDice || 1));
  const turnRef = { value: 1 };
  window.turnRef = turnRef;

  const playerPositionRef = { value: Math.floor((numRows * numCols) / 2) };
  window.playerPositionRef = playerPositionRef;

  const monstersRef = { value: [] };
  const bonusCells = new Set();
  const yellowCells = new Set();
  const eventCells = new Map();
  const portalCells = new Set();

  // Створюємо DOM-клітинки один раз
  for (let i = 0; i < numRows * numCols; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i;
    cell.classList.add("cell");
    gameField.appendChild(cell);
  }

  // Старт/рестарт гри
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

    // Сканер: початок ходу + промальовка
    scanOnTurnStart({ playerPosition: playerPositionRef.value });
    scanOnPlayerMove({
      playerPosition: playerPositionRef.value,
      numRows, numCols,
      gameFieldElement: gameField,
      monstersRef, bonusCells, yellowCells, eventCells, portalCells
    });

    // Кидок джерел на перший хід уже відбувається всередині initGame → оновимо лічильник
    currentRollCount = Math.max(1, Math.min(6, stats.maxDice || 1));
    updateStats(turnRef.value);
  };

  // Перший запуск
  restartGame();

  // Обробник кліку з логікою руху (із eventHandlers.js)
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
  });

  // Навішуємо слухачі на клітинки
  gameField.querySelectorAll(".cell").forEach(cell => {
    const i = Number(cell.dataset.index);

    cell.addEventListener("click", (e) => {
      // Shift+клік = спроба відкрити сусідню клітинку сканером (без руху)
      if (e.shiftKey) {
        tryRevealCell(i, {
          playerPosition: playerPositionRef.value,
          numRows, numCols,
          gameFieldElement: gameField,
          monstersRef, bonusCells, yellowCells, eventCells, portalCells,
          logContainer
        });
        return;
      }

      // Звичайний клік = рух (як і було). Після руху — оновлюємо сканер.
      handleCellClick(i);

      scanOnPlayerMove({
        playerPosition: playerPositionRef.value,
        numRows, numCols,
        gameFieldElement: gameField,
        monstersRef, bonusCells, yellowCells, eventCells, portalCells
      });
    });

    cell.addEventListener("contextmenu", (e) => handleRightClick(e, i, monstersRef.value));
  });

  // Розподіл значень джерел з клавіатури
  document.addEventListener("keydown", e => {
    const map = { m: "move", a: "attack", e: "energy" };
    const target = map[e.key];
    if (!target) return;

    const idx = selectedDice.findIndex(v => !v);
    if (idx === -1) return; // усі вже використані

    const value = currentDice[idx];

    if (target === "energy") {
      stats.energy = Math.min(stats.energyMax, stats.energy + value);
      tryUnlockDice(logContainer); // може розблокувати 2й/3й... слот
    } else {
      stats[target] += value;
    }

    selectedDice[idx] = true;
    const dieEl = document.getElementById(`dice${idx + 1}`);
    if (dieEl) dieEl.classList.add("selected-dice");

    const usedCount = selectedDice.filter(Boolean).length;
    if (usedCount >= currentRollCount) {
      diceUsed = true;
    }

    updateStats(turnRef.value);
  });

  // Кнопка: кинути джерела
  document.getElementById("roll-button").addEventListener("click", () => {
    rollDice(logContainer);
    currentRollCount = Math.max(1, Math.min(6, stats.maxDice || 1));
  });

  // Логіка кінця ходу
  function endTurn() {
    const usedCount = selectedDice.filter(Boolean).length;
    if (usedCount < currentRollCount) {
      return alert(`Використай ${currentRollCount} значення(нь) джерел перед завершенням ходу.`);
    }

    // Наступний хід
    turnRef.value++;
    const tc = document.getElementById("turn-counter");
    if (tc) tc.textContent = turnRef.value;

    // Скидання стану вибраних значень
    diceUsed = false;
    selectedDice.fill(false);
    document.querySelectorAll(".selected-dice").forEach(el => el.classList.remove("selected-dice"));

    // Запитання на певних ходах
    showQuestionIfNeeded({
      turnRef,
      stats,
      logContainer,
      playerPositionRef,
      numRows,
      numCols,
      onUpdate: () => {
        // Оновлюємо UI і видимість без зміни позиції
        updateStats(turnRef.value);
        scanOnPlayerMove({
          playerPosition: playerPositionRef.value,
          numRows, numCols,
          gameFieldElement: gameField,
          monstersRef, bonusCells, yellowCells, eventCells, portalCells
        });
      },
      afterPopup: () => {
        // Початок нового ходу для сканера (скидаємо бюджет)
        scanOnTurnStart({ playerPosition: playerPositionRef.value });

        // Рух монстрів
        moveMonstersRandom({ monstersRef, numRows, numCols, playerPositionRef });

        // Бій після руху монстрів
        resolveCombat({
          playerPosition: playerPositionRef.value,
          monstersRef,
          stats,
          logContainer
        });

        // Оновлення сканеру і рендера (позиція могла змінитися під час подій)
        scanOnPlayerMove({
          playerPosition: playerPositionRef.value,
          numRows, numCols,
          gameFieldElement: gameField,
          monstersRef, bonusCells, yellowCells, eventCells, portalCells
        });

        // Підготувати джерела на новий хід
        rollDice(logContainer);
        currentRollCount = Math.max(1, Math.min(6, stats.maxDice || 1));

        // Оновити стати
        updateStats(turnRef.value);
      }
    });
  }

  // Кнопка: завершити хід
  document.getElementById("end-turn-button").addEventListener("click", () => {
    endTurn();
  });

  // (Додатково, опційно) — можна відобразити ліміт скану в журналі:
  // import("./fieldRenderer.js").then(m => m.logEvent(`[SCAN] Доступно відкриттів: ${getScanBudgetLeft()}`, logContainer));
});
