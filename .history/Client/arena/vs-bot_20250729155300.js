let favorites = [], selectedPokemon = null;

// --- טעינת משתמש ---
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(u => {
    document.getElementById('user-info').textContent = 'Logged in as ' + u.firstName;
  })
  .catch(() => location.href = '/login');

// --- בניית כרטיס פוקימון ---
function createPokemonCard(p) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.dataset.id = p.id;
  card.innerHTML = `
    <h2>#${p.id} - ${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" />
    <p><strong>types:</strong> ${p.types.join(', ')}</p>
    <p><strong>abilities:</strong> ${p.abilities.join(', ')}</p>
  `;
  card.addEventListener('click', () => {
    document.querySelectorAll('.pokemon-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPokemon = p;
    document.getElementById('start-battle-btn').disabled = false;
  });
  return card;
}

// --- טעינת מועדפים ---
const container = document.getElementById('favorites-container');
fetch('/api/favorites', { credentials: 'same-origin' })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(data => {
    favorites = data.favorites || [];
    document.getElementById('loading-screen').style.display = 'none';
    if (!favorites.length) {
      container.textContent = 'You have no favorites yet.';
      return;
    }
    favorites.forEach(p => container.appendChild(createPokemonCard(p)));
  })
  .catch(() => {
    document.getElementById('loading-screen').textContent = 'Failed to load favorites.';
  });

// --- התחלת קרב ---
document.getElementById('start-battle-btn').addEventListener('click', () => {
  if (!selectedPokemon) return;
  const botId = Math.floor(Math.random() * 898) + 1;
  const bot = { id: botId, name: "RandomBot", image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${botId}.png` };

  // מסתירים את מסך הבחירה
  document.getElementById('choose-screen').classList.add('hidden');
  // מציגים את מסך הקרב
  document.getElementById('battle-screen').classList.remove('hidden');

  // ממלאים את הכרטיסים
  document.getElementById('player-slot').innerHTML = `
    <h2>#${selectedPokemon.id} - ${selectedPokemon.name}</h2>
    <img src="${selectedPokemon.image}" />
  `;
  document.getElementById('bot-slot').innerHTML = `
    <h2>#${bot.id} - ${bot.name}</h2>
    <img src="${bot.image}" />
  `;
});

// --- כפתורי ניווט ---
document.getElementById('back-btn').addEventListener('click', () => window.location.href = '/arena');
document.getElementById('back-to-search-btn').addEventListener('click', () => window.location.href = '/');
