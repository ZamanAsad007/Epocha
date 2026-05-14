const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');

// GET /api/stats - Global statistics
router.get('/', async (req, res, next) => {
  try {
    const total = await prisma.place.count();
    
    // Group by category
    const categories = await prisma.place.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    const byCategory = {};
    categories.forEach(c => {
      byCategory[c.category] = c._count.category;
    });

    // Group by era
    const eras = await prisma.place.groupBy({
      by: ['era'],
      _count: { era: true }
    });

    const byEra = {};
    eras.forEach(e => {
      byEra[e.era] = e._count.era;
    });

    res.json({
      total,
      byCategory,
      byEra,
      mostViewed: [] // Phase 3 stub
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
