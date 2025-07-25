const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '..', 'Data', 'users.json');

// Helper to read users
function readUsers() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
}

// Helper to write users
function writeUsers(users) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// 📥 Create user (used by HTML form)
router.post('/', (req, res) => {
    const newUser = {
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email
    };

    const users = readUsers();
    users.push(newUser);
    writeUsers(users);

    res.send('User saved!');
});

// 📄 Get all users
router.get('/', (req, res) => {
    const users = readUsers();
    res.json(users);
});

// 📄 Get user by ID
router.get('/:id', (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).send('User not found');
    res.json(user);
});

// ✏️ Update user by ID
router.put('/:id', (req, res) => {
    const users = readUsers();
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).send('User not found');

    users[index] = { ...users[index], ...req.body };
    writeUsers(users);
    res.send('User updated');
});

// ❌ Delete user by ID
router.delete('/:id', (req, res) => {
    let users = readUsers();
    const initialLength = users.length;
    users = users.filter(u => u.id !== req.params.id);

    if (users.length === initialLength) {
        return res.status(404).send('User not found');
    }

    writeUsers(users);
    res.send('User deleted');
});

module.exports = router;
