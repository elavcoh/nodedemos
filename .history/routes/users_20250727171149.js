const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function loadUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  return JSON.parse(fs.readFileSync(USERS_PATH));
}

router.get('/', (req, res) => {
  const users = loadUsers().map(u => ({ email: u.email, firstName: u.firstName }));
  res.json(users);
});

module.exports = router;
