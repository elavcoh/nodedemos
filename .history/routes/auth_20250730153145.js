const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'Data', 'users.json');

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
  res.json({ 
    email: req.session.user.email, 
    firstName: req.session.user.firstName, 
    id: req.session.user.id 
  });
});

// 4. Mount your APIs
app.use('/', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/favorites', favRoutes);

// 5. Middleware – require login
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  if (req.path === '/login' || req.path === '/register') return next();
  res.redirect('/login');
}

// 6. Arena sub-pages (e.g., /arena/vs-bot, /arena/random-vs-player)
app.get('/arena/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', 'arena', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// 7. Generic handler: allow routes without .html
app.get('/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// 8. Homepage
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
  }
  res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// ------------------- חדש: ניהול Online Users -------------------

// סימון משתמש כ־online
app.post('/api/online', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  users = users.map(u => {
    if (u.id === req.session.user.id) {
      return { ...u, online: true };
    }
    return u;
  });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// סימון משתמש כ־offline
app.post('/api/offline', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  users = users.map(u => {
    if (u.id === req.session.user.id) {
      return { ...u, online: false };
    }
    return u;
  });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// החזרת רשימת משתמשים מחוברים
app.get('/api/online-users', (req, res) => {
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  const onlineUsers = users.filter(u => u.online);
  res.json({ online: onlineUsers });
});

// 9. Static assets
app.use(express.static(path.join(__dirname, 'Client')));

// 10. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
