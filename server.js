// File: server.js (project root)

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const session = require('express-session');

const app  = express();
const PORT = 3000;

// 1) Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2) Sessions
app.use(session({
  secret: 'myDevSecret123!',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 3) Import your API routers
const authRoutes  = require('./routes/auth');      // /login, /register, /logout
const usersRouter = require('./routes/users');     // /api/users
const favRoutes   = require('./routes/favorites'); // /api/favorites

// 4) “Who am I?” endpoint
app.get('/api/me', (req, res) => {
  console.log('API /me check:', {
    sessionId: req.sessionID,
    hasUser: !!req.session.user,
    user: req.session.user
  });
  
  if (!req.session.user) 
    return res.status(401).json({ error: 'Not logged in' });
  res.json({
    email: req.session.user.email,
    firstName: req.session.user.firstName
  });
});

// הצגת כל המשתמשים שמחוברים כרגע (לא כולל המשתמש הנוכחי)
app.get('/api/online-users', (req, res) => {
  console.log('=== Online Users API Debug ===');
  console.log('Session user:', req.session.user);
  
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  
  const fs = require('fs');
  const path = require('path');
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read users file' });
  }
  
  console.log('All users:', users.map(u => ({ name: u.firstName, email: u.email, online: u.online })));
  
  // מסנן רק משתמשים מחוברים, לא כולל המשתמש הנוכחי (לפי email)
  const onlineUsers = users.filter(u => 
    u.online && u.email !== req.session.user.email
  );
  
  console.log('Online users (filtered):', onlineUsers.map(u => ({ name: u.firstName, email: u.email })));
  
  res.json({ online: onlineUsers });
});

// הוספת שדה online לכל המשתמשים (זמני)
app.get('/fix-online', (req, res) => {
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  
  // הוספת שדה online לכל משתמש
  users = users.map(u => ({
    ...u,
    online: u.online !== undefined ? u.online : false
  }));
  
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: 'Online field added to all users', users: users.map(u => ({ name: u.firstName, email: u.email, online: u.online })) });
});

