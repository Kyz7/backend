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

router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana perjalanan tidak ditemukan' });
    }
    
    if (plan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak diizinkan menghapus rencana ini' });
    }
    
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rencana perjalanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Gagal menghapus rencana perjalanan' });
  }
});

module.exports = router;