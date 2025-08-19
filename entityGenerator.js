// entityGenerator.js

import { logEvent } from './fieldRenderer.js';
import { stats } from './playerStats.js';

export function generateEntities(numRows, numCols, playerPosition, {
  bonusCells,
  yellowCells,
  eventCells,
  portalCells
}, logContainer) {
  const monsters = [];
  //monsters.length = 1;
  bonusCells.clear();
  yellowCells.clear();
  eventCells.clear();
  portalCells.clear();

  const totalCells = numRows * numCols;

  for (let i = 0; i < 10; i++) {
  let index;
  do {
    index = Math.floor(Math.random() * totalCells);
  } while (index === playerPosition);
  monsters.push({
    pos: index,
    hp: 10,
    damage: 3,
    speed: Math.random() < 0.6 ? 1 : 2,   // 60% = 1 крок, 40% = 2 кроки
    aggroRange: 3 + Math.floor(Math.random() * 3) // 3..5 клітинок за Чебишевим
  });
}

  for (let i = 0; i < 10; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * totalCells);
    } while (index === playerPosition || bonusCells.has(index));
    bonusCells.add(index);
  }

  for (let i = 0; i < 10; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * totalCells);
    } while (
      index === playerPosition ||
      bonusCells.has(index) ||
      yellowCells.has(index)
    );
    yellowCells.add(index);
  }

  const eventDefinitions = [
  {
    effect(logContainer, stats, monsters, bonusCells) {
      stats.energy = Math.min(stats.energyMax, stats.energy + 10);
      logEvent("Подія: Тіло біона (+10 енергії)", logContainer);
    },
    label: "Тіло біона (+10 енергії)"
  },
  {
    effect(logContainer, stats) {
      const delta = Math.random() < 0.5 ? -5 : 5;
      stats.energy = Math.max(0, Math.min(stats.energyMax, stats.energy + delta));
      logEvent(`Подія: Невідома печера (${delta > 0 ? "+" : ""}${delta} енергії)`, logContainer);
    },
    label: "Невідома печера (+/-5 енергії)"
  },
  {
    effect(logContainer, stats) {
      stats.energy = 0;
      stats.move = 0;
      stats.attack = 0;
      logEvent("Подія: Трясовина (всі характеристики 0)", logContainer);
    },
    label: "Трясовина (всі характеристики 0)"
  },
  {
    effect(logContainer, stats, monsters) {
      for (const m of monsters) m.damage += 3;
      logEvent("Подія: Сказ (+3 до атаки всім монстрам)", logContainer);
    },
    label: "Сказ (+3 до атаки всім монстрам)"
  },
  {
    effect(logContainer, stats, monsters, bonusCells) {
      for (let i = 0; i < 7; i++) {
        let idx;
        do {
          idx = Math.floor(Math.random() * totalCells);
        } while (bonusCells.has(idx));
        bonusCells.add(idx);
      }
      logEvent("Подія: Осяяння (+7 бонусних клітин)", logContainer);
    },
    label: "Осяяння (+7 бонусних клітин)"
  }
  ];

  for (const ev of eventDefinitions) {
    let index;
    do {
      index = Math.floor(Math.random() * totalCells);
    } while (
      index === playerPosition ||
      bonusCells.has(index) ||
      yellowCells.has(index) ||
      eventCells.has(index)
    );
    eventCells.set(index, () => ev.effect(logContainer, stats, monsters, bonusCells));

  }

  for (let i = 0; i < 3; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * totalCells);
    } while (
      index === playerPosition ||
      bonusCells.has(index) ||
      yellowCells.has(index) ||
      eventCells.has(index) ||
      portalCells.has(index)
    );
    portalCells.add(index);
  }

  return {
    monsters,
    bonusCells,
    yellowCells,
    eventCells,
    portalCells
  };

}
