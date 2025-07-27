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

<<<<<<< HEAD
  // Check for existing email
=======
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    errors.push("Email already registered.");
  }

<<<<<<< HEAD
  // If any errors, show them
=======
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
  if (errors.length > 0) {
    return res.status(400).send(`
      <h2>Registration Failed</h2>
      <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
      <a href="/register">Back</a>
    `);
  }

<<<<<<< HEAD
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
=======
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ firstName, email, password: hashedPassword });
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
  writeUsers(users);

  res.redirect('/login');
});

// ————— HANDLE LOGIN —————
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
<<<<<<< HEAD
    return res.status(401).send(`
      <h2>User Not Found</h2>
      <a href="/login">Try Again</a>
    `);
=======
    return res.status(401).send(`<h2>User Not Found</h2><a href="/login">Try Again</a>`);
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
<<<<<<< HEAD
    return res.status(401).send(`
      <h2>Incorrect Password</h2>
      <a href="/login">Try Again</a>
    `);
  }

  // Save user info to session
  req.session.user = {
    id: user.id,
=======
    return res.status(401).send(`<h2>Incorrect Password</h2><a href="/login">Try Again</a>`);
  }

  req.session.user = {
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
    email: user.email,
    firstName: user.firstName
  };

  res.redirect('/app');
});

<<<<<<< HEAD
// ————— HANDLE LOGOUT —————
=======
// התנתקות
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.redirect('/');
  });
});

module.exports = router;
