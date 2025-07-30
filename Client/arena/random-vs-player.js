let battleData = null;
let currentUser = null;

// טעינת המשתמש הנוכחי
async function loadCurrentUser() {
  try {
    console.log('Loading current user...');
    const res = await fetch('/api/me');
    console.log('API response:', res);
    
    if (!res.ok) {
      throw new Error('Failed to load user');
    }
    
    currentUser = await res.json();
    console.log('Current user loaded:', currentUser);
    
    // עדכון סטטוס online
    console.log('Setting user online...');
    const onlineRes = await fetch('/api/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (onlineRes.ok) {
      console.log('User set to online');
    } else {
      console.log('Failed to set user online');
    }
    
    await loadPlayers();
  } catch (error) {
    console.error('Error loading user:', error);
  }
}

// טען את כל המשתמשים שמחוברים (online: true)
async function loadPlayers() {
  const res = await fetch('/api/online-users');
  const data = await res.json();
  const list = document.getElementById('players-list');
  list.innerHTML = '';

  if (!data.online.length) {
    list.innerHTML = '<p class="no-players">No players online.</p>';
    return;
  }

  data.online.forEach(player => {
    if (player.id === currentUser.id) return;
    const div = document.createElement('div');
    div.className = 'player-card';
    div.innerHTML = `
      <h3>${player.firstName}</h3>
      <p>${player.email}</p>
      <p class="pokemon-count">Pokémon: ${player.favorites ? player.favorites.length : 0}</p>
      <button class="challenge-btn">Challenge</button>
    `;
    div.querySelector('.challenge-btn').onclick = () => startBattle(player.id);
    list.appendChild(div);
  });
}

// התחלת קרב מול שחקן אחר
async function startBattle(opponentId) {
  console.log('Starting battle with opponent:', opponentId);
  try {
    const res = await fetch('/api/arena/battle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opponentId })
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Battle error:', error);
      alert(error.error || 'Failed to start battle');
      return;
    }
    
    battleData = await res.json();
    console.log('Battle data received:', battleData);
    
    document.getElementById('players-section').style.display = 'none';
    document.getElementById('battle-section').style.display = 'block';
    renderBattle();
  } catch (err) {
    console.error('Battle error:', err);
    alert('Failed to start battle');
  }
}

// הצגת הקרב: פוקימון, סטאטים, ניקוד
function renderBattle() {
  const field = document.getElementById('battle-field');
  const me = battleData.me, opp = battleData.opponent;
  field.innerHTML = `
    <div class="battle-pokemon" id="me">
      <div class="player-info">
        <h3>${me.name}</h3>
        <div class="pokemon-details">
          <img src="${me.pokemon.image}" alt="${me.pokemon.name}" class="pokemon-img"/>
          <h4>${me.pokemon.name}</h4>
          <div class="stats">
            <div class="stat">HP: ${me.pokemon.stats.hp}</div>
            <div class="stat">Attack: ${me.pokemon.stats.attack}</div>
            <div class="stat">Defense: ${me.pokemon.stats.defense}</div>
            <div class="stat">Speed: ${me.pokemon.stats.speed}</div>
          </div>
          <div class="score">Score: <b>${Math.round(me.score * 100) / 100}</b></div>
        </div>
      </div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="battle-pokemon" id="opp">
      <div class="player-info">
        <h3>${opp.name}</h3>
        <div class="pokemon-details">
          <img src="${opp.pokemon.image}" alt="${opp.pokemon.name}" class="pokemon-img"/>
          <h4>${opp.pokemon.name}</h4>
          <div class="stats">
            <div class="stat">HP: ${opp.pokemon.stats.hp}</div>
            <div class="stat">Attack: ${opp.pokemon.stats.attack}</div>
            <div class="stat">Defense: ${opp.pokemon.stats.defense}</div>
            <div class="stat">Speed: ${opp.pokemon.stats.speed}</div>
          </div>
          <div class="score">Score: <b>${Math.round(opp.score * 100) / 100}</b></div>
        </div>
      </div>
    </div>
  `;
  
  // התחלת שחלוף הפוקימונים מיד
  animatePokemonRoulette();
}

