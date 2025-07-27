const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

router.get('/', (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.status(401).json({ error: 'Not logged in' });

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  res.json(user?.favorites || []);
});

router.post('/', (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.status(401).json({ error: 'Not logged in' });

  const { id, name, image } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user.favorites.find(p => p.id === id)) {
    user.favorites.push({ id, name, image });
    saveUsers(users);
  }
  res.json(user.favorites);
});

router.delete('/:id', (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.status(401).json({ error: 'Not logged in' });

  const users = loadUsers();
  const user = users.find(u => u.email === email);
  user.favorites = user.favorites.filter(p => p.id !== req.params.id);
  saveUsers(users);
  res.json(user.favorites);
});

module.exports = router;
