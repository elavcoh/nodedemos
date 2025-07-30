const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', 'Data', 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// GET /favorites – Load favorites
router.get('/', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ favorites: Array.isArray(user.favorites) ? user.favorites : [] });
});

// POST /favorites – Add favorite
// POST /favorites – Add favorite
router.post('/favorites', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);

  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!Array.isArray(user.favorites)) user.favorites = [];

  if (user.favorites.length >= 10) {
    return res.status(400).json({ error: 'You can only have up to 10 favorites.' });
  }

  const { id, name, image, types, abilities, stats } = req.body;
  if (!id || !name || !image) {
    return res.status(400).json({ error: 'Missing favorite data' });
  }

  const alreadyExists = user.favorites.some(fav => parseInt(fav.id) === parseInt(id));
  if (!alreadyExists) {
    user.favorites.push({ id, name, image, types, abilities, stats });
    writeUsers(users);
  }

  res.json({ success: true, favorites: user.favorites });
});


// POST /favorites/remove – Remove favorite
router.post('/remove', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);

  if (!user) return res.status(404).json({ error: 'User not found' });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });

  const normalizedId = parseInt(id);

  if (Array.isArray(user.favorites)) {
    user.favorites = user.favorites.filter(fav => parseInt(fav.id) !== normalizedId);
    writeUsers(users); // ✅ שמירת הקובץ לאחר עדכון
  }

  res.json({ success: true, favorites: user.favorites });
});

module.exports = router;