// הוספת משתמש לבדיקה (זמני)
app.get('/add-test-user', (req, res) => {
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  
  // מוסיף משתמש לבדיקה
  const testUser = {
    id: 'test-123',
    firstName: 'TestUser',
    email: 'test@test.com',
    password: 'hashedpassword',
    favorites: [],
    online: true
  };
  
  users.push(testUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  res.json({ message: 'Test user added', user: testUser });
});

// 5) Mount API routes
app.use('/',              authRoutes);
app.use('/api/users',     usersRouter);
app.use('/api/favorites', favRoutes);

// API קרב מול שחקן אחר - עם כל הפוקימונים
app.post('/api/arena/battle', (req, res) => {
  console.log('=== Battle API Debug ===');
  console.log('Session user:', req.session.user);
  console.log('Request body:', req.body);
  
  if (!req.session.user) {
    console.log('No session user found');
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { opponentId } = req.body;
  console.log('Opponent ID:', opponentId);
  
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  
  // מחפש את המשתמש הנוכחי לפי email
  const me = users.find(u => u.email === req.session.user.email);
  const opp = users.find(u => u.id === opponentId);
  
  console.log('Current user found:', !!me);
  console.log('Current user email:', req.session.user.email);
  console.log('Current user favorites:', me ? me.favorites.length : 'N/A');
  console.log('Opponent found:', !!opp);
  console.log('Opponent favorites:', opp ? opp.favorites.length : 'N/A');

  if (!me) {
    console.log('Current user not found');
    return res.status(400).json({ error: 'Current user not found' });
  }
  if (!opp) {
    console.log('Opponent not found');
    return res.status(400).json({ error: 'Opponent not found' });
  }
  if (!me.favorites.length || !opp.favorites.length) {
    console.log('Missing favorites - me:', me.favorites.length, 'opp:', opp.favorites.length);
    return res.status(400).json({ error: 'Both players must have favorites' });
  }

  // בחירת פוקימון רנדומלי לכל שחקן
  const mePokemon = me.favorites[Math.floor(Math.random() * me.favorites.length)];
  const oppPokemon = opp.favorites[Math.floor(Math.random() * opp.favorites.length)];

  console.log('Selected Pokémon - me:', mePokemon.name, 'opp:', oppPokemon.name);

  // חישוב ניקוד לפי הנוסחה: HP×0.3 + Attack×0.4 + Defense×0.2 + Speed×0.1
  function score(p) {
    const baseScore = p.stats.hp * 0.3 + p.stats.attack * 0.4 + p.stats.defense * 0.2 + p.stats.speed * 0.1;
    const randomBonus = Math.random() * 5; // רכיב רנדומלי קטן
    return baseScore + randomBonus;
  }

  const meScore = score(mePokemon);
  const oppScore = score(oppPokemon);

  console.log('Scores - me:', meScore, 'opp:', oppScore);

  // קביעת המנצח
  let winner;
  if (meScore > oppScore) winner = me.id;
  else if (oppScore > meScore) winner = opp.id;
  else winner = Math.random() < 0.5 ? me.id : opp.id;

  const battleResult = {
    me: {
      id: me.id,
      name: me.firstName,
      pokemon: mePokemon,
      score: Math.round(meScore * 100) / 100
    },
    opponent: {
      id: opp.id,
      name: opp.firstName,
      pokemon: oppPokemon,
      score: Math.round(oppScore * 100) / 100
    },
    meAllPokemons: me.favorites, // כל הפוקימונים של השחקן הנוכחי
    oppAllPokemons: opp.favorites, // כל הפוקימונים של היריב
    winner: winner,
    winnerName: winner === me.id ? me.firstName : opp.firstName
  };

  console.log('Battle result:', battleResult);
  res.json(battleResult);
});

// עדכון login – הוספת/עדכון שדה online
app.post('/login', async (req, res) => {
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.email === req.body.email);

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).render('login', { error: 'Invalid credentials' });
  }

  // עדכון online + זמן התחברות
  const updatedUsers = users.map(u =>
    u.id === user.id
      ? { ...u, online: true, lastSeen: Date.now() }
      : (u.online === undefined ? { ...u, online: false } : u)
  );
  fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));

  req.session.user = { id: user.id, email: user.email, firstName: user.firstName };
  res.redirect('/arena');
});

// עדכון logout – עדכון online ל־false
app.post('/logout', (req, res) => {
  if (req.session.user) {
    const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
    let users = JSON.parse(fs.readFileSync(USERS_FILE));
    users = users.map(u => 
      u.id === req.session.user.id ? { ...u, online: false } : u
    );
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  }
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// עדכון online status
app.post('/api/online', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  users = users.map(u => 
    u.id === req.session.user.id 
      ? { ...u, online: true, lastSeen: Date.now() } 
      : u
  );
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// ניקוי ידני של המשתמש המנותק
app.get('/cleanup', (req, res) => {
  const USERS_FILE = path.join(__dirname, 'Data', 'users.json');
  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  users = users.map(u => ({ ...u, online: false }));
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: 'All users set to offline' });
});

// 6) Login‐required guard
function requireLogin(req, res, next) {
  console.log('requireLogin check:', {
    path: req.path,
    hasUser: !!req.session.user,
    sessionId: req.sessionID,
    user: req.session.user
  });
  
  if (req.session.user)                           return next();
  if (req.path === '/login' || req.path === '/register') return next();
  return res.redirect('/login');
}

// 7) Serve any page under /arena (no “.html” in URL)
app.get('/arena/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', 'arena', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// 8) Serve root-level pages (no “.html” in URL)
app.get('/:page', requireLogin, (req, res, next) => {
  const filePath = path.join(__dirname, 'Client', `${req.params.page}.html`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// 9) Homepage (/)
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
  }
  res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// 10) Handle battle page (no parameters in URL)
app.get('/arena/battle', requireLogin, (req, res) => {
  const filePath = path.join(__dirname, 'Client', 'arena', 'battle.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.status(404).send('Battle page not found');
});

// 11) Static assets (CSS, JS, images…) - but exclude .html files from static serving
app.use(express.static(path.join(__dirname, 'Client'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// נתיב לקבצי צליל
app.use('/sounds', express.static(path.join(__dirname, 'Client', 'sounds')));

// 11) Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
