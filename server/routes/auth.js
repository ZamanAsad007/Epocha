const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create user row in our DB
      const user = await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email,
          displayName: displayName || email.split('@')[0],
        },
      });
      res.status(201).json(user);
    } else {
      res.status(400).json({ message: 'User registration failed' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      details: error.message 
    });
  }
});

// POST /api/auth/login - Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout - Logout
router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
