// dice.js
import { stats, updateStats } from "./playerStats.js";
import { logEvent } from "./fieldRenderer.js";

export let currentDice = [0, 0, 0];
export let selectedDice = [false, false, false];

export function rollDice(logContainer) {
  for (let i = 0; i < 3; i++) {
    currentDice[i] = Math.floor(Math.random() * 6) + 1;
    const el = document.getElementById(`dice${i + 1}`);
    if (el) {
      el.textContent = currentDice[i];
      el.classList.remove("selected-dice");
    }
  }
  selectedDice = [false, false, false];

  // --- комбінації ---
  // Підстрахуємося, якщо хтось десь обнулив specialMoves
  if (!stats.specialMoves) {
    stats.specialMoves = { shield: 0, dash: 0, strike: 0, recover: 0 };
  }

  const sorted = [...currentDice].sort().join("");
  if (sorted === "123") {
    stats.specialMoves.shield++;
    logEvent("Комбінація 123 — +1 до Щита", logContainer);
  } else if (sorted === "234") {
    stats.specialMoves.dash++;
    logEvent("Комбінація 234 — +1 до Ривка (хід)", logContainer);
  } else if (sorted === "345") {
    stats.specialMoves.strike++;
    logEvent("Комбінація 345 — +1 до Удару (атака)", logContainer);
  } else if (sorted === "456") {
    stats.specialMoves.recover++;
    logEvent("Комбінація 456 — +1 до Відновлення (енергія)", logContainer);
  } else if (currentDice[0] === currentDice[1] && currentDice[1] === currentDice[2]) {
    // трійка однакових
    const v = currentDice[0];
    stats.energy = Math.min(stats.energyMax, stats.energy + v);
    logEvent(`Випала трійка ${v} — +${v} до енергії`, logContainer);
  }

  updateStats(); // щоб одразу побачити +1 до прийомів/енергії
}
