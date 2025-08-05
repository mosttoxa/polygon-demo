// popupQuestion.js

import { stats } from "./playerStats.js";
import { updateStats } from "./playerStats.js";
import { logEvent } from "./fieldRenderer.js";

export function setupPopupQuestion(logContainer) {
  const popup = document.getElementById("popup-question");
  if (!popup) return;

  popup.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const answer = button.dataset.answer;
      let logText = "";

      switch (answer) {
        case "yes":
          logText = "Біон: Так! Полігон — це кайф.";
          break;
        case "no":
          logText = "Біон: Ні. Хочу назад у пробірку.";
          break;
        case "skip":
          logText = "Біон відмовився відповідати.";
          break;
      }

      popup.style.display = "none";
      popup.dataset.shown = "true";

      if (logContainer) {
        const line = document.createElement("div");
        line.textContent = logText;
        logContainer.appendChild(line);
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    });
  });
}

