async function fetchFavorites() {
  const res = await fetch("/api/favorites");
  if (res.status === 401) {
    location.href = "login.html";
    return;
  }
  const favorites = await res.json();
  const list = document.getElementById("favoritesList");
  list.innerHTML = "";
  favorites.forEach(fav => {
    const li = document.createElement("li");
    li.textContent = fav.name;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => removeFavorite(fav.id);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function removeFavorite(id) {
  await fetch("/api/favorites/" + id, { method: "DELETE" });
  fetchFavorites();
}

async function logout() {
  await fetch("/api/logout", { method: "POST" });
  location.href = "login.html";
}

fetchFavorites();
