const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const homeRouter = require('./routes/home');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use('/app', express.static(path.join(__dirname, 'Client')));

app.use('/api', homeRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/users/:userId/favorites', favoritesRouter);

app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.session.user);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
