const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const supabase = require('../services/supabase');
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/authMiddleware');
const { sendVerificationEmail } = require('../services/brevo');

const getEnv = (...keys) => keys.map((key) => process.env[key]).find(Boolean);

const getServerBaseUrl = (req) => {
  return getEnv('SERVER_URL', 'API_URL') || `${req.protocol}://${req.get('host')}`;
};

const getClientOrigin = (req) => {
  return req.headers.origin || getEnv('CLIENT_URL', 'FRONTEND_URL') || 'http://localhost:5173';
};

const resolveSafeRedirect = (req, redirect) => {
  const fallback = `${getClientOrigin(req)}/auth?verified=1`;

  if (typeof redirect !== 'string' || !redirect) {
    return fallback;
  }

  try {
    const parsedRedirect = new URL(redirect);
    if (parsedRedirect.origin === getClientOrigin(req)) {
      return parsedRedirect.toString();
    }
  } catch (_error) {
    return fallback;
  }

  return fallback;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createVerificationToken = async (userId) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.emailVerificationToken.upsert({
    where: { userId },
    update: {
      tokenHash,
      expiresAt,
    },
    create: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
};

const sendVerificationForUser = async (req, user) => {
  const token = await createVerificationToken(user.id);
  const verificationUrl = new URL('/api/auth/verify-email', getServerBaseUrl(req));
  verificationUrl.searchParams.set('token', token);
  verificationUrl.searchParams.set('redirect', `${getClientOrigin(req)}/auth?verified=1`);

  await sendVerificationEmail({
    to: user.email,
    displayName: user.displayName,
    verificationUrl: verificationUrl.toString(),
  });
};

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
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          id: data.user.id,
          displayName: displayName || email.split('@')[0],
          emailVerified: false,
        },
        create: {
          id: data.user.id,
          email: data.user.email,
          displayName: displayName || email.split('@')[0],
          emailVerified: false,
        },
      });

      await sendVerificationForUser(req, user);

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

    const localUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (localUser && !localUser.emailVerified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before signing in',
      });
    }

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

// GET /api/auth/verify-email - Verify local email login
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token, redirect } = req.query;

    if (!token) {
      return res.status(400).send('Missing verification token');
    }

    const tokenHash = hashToken(token);
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
      },
    });

    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      return res.status(400).send('Verification link is invalid or has expired');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationRecord.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({
        where: { tokenHash },
      }),
    ]);

    return res.redirect(resolveSafeRedirect(req, redirect));
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/resend-verification - Resend local verification email
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    await sendVerificationForUser(req, user);

    return res.json({ message: 'Verification email sent' });
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
