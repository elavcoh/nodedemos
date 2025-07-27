const express = require('express');
const router = express.Router({ mergeParams: true });
const fs = require('fs');
const path = require('path');

const favoritesPath = path.join(__dirname, '../Data/favorites.json');

router.get('/', (req, res) => {
  const { userId } = req.params;
  const favoritesData = JSON.parse(fs.readFileSync(favoritesPath, 'utf-8'));
  const userFavorites = favoritesData[userId] || [];
  res.json(userFavorites);
});

router.post('/', (req, res) => {
  const { userId } = req.params;
  const newFavorite = req.body;
  const favoritesData = JSON.parse(fs.readFileSync(favoritesPath, 'utf-8'));

  if (!favoritesData[userId]) favoritesData[userId] = [];
  favoritesData[userId].push(newFavorite);

  fs.writeFileSync(favoritesPath, JSON.stringify(favoritesData, null, 2));
  res.status(201).json(newFavorite);
});

router.delete('/:pokemonId', (req, res) => {
  const { userId, pokemonId } = req.params;
  const favoritesData = JSON.parse(fs.readFileSync(favoritesPath, 'utf-8'));

  if (!favoritesData[userId]) {
    return res.status(404).json({ error: 'No favorites found for user' });
  }

  favoritesData[userId] = favoritesData[userId].filter(p => p.id !== pokemonId);
  fs.writeFileSync(favoritesPath, JSON.stringify(favoritesData, null, 2));

  res.json({ message: 'Favorite deleted' });
});

module.exports = router;
