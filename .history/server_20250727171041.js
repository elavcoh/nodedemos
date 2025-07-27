// server.js
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();

// Middlewares
app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files
app.use("/app", express.static(path.join(__dirname, "Client")));

// Routes
const favoritesRouter = require("./routes/favorites");
app.use("/users", favoritesRouter);

// Login route
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });

  req.session.user = username;
  res.json({ message: "Login successful", username });
});

// Route to get the logged-in user
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
