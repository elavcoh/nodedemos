let favorites = [], selectedPokemon = null, botPokemon = null;

// הצגת שם המשתמש
fetch('/api/me', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(u => document.getElementById('user-info').textContent = 'Logged in as ' + u.firstName)
  .catch(() => location.href = '/login');

// יצירת קלף פוקימון לבחירה
function createPokemonCard(p) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  card.dataset.id = p.id;
  card.innerHTML = `
    <h2>#${p.id} - ${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" />
    <div class="details">
      <p><strong>HP:</strong> ${p.stats.hp}</p>
      <p><strong>Attack:</strong> ${p.stats.attack}</p>
      <p><strong>Defense:</strong> ${p.stats.defense}</p>
      <p><strong>Speed:</strong> ${p.stats.speed}</p>
    </div>`;
  card.addEventListener('click', () => {
    document.querySelectorAll('.pokemon-card.selected').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPokemon = p;
    document.getElementById('start-battle-btn').disabled = false;
  });
  return card;
}

// טעינת מועדפים
const container = document.getElementById('favorites-container');
fetch('/api/favorites', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(data => {
    favorites = data.favorites || [];
    document.getElementById('loading-screen').style.display = 'none';
    favorites.forEach(p => container.appendChild(createPokemonCard(p)));
  });

// מעבר לקרב
document.getElementById('start-battle-btn').addEventListener('click', async () => {
  const botId = Math.floor(Math.random() * 898) + 1;
  botPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${botId}`).then(r => r.json());

  document.getElementById('selection-screen').style.display = 'none';
  document.getElementById('battle-screen').style.display = 'block';

  renderCard(selectedPokemon, 'player-card');
  renderCard({
    id: botPokemon.id,
    name: botPokemon.name,
    sprites: botPokemon.sprites,
    stats: botPokemon.stats
  }, 'bot-card');
});

// ציור קלף בקרב
function renderCard(poke, id) {
  const el = document.getElementById(id);
  const stat = n => poke.stats.find(s => s.stat.name === n).base_stat;
  el.innerHTML = `
    <h2>#${poke.id} - ${poke.name}</h2>
    <img src="${poke.sprites?.front_default || poke.image}" alt="${poke.name}" />
    <div class="details">
      <p><strong>HP:</strong> ${stat('hp')}</p>
      <p><strong>Attack:</strong> ${stat('attack')}</p>
      <p><strong>Defense:</strong> ${stat('defense')}</p>
      <p><strong>Speed:</strong> ${stat('speed')}</p>
    </div>`;
}

// לוגיקת קרב
const fightBtn = document.getElementById('fight-btn');
const rematchBtn = document.getElementById('rematch-btn');
const cdEl = document.getElementById('countdown');
const resEl = document.getElementById('result');
const pcEl = document.getElementById('player-card');
const bcEl = document.getElementById('bot-card');

function runBattle() {
  pcEl.classList.remove('winner','loser');
  bcEl.classList.remove('winner','loser');
  cdEl.textContent = '';
  resEl.textContent = '';

  fightBtn.style.display = 'none';
  rematchBtn.style.display = 'none';

  const w = { hp:0.3, attack:0.4, defense:0.2, speed:0.1 };
  const statVal = (o,n) => o.stats.find(s=>s.stat.name===n).base_stat;
  const rnd = () => Math.random() * 10;

  const pScore = w.hp*selectedPokemon.stats.hp + w.attack*selectedPokemon.stats.attack +
                 w.defense*selectedPokemon.stats.defense + w.speed*selectedPokemon.stats.speed + rnd();
  const bScore = w.hp*statVal(botPokemon,'hp') + w.attack*statVal(botPokemon,'attack') +
                 w.defense*statVal(botPokemon,'defense') + w.speed*statVal(botPokemon,'speed') + rnd();

  let cnt = 3;
  cdEl.textContent = cnt;
  const iv = setInterval(() => {
    cnt--;
    if (cnt > 0) {
      cdEl.textContent = cnt;
    } else {
      clearInterval(iv);
      cdEl.textContent = 'Fight!';
      if (pScore > bScore) {
        pcEl.classList.add('winner'); bcEl.classList.add('loser');
        resEl.textContent = 'You Win!';
      } else if (bScore > pScore) {
        bcEl.classList.add('winner'); pcEl.classList.add('loser');
        resEl.textContent = 'Bot Wins!';
      } else {
        resEl.textContent = "It's a Tie!";
      }
      document.getElementById('battle-end-sound').play();
      rematchBtn.style.display = 'inline-block';
    }
  }, 1000);
}

fightBtn.addEventListener('click', runBattle);
rematchBtn.addEventListener('click', runBattle);

// ניווט
document.getElementById('back-btn').addEventListener('click', () => location.href = '/arena');
document.getElementById('back-to-search-btn').addEventListener('click', () => location.href = '/');
