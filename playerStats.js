export const stats = {
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

export function updateStats() {
  document.getElementById("stat-energy").textContent = stats.energy;
  document.getElementById("stat-energy-max").textContent = stats.energyMax;
  document.getElementById("stat-move").textContent = stats.move;
  document.getElementById("stat-move-max").textContent = stats.moveMax;
  document.getElementById("stat-attack").textContent = stats.attack;
  document.getElementById("stat-attack-max").textContent = stats.attackMax;
  //document.getElementById("turn-counter").textContent = turn;

  document.getElementById("special-shield").textContent = stats.specialMoves.shield;
  document.getElementById("special-dash").textContent = stats.specialMoves.dash;
  document.getElementById("special-strike").textContent = stats.specialMoves.strike;
  document.getElementById("special-recover").textContent = stats.specialMoves.recover;
}

export function randomStatKey() {
  const keys = ["energy", "move", "attack"];
  return keys[Math.floor(Math.random() * keys.length)];
}