function animatePokemonRoulette() {
  const mePokemons = battleData.meAllPokemons || [battleData.me.pokemon];
  const oppPokemons = battleData.oppAllPokemons || [battleData.opponent.pokemon];

  let meImg = document.querySelector('#me .pokemon-img');
  let meName = document.querySelector('#me h4');
  let oppImg = document.querySelector('#opp .pokemon-img');
  let oppName = document.querySelector('#opp h4');

  let totalDuration = 1800; // משך כולל במילישניות
  let interval = 60; // התחלה מהירה
  let elapsed = 0;

  // אפקט רולטה: מתחיל מהר ומאט בהדרגה
  function spin() {
    if (elapsed < totalDuration) {
      // רנדום פוקימון לכל צד
      const mePoke = mePokemons[Math.floor(Math.random() * mePokemons.length)];
      const oppPoke = oppPokemons[Math.floor(Math.random() * oppPokemons.length)];
      if (meImg && meName) {
        meImg.src = mePoke.image;
        meName.textContent = mePoke.name;
        meImg.style.transform = 'scale(1.15)';
        setTimeout(() => meImg.style.transform = 'scale(1)', 40);
      }
      if (oppImg && oppName) {
        oppImg.src = oppPoke.image;
        oppName.textContent = oppPoke.name;
        oppImg.style.transform = 'scale(1.15)';
        setTimeout(() => oppImg.style.transform = 'scale(1)', 40);
      }
      // האטה הדרגתית
      interval = Math.min(200, interval + 15);
      elapsed += interval;
      setTimeout(spin, interval);
    } else {
      // בסוף – להחזיר את הפוקימון שנבחר באמת
      if (meImg && meName) {
        meImg.src = battleData.me.pokemon.image;
        meName.textContent = battleData.me.pokemon.name;
        meImg.style.transform = 'scale(1)';
      }
      if (oppImg && oppName) {
        oppImg.src = battleData.opponent.pokemon.image;
        oppName.textContent = battleData.opponent.pokemon.name;
        oppImg.style.transform = 'scale(1)';
      }
    }
  }
  spin();
}

// טיימר 3...2...1 ואז הצגת מנצח
document.getElementById('start-battle-btn').onclick = () => {
  const timer = document.getElementById('timer');
  const btn = document.getElementById('start-battle-btn');
  btn.disabled = true;
  
  let countdown = 3;
  timer.textContent = countdown;
  timer.style.display = 'block';
  const interval = setInterval(() => {
    countdown--;
    if (countdown === 0) {
      clearInterval(interval);
      timer.textContent = "Fight!";
      setTimeout(() => {
        timer.style.display = 'none';
        showWinner();
      }, 1000);
    } else {
      timer.textContent = countdown;
    }
  }, 1000);
};

// הצגת מנצח עם כתר וצליל
function showWinner() {
  const winnerId = battleData.winner;
  const me = document.getElementById('me');
  const opp = document.getElementById('opp');
  
  // הפעלת צליל
  const audio = new Audio('/sounds/sound.wav');
  audio.play().catch(e => console.log('Audio play failed:', e));
  
  if (battleData.me.id === winnerId) {
    me.classList.add('winner');
    opp.classList.add('loser');
    me.innerHTML += '<div class="crown">👑</div>';
  } else {
    opp.classList.add('winner');
    me.classList.add('loser');
    opp.innerHTML += '<div class="crown">👑</div>';
  }
}

// כפתור חזרה
document.getElementById('back-btn').onclick = () => {
  document.getElementById('players-section').style.display = 'block';
  document.getElementById('battle-section').style.display = 'none';
};

// אתחול
async function init() {
  await loadCurrentUser();
}

// הפעלה כשהדף נטען
document.addEventListener('DOMContentLoaded', init); 