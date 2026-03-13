const express = require('express');
const { authenticate, authorizeTeacher } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get user by email (teachers only)
router.get('/by-email', authenticate, authorizeTeacher, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only return student users for enrollment
    if (user.role !== 'student') {
      return res.status(400).json({ error: 'Email belongs to a teacher, not a student' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Find user error:', error);
    res.status(500).json({ error: 'Failed to find user' });
  }
});

// Alternative: Get user by email using query parameter
router.get('/', authenticate, authorizeTeacher, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only return student users for enrollment
    if (user.role !== 'student') {
      return res.status(400).json({ error: 'Email belongs to a teacher, not a student' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Find user error:', error);
    res.status(500).json({ error: 'Failed to find user' });
  }
});

module.exports = router;