const express = require('express');
const path = require('path');
const session = require('express-session');

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

// 5. Protect middleware
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// 6. Homepage
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/homepage');
  }
  res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
});

// 7. Static serving for logged-in pages
app.use(requireLogin, express.static(path.join(__dirname, 'Client')));

// 8. Clean routes without .html
app.get('/:page', requireLogin, (req, res, next) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, 'Client', `${page}.html`), (err) => {
    if (err) next();
  });
});

// 9. Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
