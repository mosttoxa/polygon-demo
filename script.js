import { stats, updateStats } from "./playerStats.js";
import { currentDice, selectedDice, rollDice } from "./dice.js";
import { renderField, logEvent } from "./fieldRenderer.js";
import { showDamagePopup } from "./damagePopup.js";
import { resolveCombat } from "./combat.js";
import { handleRightClick } from "./rightClickHandler.js";
import { createHandleCellClick } from "./eventHandlers.js";
import { initGame } from "./initGame.js"; // новий модуль
//import { setupPopupQuestion } from "./popupQuestion.js";
import { showQuestionIfNeeded } from "./popupQuestion.js";
import { moveMonstersRandom } from "./monstersAI.js";


document.addEventListener("DOMContentLoaded", () => {
  const gameField = document.getElementById("game-field");
  const logContainer = document.getElementById("combat-log");
  showQuestionIfNeeded(logContainer);
  const numRows = 13;
  const numCols = 13;
  //let turn = 1;
  let diceUsed = false;
  const turnRef = { value: 1 };
  window.turnRef = turnRef;
  
  const playerPositionRef = { value: Math.floor((numRows * numCols) / 2) };
window.playerPositionRef = playerPositionRef; // ← fallback

  const monstersRef = { value: [] };
  const bonusCells = new Set();
  const yellowCells = new Set();
  const eventCells = new Map();
  const portalCells = new Set();

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
      gameFieldElement: gameField,
      monsters: monstersRef.value,
      bonusCells,
      yellowCells,
      eventCells,
      portalCells,
      playerPosition: playerPositionRef.value
    },
    logContainer
  });

  for (let i = 0; i < numRows * numCols; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i;
    cell.classList.add("cell");
    cell.addEventListener("click", () => handleCellClick(i));
    cell.addEventListener("contextmenu", (e) => handleRightClick(e, i, monstersRef.value));
    gameField.appendChild(cell);
  }

  document.addEventListener("keydown", e => {
    const map = { m: "move", a: "attack", e: "energy" };
    const target = map[e.key];
    if (!target) return;
    const idx = selectedDice.findIndex(v => !v);
    if (idx === -1) return;
    const value = currentDice[idx];
    if (target === "energy") stats.energy = Math.min(stats.energyMax, stats.energy + value);
    else stats[target] += value;
    selectedDice[idx] = true;
    document.getElementById(`dice${idx + 1}`).classList.add("selected-dice");
    if (selectedDice.filter(v => v).length >= 2) diceUsed = true;
    updateStats(turnRef.value);
  });

  
function endTurn() {
  if (!diceUsed) return alert("Розподіліть 2 кубики!");

  turnRef.value++;
  document.getElementById("turn-counter").textContent = turnRef.value;

  diceUsed = false;
  selectedDice[0] = selectedDice[1] = selectedDice[2] = false;
  document.querySelectorAll(".selected-dice").forEach(el => el.classList.remove("selected-dice"));

  rollDice(logContainer);

  showQuestionIfNeeded({
    turnRef,
    stats,
    logContainer,
    playerPositionRef,
    numRows,
    numCols,
    onUpdate: () => {
      // легкий апдейт UI прямо під час попапу (не обов’язково)
      updateStats(turnRef.value);
      renderField({
        gameFieldElement: gameField,
        numRows, numCols,
        monsters: monstersRef.value,
        bonusCells, yellowCells, eventCells, portalCells,
        playerPosition: playerPositionRef.value
      });
    },
    afterPopup: () => {
      // ← все, що має статись ПІСЛЯ попапа і ДО початку нового ходу
      moveMonstersRandom({ monstersRef, numRows, numCols, playerPositionRef });

      moveMonstersRandom({ monstersRef, numRows, numCols, playerPositionRef });

const alive = resolveCombat({
  playerPosition: playerPositionRef.value,
  monstersRef,
  stats,
  logContainer
});

renderField({
  gameFieldElement: gameField,
  numRows, numCols,
  monsters: alive,
  bonusCells, yellowCells, eventCells, portalCells,
  playerPosition: playerPositionRef.value
});

      updateStats(turnRef.value);
    }
  });
}

  document.getElementById("roll-button").addEventListener("click", () => {
    rollDice(logContainer);
  });

  document.getElementById("end-turn-button").addEventListener("click", () => {
    endTurn();
  });

  // ІНІЦІАЛІЗАЦІЯ ГРИ
  initGame({
    numRows,
    numCols,
    playerPositionRef,
    monstersRef,
    bonusCells,
    yellowCells,
    eventCells,
    portalCells
  }, logContainer);

  updateStats(turnRef.value);
});
