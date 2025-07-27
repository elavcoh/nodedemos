const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '..', 'Data', 'users.json');

// קריאת משתמשים
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// כתיבת משתמשים
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ----------------- REGISTER -----------------
router.post('/register', async (req, res) => {
  const { firstName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const users = readUsers();
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    firstName,
    email,
    password: hashed,
    favorites: []
  };

  users.push(newUser);
  writeUsers(users);

  req.session.user = { id: newUser.id, firstName: newUser.firstName };
  res.json({ message: 'Registration successful' });
});

// ----------------- LOGIN -----------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  req.session.user = { id: user.id, firstName: user.firstName };
  res.json({ message: 'Login successful' });
});

// ----------------- LOGOUT -----------------
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
