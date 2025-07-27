const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

const usersFilePath = path.join(__dirname, "users.json");
function readUsers() {
  if (!fs.existsSync(usersFilePath)) return {};
  return JSON.parse(fs.readFileSync(usersFilePath));
}
function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// הרשמה
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  if (users[username]) return res.status(400).json({ message: "User exists" });
  users[username] = { password, favorites: [] };
  writeUsers(users);
  res.json({ message: "Registered" });
});

// התחברות
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  if (!users[username] || users[username].password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  req.session.username = username;
  res.json({ message: "Logged in" });
});

// בדיקת התחברות
app.get("/api/current-user", (req, res) => {
  if (!req.session.username) return res.status(401).json({ message: "Not logged in" });
  res.json({ username: req.session.username });
});

// התנתקות
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Logged out" }));
});

// קבלת מועדפים
app.get("/api/favorites", (req, res) => {
  const users = readUsers();
  const user = users[req.session.username];
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  res.json(user.favorites || []);
});

// הוספה
app.post("/api/favorites", (req, res) => {
  const users = readUsers();
  const user = users[req.session.username];
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const favorite = req.body;
  if (!user.favorites.some(f => f.id === favorite.id)) {
    user.favorites.push(favorite);
    writeUsers(users);
  }
  res.json({ message: "Added" });
});

// הסרה
app.delete("/api/favorites/:id", (req, res) => {
  const users = readUsers();
  const user = users[req.session.username];
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  user.favorites = user.favorites.filter(f => f.id !== req.params.id);
  writeUsers(users);
  res.json({ message: "Removed" });
});

app.use(express.static(path.join(__dirname, "Client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Client/index.html"));
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));
