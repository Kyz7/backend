// File: routes/plans.js - Updated for MySQL with Sequelize
const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../utils/authMiddleware');
const jwt = require('jsonwebtoken');

// Alternative auth middleware that checks query params too
const flexibleAuth = (req, res, next) => {
  // First try normal header auth
  let token = req.headers.authorization?.split(' ')[1];
  
  // If no header token, try query parameter (fallback for 431 errors)
  if (!token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

// Create new plan
router.get('/', flexibleAuth, async (req, res) => {
  try {
    console.log('📍 Getting plans for user:', req.user.id);
    
    const plans = await Plan.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']],
      raw: false // Pastikan tidak menggunakan raw query
    });
    
    console.log('📍 Found plans:', plans.length);
    
    // Debug setiap plan
    plans.forEach((plan, index) => {
      console.log(`Plan ${index + 1}:`);
      console.log('- ID:', plan.id);
      console.log('- Raw dateRange dari DB:', plan.getDataValue('dateRange'));
      console.log('- Processed dateRange:', plan.dateRange);
      console.log('- Type of dateRange:', typeof plan.dateRange);
      console.log('---');
    });
    
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Gagal mengambil plan', details: error.message });
  }
});

// Create new plan - tambahkan debug
router.post('/', auth, async (req, res) => {
  try {
    console.log('📍 Creating plan with data:', req.body);
    console.log('📍 DateRange from request:', req.body.dateRange);
    console.log('📍 Type of dateRange:', typeof req.body.dateRange);
    
    const plan = await Plan.create({ 
      ...req.body, 
      userId: req.user.id
    });
    
    console.log('📍 Plan created with ID:', plan.id);
    console.log('📍 Saved dateRange:', plan.dateRange);
    
    // Fetch the created plan with user info
    const createdPlan = await Plan.findByPk(plan.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });
    
    console.log('📍 Fetched plan dateRange:', createdPlan.dateRange);
    
    res.json({ message: 'Plan saved', plan: createdPlan });
  } catch (error) {
    console.error('Save plan error:', error);
    res.status(500).json({ message: 'Gagal menyimpan plan', details: error.message });
  }
});

// Get single plan by ID
router.get('/:id', flexibleAuth, async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana perjalanan tidak ditemukan' });
    }
    
    // Check if user owns this plan
    if (plan.userId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak diizinkan mengakses rencana ini' });
    }
    
    res.json({ plan });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Gagal mengambil plan', details: error.message });
  }
});

// Update plan
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana perjalanan tidak ditemukan' });
    }
    
    // Check ownership
    if (plan.userId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak diizinkan mengubah rencana ini' });
    }
    
    // Update the plan
    await plan.update(req.body);
    
    // Fetch updated plan with user info
    const updatedPlan = await Plan.findByPk(plan.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });
    
    res.json({ message: 'Rencana perjalanan berhasil diupdate', plan: updatedPlan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Gagal mengupdate rencana perjalanan', details: error.message });
  }
});

// Delete plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findByPk(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Rencana perjalanan tidak ditemukan' });
    }
    
    // Check ownership - Changed from toString() to direct comparison
    if (plan.userId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak diizinkan menghapus rencana ini' });
    }
    
    // Delete the plan
    await plan.destroy(); // Changed from findByIdAndDelete to destroy()
    
    res.json({ message: 'Rencana perjalanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Gagal menghapus rencana perjalanan', details: error.message });
  }
});

module.exports = router;