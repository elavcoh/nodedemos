let favorites = [];
let selectedPokemon = null;
let botPokemon = null;

// --- 1) מציג שם משתמש מחובר ---
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => { if (!r.ok) throw 0; return r.json(); })
  .then(u => {
    document.getElementById('user-info').textContent =
      'Logged in as ' + u.firstName;
  })
  .catch(() => location.href = '/login');

// --- 2) יוצר כרטיס פוקימון לבחירה ---
function createPokemonCard(p) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.dataset.id = p.id;

  card.innerHTML = `
    <h2>#${p.id} - ${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" />
    <p><strong>Types:</strong> ${p.types.join(', ')}</p>
    <p><strong>Abilities:</strong> ${p.abilities.join(', ')}</p>
  `;

  card.addEventListener('click', () => {
    document.querySelectorAll('.pokemon-card.selected')
      .forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPokemon = p;
    document.getElementById('start-battle-btn').disabled = false;
  });

  return card;
}

// --- 3) טוען מועדפים ומציג אותם ---
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
    favorites.forEach(p => 
      container.appendChild(createPokemonCard(p))
    );
  })
  .catch(() => {
    document.getElementById('loading-screen')
      .textContent = 'Failed to load favorites.';
  });

// --- 4) התחלת קרב ---
document.getElementById('start-battle-btn')
  .addEventListener('click', async () => {
    if (!selectedPokemon) return;

    const botId = Math.floor(Math.random() * 898) + 1;

    botPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${botId}`)
      .then(r => r.json());

    // מסתיר את מסך הבחירה ומציג את הקרב
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';

    renderBattleCards(selectedPokemon, botPokemon);
  });

// --- 5) מציג קלפי קרב ---
function renderBattleCards(player, bot) {
  const playerDiv = document.getElementById('player-card');
  const botDiv = document.getElementById('bot-card');

  playerDiv.innerHTML = `
    <h3>#${player.id} - ${player.name}</h3>
    <img src="${player.image}" alt="${player.name}" />
    <p><strong>HP:</strong> ${player.stats.hp}</p>
    <p><strong>Attack:</strong> ${player.stats.attack}</p>
    <p><strong>Defense:</strong> ${player.stats.defense}</p>
    <p><strong>Speed:</strong> ${player.stats.speed}</p>
  `;

  botDiv.innerHTML = `
    <h3>#${bot.id} - ${bot.name}</h3>
    <img src="${bot.sprites.front_default}" alt="${bot.name}" />
    <p><strong>HP:</strong> ${bot.stats[0].base_stat}</p>
    <p><strong>Attack:</strong> ${bot.stats[1].base_stat}</p>
    <p><strong>Defense:</strong> ${bot.stats[2].base_stat}</p>
    <p><strong>Speed:</strong> ${bot.stats[5].base_stat}</p>
  `;
}

// --- 6) כפתורי ניווט ---
document.getElementById('back-btn')
  .addEventListener('click', () => window.location.href = '/arena');
document.getElementById('back-to-search-btn')
  .addEventListener('click', () => window.location.href = '/');
