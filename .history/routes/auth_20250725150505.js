const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

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

// שליחת עמודי טופס
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'register.html'));
});

// התחברות
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).send(`<h2>User not found</h2><a href="/login">Try again</a>`);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).send(`<h2>Incorrect password</h2><a href="/login">Try again</a>`);
  }

  req.session.user = { email: user.email, firstName: user.firstName };
  res.redirect('/');
});

// הרשמה
router.post('/register', async (req, res) => {
  const { firstName, email, password, confirmPassword } = req.body;
  const users = readUsers();
  const errors = [];

  if (!firstName || !/^[A-Za-z]{1,50}$/.test(firstName)) {
    errors.push("First name must be 1-50 English letters.");
  }
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    errors.push("Invalid email.");
  }
  if (users.find(u => u.email === email)) {
    errors.push("Email already registered.");
  }
  if (password !== confirmPassword) {
    errors.push("Passwords don't match.");
  }
  if (!password || password.length < 7 || !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must be 7-15 chars with upper, lower, digit, special char.");
  }

  if (errors.length) {
    return res.status(400).send(`<h2>Errors:</h2><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul><a href="/register">Back</a>`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ firstName, email, password: hashedPassword });
  writeUsers(users);
  res.redirect('/login');
});

// התנתקות
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
