module.exports = function (pool) {
  const express = require('express');
  const router = express.Router();
  const csrf = require('csurf');
  const csrfProtection = csrf({ cookie: true });

  // Ensure login
  function requireLogin(req, res, next) {
    if (req.user) return next();
    res.status(401).json({ error: 'login_required' });
  }

  // GET /api/courses — public catalog
  router.get('/courses', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT id, title, topic, topic_slug, level, duration, description, icon, color, accent, badge_name, badge_icon, skills, featured FROM skillshop_courses ORDER BY featured DESC, title');
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/courses/:id — full course JSON
  router.get('/courses/:id', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT course_json FROM skillshop_courses WHERE id = $1', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'not_found' });
      res.json(rows[0].course_json);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/me — current user profile
  router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'login_required' });
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatar_color,
      provider: req.user.provider
    });
  });

  // GET /api/progress — user progress for all courses
  router.get('/progress', requireLogin, async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT course_id, data FROM skillshop_progress WHERE user_id = $1', [req.user.id]);
      const map = {};
      rows.forEach(r => { map[r.course_id] = r.data; });
      res.json(map);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/progress/:courseId — save/update progress
  router.post('/progress/:courseId', requireLogin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const data = req.body || {};
      await pool.query(
        `INSERT INTO skillshop_progress (user_id, course_id, data, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, course_id) DO UPDATE SET data = $3, updated_at = NOW()`,
        [req.user.id, courseId, JSON.stringify(data)]
      );
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // GET /api/certificates — user certificates
  router.get('/certificates', requireLogin, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT c.id, c.course_id, cr.title as course_title, c.learner_name, c.badge_name, c.skills, c.score, c.issued_at, c.credential_id
         FROM skillshop_certificates c
         JOIN skillshop_courses cr ON cr.id = c.course_id
         WHERE c.user_id = $1 ORDER BY c.issued_at DESC`,
        [req.user.id]
      );
      res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // POST /api/certificates — issue certificate (called after passing assessment)
  router.post('/certificates', requireLogin, async (req, res) => {
    try {
      const { courseId, learnerName, badgeName, skills, score, duration, topic, level } = req.body;
      const credentialId = 'SK-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const { rows } = await pool.query(
        `INSERT INTO skillshop_certificates (user_id, course_id, learner_name, badge_name, skills, score, duration, topic, level, credential_id, issued_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) RETURNING *`,
        [req.user.id, courseId, learnerName, badgeName, JSON.stringify(skills || []), score, duration, topic, level, credentialId]
      );
      res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
};
