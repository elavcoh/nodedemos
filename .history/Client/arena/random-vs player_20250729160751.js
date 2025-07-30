let player1 = null, player2 = null;

// נוסחת ניקוד
function calcScore(p) {
  return (
    p.stats.hp * 0.3 +
    p.stats.attack * 0.4 +
    p.stats.defense * 0.2 +
    p.stats.speed * 0.1
  ).toFixed(2);
}

// יצירת כרטיס
function createCard(container, p) {
  container.innerHTML = `
    <h2>#${p.id} - ${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" />
    <p><strong>HP:</strong> ${p.stats.hp}</p>
    <p><strong>Attack:</strong> ${p.stats.attack}</p>
    <p><strong>Defense:</strong> ${p.stats.defense}</p>
    <p><strong>Speed:</strong> ${p.stats.speed}</p>
    <p><strong>Score:</strong> ${calcScore(p)}</p>
  `;
}

// הפעלה
document.getElementById('start-battle-btn').addEventListener('click', () => {
  // TODO: במקום דמו, למשוך פוקימונים אמיתיים מהמועדפים של שחקנים
  const demoPoke1 = {
    id: 25, name: "Pikachu",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    stats: { hp: 60, attack: 55, defense: 40, speed: 90 }
  };
  const demoPoke2 = {
    id: 1, name: "Bulbasaur",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    stats: { hp: 70, attack: 49, defense: 50, speed: 45 }
  };

  player1 = demoPoke1;
  player2 = demoPoke2;

  createCard(document.getElementById('player1-card'), player1);
  createCard(document.getElementById('player2-card'), player2);

  const score1 = calcScore(player1);
  const score2 = calcScore(player2);

  let result = "";
  if (score1 > score2) result = `${player1.name} Wins!`;
  else if (score2 > score1) result = `${player2.name} Wins!`;
  else result = "It's a Draw!";

  document.getElementById('result').textContent = result;

  document.getElementById('rematch-btn').style.display = 'inline-block';
});

// רימאץ’
document.getElementById('rematch-btn').addEventListener('click', () => {
  document.getElementById('result').textContent = "";
  document.getElementById('player1-card').innerHTML = "";
  document.getElementById('player2-card').innerHTML = "";
  document.getElementById('rematch-btn').style.display = 'none';
});
