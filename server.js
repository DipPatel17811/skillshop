require('dotenv').config();

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const { Pool } = require('pg');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Passport strategies
require('./auth/passport')(pool);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false, // allow inline SVG / fonts from Google
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new pgSession({ pool, tableName: 'skillshop_sessions' }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// CSRF for state-changing forms
const csrfProtection = csrf({ cookie: true });

// Make user + CSRF token available to templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  next();
});

// API routes
app.use('/api', require('./routes/api')(pool));
app.use('/auth', require('./routes/auth')(pool));

// Static site (HTML, CSS, JS, assets, courses JSON)
app.use(express.static(path.join(__dirname)));
app.get('/sitemap.xml', (req, res) => {
  const base = process.env.BASE_URL || 'https://skillshop.example.com';
  const pages = [
    '', 'courses.html', 'dashboard.html', 'account.html', 'certificate.html'
  ];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  pages.forEach(p => {
    xml += `  <url><loc>${base}/${p}</loc><changefreq>weekly</changefreq></url>\n`;
  });
  // Add course pages
  pool.query("SELECT id FROM courses").then(r => {
    r.rows.forEach(c => {
      xml += `  <url><loc>${base}/course.html?course=${c.id}</loc><changefreq>monthly</changefreq></url>\n`;
    });
    xml += '</urlset>';
    res.type('application/xml').send(xml);
  }).catch(() => res.status(500).send(''));
});

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nSitemap: ${process.env.BASE_URL || 'https://skillshop.example.com'}/sitemap.xml\n`
  );
});

// Fallback: serve index.html for unknown routes (so direct links work)
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, req.path), err => {
    if (err && err.code === 'ENOENT') res.sendFile(path.join(__dirname, 'index.html'));
    else next(err);
  });
});

app.listen(PORT, () => {
  console.log(`Skillshop listening on http://localhost:${PORT}`);
});

module.exports = { app, pool };
