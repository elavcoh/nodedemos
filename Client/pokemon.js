// get dom elements for input and buttons
const input = document.getElementById("pokemon-input");
const searchType = document.getElementById("search-type");
const searchButton = document.getElementById("search-button");
const clearButton = document.getElementById("clear-button");
const pokemonContainer = document.getElementById("pokemon-container");
const errorMessage = document.getElementById("error-message");
const loadingScreen = document.getElementById("loading-screen");

// favorites list loaded from localStorage
// this stores user's favorite pokemons even if page reloads or in other tabs
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// when page loads, read url params to restore previous search
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query") || "";  // get search text from url
  const filter = params.get("filter") || "name";  // get filter type from url

  input.value = query;       // show search text in input box
  searchType.value = filter; // show filter type selected

  // if url has search text, do the search automatically
  if (query) {
    searchPokemon(query, filter);
  }
});

// search button clicked by user
searchButton.addEventListener("click", () => {
  const query = input.value.trim().toLowerCase(); // get and clean input text
  const filter = searchType.value;                // get selected filter

  if (!query) {                                   // if input empty, show error
    errorMessage.textContent = "please enter a search term.";
    return;
  }

  searchPokemon(query, filter);                   // do the search function
});

// clear button clicked by user
clearButton.addEventListener("click", () => {
  input.value = "";             // clear input box
  pokemonContainer.innerHTML = ""; // clear pokemon cards on page
  errorMessage.textContent = ""; // clear error messages

  // clear the url query params but keep on same page (no search)
  history.replaceState(null, "", window.location.pathname);
});

// main search function: fetch data and filter pokemons
async function searchPokemon(query, filter) {
  errorMessage.textContent = "";          // clear any previous errors
  pokemonContainer.innerHTML = "";        // clear previous results
  loadingScreen.style.visibility = "visible"; // show loading spinner

  try {
    // get list of all pokemons (big list)
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    const data = await res.json();

    const matches = [];           // to store pokemons matching search
    const seenIds = new Set();    // to avoid duplicates

    // loop over all pokemons to fetch detailed info and check if match
    for (const pokemon of data.results) {
      try {
        const details = await fetchPokemonDetails(pokemon.url);

        // check if current pokemon matches search query/filter and no duplicate
        if (isMatchingQuery(details, query, filter, seenIds)) {
          matches.push({
            id: details.id,
            name: details.name,
            image: details.sprites.front_default,
            types: details.types.map(t => t.type.name.toLowerCase()),
            abilities: details.abilities.map(a => a.ability.name.toLowerCase())
          });
        }
      } catch {
        // if error getting details, just skip this pokemon
      }
    }

    // update the url to save search state (so user can copy url or reload and keep search)
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("filter", filter);
    history.replaceState(null, "", "?" + params.toString());

    loadingScreen.style.visibility = "hidden"; // hide loading spinner

    // if no matches, show error message
    if (matches.length === 0) {
      errorMessage.textContent = `no pokemon found matching "${query}".`;
      return;
    }

    // show matched pokemons on page
    renderSavedResults(matches);
  } catch {
    loadingScreen.style.visibility = "hidden";  // hide spinner if error
    errorMessage.textContent = "error fetching pokemon data.";
  }
}

// helper function to get details of one pokemon by url
async function fetchPokemonDetails(url) {
  const res = await fetch(url);
  return await res.json();
}

// check if pokemon details match query and filter, and avoid duplicates
function isMatchingQuery(details, query, filter, seenIds) {
  const name = details.name.toLowerCase();
  const id = String(details.id);
  const types = details.types.map(t => t.type.name.toLowerCase());
  const abilities = details.abilities.map(a => a.ability.name.toLowerCase());

  let match = false;

  if (filter === "name" && name.startsWith(query)) {
    match = true;
  } else if (filter === "id" && id === query) {
    match = true;
  } else if (filter === "type" && types.some(type => type.includes(query))) {
    match = true;
  } else if (filter === "ability" && abilities.some(ability => ability.includes(query))) {
    match = true;
  }

  // add to seenIds to avoid duplicates in results
  if (match && !seenIds.has(details.id)) {
    seenIds.add(details.id);
    return true;
  }

  return false;
}

// show pokemon cards on page from results list
function renderSavedResults(results) {
  pokemonContainer.innerHTML = "";  // clear old cards

  results.forEach(pokemon => {
    const card = createPokemonCard(pokemon);
    pokemonContainer.appendChild(card);
  });
}

// create one pokemon card html element with data and favorite button
function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  // check if pokemon is already in favorites list
  const isFavorite = favorites.some(fav => fav.id === pokemon.id);
  if (isFavorite) {
    card.classList.add("added-to-favorites"); // add css class if favorite
  }

  // add pokemon info inside card
  card.innerHTML = `
    <h2>#${pokemon.id} - ${pokemon.name}</h2>
    <img src="${pokemon.image}" alt="${pokemon.name}" />
    <p><strong>types:</strong> ${pokemon.types.join(", ")}</p>
    <p><strong>abilities:</strong> ${pokemon.abilities.join(", ")}</p>
  `;

  // create favorite button text and style
  const favButton = document.createElement("button");
  favButton.classList.add("add-to-favorites");
  favButton.textContent = isFavorite ? "remove from favorites" : "add to favorites";

  // when favorite button clicked, toggle favorite state
  favButton.addEventListener("click", () => toggleFavorite(pokemon, card, favButton));

  card.appendChild(favButton);
  return card;
}

// toggle favorite status for one pokemon card
function toggleFavorite(pokemon, card, favButton) {
  // check if pokemon already in favorites list
  const index = favorites.findIndex(fav => fav.id === pokemon.id);

  if (index === -1) {
    // not favorite, so add it to favorites
    favorites.push(pokemon);
    favButton.textContent = "remove from favorites";     // update button text
    card.classList.add("added-to-favorites");            // update card style
  } else {
    // is favorite, so remove it from favorites
    favorites.splice(index, 1);
    favButton.textContent = "add to favorites";          // update button text
    card.classList.remove("added-to-favorites");         // update card style
  }

  // save updated favorites list to localStorage (sync across tabs)
  localStorage.setItem("favorites", JSON.stringify(favorites));

  // update all cards UI in this page to stay in sync
  updateFavoritesUI();
}

// update all pokemon cards UI to match current favorites list
function updateFavoritesUI() {
  const cards = pokemonContainer.querySelectorAll(".pokemon-card");
  cards.forEach(card => {
    // get pokemon id from card title text
    const titleText = card.querySelector("h2").textContent;
    const id = parseInt(titleText.match(/^#(\d+)/)[1]);

    // check if this pokemon is in favorites
    const isFavorite = favorites.some(fav => fav.id === id);
    const favButton = card.querySelector(".add-to-favorites");

    // update card style and button text accordingly
    if (isFavorite) {
      card.classList.add("added-to-favorites");
      favButton.textContent = "remove from favorites";
    } else {
      card.classList.remove("added-to-favorites");
      favButton.textContent = "add to favorites";
    }
  });
}

// listen for localStorage changes from other tabs/windows
// this event helps sync favorites changes between pages
window.addEventListener("storage", (event) => {
  if (event.key === "favorites") {
    favorites = JSON.parse(event.newValue) || [];
    updateFavoritesUI();  // update UI to reflect changes from other tab
  }
});
