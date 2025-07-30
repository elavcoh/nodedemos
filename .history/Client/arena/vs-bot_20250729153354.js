let favorites = [];
let selectedPokemonId = null;

// 1) הצגת המשתמש המחובר
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => { if (!r.ok) throw 0; return r.json(); })
  .then(u => {
    document.getElementById('user-info').textContent =
      'Logged in as ' + u.firstName;
  })
  .catch(() => location.href = '/login');

// 2) בניית קלף פוקימון (שלב בחירה)
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

// 3) טעינת מועדפים
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

// 4) בחירת פוקימון אחד בלבד
container.addEventListener('click', e => {
  const card = e.target.closest('.pokemon-card');
  if (!card) return;
  document.querySelectorAll('.pokemon-card.selected')
    .forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedPokemonId = card.dataset.id;
  document.getElementById('start-battle-btn').disabled = false;
});

// 5) התחלת הקרב – מעבר למסך הקרב באותו דף
document.getElementById('start-battle-btn')
  .addEventListener('click', () => {
    const botId = Math.floor(Math.random() * 898) + 1;
    const playerPokemon = favorites.find(p => p.id == selectedPokemonId);

    renderBattle(playerPokemon, botId);

    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';
  });

// 6) ציור הקרב
function renderBattle(playerPokemon, botId) {
  const playerCard = document.getElementById('player-card');
  playerCard.innerHTML = `
    <h2>#${playerPokemon.id} - ${playerPokemon.name}</h2>
    <img src="${playerPokemon.image}" alt="${playerPokemon.name}">
    <p><strong>HP:</strong> ${playerPokemon.stats.hp}</p>
    <p><strong>Attack:</strong> ${playerPokemon.stats.attack}</p>
    <p><strong>Defense:</strong> ${playerPokemon.stats.defense}</p>
    <p><strong>Speed:</strong> ${playerPokemon.stats.speed}</p>
  `;

  // בוט רנדומלי מה־API
  fetch(`https://pokeapi.co/api/v2/pokemon/${botId}`)
    .then(r => r.json())
    .then(bot => {
      const botCard = document.getElementById('bot-card');
      botCard.innerHTML = `
        <h2>#${bot.id} - ${bot.name}</h2>
        <img src="${bot.sprites.front_default}" alt="${bot.name}">
        <p><strong>HP:</strong> ${bot.stats[0].base_stat}</p>
        <p><strong>Attack:</strong> ${bot.stats[1].base_stat}</p>
        <p><strong>Defense:</strong> ${bot.stats[2].base_stat}</p>
        <p><strong>Speed:</strong> ${bot.stats[5].base_stat}</p>
      `;
    });
}
