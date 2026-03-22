/**
 * Dev/local auth stubs — the FirstPath Node server had no /api routes, so the
 * React app (REACT_APP_BACKEND_URL=http://localhost:8000) hit 404 on /api/auth/*.
 * Replace with a real auth service when you wire production users.
 */
const express = require('express');
const router = express.Router();

function demoUserFromBody(body) {
  const email = (body.email || 'demo@firstpath.com').trim();
  const name = (body.name || email.split('@')[0] || 'Traveler').trim();
  return { name, email };
}

router.post('/auth/register', (req, res) => {
  const user = demoUserFromBody(req.body);
  res.json({
    token: `fp-local-${Buffer.from(user.email).toString('base64url').slice(0, 24)}`,
    user,
  });
});

router.post('/auth/login', (req, res) => {
  const user = demoUserFromBody(req.body);
  res.json({
    token: 'fp-local-token',
    user,
  });
});

router.get('/auth/session', (req, res) => {
  res.json({
    token: 'fp-local-token',
    user: { name: 'Traveler', email: 'demo@firstpath.com' },
  });
});

router.get('/auth/me', (req, res) => {
  res.json({
    user: { name: 'Traveler', email: 'demo@firstpath.com' },
  });
});

router.post('/auth/logout', (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
