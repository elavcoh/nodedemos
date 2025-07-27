const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Body parsers & session
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'myDevSecret123!',
  resave: false,
  saveUninitialized: false
}));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use(authRoutes);

// Serve homepage or redirect
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/app');
  res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
});

// Protect /app
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
app.use('/app', requireLogin, express.static(path.join(__dirname, 'Client')));

// Serve static files
app.use(express.static(path.join(__dirname, 'Client')));

// Current user API
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json(req.session.user);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
