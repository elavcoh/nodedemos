const input            = document.getElementById("pokemon-input");
const searchType       = document.getElementById("search-type");
const searchButton     = document.getElementById("search-button");
const clearButton      = document.getElementById("clear-button");
const pokemonContainer = document.getElementById("pokemon-container");
const errorMessage     = document.getElementById("error-message");
const loadingScreen    = document.getElementById("loading-screen");

let favorites = [];

let allPokemonList = null;
const detailsCache = new Map();

async function fetchAllPokemon() {
  if (!allPokemonList) {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    const data = await res.json();
    allPokemonList = data.results;
  }
  return allPokemonList;
}

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
async function toggleFavorite(pokemon, card, btn) {
  const isCurrentlyFavorite = favorites.some(f => f.id === pokemon.id);

  if (isCurrentlyFavorite) {
    // הסרה מהמועדפים
    try {
      const res = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: pokemon.id }),
      });

      const data = await res.json();
      if (res.ok) {
        favorites = data.favorites;
        card.classList.remove("added-to-favorites");
        btn.textContent = "add to favorites";
      } else {
        alert(data.error || "Failed to remove favorite.");
      }

    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Error removing favorite.");
    }

  } else {
    // הוספה למועדפים
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          id: pokemon.id,
          name: pokemon.name,
          image: pokemon.image,
          types: pokemon.types,
          abilities: pokemon.abilities,
          stats: pokemon.stats
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          console.error("SERVER ERROR:", json); // נראה מה השרת החזיר
          alert(json.error || "Failed to add favorite.");
        } catch (e) {
          console.error("Raw error:", text); // אם זה לא JSON
          alert("Failed to add favorite.");
        }
        return;
      }
      

      favorites = data.favorites;
      card.classList.add("added-to-favorites");
      btn.textContent = "remove from favorites";

    } catch (err) {
      console.error("Error adding favorite:", err);
      alert("You can only have up to 10 favorite Pokémon");
    }
  }
}




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

function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  const isFav = favorites.some(f => f.id === pokemon.id);
  if (isFav) card.classList.add("added-to-favorites");

  card.innerHTML = `
    <h2>#${pokemon.id} - ${pokemon.name}</h2>
    <img src="${pokemon.image}" alt="${pokemon.name}" />
    <p><strong>types:</strong> ${pokemon.types.join(", ")}</p>
    <p><strong>abilities:</strong> ${pokemon.abilities.join(", ")}</p>
    <div class="details">
      <p><strong>HP:</strong> ${pokemon.stats.hp}</p>
      <p><strong>Attack:</strong> ${pokemon.stats.attack}</p>
      <p><strong>Defense:</strong> ${pokemon.stats.defense}</p>
      <p><strong>Speed:</strong> ${pokemon.stats.speed}</p>
      <div class="youtube-videos">
        <h3>Related Videos:</h3>
        <ul class="yt-list"><li>Loading videos…</li></ul>
      </div>
    </div>
  `;

  const favButton = document.createElement("button");
  favButton.className = "add-to-favorites";
  favButton.textContent = isFav ? "remove from favorites" : "add to favorites";
  favButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(pokemon, card, favButton);
  });
  card.appendChild(favButton);

  card.addEventListener("click", async (e) => {
    if (e.target.closest("button")) return;
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

  return card;
}

async function searchPokemon(query, filter) {
  errorMessage.textContent = "";
  pokemonContainer.innerHTML = "";
  loadingScreen.style.display = "flex"; // ✅ מציג את הטעינה

  try {
    const list = await fetchAllPokemon();
    const results = [];
    for (let entry of list) {
      const info = await fetchPokemonDetails(entry.url);
      let match = false;
      if (filter === "name" && info.name.includes(query)) match = true;
      if (filter === "id" && info.id.toString() === query) match = true;
      if (filter === "type" && info.types.includes(query)) match = true;
      if (filter === "ability" && info.abilities.includes(query)) match = true;
      if (match) results.push(info);
    }
    if (!results.length) {
      errorMessage.textContent = `No Pokémon found matching "${query}".`;
    } else {
      results.forEach(p => pokemonContainer.appendChild(createPokemonCard(p)));
    }
  } catch (e) {
    console.error(e);
    errorMessage.textContent = "Error fetching Pokémon data.";
  } finally {
    loadingScreen.style.display = "none"; // ✅ מסתיר את הטעינה
  }
}


input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});


searchButton.addEventListener("click", () => {
  const q = input.value.trim().toLowerCase();
  if (!q) {
    errorMessage.textContent = "Please enter a search term.";
    return;
  }
  searchPokemon(q, searchType.value);
});

clearButton.addEventListener("click", () => {
  input.value = "";
  pokemonContainer.innerHTML = "";
  errorMessage.textContent = "";
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/favorites", { credentials: "same-origin" });
    const data = await res.json();
    favorites = data.favorites || [];
  } catch (err) {
    console.error("Failed to load favorites from server:", err);
    favorites = [];
  }

  const savedSearch = sessionStorage.getItem("savedSearch");
  const savedFilter = sessionStorage.getItem("savedFilter");

  if (savedSearch && savedFilter) {
    input.value = savedSearch;
    searchType.value = savedFilter;
    searchPokemon(savedSearch, savedFilter);
    sessionStorage.removeItem("savedSearch");
    sessionStorage.removeItem("savedFilter");
  } else {
    loadingScreen.style.display = "none";
  }
});