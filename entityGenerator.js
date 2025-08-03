// entityGenerator.js

import { logEvent } from './fieldRenderer.js';
import { stats } from './playerStats.js';

export function generateEntities(numRows, numCols, playerPosition, {
  bonusCells,
  yellowCells,
  eventCells,
  portalCells
}) {
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
    monsters.push({ pos: index, hp: 10, damage: 3 });
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
      effect: () => {
        logEvent("Подія: Тіло біона1");
        stats.energy = Math.min(stats.energyMax, stats.energy + 10);
      },
      label: "Тіло біона1 (+10 енергії)"
    },
    {
      effect: () => {
        const delta = Math.random() < 0.5 ? -5 : 5;
        logEvent("Подія: Невідома печера");
        stats.energy = Math.max(0, Math.min(stats.energyMax, stats.energy + delta));
      },
      label: "Невідома печера (+/-5 енергії)"
    },
    {
      effect: () => {
        logEvent("Подія: Трясовина");
        stats.energy = 0;
        stats.move = 0;
        stats.attack = 0;
      },
      label: "Трясовина (всі характеристики 0)"
    },
    {
      effect: () => {
        logEvent("Подія: Сказ");
        for (const m of monsters) m.damage += 3;
      },
      label: "Сказ (+3 до атаки всім монстрам)"
    },
    {
      effect: () => {
        logEvent("Подія: Осяяння");
        for (let i = 0; i < 7; i++) {
          let idx;
          do {
            idx = Math.floor(Math.random() * totalCells);
          } while (
            bonusCells.has(idx) ||
            yellowCells.has(idx) ||
            eventCells.has(idx)
          );
          bonusCells.add(idx);
        }
      },
      label: "Осяяння (+7 зелених клітин)"
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
    eventCells.set(index, ev);
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
