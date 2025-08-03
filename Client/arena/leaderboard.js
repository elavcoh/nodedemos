document.addEventListener('DOMContentLoaded', function() {
  const leaderboardTable = document.getElementById('leaderboard-table');
  const loadingMessage = document.getElementById('loading-message');
  const noPlayersMessage = document.getElementById('no-players-message');
  const refreshBtn = document.getElementById('refresh-btn');
  const backBtn = document.querySelector('.back-to-arena-btn');

  // Load leaderboard on page load
  loadLeaderboard();

  // Refresh button event listener
  refreshBtn.addEventListener('click', loadLeaderboard);

  // Back button event listener
  if (backBtn) {
    console.log('Back button found:', backBtn);
    backBtn.addEventListener('click', function() {
      console.log('Back button clicked!');
      window.location.href = '/arena';
    });
  } else {
    console.error('Back button not found!');
  }

  async function loadLeaderboard() {
    try {
      loadingMessage.style.display = 'block';
      leaderboardTable.innerHTML = '';
      noPlayersMessage.style.display = 'none';

      const response = await fetch('/api/leaderboard', {
        method: 'GET',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      if (data.players && data.players.length > 0) {
        displayLeaderboard(data.players);
      } else {
        showNoPlayersMessage();
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showNoPlayersMessage();
    } finally {
      loadingMessage.style.display = 'none';
    }
  }

  function displayLeaderboard(players) {
    // Create header
    const header = document.createElement('div');
    header.className = 'leaderboard-header';
    header.innerHTML = `
      <div>Rank</div>
      <div>Username</div>
      <div>Total Score</div>
      <div>Wins</div>
      <div>Losses</div>
      <div>Total Battles</div>
      <div>Success Rate</div>
    `;
    leaderboardTable.appendChild(header);

    // Create rows for each player
    players.forEach((player, index) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      
      // Add current-user class if this is the current user
      if (player.isCurrentUser) {
        row.classList.add('current-user');
      }

      const rank = index + 1;
      const successRate = player.totalBattles > 0 ? Math.round((player.wins / player.totalBattles) * 100) : 0;
      const successRateClass = getSuccessRateClass(successRate);

      row.innerHTML = `
        <div class="rank rank-${rank <= 3 ? rank : ''}">${rank}</div>
        <div class="username">${player.firstName}</div>
        <div class="total-score">${player.totalScore}</div>
        <div class="wins">${player.wins}</div>
        <div class="losses">${player.losses}</div>
        <div class="total-battles">${player.totalBattles}</div>
        <div class="success-rate ${successRateClass}">${successRate}%</div>
      `;
      
      leaderboardTable.appendChild(row);
    });
  }

  function getSuccessRateClass(rate) {
    if (rate >= 70) return 'high';
    if (rate >= 40) return 'medium';
    return 'low';
  }

  function showNoPlayersMessage() {
    noPlayersMessage.style.display = 'block';
  }
}); 