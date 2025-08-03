// damagePopup.js

export function showDamagePopup(index, text, color = "red") {
  const cell = document.querySelector(`#game-field div[data-index='${index}']`);
  if (!cell) return;

  const popup = document.createElement("div");
  popup.textContent = text;
  popup.style.position = "absolute";
  popup.style.color = color;
  popup.style.fontWeight = "bold";
  popup.style.left = `${cell.offsetLeft + 10}px`;
  popup.style.top = `${cell.offsetTop - 10}px`;
  popup.style.zIndex = 1000;

  popup.classList.add("damage-popup");
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1000);
}
