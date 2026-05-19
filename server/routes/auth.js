const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const buildProfilePayload = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  const [bookmarks, quizScores, recentQuizzes] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            lat: true,
            lng: true,
            year: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quizScore.findMany({
      where: { userId },
      select: { placeId: true, score: true, total: true },
    }),
    prisma.quizScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    }),
  ]);

  const exploredPlaces = new Set([
    ...bookmarks.map((bookmark) => bookmark.placeId),
    ...quizScores.map((quiz) => quiz.placeId),
  ]);

  const aggregate = quizScores.reduce(
    (accumulator, quiz) => {
      accumulator.score += quiz.score;
      accumulator.total += quiz.total;
      return accumulator;
    },
    { score: 0, total: 0 }
  );

  const averageScore = aggregate.total > 0
    ? Math.round((aggregate.score / aggregate.total) * 100)
    : 0;

  return {
    user,
    stats: {
      placesExplored: exploredPlaces.size,
      quizzesTaken: quizScores.length,
      averageScore,
      bookmarksSaved: bookmarks.length,
    },
    bookmarks,
    recentQuizzes,
  };
};

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
    const profile = await buildProfilePayload(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/me - Update user profile
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { displayName, avatarUrl } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(typeof displayName === 'string' ? { displayName: displayName.trim() } : {}),
        ...(typeof avatarUrl === 'string' ? { avatarUrl } : {}),
      },
    });

    const profile = await buildProfilePayload(req.user.id);
    res.json(profile);
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
