import { createPokemonCard } from './pokemon.js'; // אם אתה עובד עם מודולים
// או אם לא — פשוט תעתיק את הפונקציה `createPokemonCard` ישירות לפה

const container = document.getElementById("pokemon-container");
const loading   = document.getElementById("loading-screen");
const errorBox  = document.getElementById("error-message");

async function loadFavorites() {
  loading.style.visibility = "visible";
  try {
    const res = await fetch("/api/favorites", { credentials: "same-origin" });
    const data = await res.json();
    const favorites = data.favorites || [];

    if (!favorites.length) {
      errorBox.textContent = "No favorites yet 😢";
      return;
    }

    favorites.forEach(pokemon => {
      const card = createPokemonCard(pokemon);
      container.appendChild(card);
    });

  } catch (err) {
    errorBox.textContent = "Failed to load favorites.";
    console.error(err);
  } finally {
    loading.style.visibility = "hidden";
  }
}

window.addEventListener("DOMContentLoaded", loadFavorites);
