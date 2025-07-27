const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const usersPath = path.join(__dirname, '../Data/users.json');

// קריאת קובץ המשתמשים
function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

// כתיבה לקובץ המשתמשים
function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// 🔐 הרשמה
router.post('/signup', async (req, res) => {
  const { firstName, email, password } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const users = readUsers();

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(), // מזהה ייחודי
    firstName,
    email,
    password: hashedPassword,
    favorites: []
  };

  users.push(newUser);
  writeUsers(users);

  req.session.user = { id: newUser.id, firstName: newUser.firstName };
  res.status(201).json({ message: 'Signup successful' });
});

// 🔐 התחברות
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.user = { id: user.id, firstName: user.firstName };
  res.json({ message: 'Login successful' });
});

// 🔐 התנתקות
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// 🔐 מי מחובר (שימושי ל-favorites.html)
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

module.exports = router;
