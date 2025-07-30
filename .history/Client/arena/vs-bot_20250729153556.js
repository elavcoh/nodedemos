let favorites = [];
let selectedPokemonId = null;

// הצגת משתמש מחובר
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(u => {
    document.getElementById('user-info').textContent = 'Logged in as ' + u.firstName;
  })
  .catch(() => location.href = '/login');

// בניית קלף
function createPokemonCard(p) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.dataset.id = p.id;
  card.innerHTML = `
    <h2>#${p.id} - ${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" />
    <p><strong>HP:</strong> ${p.stats.hp}</p>
    <p><strong>Attack:</strong> ${p.stats.attack}</p>
    <p><strong>Defense:</strong> ${p.stats.defense}</p>
    <p><strong>Speed:</strong> ${p.stats.speed}</p>
  `;
  return card;
}

// טעינת מועדפים
const container = document.getElementById('favorites-container');
fetch('/api/favorites', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(data => {
    favorites = data.favorites || [];
    document.getElementById('loading-screen').style.display = 'none';
    if (!favorites.length) {
      container.textContent = 'No favorites yet.';
      return;
    }
    favorites.forEach(p => container.appendChild(createPokemonCard(p)));
  });

// בחירה
container.addEventListener('click', e => {
  const card = e.target.closest('.pokemon-card');
  if (!card) return;
  document.querySelectorAll('.pokemon-card.selected').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedPokemonId = card.dataset.id;
  document.getElementById('start-battle-btn').disabled = false;
});

// התחלת קרב (באותו דף)
document.getElementById('start-battle-btn').addEventListener('click', () => {
  const playerPokemon = favorites.find(p => p.id == selectedPokemonId);
  const botId = Math.floor(Math.random() * 898) + 1;

  renderBattle(playerPokemon, botId);

  document.getElementById('selection-screen').style.display = 'none';
  document.getElementById('battle-screen').style.display = 'block';
});

// ציור הקרב
function renderBattle(playerPokemon, botId) {
  const playerCard = document.getElementById('player-card');
  playerCard.innerHTML = `
    <h2>#${playerPokemon.id} - ${playerPokemon.name}</h2>
    <img src="${playerPokemon.image}" />
    <p>HP: ${playerPokemon.stats.hp}</p>
    <p>Attack: ${playerPokemon.stats.attack}</p>
    <p>Defense: ${playerPokemon.stats.defense}</p>
    <p>Speed: ${playerPokemon.stats.speed}</p>
  `;

  fetch(`https://pokeapi.co/api/v2/pokemon/${botId}`)
    .then(r => r.json())
    .then(bot => {
      const botCard = document.getElementById('bot-card');
      botCard.innerHTML = `
        <h2>#${bot.id} - ${bot.name}</h2>
        <img src="${bot.sprites.front_default}" />
        <p>HP: ${bot.stats[0].base_stat}</p>
        <p>Attack: ${bot.stats[1].base_stat}</p>
        <p>Defense: ${bot.stats[2].base_stat}</p>
        <p>Speed: ${bot.stats[5].base_stat}</p>
      `;
    });
}

// כפתור ריסטארט
document.getElementById('restart-btn').addEventListener('click', () => {
  document.getElementById('battle-screen').style.display = 'none';
  document.getElementById('selection-screen').style.display = 'block';
});
