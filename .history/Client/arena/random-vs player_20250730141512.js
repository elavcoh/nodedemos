let battleData = null;

async function loadPlayers() {
  const res = await fetch('/api/online-users');
  const data = await res.json();
  const list = document.getElementById('players-list');
  list.innerHTML = '';

  if (!data.online.length) {
    list.textContent = 'No players online.';
    return;
  }

  data.online.forEach(p => {
    const div = document.createElement('div');
    div.className = 'player-card';
    div.textContent = p.firstName + " (" + p.email + ")";
    div.onclick = () => startBattle(p.id);
    list.appendChild(div);
  });
}

async function startBattle(opponentId) {
  const res = await fetch('/api/arena/battle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opponentId })
  });
  battleData = await res.json();

  document.getElementById('players-section').style.display = 'none';
  document.getElementById('battle-section').style.display = 'block';

  renderBattle();
}

function renderBattle() {
  const field = document.getElementById('battle-field');
  const me = battleData.me, opp = battleData.opponent;

  field.innerHTML = `
    <div class="pokemon" id="me">
      <h3>${me.user.name}</h3>
      <img src="${me.pokemon.image}" alt="${me.pokemon.name}"/>
      <p>${me.pokemon.name}</p>
      <p>HP:${me.pokemon.stats.hp} Atk:${me.pokemon.stats.attack} Def:${me.pokemon.stats.defense} Spd:${me.pokemon.stats.speed}</p>
    </div>
    <div class="pokemon" id="opp">
      <h3>${opp.user.name}</h3>
      <img src="${opp.pokemon.image}" alt="${opp.pokemon.name}"/>
      <p>${opp.pokemon.name}</p>
      <p>HP:${opp.pokemon.stats.hp} Atk:${opp.pokemon.stats.attack} Def:${opp.pokemon.stats.defense} Spd:${opp.pokemon.stats.speed}</p>
    </div>
  `;
}

document.getElementById('start-battle-btn').onclick = () => {
  let t = 3;
  const timer = document.getElementById('timer');
  timer.textContent = t;
  const intv = setInterval(() => {
    t--;
    if (t === 0) {
      clearInterval(intv);
      timer.textContent = "Fight!";
      showWinner();
    } else {
      timer.textContent = t;
    }
  }, 1000);
};

function showWinner() {
  const winnerId = battleData.winner;
  const me = document.getElementById('me');
  const opp = document.getElementById('opp');

  if (battleData.me.user.id === winnerId) {
    me.classList.add('winner');
    opp.classList.add('loser');
  } else {
    opp.classList.add('winner');
    me.classList.add('loser');
  }
}

loadPlayers();
