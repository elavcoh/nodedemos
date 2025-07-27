const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../Data/users.json');

router.post('/register', (req, res) => {
  const { username, password, firstName } = req.body;
  let users = JSON.parse(fs.readFileSync(usersPath));

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    firstName
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ message: 'User registered successfully' });
});

module.exports = router;
