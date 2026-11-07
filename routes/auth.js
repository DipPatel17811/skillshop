const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');

// Setup strategies (imported as function that takes pool)
const setupStrategies = require('../auth/passport');

module.exports = function (pool) {
  setupStrategies(pool);

  router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/dashboard.html');
    res.sendFile(path.join(__dirname, '..', 'login.html'));
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard.html',
    failureRedirect: '/auth/login?error=1'
  }));

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/dashboard.html',
    failureRedirect: '/auth/login?error=1'
  }));

  router.post('/register', async (req, res) => {
    const { name, email, password, avatarColor } = req.body;
    if (!name || !email || !password) {
      return res.redirect('/account.html?error=missing');
    }
    try {
      const { rows } = await pool.query('SELECT id FROM skillshop_users WHERE email = $1 AND provider = $2', [email, 'local']);
      if (rows.length) return res.redirect('/account.html?error=exists');
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `INSERT INTO skillshop_users (email, name, password_hash, provider, avatar_color) VALUES ($1,$2,$3,$4,$5)`,
        [email, name, hash, 'local', avatarColor || '#D8F26B']
      );
      res.redirect('/auth/login?registered=1');
    } catch (e) {
      console.error(e);
      res.redirect('/account.html?error=server');
    }
  });

  router.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/index.html'));
  });

  return router;
};
