// ————— HANDLE LOGIN —————
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).send(`
      <h2>User Not Found</h2>
      <a href="/login">Try Again</a>
    `);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).send(`
      <h2>Incorrect Password</h2>
      <a href="/login">Try Again</a>
    `);
  }

  // Save user info to session
  req.session.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName
  };

  // 🔥 שינוי כאן
  res.redirect('/');
});
