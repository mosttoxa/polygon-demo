// playerStats.js

// Конфіг розблокувань джерел (слотів):
// next = який за рахунком слот відкриваємо (2..6)
// req  = скільки енергії треба МАТИ прямо зараз
// cost = скільки енергії списуємо при відкритті
const DICE_UNLOCKS = {
  2: { req: 10, cost: 5 },
  3: { req: 20, cost: 10 },
  4: { req: 30, cost: 15 },
  5: { req: 40, cost: 20 },
  6: { req: 50, cost: 25 },
};

export const stats = {
  visionRadius: 1,

  energy: 5,
  energyMax: 100,

  move: 0,
  moveMax: 100,

  attack: 0,
  attackMax: 100,

  shield: 0,

  // Кількість доступних “джерел-кубиків”
  maxDice: 1,  // стартуємо з 1

  specialMoves: {
    shield: 0,
    dash: 0,
    strike: 0,
    recover: 0
  }
};

// Безпечний апдейт тексту
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Спроба розблокувати наступне джерело (слот) згідно порогу енергії.
 * Викликаємо у ключових місцях (напр. при кидку “кубиків”/джерел або після змін енергії).
 * Повертає true, якщо щось розблокувалось.
 */
export function tryUnlockDice(logContainer) {
  // Наступний слот, який можна відкрити
  const next = Math.min(6, (stats.maxDice || 1) + 1);
  const cfg = DICE_UNLOCKS[next];
  if (!cfg) return false; // всі відкриті або немає конфіга

  if (stats.energy >= cfg.req) {
    // списуємо вартість і відкриваємо слот
    stats.energy = Math.max(0, stats.energy - cfg.cost);
    stats.maxDice = next;

    // лог — тільки якщо є контейнер
    if (logContainer) {
      const line = document.createElement("div");
      line.textContent = `Активовано джерело #${next}! (вимога: ${cfg.req}, витрати: ${cfg.cost})`;
      logContainer.appendChild(line);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
    return true;
  }
  return false;
}

export function updateStats() {
  // страховка, якщо хтось занулить specialMoves
  if (!stats.specialMoves) {
    stats.specialMoves = { shield: 0, dash: 0, strike: 0, recover: 0 };
  }

  setText("stat-energy", stats.energy);
  setText("stat-energy-max", stats.energyMax);
  setText("stat-move", stats.move);
  setText("stat-move-max", stats.moveMax);
  setText("stat-attack", stats.attack);
  setText("stat-attack-max", stats.attackMax);

  setText("special-shield",  stats.specialMoves.shield);
  setText("special-dash",    stats.specialMoves.dash);
  setText("special-strike",  stats.specialMoves.strike);
  setText("special-recover", stats.specialMoves.recover);

  // За бажанням: можна виводити maxDice в окремий елемент, коли додамо його в HTML
  // setText("stat-max-dice", `${stats.maxDice}/6`);
}

// Зручно мати тут — щоб імпортувати з одного місця
export function randomStatKey() {
  const keys = ["energy", "move", "attack"];
  return keys[Math.floor(Math.random() * keys.length)];
}
