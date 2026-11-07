/* ==========================================================================
   Skillshop — local dev server (no database required)
   Serves the static site + mock auth so login/signup work locally.
   Use this until you connect a PostgreSQL database on Render.
   ========================================================================== */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (in-memory for local demo) - MUST come before routes that use req.session
const session = require('express-session');
app.use(session({
  secret: 'local-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' }
}));

// Mock in-memory user store for local demo only (resets on restart)
const localUsers = [];

// Mock auth: login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = localUsers.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_color: user.avatar_color,
    provider: 'local'
  };
  res.json({ ok: true, user: req.session.user });
});

// Mock auth: register
app.post('/auth/register', (req, res) => {
  const { name, email, password, avatarColor } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });
  if (localUsers.find(u => u.email === email)) return res.status(409).json({ error: 'email_exists' });
  const user = {
    id: 'local-' + Date.now(),
    name,
    email,
    password,
    avatar_color: avatarColor || '#D8F26B',
    provider: 'local',
    created_at: new Date().toISOString()
  };
  localUsers.push(user);
  req.session.user = { id: user.id, name: user.name, email: user.email, avatar_color: user.avatar_color, provider: 'local' };
  res.json({ ok: true, user: req.session.user });
});

// Mock auth: google (redirects to login page with note)
app.get('/auth/google', (req, res) => {
  res.redirect('/login.html?google=local_demo');
});

// Mock auth: logout
app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/index.html'));
});

// Mock API
app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login_required' });
  res.json(req.session.user);
});

app.get('/api/courses', (req, res) => {
  try {
    const catalog = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'courses', 'catalog.json'), 'utf8'));
    res.json(catalog.courses);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/courses/:id', (req, res) => {
  try {
    const catalog = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'courses', 'catalog.json'), 'utf8'));
    const entry = catalog.courses.find(c => c.id === req.params.id);
    if (!entry) return res.status(404).json({ error: 'not_found' });
    const p = path.join(PUBLIC, entry.path);
    const course = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.json(course);
  } catch (e) { res.status(404).json({ error: 'not_found' }); }
});

app.get('/api/progress', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login_required' });
  res.json(req.session.progress || {});
});

app.post('/api/progress/:courseId', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login_required' });
  req.session.progress = req.session.progress || {};
  req.session.progress[req.params.courseId] = req.body || {};
  res.json({ ok: true });
});

app.get('/api/certificates', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login_required' });
  res.json(req.session.certificates || []);
});

app.post('/api/certificates', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'login_required' });
  req.session.certificates = req.session.certificates || [];
  req.session.certificates.push({ id: 'SK-LOCAL-' + Date.now(), issued_at: new Date().toISOString(), ...req.body });
  res.json({ ok: true });
});

// Static files
app.use(express.static(PUBLIC));

// SEO static files
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(PUBLIC, 'sitemap.xml')));
app.get('/robots.txt', (req, res) => res.sendFile(path.join(PUBLIC, 'robots.txt')));

// Fallback to index.html
app.get('*', (req, res, next) => {
  res.sendFile(path.join(PUBLIC, req.path), err => {
    if (err && err.code === 'ENOENT') res.sendFile(path.join(PUBLIC, 'index.html'));
    else next(err);
  });
});

app.listen(PORT, () => {
  console.log(`Skillshop local dev server: http://localhost:${PORT}`);
  console.log('Note: This is a local demo without a database. Data resets when the server stops.');
});
