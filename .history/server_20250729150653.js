const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 1. Body parsers & session
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'myDevSecret123!',
  resave: false,
  saveUninitialized: false
}));

// 2. Import routes
const authRoutes  = require('./routes/auth');      // /login, /register, /logout
const usersRouter = require('./routes/users');     // /api/users
const favRoutes   = require('./routes/favorites'); // /api/favorites

// 3. “Who am I?” endpoint
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ email: req.session.user.email, firstName: req.session.user.firstName });
});

// 4. Mount your APIs
app.use('/', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/favorites', favRoutes);

// 5. Middleware – require login (except login/register)
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  if (req.path === '/login' || req.path === '/register') return next();
  res.redirect('/login');
}

// 6. Explicit routes for Arena
app.get('/arena', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'arena.html'));
});

app.get('/arena/vs-bot', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'arena', 'vs-bot.html'));
});

app.get('/arena/random-vs-player', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'arena', 'random-vs-player.html'));
});

// 7. Battle page (also require login)
app.get('/battle', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'battle.html'));
});

// 8. Top-level pages without .html (e.g., /favorites → favorites.html)
app.get('/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// 9. Homepage (/) – show homepage.html or redirect
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
  }
  // אחרי לוגין → נטען index.html
  res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// 10. Static assets (css, js, images…)
app.use(express.static(path.join(__dirname, 'Client')));

// 11. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
