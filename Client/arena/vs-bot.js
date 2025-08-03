// File: Client/arena/vs-bot.js
(async () => {
    // 1) Authenticate & show name
    try {
      const meRes = await fetch('/api/me', { credentials: 'same-origin' });
      if (!meRes.ok) throw new Error();
      const me = await meRes.json();
      document.getElementById('user-name').textContent = me.firstName;
    } catch {
      return location.replace('/login');
    }
  
    // 2) NAV buttons
    document.getElementById('back-btn')
      .addEventListener('click', () => location.href = '/arena');
    document.getElementById('back-to-search-btn')
      .addEventListener('click', () => location.href = '/');
  
    // 3) Load your favorites
    // 3) Load your favorites
    let selectedId = null;
    
    try {
      const favsRes = await fetch('/api/favorites', { credentials: 'same-origin' });
      if (!favsRes.ok) throw new Error('Failed to fetch favorites');
      const response = await favsRes.json();
      const favs = response.favorites || [];
      
      const container = document.getElementById('favorites-list');
      
      if (favs.length === 0) {
        container.innerHTML = '<p>No favorites found. Add some Pokémon to your favorites first!</p>';
        return;
      }
      
      favs.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
          <h2>#${p.id} – ${p.name}</h2>
          <img src="${p.image}" alt="${p.name}">
          <p><strong>Types:</strong> ${p.types?.join(', ') || '?'}</p>
          <p><strong>Abilities:</strong> ${p.abilities?.join(', ') || '?'}</p>
          <div class="details">
            <p><strong>HP:</strong> ${p.stats?.hp || '?'}</p>
            <p><strong>Attack:</strong> ${p.stats?.attack || '?'}</p>
            <p><strong>Defense:</strong> ${p.stats?.defense || '?'}</p>
            <p><strong>Speed:</strong> ${p.stats?.speed || '?'}</p>
          </div>
        `;
        
        // Add click to expand functionality
        card.addEventListener('click', () => {
          card.classList.toggle('expanded');
        });
        
        // Add selection functionality
        card.addEventListener('click', (e) => {
          // Don't select if clicking on expanded details
          if (e.target.closest('.details')) return;
          
          selectedId = p.id;
          // highlight selected card
          container.querySelectorAll('.selected')
            .forEach(e => e.classList.remove('selected'));
          card.classList.add('selected');
          document.getElementById('start-battle-btn').disabled = false;
        });
        
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
      document.getElementById('favorites-list').innerHTML = 
        '<p>Error loading favorites. Please try again.</p>';
    }
  
    // 4) Start the BOT battle
    const startBattleBtn = document.getElementById('start-battle-btn');
    startBattleBtn.disabled = true; // Start disabled until a Pokémon is selected
    
    startBattleBtn.addEventListener('click', async () => {
      if (!selectedId) {
        alert('Please select a Pokémon first!');
        return;
      }
      
      // בדוק הגבלת קרבות לפני התחלת הקרב
      try {
        const limitRes = await fetch('/api/battle-limit');
        if (limitRes.ok) {
          const limitData = await limitRes.json();
          if (!limitData.canBattle) {
            alert(limitData.error);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking battle limit:', error);
      }
      
      const botId = Math.floor(Math.random() * 898) + 1;
      // Store the IDs in sessionStorage for the battle page to use
      sessionStorage.setItem('playerId', selectedId);
      sessionStorage.setItem('botId', botId);
      window.location.href = `/arena/battle`;
    });
  })();
  