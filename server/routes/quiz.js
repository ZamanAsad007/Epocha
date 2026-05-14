const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/quiz/:placeId - Get quiz questions for a place
router.get('/:placeId', async (req, res, next) => {
  try {
    let questions = await prisma.quizQuestion.findMany({
      where: { placeId: req.params.placeId },
      take: 4
    });

    // If not enough questions, we'll need AI generation (Step 8 stub)
    if (questions.length < 4) {
      // For now, return what we have or empty
    }

    // Shuffle options for each question
    const shuffledQuestions = questions.map(q => {
      const options = [
        { key: 'a', text: q.optionA },
        { key: 'b', text: q.optionB },
        { key: 'c', text: q.optionC },
        { key: 'd', text: q.optionD },
      ];
      
      // Fisher-Yates shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        ...q,
        options,
        // Don't send the correct answer key directly to prevent cheating
        // We'll verify on server or just trust client for Phase 2
      };
    });

    res.json(shuffledQuestions);
  } catch (error) {
    next(error);
  }
});

// POST /api/quiz/:placeId/score - Save a quiz score (auth required)
router.post('/:placeId/score', authMiddleware, async (req, res, next) => {
  try {
    const { score, total } = req.body;
    const { id: userId } = req.user;
    const { placeId } = req.params;

    const quizScore = await prisma.quizScore.create({
      data: {
        userId,
        placeId,
        score,
        total,
      },
    });

    res.status(201).json(quizScore);
  } catch (error) {
    next(error);
  }
});

// GET /api/quiz/leaderboard/:placeId - Get top scores for a place
router.get('/leaderboard/:placeId', async (req, res, next) => {
  try {
    const scores = await prisma.quizScore.findMany({
      where: { placeId: req.params.placeId },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10,
      include: {
        user: {
          select: { displayName: true, avatarUrl: true }
        }
      }
    });

    res.json(scores);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
