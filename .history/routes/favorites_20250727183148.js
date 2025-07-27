// routes/favorites.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'Data', 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ✅ Get favorites of the logged-in user
router.get('/favorites', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ favorites: user.favorites || [] });
});

// ✅ Add a favorite to the logged-in user
router.post('/favorites', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const { id, name, image } = req.body;
  if (!id || !name || !image) {
    return res.status(400).json({ error: 'Missing favorite data' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === req.session.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // ✅ Create favorites array if missing
  if (!user.favorites) user.favorites = [];

  // ✅ Check for duplicates
  const alreadyExists = user.favorites.some(fav => fav.id === id);
  if (alreadyExists) {
    return res.json({ success: true, favorites: user.favorites });
  }

  // ✅ Add new favorite
  user.favorites.push({ id, name, image });
  writeUsers(users);

  res.json({ success: true, favorites: user.favorites });
});

module.exports = router;
