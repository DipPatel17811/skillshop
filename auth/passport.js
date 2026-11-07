const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');

module.exports = function (pool) {
  // Serialize / deserialize user
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query('SELECT id, email, name, avatar_color, provider, google_id, created_at FROM skillshop_users WHERE id = $1', [id]);
      done(null, rows[0] || null);
    } catch (e) { done(e); }
  });

  // Local (email/password) strategy
  passport.use('local', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM skillshop_users WHERE email = $1 AND provider = $2', [email, 'local']);
      const user = rows[0];
      if (!user) return done(null, false, { message: 'No account with that email.' });
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (e) { return done(e); }
  }));

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) return done(null, false, { message: 'Google account has no email.' });

      let { rows } = await pool.query('SELECT * FROM skillshop_users WHERE provider = $2 AND google_id = $1', [profile.id, 'google']);
      let user = rows[0];

      if (!user) {
        // Google user exists by email? Link accounts.
        ({ rows } = await pool.query('SELECT * FROM skillshop_users WHERE email = $1 AND provider = $2', [email, 'local']));
        if (rows[0]) {
          await pool.query('UPDATE skillshop_users SET provider = $1, google_id = $2, avatar_color = COALESCE($3, avatar_color) WHERE id = $4', ['google', profile.id, profile.photos && profile.photos[0] ? profile.photos[0].value : null, rows[0].id]);
          user = rows[0];
        } else {
          const name = profile.displayName || email.split('@')[0];
          const { rows: inserted } = await pool.query(
            `INSERT INTO skillshop_users (email, name, password_hash, provider, google_id, avatar_color)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [email, name, null, 'google', profile.id, profile.photos && profile.photos[0] ? profile.photos[0].value : null]
          );
          user = inserted[0];
        }
      }
      return done(null, user);
    } catch (e) { return done(e); }
  }));
};
