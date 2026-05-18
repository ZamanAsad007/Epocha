const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');

// GET /api/banner/today?month=5&day=12
router.get('/today', async (req, res, next) => {
  try {
    const month = Number.parseInt(String(req.query.month), 10);
    const day = Number.parseInt(String(req.query.day), 10);

    if (Number.isNaN(month) || Number.isNaN(day)) {
      return res.status(400).json({ error: 'month and day required' });
    }

    const events = await prisma.bannerEvent.findMany({
      where: {
        dateMonth: month,
        dateDay: day,
      },
      include: {
        place: {
          select: { id: true, name: true, lat: true, lng: true },
        },
      },
    });

    if (events.length === 0) {
      return res.json({ event: null });
    }

    const random = events[Math.floor(Math.random() * events.length)];
    return res.json({ event: random });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;