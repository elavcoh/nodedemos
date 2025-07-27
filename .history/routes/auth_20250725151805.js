const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '..', 'Data', 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// שליחת דפי login/register
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'register.html'));
});

// טיפול בהרשמה
router.post('/register', async (req, res) => {
  const { firstName, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!firstName || !/^[A-Za-z]{1,50}$/.test(firstName)) {
    errors.push("First name must be up to 50 English letters only.");
  }

  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    errors.push("Invalid email format.");
  }

  if (!password || password.length < 7 || password.length > 15 ||
    !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must be 7-15 characters with upper, lower, digit, and special character.");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  const users = readUsers();
  if (users.find(u => u.email === email)) {
    errors.push("Email already registered.");
  }

  if (errors.length > 0) {
    return res.status(400).send(`
      <h2>Registration Failed</h2>
      <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
      <a href="/register">Back</a>
    `);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ firstName, email, password: hashedPassword });
  writeUsers(users);

  res.redirect('/login');
});

// התחברות
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).send(`<h2>User Not Found</h2><a href="/login">Try Again</a>`);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).send(`<h2>Incorrect Password</h2><a href="/login">Try Again</a>`);
  }

  req.session.user = {
    email: user.email,
    firstName: user.firstName
  };

  res.redirect('/app');
});

// התנתקות
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/');
  });
});

module.exports = router;
