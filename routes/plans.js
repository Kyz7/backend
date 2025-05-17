const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../utils/authMiddleware');

router.post('/', auth, async (req, res) => {
  try {
    const plan = await Plan.create({ ...req.body, user: req.user.id });
    res.json({ message: 'Plan saved', plan });
  } catch {
    res.status(500).json({ message: 'Gagal menyimpan plan' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const plans = await Plan.find({ user: req.user.id });
    res.json({ plans });
  } catch {
    res.status(500).json({ message: 'Gagal mengambil plan' });
  }
});

module.exports = router;