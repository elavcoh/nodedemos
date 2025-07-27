const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const usersPath = path.join(__dirname, '../Data/users.json');

// helper to load users
function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

// helper to save users
function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// GET current logged in user
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST /api/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.user = { email: user.email, firstName: user.firstName };
    res.json({ message: 'Login successful' });
  });
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// POST /api/register
router.post('/register', async (req, res) => {
  const { email, password, firstName } = req.body;
  const users = loadUsers();

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    email,
    firstName,
    password: hashedPassword,
    favorites: []
  };

  users.push(newUser);
  saveUsers(users);

  req.session.user = { email, firstName };
  res.json({ message: 'Registration successful' });
});

module.exports = router;
