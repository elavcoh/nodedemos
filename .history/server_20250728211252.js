const express = require('express');
const path = require('path');
const fs = require('fs');
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
app.use('/api/favorites', favRoutes); // ✅ תיקון

// 5. Serve the homepage at `/`
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/app');
  }
  res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
});

// 6. Protect `/app` and serve Client files
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
app.use('/app', requireLogin, express.static(path.join(__dirname, 'Client')));

// 7. Serve static assets (CSS, JS, images…)
app.use(express.static(path.join(__dirname, 'Client')));

// ✅ 8. Dynamic routing for all HTML files without .html
const clientDir = path.join(__dirname, 'Client');
fs.readdirSync(clientDir).forEach(file => {
  if (file.endsWith('.html')) {
    const route = '/' + file.replace('.html', '');
    app.get(route, (req, res) => {
      res.sendFile(path.join(clientDir, file));
    });
  }
});

// 9. Start the server
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
