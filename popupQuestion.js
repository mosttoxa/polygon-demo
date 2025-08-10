// popupQuestion.js

// Які ходи показувати й що роблять відповіді
// (2 — наш тестовий, можеш прибрати його з об’єкта, коли не буде потрібен)
const QUESTION_CONFIG = {
  2:  { // dev-тест
    text: "Ну як тобі на полігоні, біончику? Подобається?",
    options: [
      { label: "Так",  effect: ({stats, log}) => { stats.energy = clamp(stats.energy + 1, 0, stats.energyMax); log("Ти відповів: Так! +1 до енергії"); } },
      { label: "Ні",   effect: ({stats, log}) => { stats.attack = clamp(stats.attack + 1, 0, stats.attackMax); log("Ти відповів: Ні! +1 до атаки"); } },
      { label: "Не хочу відповідати", effect: ({stats, log}) => { stats.move   = clamp(stats.move + 1, 0, stats.moveMax);  log("Ти відповів: Не хочу відповідати. +1 до ходу"); } },
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

// показати попап, якщо для цього ходу є конфіг і його ще не показували
export function showQuestionIfNeeded({ turnRef, stats, logContainer, onUpdate, playerPositionRef, numRows, numCols }) {
  const t = turnRef?.value;
  const cfg = QUESTION_CONFIG[t];
  if (!cfg) return;

  const popup = document.getElementById("popup-question");
  if (!popup) return;

  // якщо вже показували на цьому ході — вийти
  if (popup.dataset.shown === String(t)) return;

  // намалюємо чистий контент і покажемо
  popup.innerHTML = `
    <p>${cfg.text}</p>
    ${cfg.options.map((opt, i) => `<button data-idx="${i}">${opt.label}</button>`).join("")}
  `;
  popup.style.display = "block";

  const log = (msg) => {
    const div = document.createElement("div");
    div.textContent = msg;
    logContainer.appendChild(div);
    logContainer.scrollTop = logContainer.scrollHeight;
  };

  const buttons = popup.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const opt = cfg.options[idx];
      if (opt?.effect) {
        opt.effect({ stats, log, playerPositionRef, numRows, numCols });
      }
      popup.style.display = "none";
      popup.dataset.shown = String(t);
      onUpdate?.();
    }, { once: true });
  });
}

// helpers
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function addAll(stats, delta) {
  stats.energy = clamp(stats.energy + delta, 0, stats.energyMax);
  stats.move   = clamp(stats.move   + delta, 0, stats.moveMax);
  stats.attack = clamp(stats.attack + delta, 0, stats.attackMax);
}
function moveToRandomCorner(playerPositionRef, numRows, numCols) {
  const corners = [
    0,
    numCols - 1,
    (numRows - 1) * numCols,
    numRows * numCols - 1
  ];
  const pick = corners[Math.floor(Math.random() * corners.length)];
  playerPositionRef.value = pick;
}
