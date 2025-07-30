const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs'); // ✅ חובה בשביל בדיקת קיום קובץ

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

// 5. Serve homepage at `/`
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/app');
  }
  res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
});

// 6. Protect `/app` and serve static content
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
app.use('/app', requireLogin, express.static(path.join(__dirname, 'Client')));

// 7. Serve other static files (css, js, images, etc.)
app.use(express.static(path.join(__dirname, 'Client')));

// 8. Dynamic routing: allow `/favorites` to serve `favorites` and so on
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'Client', `${page}.html`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next(); // אם לא נמצא – תמשיך לראוטים הבאים
});

// 9. Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
