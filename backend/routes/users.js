const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/analysts', requireRole('manager'), async (req, res) => {
  const analysts = await User.find({ role: 'analyst' });
  res.json(analysts);
});

module.exports = router;