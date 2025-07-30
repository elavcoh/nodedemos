// File: Client/arena/vs-bot.js
let favorites = [], selectedPokemon = null, botPokemon = null;

// --- 1) טען מידע משתמש ---
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => { if (!r.ok) throw 0; return r.json(); })
  .then(u => {
    document.getElementById('user-info').textContent =
      'Logged in as ' + u.firstName;
  })
  .catch(() => location.href = '/login');

// --- 2) צור קלף פוקימון ---
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

// --- 3) טען מועדפים ---
const container = document.getElementById('favorites-container');
fetch('/api/favorites', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(data => {
    favorites = data.favorites || [];
    document.getElementById('loading-screen').style.display = 'none';
    if (!favorites.length) {
      container.textContent = 'You have no favorites yet.';
      return;
    }
    favorites.forEach(p => {
      const card = createPokemonCard(p);
      container.appendChild(card);
    });
  });

// --- 4) בחירת פוקימון ---
container.addEventListener('click', e => {
  const card = e.target.closest('.pokemon-card');
  if (!card) return;

  document.querySelectorAll('.pokemon-card.selected')
    .forEach(c => c.classList.remove('selected'));

  card.classList.add('selected');
  selectedPokemon = favorites.find(p => p.id == card.dataset.id);
  document.getElementById('start-battle-btn').disabled = false;
});

// --- 5) התחלת קרב ---
document.getElementById('start-battle-btn')
  .addEventListener('click', async () => {
    const botId = Math.floor(Math.random() * 898) + 1;

    botPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${botId}`)
      .then(r => r.json());

    // החלף מסכים
    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';

    renderBattleCards(selectedPokemon, botPokemon);
  });

// --- 6) הצגת קלפים בקרב ---
function renderBattleCards(player, bot) {
  document.getElementById('player-card').innerHTML = `
    <h3>#${player.id} - ${player.name}</h3>
    <img src="${player.image}" alt="${player.name}" />
    <p>HP: ${player.stats.hp}</p>
  `;

  document.getElementById('bot-card').innerHTML = `
    <h3>#${bot.id} - ${bot.name}</h3>
    <img src="${bot.sprites.front_default}" alt="${bot.name}" />
    <p>HP: ${bot.stats[0].base_stat}</p>
  `;

  document.getElementById('battle-log').textContent =
    `${player.name} vs ${bot.name} — Battle begins!`;
}
