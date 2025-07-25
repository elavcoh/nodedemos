const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = 3000;

const authRoutes = require('./routes/auth');

app.use(session({
  secret: 'mySecret123',
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Client')));

app.use('/', authRoutes);

function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}
app.use('/app', requireLogin, express.static(path.join(__dirname, 'Client')));

app.get('/', (req, res) => {
  const infoPath = path.join(__dirname, 'Data', 'projectInfo.json');
  if (!fs.existsSync(infoPath)) return res.status(500).send("projectInfo.json not found");

  const info = JSON.parse(fs.readFileSync(infoPath));
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Project Homepage</title>
    </head>
    <body>
      <h1>Welcome to the Pokémon System</h1>
      <p>${info.description}</p>
      <h2>Developers:</h2>
      ${info.students.map(s => `<div>${s.name} – ${s.id}</div>`).join('')}
      <a href="/register">Register</a>
      <a href="/login">Login</a>
    </body>
    </html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
