const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.user = { email: user.email, firstName: user.firstName };
  res.redirect('/app');
});

router.post('/register', (req, res) => {
  const { email, password, firstName } = req.body;
  const users = loadUsers();
  if (users.some(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });

  users.push({ email, password, firstName, favorites: [] });
  saveUsers(users);
  req.session.user = { email, firstName };
  res.redirect('/app');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
