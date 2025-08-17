// playerStats.js
export const stats = {
  visionRadius: 1,
  energy: 5,
  energyMax: 100,
  move: 0,
  moveMax: 100,
  attack: 0,
  attackMax: 100,
  shield: 0,
  specialMoves: {
    shield: 0,
    dash: 0,
    strike: 0,
    recover: 0
  }
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function updateStats() {
  // страховка на випадок, якщо хтось занулить specialMoves
  if (!stats.specialMoves) {
    stats.specialMoves = { shield: 0, dash: 0, strike: 0, recover: 0 };
  }

  setText("stat-energy", stats.energy);
  setText("stat-energy-max", stats.energyMax);
  setText("stat-move", stats.move);
  setText("stat-move-max", stats.moveMax);
  setText("stat-attack", stats.attack);
  setText("stat-attack-max", stats.attackMax);

  setText("special-shield", stats.specialMoves.shield);
  setText("special-dash",   stats.specialMoves.dash);
  setText("special-strike", stats.specialMoves.strike);
  setText("special-recover",stats.specialMoves.recover);
}

// зручно мати тут — щоб імпортувати з одного місця
export function randomStatKey() {
  const keys = ["energy", "move", "attack"];
  return keys[Math.floor(Math.random() * keys.length)];
}
