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

// ————— SEND LOGIN / REGISTER PAGES —————
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Client', 'register.html'));
});

// ————— HANDLE REGISTRATION —————
router.post('/register', async (req, res) => {
  const { firstName, email, password, confirmPassword } = req.body;
  const errors = [];

  // Validate first name
  if (!firstName || !/^[A-Za-z]{1,50}$/.test(firstName)) {
    errors.push("First name must be up to 50 English letters only.");
  }

  // Validate email
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    errors.push("Invalid email format.");
  }

  // Validate password
  if (
    !password ||
    password.length < 7 ||
    password.length > 15 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^a-zA-Z0-9]/.test(password)
  ) {
    errors.push("Password must be 7–15 characters with upper, lower, digit, and special character.");
  }

  // Confirm passwords match
  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  // Check for existing email
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    errors.push("Email already registered.");
  }

  // If any errors, show them
  if (errors.length > 0) {
    const errorMessage = errors.join(' ');
    return res.redirect('/register?error=' + encodeURIComponent(errorMessage));
  }

  // All good → create user with id + favorites
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    firstName,
    email,
    password: hashedPassword,
    favorites: []
  };

  users.push(newUser);
  writeUsers(users);

  res.redirect('/login');
});

// ————— HANDLE LOGIN —————
router.post('/login', async (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.email === req.body.email);

  // בדיקת סיסמה וכו'
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.redirect('/login?error=' + encodeURIComponent('Invalid email or password!'));
  }

  // עדכון/הוספת שדה online
  const updatedUsers = users.map(u =>
    u.id === user.id
      ? { ...u, online: true }
      : (u.online === undefined ? { ...u, online: false } : u)
  );
  fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));

  // שמירת המשתמש בסשן
  req.session.user = { id: user.id, email: user.email, firstName: user.firstName };
  res.redirect('/search');
});

// ————— HANDLE LOGOUT —————
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/');
  });
});

module.exports = router;
