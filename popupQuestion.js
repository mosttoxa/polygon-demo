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
export function showQuestionIfNeeded({
  turnRef,
  stats,
  logContainer,
  playerPositionRef,
  numRows,
  numCols,
  onUpdate,     // існуючий колбек для миттєвого UI-апдейту
  afterPopup    // НОВО: те, що треба зробити після попапа (рух монстрів тощо)
}) {
  const popup = document.getElementById("popup-question");
  const needPopup = (turnRef?.value === 5 || turnRef?.value === 10 || turnRef?.value === 15);

  if (!popup || !needPopup) {
    // попапа немає — одразу продовжуємо цикл ходу
    afterPopup && afterPopup();
    return;
  }

  popup.style.display = "block";

  const finish = () => {
    popup.style.display = "none";
    onUpdate && onUpdate();
    afterPopup && afterPopup(); // ← рух монстрів і решта логіки під кінець ходу
  };

  const btns = popup.querySelectorAll("button");
  // приклад логіки для 5/10/15 ходу — залиш як є у твоєму файлі
  btns[0].addEventListener("click", () => { /* ... */ finish(); }, { once: true });
  btns[1].addEventListener("click", () => { /* ... */ finish(); }, { once: true });
  btns[2].addEventListener("click", () => { /* ... */ finish(); }, { once: true });
}

// popupQuestion.js (фрагмент з кінця файлу)

// helpers
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function addAll(stats, delta) {
  stats.energy = clamp(stats.energy + delta, 0, stats.energyMax);
  stats.move   = clamp(stats.move   + delta, 0, stats.moveMax);
  stats.attack = clamp(stats.attack + delta, 0, stats.attackMax);
}
function moveToRandomCorner(playerPositionRef, numRows, numCols) {
  // fallback, якщо параметр не передали
  if (!playerPositionRef) {
    playerPositionRef = window.playerPositionRef;
  }

  if (!playerPositionRef || typeof playerPositionRef.value !== "number") {
    console.warn("moveToRandomCorner: playerPositionRef is missing or invalid");
    return;
  }
  if (!numRows || !numCols) {
    console.warn("moveToRandomCorner: grid size missing");
    return;
  }

  const corners = [0, numCols - 1, (numRows - 1) * numCols, numRows * numCols - 1];
  const pick = corners[Math.floor(Math.random() * corners.length)];
  playerPositionRef.value = pick;
}


