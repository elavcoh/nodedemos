document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = document.getElementById('user-info');
  const container = document.getElementById('favorites-container');
  const loading = document.getElementById('loading-screen');

  try {
    const res = await fetch('/api/me', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Not logged in');
    const user = await res.json();

    userInfo.textContent = 'Logged in as ' + user.firstName;

    const favoritesRes = await fetch(`/api/users/${user.id}/favorites`);
    const favorites = await favoritesRes.json();

    container.innerHTML = favorites.map(f => `
      <div>
        <h3>${f.name}</h3>
        <img src="${f.image}" width="100">
      </div>
    `).join('');

    loading.style.display = 'none';
  } catch (err) {
    loading.textContent = 'Error loading favorites: ' + err.message;
  }
});
