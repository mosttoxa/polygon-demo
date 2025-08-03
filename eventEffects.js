// eventEffects.js

import { logEvent } from "./fieldRenderer.js";

export function applyEventEffect(type, stats, monsters, bonusCells, logContainer, numRows, numCols) {
  switch (type) {
    case 0:
      stats.energy = Math.min(stats.energyMax, stats.energy + 10);
      logEvent("Подія: Тіло біона (+10 енергії)", logContainer);
      break;
    case 1:
      const delta = Math.random() < 0.5 ? -5 : 5;
      stats.energy = Math.max(0, Math.min(stats.energyMax, stats.energy + delta));
      logEvent(`Подія: Невідома печера (${delta > 0 ? "+" : ""}${delta} енергії)`, logContainer);
      break;
    case 2:
      stats.energy = 0;
      stats.move = 0;
      stats.attack = 0;
      logEvent("Подія: Трясовина (всі характеристики скинуто до 0)", logContainer);
      break;
    case 3:
      for (const m of monsters) m.damage += 3;
      logEvent("Подія: Сказ (усі монстри отримали +3 до атаки)", logContainer);
      break;
    case 4:
      for (let i = 0; i < 7; i++) {
        let idx;
        do {
          idx = Math.floor(Math.random() * numRows * numCols);
        } while (bonusCells.has(idx));
        bonusCells.add(idx);
      }
      logEvent("Подія: Осяяння (+7 бонусних клітин)", logContainer);
      break;
  }
}
