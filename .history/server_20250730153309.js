const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'Data', 'users.json');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'myDevSecret123!',
  resave: false,
  saveUninitialized: false
}));

// Routes
const authRoutes  = require('./routes/auth');
const usersRouter = require('./routes/users');
const favRoutes   = require('./routes/favorites');

app.use('/', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/favorites', favRoutes);

// מי אני
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json(req.session.user);
});

// דרישת התחברות
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  if (req.path === '/login' || req.path === '/register') return next();
  res.redirect('/login');
}

// דפי Arena (כמו random-vs-player)
app.get('/arena/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', 'arena', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else next();
});

// דפים כלליים
app.get('/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else next();
});

// Homepage
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
  }
  res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// API לניהול Online Users
app.post('/api/online', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  users = users.map(u => u.id === req.session.user.id ? { ...u, online: true } : u);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.get('/api/online-users', (req, res) => {
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  res.json({ online: users.filter(u => u.online) });
});

// API קרב מול שחקן אחר
app.post('/api/arena/battle', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });

  const { opponentId } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const me = users.find(u => u.id === req.session.user.id);
  const opp = users.find(u => u.id === opponentId);

  if (!opp) return res.status(400).json({ error: 'Opponent not found' });
  if (!me.favorites.length || !opp.favorites.length) {
    return res.status(400).json({ error: 'Both players must have favorites' });
  }

  const mePokemon = me.favorites[Math.floor(Math.random() * me.favorites.length)];
  const oppPokemon = opp.favorites[Math.floor(Math.random() * opp.favorites.length)];

  function score(p) {
    return p.stats.hp*0.3 + p.stats.attack*0.4 + p.stats.defense*0.2 + p.stats.speed*0.1;
  }

  const meScore  = score(mePokemon);
  const oppScore = score(oppPokemon);

  let winner;
  if (meScore > oppScore) winner = me.id;
  else if (oppScore > meScore) winner = opp.id;
  else winner = Math.random() < 0.5 ? me.id : opp.id;  // הכרעה רנדומלית במקרה תיקו

  res.json({
    me: { user: me, pokemon: mePokemon, score: meScore },
    opponent: { user: opp, pokemon: oppPokemon, score: oppScore },
    winner
  });
});

// Static files
app.use(express.static(path.join(__dirname, 'Client')));

// Start
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
