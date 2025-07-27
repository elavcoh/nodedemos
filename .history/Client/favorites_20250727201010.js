const container = document.getElementById("favorites-container");
const backButton = document.getElementById("back-button");
const sortSelect = document.getElementById("sort-select");
const downloadButton = document.getElementById("download-csv-button");
const loadingScreen = document.getElementById("loading-screen");

let favorites = [];
const detailsCache = new Map();

// חזרה לדף הבית
backButton?.addEventListener("click", () => {
  window.location.href = "/app";
});

// שליפת פרטי פוקימון לפי ID
async function fetchPokemonDetailsById(id) {
  const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
  return await fetchPokemonDetails(url);
}

// שליפת פרטי פוקימון מלאים מה-API
async function fetchPokemonDetails(url) {
  if (detailsCache.has(url)) return detailsCache.get(url);
  const res = await fetch(url);
  const data = await res.json();

  const statsMap = {};
  data.stats.forEach(s => { statsMap[s.stat.name] = s.base_stat; });

  const info = {
    id:        data.id,
    name:      data.name,
    types:     data.types.map(t => t.type.name),
    abilities: data.abilities.map(a => a.ability.name),
    image:     data.sprites.front_default,
    stats: {
      hp:      statsMap.hp,
      attack:  statsMap.attack,
      defense: statsMap.defense,
      speed:   statsMap.speed
    }
  };
  detailsCache.set(url, info);
  return info;
}


// שליפת סרטון מיוטיוב לפי קטגוריה
async function fetchVideoId(pokemonName, category) {
  const key = window.YOUTUBE_API_KEY;
  if (!key) return null;
  const q = encodeURIComponent(`${pokemonName} ${category}`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${q}&key=${key}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.items?.[0]?.id?.videoId || null;
  } catch (e) {
    console.warn("YouTube API error:", e);
    return null;
  }
}

// יצירת כרטיס פוקימון
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
      <div class="youtube-videos">
        <h3>Related Videos:</h3>
        <ul class="yt-list"><li>Loading videos…</li></ul>
      </div>
    </div>
  `;

  // הרחבת הכרטיס בלחיצה
  card.addEventListener("click", async () => {
    const nowExpanded = card.classList.toggle("expanded");
    if (nowExpanded) {
      const ul = card.querySelector(".yt-list");
      ul.innerHTML = "";
      for (let cat of ["trailer", "gameplay", "anime"]) {
        const vid = await fetchVideoId(pokemon.name, cat);
        const li = document.createElement("li");
        if (vid) {
          li.innerHTML = `<a href="https://youtu.be/${vid}" target="_blank">${cat}</a>`;
        } else {
          li.textContent = `${cat}: not found`;
        }
        ul.appendChild(li);
      }
    }
  });

  const favButton = document.createElement("button");
  favButton.className = "add-to-favorites";
  favButton.textContent = "remove from favorites";
  favButton.addEventListener("click", async function (e) {
    e.stopPropagation(); // לא יפתח את ההרחבה
    favorites = favorites.filter(f => parseInt(f.id) !== parseInt(pokemon.id));
    card.remove();
    try {
      const res = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: parseInt(pokemon.id) }),
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

// טעינת המועדפים
async function loadFavorites() {
  try {
    const res = await fetch("/api/favorites", { credentials: "same-origin" });
    if (!res.ok) throw new Error("Not logged in");

    const data = await res.json();
    favorites = Array.isArray(data.favorites) ? data.favorites : [];

    container.innerHTML = "";
    for (const fav of favorites) {
      const fullDetails = await fetchPokemonDetailsById(fav.id);
      const card = createPokemonCard(fullDetails);
      container.appendChild(card);
    }
  } catch (err) {
    alert("Error loading favorites. Please log in.");
    window.location.href = "/login";
  } finally {
    if (loadingScreen) loadingScreen.style.display = "none";
  }
}

window.addEventListener("DOMContentLoaded", loadFavorites);
