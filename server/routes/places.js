const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');

// GET /api/places - Get all places with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { category, era, year } = req.query;

    const where = {};
    if (category) where.category = category;
    if (era) where.era = era;
    if (year) {
      where.year = {
        lte: parseInt(year)
      };
    }

    const places = await prisma.place.findMany({ where });
    res.json(places);
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

module.exports = router;
