const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/places - Get all places with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { category, era, year } = req.query;

    const where = {};

    if (category) {
      where.category = { equals: String(category), mode: 'insensitive' };
    }

    if (era) {
      where.era = { equals: String(era), mode: 'insensitive' };
    }

    if (year !== undefined) {
      const y = Number.parseInt(String(year), 10);
      if (!Number.isNaN(y)) {
        // Include records with unknown year so seeded war data isn't accidentally filtered out.
        where.OR = [{ year: { lte: y } }, { year: null }];
      }
    }

    const places = await prisma.place.findMany({ where });
    res.json(places);
  } catch (error) {
    next(error);
  }
});

// GET /api/places/bookmarks/all - Get all bookmarks for user
router.get('/bookmarks/all', authMiddleware, async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: { place: true }
    });

    res.json(bookmarks.map(b => b.place));
  } catch (error) {
    next(error);
  }
});

// GET /api/places/:id - Get single place with quiz questions
router.get('/:id', async (req, res, next) => {
  try {
    const place = await prisma.place.findUnique({
      where: { id: req.params.id },
      include: { quizQuestions: true }
    });

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(place);
  } catch (error) {
    next(error);
  }
});

// POST /api/places/:id/bookmark - Bookmark a place
router.post('/:id/bookmark', authMiddleware, async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const placeId = req.params.id;

    await prisma.bookmark.upsert({
      where: { userId_placeId: { userId, placeId } },
      update: {},
      create: { userId, placeId }
    });

    res.json({ bookmarked: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/places/:id/bookmark - Remove bookmark
router.delete('/:id/bookmark', authMiddleware, async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const placeId = req.params.id;

    await prisma.bookmark.delete({
      where: { userId_placeId: { userId, placeId } }
    });

    res.json({ bookmarked: false });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
