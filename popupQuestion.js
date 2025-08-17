// popupQuestion.js
import { logEvent } from "./fieldRenderer.js";

const QUESTION_CONFIG = {
  2: {
    text: "Ну як тобі на полігоні, біончику? Подобається?",
    options: [
      { label: "Так",  effect: ({stats, log}) => { stats.energy = clamp(stats.energy + 1, 0, stats.energyMax); log("Ти відповів: Так! +1 до енергії"); } },
      { label: "Ні",   effect: ({stats, log}) => { stats.attack = clamp(stats.attack + 1, 0, stats.attackMax); log("Ти відповів: Ні! +1 до атаки"); } },
      { label: "Не хочу відповідати", effect: ({stats, log}) => { stats.move = clamp(stats.move + 1, 0, stats.moveMax); log("Ти відповів: Не хочу відповідати. +1 до ходу"); } },
    ]
  },
  5: {
    text: "Ну як тобі на полігоні, біончику? Подобається?",
    options: [
      { label: "Так",  effect: ({stats, log}) => { stats.energy = clamp(stats.energy + 3, 0, stats.energyMax); log("5-й хід: Так → +3 енергії"); } },
      { label: "Ні",   effect: ({stats, log}) => { stats.attack = clamp(stats.attack - 3, 0, stats.attackMax); log("5-й хід: Ні → -3 атаки"); } },
      { label: "Не хочу відповідати", effect: ({stats, log}) => { addAll(stats, -1); log("5-й хід: Не хочу → -1 до всіх характеристик"); } },
    ]
  },
  10: {
    text: "Ну як тобі на полігоні, біончику? Подобається?",
    options: [
      { label: "Так",  effect: ({stats, log}) => { stats.attack = clamp(stats.attack - 3, 0, stats.attackMax); log("10-й хід: Так → -3 атаки"); } },
      { label: "Ні",   effect: ({stats, log}) => { stats.energy = clamp(stats.energy + 3, 0, stats.energyMax); log("10-й хід: Ні → +3 енергії"); } },
      { label: "Не хочу відповідати", effect: ({stats, log}) => { addAll(stats, -2); log("10-й хід: Не хочу → -2 до всіх характеристик"); } },
    ]
  },
  15: {
    text: "Ну як тобі на полігоні, біончику? Подобається?",
    options: [
      { label: "Так",  effect: ({stats, log}) => { stats.energy = clamp(stats.energy + 5, 0, stats.energyMax); log("15-й хід: Так → +5 енергії"); } },
      { label: "Ні",   effect: ({stats, log}) => { stats.move = 0; log("15-й хід: Ні → усі очки ходу скинуто до 0"); } },
      { label: "Не хочу відповідати", effect: ({playerPositionRef, numRows, numCols, log}) => {
          moveToRandomCorner(playerPositionRef, numRows, numCols);
          log("15-й хід: Не хочу → телепорт у випадковий кут полігону");
        }
      },
    ]
  }
};

const shownTurns = new Set();

export function showQuestionIfNeeded({
  turnRef,
  stats,
  logContainer,
  playerPositionRef,
  numRows,
  numCols,
  onUpdate,
  afterPopup
}) {
  const turn = Number(turnRef?.value ?? 0);
  const popup = document.getElementById("popup-question");
  const config = QUESTION_CONFIG[turn];

  // ДІАГНОСТИЧНИЙ ЛОГ: бачимо хід і наявність конфіга/попапа
  logEvent(`[Q] turn=${turn}, hasConfig=${!!config}, hasPopup=${!!popup}`, logContainer);

  if (!popup || !config) {
    afterPopup && afterPopup();
    return;
  }

  if (shownTurns.has(turn)) {
    logEvent(`[Q] turn=${turn} вже показували, пропускаю`, logContainer);
    afterPopup && afterPopup();
    return;
  }
  shownTurns.add(turn);

  // Готуємо попап
  popup.style.display = "block";
  popup.style.zIndex = "1000";
  popup.dataset.shown = "true";

  // Гарантуємо наявність <p> з текстом
  let question = popup.querySelector("p");
  if (!question) {
    question = document.createElement("p");
    popup.prepend(question);
  }
  question.textContent = config.text;

  // Прибираємо старі кнопки та створюємо нові
  popup.querySelectorAll("button").forEach(btn => btn.remove());
  const buttons = [];
  for (let i = 0; i < 3; i++) {
    const b = document.createElement("button");
    popup.appendChild(b);
    buttons.push(b);
  }

  const log = (msg) => logEvent(msg, logContainer);

  // Навішуємо обробники на кнопки
  config.options.forEach((opt, i) => {
    const btn = buttons[i];
    if (!btn) return;
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      opt.effect({ stats, log, playerPositionRef, numRows, numCols });
      popup.style.display = "none";
      onUpdate && onUpdate();
      afterPopup && afterPopup();
    }, { once: true });
  });

  logEvent(`[Q] Popup shown for turn=${turn}`, logContainer);
}

export function resetQuestions() {
  shownTurns.clear();
}

// helpers
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function addAll(stats, delta) {
  stats.energy = clamp(stats.energy + delta, 0, stats.energyMax);
  stats.move   = clamp(stats.move   + delta, 0, stats.moveMax);
  stats.attack = clamp(stats.attack + delta, 0, stats.attackMax);
}
function moveToRandomCorner(playerPositionRef, numRows, numCols) {
  if (!playerPositionRef || typeof playerPositionRef.value !== "number") return;
  const corners = [0, numCols - 1, (numRows - 1) * numCols, numRows * numCols - 1];
  const pick = corners[Math.floor(Math.random() * corners.length)];
  playerPositionRef.value = pick;
}
