// server.js

const express = require('express');
const path    = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

<<<<<<< HEAD
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
app.use('/api', favRoutes);

// 5. Serve the new styled homepage at `/`
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/app');
  }
  res.sendFile(path.join(__dirname, 'Client', 'homepage.html'));
});

// 6. Protect `/app` and serve your React/SPA files
function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}
app.use('/app', requireLogin, express.static(path.join(__dirname, 'Client')));

// 7. All other static files (CSS, JS, images…)
app.use(express.static(path.join(__dirname, 'Client')));

// 8. Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
=======
// === פרסרים ו-SESSION ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'myDevSecret123!',
    resave: false,
    saveUninitialized: false
}));

// === רואטרים ===
const usersRouter = require('./routes/users');
const homeRoute = require('./routes/home');
const authRoutes = require('./routes/auth');

// === הגנה על /app ===
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');  // תיקון חשוב
    }
}

// === רואטרים - חשבו קודם ל-auth ואז להגנה ===
app.use('/', authRoutes);             // /login, /register
app.use('/api/users', usersRouter);   // API
app.use('/', homeRoute);              // /home וכו'

// === קבצים מוגנים ===
app.use('/app', requireLogin, express.static(path.join(__dirname, 'Client')));

// === דף בית דינאמי ===
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/app');
    }

    const infoPath = path.join(__dirname, 'Data', 'projectInfo.json');
    if (!fs.existsSync(infoPath)) {
        return res.status(500).send("projectInfo.json not found");
    }

    const info = JSON.parse(fs.readFileSync(infoPath));
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Project Homepage</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 40px; background-color: #f5f5f5; }
                .student { font-weight: bold; margin: 5px; }
                .link { display: inline-block; margin: 10px; padding: 10px 20px; background: #ffcb05; border-radius: 8px; color: #2a75bb; font-weight: bold; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>Welcome to the Pokémon System</h1>
            <p>${info.description}</p>
            <h2>Developers:</h2>
            ${info.students.map(s => `<div class="student">${s.name} – ${s.id}</div>`).join('')}
            <a class="link" href="/register">Register</a>
            <a class="link" href="/login">Login</a>
        </body>
        </html>
    `;
    res.send(html);
});

// === דפים נוספים ===
app.get('/home', (req, res) => res.redirect('/'));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'Client', 'aboutus.html')));
app.get('/aboutus', (req, res) => res.redirect('/about'));
app.get('/about_us', (req, res) => res.redirect('/about'));

app.get('/page/:name', (req, res) => {
    const fileName = `page_${req.params.name}.html`;
    const filePath = path.join(__dirname, 'Client', fileName);
    res.sendFile(filePath, (err) => {
        if (err) res.status(404).send('Page not found');
    });
});

// === הפעלת השרת ===
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
>>>>>>> 10f93522875441141ef66ca069a72cff0e18fca8
});
