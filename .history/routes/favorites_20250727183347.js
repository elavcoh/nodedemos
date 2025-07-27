// routes/favorites.js
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

// GET favorites
router.get('/favorites', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);

  if (!user) {
    console.log("User not found in GET:", req.session.user.email);
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ favorites: Array.isArray(user.favorites) ? user.favorites : [] });
});

// POST favorites – Add a single favorite
router.post('/favorites', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);

  if (!user) {
    console.log("User not found in POST:", req.session.user.email);
    return res.status(404).json({ error: 'User not found' });
  }

  const { id, name, image } = req.body;
  if (!id || !name || !image) {
    return res.status(400).json({ error: 'Missing favorite data' });
  }

  if (!Array.isArray(user.favorites)) {
    user.favorites = [];
  }

  const alreadyExists = user.favorites.some(fav => fav.id === id);
  if (!alreadyExists) {
    user.favorites.push({ id, name, image });
    writeUsers(users);
  }

  console.log(`Updated favorites for ${user.email}:`, user.favorites);
  res.json({ success: true, favorites: user.favorites });
});

module.exports = router;
