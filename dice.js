// dice.js
import { stats, updateStats, tryUnlockDice } from "./playerStats.js";
import { logEvent } from "./fieldRenderer.js";

// Тримай масиви одразу на 6, але фактично використовуємо лише stats.maxDice
export let currentDice = [0, 0, 0, 0, 0, 0];
export let selectedDice = [false, false, false, false, false, false];

/**
 * Гарантує, що в DOM є до 6 слотів для “джерел” (dice1..dice6).
 * Якщо контейнер має іншу розмітку — намагаємось вставити нові слоти перед кнопкою roll.
 */
function ensureDiceSlotsInDOM(maxVisible) {
  const container = document.getElementById("dice-container");
  if (!container) return;
  const rollBtn = document.getElementById("roll-button");

  for (let i = 1; i <= 6; i++) {
    let el = document.getElementById(`dice${i}`);
    if (!el) {
      el = document.createElement("div");
      el.id = `dice${i}`;
      el.className = "dice";
      el.textContent = "";
      // Вставимо перед кнопкою “Кинути кубики”, якщо вона є
      if (rollBtn && rollBtn.parentElement === container) {
        container.insertBefore(el, rollBtn);
      } else {
        container.appendChild(el);
      }
    }
    // Показуємо лише доступні слоти; інші залишимо порожніми
    if (i <= maxVisible) {
      el.style.display = "inline-block";
    } else {
      el.style.display = "none";
      el.classList.remove("selected-dice");
      el.textContent = "";
    }
  }
}

/**
 * Кидок доступних джерел/“кубиків”.
 * - Спершу перевіряємо, чи можна розблокувати новий слот (tryUnlockDice).
 * - Кидаємо рівно stats.maxDice штук.
 * - Обробляємо комбінації.
 */
export function rollDice(logContainer) {
  // Можемо розблокувати наступний слот, якщо енергії достатньо
  tryUnlockDice(logContainer);

  const n = Math.max(1, Math.min(6, stats.maxDice || 1));

  // Підготуємо DOM під потрібну кількість слотів
  ensureDiceSlotsInDOM(n);

  // Кидаємо n “кубиків”
  for (let i = 0; i < n; i++) {
    currentDice[i] = Math.floor(Math.random() * 6) + 1;
    const el = document.getElementById(`dice${i + 1}`);
    if (el) {
      el.textContent = currentDice[i];
      el.classList.remove("selected-dice");
      el.style.display = "inline-block";
    }
  }
  // Слоти, які поки що недоступні — не чіпаємо (вони приховані ensureDiceSlotsInDOM)

  // Обнуляємо вибір лише для активних слотів
  selectedDice = Array(n).fill(false);

  // --- Комбінації (як було) ---
  // Страховка для specialMoves
  if (!stats.specialMoves) {
    stats.specialMoves = { shield: 0, dash: 0, strike: 0, recover: 0 };
  }

  const rolledNow = currentDice.slice(0, n);
  const sorted = [...rolledNow].sort().join("");

  if (sorted === "123") {
    stats.specialMoves.shield++;
    logEvent && logEvent("Комбінація 123 — +1 до Щита", logContainer);
  } else if (sorted === "234") {
    stats.specialMoves.dash++;
    logEvent && logEvent("Комбінація 234 — +1 до Ривка (хід)", logContainer);
  } else if (sorted === "345") {
    stats.specialMoves.strike++;
    logEvent && logEvent("Комбінація 345 — +1 до Удару (атака)", logContainer);
  } else if (sorted === "456") {
    stats.specialMoves.recover++;
    logEvent && logEvent("Комбінація 456 — +1 до Відновлення (енергія)", logContainer);
  } else if (n >= 3 && rolledNow[0] === rolledNow[1] && rolledNow[1] === rolledNow[2]) {
    // трійка однакових (беремо перші 3 активні джерела)
    const v = rolledNow[0];
    stats.energy = Math.min(stats.energyMax, stats.energy + v);
    logEvent && logEvent(`Випала трійка ${v} — +${v} до енергії`, logContainer);
  }

  updateStats(); // щоб одразу побачити зміну прийомів/енергії/кількості слотів (якщо додамо у UI)
}
