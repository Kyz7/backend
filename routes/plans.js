// routes/plans.js - Versi dengan debugging lengkap
const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../utils/authMiddleware');

// Create new plan dengan debugging lengkap
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== DEBUGGING SAVE PLAN ===');
    console.log('1. User ID:', req.user.id);
    console.log('2. Request body:', JSON.stringify(req.body, null, 2));
    
    // Validasi user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    console.log('✅ User found:', user.username);
    
    // Prepare data dengan validasi
    const planData = {
      userId: req.user.id,
      place: req.body.place,
      dateRange: req.body.dateRange,
      estimatedCost: req.body.estimatedCost || 0,
      travelers: req.body.travelers,
      flight: req.body.flight || null
    };
    
    console.log('3. Prepared plan data:', JSON.stringify(planData, null, 2));
    
    // Validasi data required
    if (!planData.place || !planData.dateRange) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Data tidak lengkap',
        missing: {
          place: !planData.place,
          dateRange: !planData.dateRange
        }
      });
    }
    
    // Create plan dengan try-catch khusus
    let plan;
    try {
      plan = await Plan.create(planData);
      console.log('✅ Plan created with ID:', plan.id);
    } catch (createError) {
      console.log('❌ Error creating plan:', createError);
      console.log('Error details:', {
        name: createError.name,
        message: createError.message,
        sql: createError.sql,
        parameters: createError.parameters
      });
      throw createError;
    }
    
    // Fetch created plan dengan relasi
    const createdPlan = await Plan.findByPk(plan.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });
    
    console.log('4. Final plan data:', {
      id: createdPlan.id,
      userId: createdPlan.userId,
      place: createdPlan.place,
      dateRange: createdPlan.dateRange,
      estimatedCost: createdPlan.estimatedCost,
      travelers: createdPlan.travelers,
      flight: createdPlan.flight
    });
    
    res.json({ 
      message: 'Plan berhasil disimpan',
      plan: createdPlan 
    });
    
  } catch (error) {
    console.error('=== SAVE PLAN ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Data tidak valid',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('Foreign key error:', error.fields);
      return res.status(400).json({ 
        message: 'User ID tidak valid',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Gagal menyimpan plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get plans dengan debugging
router.get('/', async (req, res) => {
  try {
    // Flexible auth inline
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('=== DEBUGGING GET PLANS ===');
    console.log('User ID:', decoded.id);
    
    const plans = await Plan.findAll({
      where: { userId: decoded.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('Found plans count:', plans.length);
    plans.forEach((plan, index) => {
      console.log(`Plan ${index + 1}:`, {
        id: plan.id,
        place: plan.place?.name,
        dateRange: plan.dateRange,
        createdAt: plan.createdAt
      });
    });
    
    res.json({ plans });
    
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Gagal mengambil plans' });
  }
});

module.exports = router;