// rightClickHandler.js

export function handleRightClick(e, index, monsters) {
  e.preventDefault();
  const m = monsters.find(m => m.pos === index);
  if (!m) return;

  const cell = document.querySelector(`#game-field div[data-index='${index}']`);
  const popup = document.createElement("div");
  popup.textContent = `HP: ${m.hp}, DMG: ${m.damage}`;
  popup.style.position = "absolute";
  popup.style.background = "rgba(0,0,0,0.8)";
  popup.style.color = "white";
  popup.style.padding = "4px 8px";
  popup.style.borderRadius = "4px";
  popup.style.fontSize = "12px";
  popup.style.left = `${cell.offsetLeft + 10}px`;
  popup.style.top = `${cell.offsetTop - 20}px`;
  popup.style.zIndex = 1000;

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}
