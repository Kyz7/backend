const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }
  
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Username harus 3-50 karakter' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username hanya boleh mengandung huruf, angka, dan underscore' });
  }
  
  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { username: username.trim() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await User.create({ 
      username: username.trim(), 
      password: hashedPassword 
    });
    
    console.log('User created successfully:', { id: user.id, username: user.username });
    
    res.status(201).json({ 
      message: 'Pendaftaran berhasil! Silakan login.',
      user: { id: user.id, username: user.username }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    // Handle unique constraint error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    
    res.status(500).json({ error: 'Gagal mendaftar. Silakan coba lagi.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }
  
  try {
    const user = await User.findOne({ where: { username: username.trim() } });
    
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    
    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      message: 'Login berhasil',
      token, 
      user: { id: user.id, username: user.username } 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal login. Silakan coba lagi.' });
  }
});

module.exports = router;