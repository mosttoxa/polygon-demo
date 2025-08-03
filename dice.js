// dice.js
import { updateStats } from './playerStats.js';
import { stats } from './playerStats.js';

export let currentDice = [0, 0, 0];
export let selectedDice = [false, false, false];
export let diceUsed = false;

export function rollDice(stats, updateStats, logEvent) {
  for (let i = 0; i < 3; i++) {
    currentDice[i] = Math.floor(Math.random() * 6) + 1;
    const dieEl = document.getElementById(`dice${i + 1}`);
    dieEl.textContent = currentDice[i];
    dieEl.classList.remove("selected-dice");
  }

  selectedDice = [false, false, false];
  diceUsed = false;

  const combo = currentDice.slice().sort().join("");
  if (combo === "123") {
    stats.specialMoves.shield++;
    logEvent("Комбінація 123 — +1 до Щита");
  } else if (combo === "234") {
    stats.specialMoves.dash++;
    logEvent("Комбінація 234 — +1 до Ривка (хід)");
  } else if (combo === "345") {
    stats.specialMoves.strike++;
    logEvent("Комбінація 345 — +1 до Удару (атака)");
  } else if (combo === "456") {
    stats.specialMoves.recover++;
    logEvent("Комбінація 456 — +1 до Відновлення (енергія)");
  } else if (currentDice[0] === currentDice[1] && currentDice[1] === currentDice[2]) {
    stats.energy = Math.min(stats.energyMax, stats.energy + currentDice[0]);
    logEvent(`Випала трійка ${currentDice[0]} — +${currentDice[0]} до енергії`);
  }
  
}

export function assignDiceToStat(key, stats, updateStats) {
  const unassigned = selectedDice.findIndex(sel => !sel);
  if (unassigned === -1) return;

  const value = currentDice[unassigned];
  if (key === "move") stats.move += value;
  if (key === "attack") stats.attack += value;
  if (key === "energy") stats.energy = Math.min(stats.energyMax, stats.energy + value);

  selectedDice[unassigned] = true;
  document.getElementById(`dice${unassigned + 1}`).classList.add("selected-dice");

  if (selectedDice.filter(v => v).length >= 2) {
    diceUsed = true;
  }

  updateStats(turnRef.value);
}
