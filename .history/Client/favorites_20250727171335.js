document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/api/user');
    if (!res.ok) {
      window.location.href = '/app/login.html'; // redirect if not logged in
      return;
    }

    const user = await res.json();
    const userId = user.email; // נניח שה־email הוא מזהה ייחודי

    const response = await fetch(`/users/${userId}/favorites`);
    const favorites = await response.json();

    const list = document.getElementById('favorites-list');
    list.innerHTML = '';

    if (favorites.length === 0) {
      list.innerHTML = '<li>No favorites yet</li>';
      return;
    }

    favorites.forEach(pokemon => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}" width="50" />
        <strong>${pokemon.name}</strong>
        <button onclick="removeFavorite('${userId}', ${pokemon.id})">Remove</button>
      `;
      list.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
});

async function removeFavorite(userId, pokemonId) {
  try {
    const res = await fetch(`/users/${userId}/favorites/${pokemonId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      location.reload(); // Reload to refresh the list
    } else {
      console.error("Failed to remove favorite");
    }
  } catch (err) {
    console.error(err);
  }
}
