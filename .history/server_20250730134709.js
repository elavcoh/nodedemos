const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

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
  res.json({ email: req.session.user.email, firstName: req.session.user.firstName, id: req.session.user.id });
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

// החזרת רשימת משתמשים מחוברים
app.get('/api/online-users', (req, res) => {
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  const onlineUsers = users.filter(u => u.online);
  res.json({ online: onlineUsers });
});

// ------------------- חדש: קרב רנדומלי מול שחקן -------------------
app.post('/arena/battle', (req, res) => {
  const { opponentId } = req.body;
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  const me = users.find(u => u.id === req.session.user.id);
  const opponent = users.find(u => u.id === opponentId);

  if (!me || !opponent) return res.status(404).json({ error: 'User not found' });
  if (!me.favorites.length || !opponent.favorites.length) {
    return res.status(400).json({ error: 'One of the players has no favorites' });
  }

  // בחירת פוקימון רנדומלי מכל אחד
  const myPokemon = me.favorites[Math.floor(Math.random() * me.favorites.length)];
  const oppPokemon = opponent.favorites[Math.floor(Math.random() * opponent.favorites.length)];

  // חישוב ניקוד
  function calcScore(p) {
    return (
      (p.stats.hp * 0.3) +
      (p.stats.attack * 0.4) +
      (p.stats.defense * 0.2) +
      (p.stats.speed * 0.1) +
      (p.stats["special-defense"] ? p.stats["special-defense"] * 0.1 : 0)
    );
  }

  const myScore = calcScore(myPokemon);
  const oppScore = calcScore(oppPokemon);

  let winner = null;
  if (myScore > oppScore) winner = me.id;
  else if (oppScore > myScore) winner = opponent.id;
  else winner = Math.random() < 0.5 ? me.id : opponent.id;

  res.json({
    me: { user: { id: me.id, name: me.firstName }, pokemon: myPokemon, score: myScore },
    opponent: { user: { id: opponent.id, name: opponent.firstName }, pokemon: oppPokemon, score: oppScore },
    winner
  });
});

// 9. Static assets
app.use(express.static(path.join(__dirname, 'Client')));

// 10. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
