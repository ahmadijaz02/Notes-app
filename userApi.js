const express = require('express');
const router = express.Router();

router.get('/api/user', (req, res) => {
  if (!req.session.user) return res.status(401).json({});
  res.json({ username: req.session.user.username, role: req.session.user.role });
});

module.exports = router;
