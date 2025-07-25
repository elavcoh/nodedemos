const favoritesContainer = document.getElementById("favorites-container");
const sortSelect = document.getElementById("sort-select");
const loadingScreen = document.getElementById("loading-screen");

// add event listener to back button to go back to main page
const backButton = document.getElementById("back-button");
if (backButton) {
  backButton.addEventListener("click", goBackToMainPage);
}

// load favorites from localStorage or empty array if none saved
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// set sortSelect default to "name"
sortSelect.value = "name";

// sort favorites by name initially
favorites.sort((a, b) => a.name.localeCompare(b.name));

// render list of favorite pokemon cards on the page
function renderFavorites(list) {
  favoritesContainer.innerHTML = ""; // clear old content

  list.forEach(pokemon => {
    const card = document.createElement("div");
    card.className = "pokemon-card";

    // create inner html for card with pokemon details
    card.innerHTML = `  
      <h2>#${pokemon.id} - ${pokemon.name}</h2>
      <img src="${pokemon.image}" alt="${pokemon.name}" />
      <p><strong>types:</strong> ${pokemon.types.join(", ")}</p>
      <p><strong>abilities:</strong> ${pokemon.abilities.join(", ")}</p>
    `;

    // create button to remove pokemon from favorites
    const removeButton = document.createElement("button");
    removeButton.textContent = "remove from favorites";
    removeButton.classList.add("remove-from-favorites");

    removeButton.addEventListener("click", () => {
      // filter out pokemon with matching id to remove it
      favorites = favorites.filter(fav => fav.id !== pokemon.id);
      // update localStorage with new favorites list
      localStorage.setItem("favorites", JSON.stringify(favorites));
      // rerender favorites after removal
      renderFavorites(favorites);
    });

    card.appendChild(removeButton);
    favoritesContainer.appendChild(card);
  });
}

// handle sorting when user changes sort option
sortSelect.addEventListener("change", () => {
  // show loading message while sorting happens
  loadingScreen.style.visibility = "visible";

  // use timeout to simulate loading delay so user can see message
  setTimeout(() => {
    const sortBy = sortSelect.value;

    // sort by name alphabetically using localeCompare for correct order
    if (sortBy === "name") {
      favorites.sort((a, b) => a.name.localeCompare(b.name));
    } 
    // sort by id numerically
    else if (sortBy === "id") {
      favorites.sort((a, b) => a.id - b.id);
    }

    // show sorted favorites on page
    renderFavorites(favorites);

    // hide loading message after sorting done
    loadingScreen.style.visibility = "hidden";
  }, 300); // delay 300ms to make loading visible
});

// render favorites first time when page loads
renderFavorites(favorites);

// go back to main page when back button clicked
function goBackToMainPage() {
  // go back to the page with the current url (which holds the query params)
  window.history.back();
}

const downloadButton = document.getElementById("download-json-button");

if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    if (favorites.length === 0) {
      alert("no favorites to download.");
      return;
    }

    // create a json blob from favorites to download as file
    const blob = new Blob([JSON.stringify(favorites, null, 2)], {
      type: "application/json"
    });

    // create temporary link element for download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites.json";
    a.click();

    // free up memory by revoking the url after download
    URL.revokeObjectURL(url);
  });
}
