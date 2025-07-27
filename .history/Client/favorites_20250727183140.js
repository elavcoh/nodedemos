// Client/favorites.js
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

  favorites.forEach(fav => {
    const card = document.createElement("div");
    card.className = "favorite-card";
    card.textContent = fav.name || JSON.stringify(fav);
    container.appendChild(card);
  });
}

window.addEventListener("DOMContentLoaded", loadFavorites);
}