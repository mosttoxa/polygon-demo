// combat.js
import { showDamagePopup } from "./damagePopup.js";
import { logEvent } from "./fieldRenderer.js";

export function resolveCombat({ playerPosition, monstersRef, stats, logContainer }) {
  const list = Array.isArray(monstersRef?.value) ? monstersRef.value : [];
  const encountered = list.filter(m => m.pos === playerPosition);

  // ❗ якщо нікого немає — нічого не змінюємо
  if (encountered.length === 0) return list;

  logEvent(
    `Біон зустрів ${encountered.length > 1 ? "монстрів" : "монстра"} на полі ${playerPosition}`,
    logContainer
  );

  for (const m of encountered) {
    if (stats.attack > 0 && m.hp > 0) {
      const dmg = Math.min(stats.attack, m.hp);
      m.hp -= dmg;
      stats.attack -= dmg;
      showDamagePopup(m.pos, `-${dmg}💥`, "orange");
      logEvent(`Біон б'є на ${dmg}.`, logContainer);
    }
    if (m.hp > 0) {
      const shield = Number(stats.specialMoves?.shield ?? 0);
      const taken = Math.max(0, Number(m.damage) - shield);
      if (taken > 0) {
        stats.energy -= taken;
        showDamagePopup(playerPosition, `-${taken}⚡`, "red");
        logEvent(`Монстр б'є на ${taken}.`, logContainer);
      } else {
        logEvent(`Щит поглинув урон.`, logContainer);
      }
    }
  }

  // оновлюємо масив тільки якщо був бій
  const alive = list.filter(m => m.hp > 0);
  monstersRef.value = alive;
  return alive;
}
