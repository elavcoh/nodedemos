<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Your Favorites</title>
  <link rel="stylesheet" href="/pokemon.css" />
  <style>
    body {
      font-family: Arial; background: #f5f5f5;
      margin: 0; padding: 0;
    }
    header {
      background: #ffcb05;
      color: #2a75bb;
      padding: 12px;
      display: flex; justify-content: space-between; align-items: center;
    }
    header #user-info { font-weight: bold; }
    header a {
      background: #2a75bb;
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      text-decoration: none;
    }
    .controls {
      display: flex; align-items: center;
      gap: 8px; margin: 12px 16px;
    }
    .controls button,
    .controls select {
      padding: 8px 12px; font-size: 1em; cursor: pointer;
    }
    #loading-screen {
      text-align: center; font-size: 1.1em; margin: 20px;
    }
    .pokemon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px,1fr));
      gap: 20px;
      padding: 0 20px 40px;
    }
  </style>

  <!-- Only load the favorites script -->
  <script src="/favorites.js" defer></script>
</head>
<body>
  <header>
    <div id="user-info">Loading user…</div>
    <a href="/app">Back to App</a>
  </header>

  <div class="controls">
    <button id="back-button">Back</button>
    <label for="sort-select">Sort by:</label>
    <select id="sort-select">
      <option value="name">Name</option>
      <option value="id">ID</option>
    </select>
    <button id="download-csv-button">Download CSV</button>
  </div>

  <div id="loading-screen">Loading favorites…</div>
  <div id="favorites-container" class="pokemon-grid"></div>
  <h1 id="user-label"></h1>
  <div id="favorites-container">Loading favorites…</div>
  
  <script>
    // fetch the user's name
    fetch('/api/me', { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => {
        document.getElementById('user-info').textContent =
          'Logged in as ' + u.firstName;
      })
      .catch(() => location.href = '/login');
  </script>
</body>
</html>
