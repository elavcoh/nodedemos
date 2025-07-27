document.addEventListener('DOMContentLoaded', () => {
  const userLabel = document.getElementById('user-label');
  const favoritesContainer = document.getElementById('favorites-container');

  // הצגת שם המשתמש המחובר
  fetch('/auth/session')
    .then(res => res.json())
    .then(data => {
      if (!data.email) {
        window.location.href = '/login.html';
      } else {
        userLabel.textContent = `Logged in as ${data.username || data.email.split('@')[0]}`;
      }
    });

  // טעינת המועדפים
  fetch('/favorites')
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch favorites');
      }
      return res.json();
    })
    .then(favorites => {
      if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>No favorites yet.</p>';
      } else {
        favoritesContainer.innerHTML = favorites.map(pokemon => `
          <div class="pokemon-card">
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <button onclick="removeFavorite('${pokemon.id}')">Remove</button>
          </div>
        `).join('');
      }
    })
    .catch(error => {
      favoritesContainer.innerHTML = `<p>Error loading favorites: ${error.message}</p>`;
    });
});

function removeFavorite(id) {
  fetch(`/favorites/${id}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(updatedFavorites => location.reload())
    .catch(err => alert('Error removing favorite'));
}
