if (!window.__favorites_loaded__) {
  window.__favorites_loaded__ = true;

  const backButton     = document.getElementById("back-button");
  const sortSelect     = document.getElementById("sort-select");
  const downloadButton = document.getElementById("download-csv-button");
  const loadingScreen  = document.getElementById("loading-screen");
  const container      = document.getElementById("favorites-container");

  backButton?.addEventListener("click", () => {
    window.location.href = "/app";
  });

  let favorites = [];

  async function loadFavorites() {
    try {
      const res = await fetch("/api/favorites", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Not logged in");

      const data = await res.json();
      favorites = Array.isArray(data.favorites) ? data.favorites : [];
    } catch (err) {
      alert("Error loading favorites. Please log in.");
      return window.location.href = "/login";
    } finally {
      if (loadingScreen) loadingScreen.style.display = "none";
    }

    renderFavorites();
  }

  function renderFavorites() {
    container.innerHTML = "";
    if (!favorites.length) {
      container.innerHTML = "<p>No favorites yet.</p>";
      return;
    }

    favorites.forEach(pokemon => {
      const card = createPokemonCard(pokemon);
      container.appendChild(card);
    });
  }

  // 🧠 שימוש בפונקציה קיימת מה-client הראשי – תעתיק אותה אם צריך
  function createPokemonCard(pokemon) {
    const card = document.createElement("div");
    card.className = "pokemon-card added-to-favorites";

    card.innerHTML = `
      <h2>#${pokemon.id} - ${pokemon.name}</h2>
      <img src="${pokemon.image}" alt="${pokemon.name}" />
      <p><strong>types:</strong> ${pokemon.types?.join(", ") || "?"}</p>
      <p><strong>abilities:</strong> ${pokemon.abilities?.join(", ") || "?"}</p>
      <div class="details">
        <p><strong>HP:</strong> ${pokemon.stats?.hp || "?"}</p>
        <p><strong>Attack:</strong> ${pokemon.stats?.attack || "?"}</p>
        <p><strong>Defense:</strong> ${pokemon.stats?.defense || "?"}</p>
        <p><strong>Speed:</strong> ${pokemon.stats?.speed || "?"}</p>
      </div>
    `;

    const favButton = document.createElement("button");
    favButton.className = "add-to-favorites";
    favButton.textContent = "remove from favorites";

    favButton.addEventListener("click", async function (e) {
      e.stopPropagation();

      // הסרה מקומית
      favorites = favorites.filter(f => f.id !== pokemon.id);
      card.remove();

      // עדכון שרת
      try {
        const res = await fetch("/api/favorites/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ id: pokemon.id }),
        });
        const data = await res.json();
        console.log("Removed from server:", data);
      } catch (err) {
        console.error("Failed to remove from favorites:", err);
      }
    });

    card.appendChild(favButton);
    return card;
  }

  window.addEventListener("DOMContentLoaded", loadFavorites);
}
