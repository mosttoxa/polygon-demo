// combat.js

import { showDamagePopup } from './damagePopup.js';
import { logEvent } from './fieldRenderer.js';
import { stats } from './playerStats.js';

export function resolveCombat(playerPosition, monsters, logContainer, shieldBonus = 0) {
  const encountered = monsters.filter(m => m.pos === playerPosition);
  if (encountered.length === 0) return monsters;

  logEvent(`Біон зустрів ${encountered.length > 1 ? "монстрів" : "монстра"} на полі ${playerPosition}`, logContainer);

  for (const m of encountered) {
    if (stats.attack > 0 && m.hp > 0) {
      const damage = Math.min(stats.attack, m.hp);
      m.hp -= damage;
      stats.attack -= damage;
      showDamagePopup(m.pos, `-${damage}💥`, "orange");
      logEvent(`Біон атакує монстра на полі ${m.pos} на ${damage} урону.`, logContainer);
    }
    if (m.hp > 0) {
      const finalDamage = Math.max(0, m.damage - shieldBonus);
      stats.energy -= finalDamage;
      showDamagePopup(playerPosition, `-${finalDamage}⚡`, "red");
      logEvent(`Монстр атакує біона на ${finalDamage} урону.`, logContainer);
    }
  }

  return monsters.filter(m => m.hp > 0);
}

