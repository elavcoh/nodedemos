const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Static files
app.use(express.static(path.join(__dirname, 'Client'))); // או 'public'

// Routers
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

app.use('/api', authRoutes);
app.use('/api', favoritesRoutes);

// ✅ נתיב ברירת מחדל – דף הבית
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Client', 'index.html')); // או שם הדף הראשי שלך
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
