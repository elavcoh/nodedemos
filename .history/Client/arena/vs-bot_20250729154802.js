// File: Client/arena/vs-bot.js
let favorites = [], selectedPokemonId = null;

// 1) טוען את המשתמש
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => { if (!r.ok) throw 0; return r.json(); })
  .then(u => {
    document.getElementById('user-info').textContent =
      'Logged in as ' + u.firstName;
  })
  .catch(() => location.href = '/login');

// 2) יצירת קלף פוקימון
function createPokemonCard(p) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.dataset.id = p.id;

  card.innerHTML = `
    <h2>#${p.id} - ${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" />
    <p><strong>types:</strong> ${p.types.join(', ')}</p>
    <p><strong>abilities:</strong> ${p.abilities.join(', ')}</p>
    <div class="details">
      <p><strong>HP:</strong> ${p.stats.hp}</p>
      <p><strong>Attack:</strong> ${p.stats.attack}</p>
      <p><strong>Defense:</strong> ${p.stats.defense}</p>
      <p><strong>Speed:</strong> ${p.stats.speed}</p>
    </div>
  `;
  return card;
}

// 3) טוען את הפייבוריטס
const container = document.getElementById('favorites-container');
fetch('/api/favorites', { credentials: 'same-origin' })
  .then(r => { if (!r.ok) throw 0; return r.json(); })
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
    document.getElementById('loading-screen')
      .textContent = 'Failed to load favorites.';
  });

// 4) בחירת פוקימון
container.addEventListener('click', e => {
  const card = e.target.closest('.pokemon-card');
  if (!card) return;
  document.querySelectorAll('.pokemon-card.selected')
    .forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedPokemonId = card.dataset.id;
  document.getElementById('start-battle-btn').disabled = false;
});

// 5) התחלת קרב
document.getElementById('start-battle-btn')
  .addEventListener('click', () => {
    const botId = Math.floor(Math.random() * 898) + 1;
    const player = favorites.find(f => f.id == selectedPokemonId);
    const bot = {
      id: botId,
      name: "RandomBot",
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${botId}.png`,
      types: ["???"],
      abilities: ["???"],
      stats: { hp: 100, attack: 50, defense: 50, speed: 50 }
    };

    // מסתיר מסך בחירה ומראה קרב
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';

    document.getElementById('player-card').innerHTML = `
      <h2>#${player.id} - ${player.name}</h2>
      <img src="${player.image}" alt="${player.name}" />
    `;
    document.getElementById('bot-card').innerHTML = `
      <h2>#${bot.id} - ${bot.name}</h2>
      <img src="${bot.image}" alt="${bot.name}" />
    `;
  });

// 6) ניווט
document.getElementById('back-btn')
  .addEventListener('click', () => window.location.href = '/arena');
document.getElementById('back-to-search-btn')
  .addEventListener('click', () => window.location.href = '/');
