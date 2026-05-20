const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const QUESTION_LIMIT = 4;
const OPTION_KEYS = ['a', 'b', 'c', 'd'];

const shuffle = (items) => {
  const values = [...items];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
};

const formatYear = (year) => {
  if (year == null) return '';
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year} AD`;
};

const createQuestion = (question, correctText, distractors = []) => {
  const uniqueOptions = [...new Set([correctText, ...distractors].filter(Boolean))];
  const paddedOptions = uniqueOptions.slice(0, QUESTION_LIMIT);

  while (paddedOptions.length < QUESTION_LIMIT) {
    paddedOptions.push(`Option ${paddedOptions.length + 1}`);
  }

  const shuffledOptions = shuffle(paddedOptions).map((text, index) => ({
    key: OPTION_KEYS[index],
    text,
  }));

  const correctAnswer = shuffledOptions.find((option) => option.text === correctText)?.key || 'a';

  return {
    question,
    options: shuffledOptions,
    correctAnswer,
  };
};

const normalizeStoredQuestion = (question) => {
  const optionMap = {
    a: question.optionA,
    b: question.optionB,
    c: question.optionC,
    d: question.optionD,
  };

  const correctText = optionMap[String(question.correctAnswer).toLowerCase()] || question.optionA;
  const options = shuffle([
    { key: 'a', text: question.optionA },
    { key: 'b', text: question.optionB },
    { key: 'c', text: question.optionC },
    { key: 'd', text: question.optionD },
  ]);

  return {
    question: question.question,
    options,
    correctAnswer: options.find((option) => option.text === correctText)?.key || 'a',
  };
};

const buildFallbackQuestions = (place, distractorPool) => {
  const questionPool = [];
  const names = distractorPool.map((entry) => entry.name).filter((name) => name && name !== place.name);
  const categories = [...new Set(distractorPool.map((entry) => entry.category).filter((category) => category && category !== place.category))];
  const eras = [...new Set(distractorPool.map((entry) => entry.era).filter((era) => era && era !== place.era))];
  const years = distractorPool
    .map((entry) => entry.year)
    .filter((year) => Number.isInteger(year) && year !== place.year)
    .map(formatYear)
    .filter(Boolean);

  const descriptionSnippet = place.description
    ? place.description.replace(/\s+/g, ' ').trim().slice(0, 120)
    : '';

  if (descriptionSnippet) {
    questionPool.push(
      createQuestion(
        `Which place matches this description? “${descriptionSnippet}${place.description.length > 120 ? '…' : ''}”`,
        place.name,
        names
      )
    );
  } else {
    questionPool.push(
      createQuestion(
        `Which of these is the correct name for this site?`,
        place.name,
        names
      )
    );
  }

  questionPool.push(
    createQuestion(
      `What category best fits ${place.name}?`,
      place.category,
      categories
    )
  );

  questionPool.push(
    createQuestion(
      `Which era is ${place.name} associated with?`,
      place.era,
      eras
    )
  );

  if (Number.isInteger(place.year)) {
    const yearText = formatYear(place.year);
    questionPool.push(
      createQuestion(
        `In which year is ${place.name} dated?`,
        yearText,
        years
      )
    );
  } else {
    questionPool.push(
      createQuestion(
        `Which of these is the correct name for this site?`,
        place.name,
        names
      )
    );
  }

  return questionPool;
};

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

// GET /api/quiz/:placeId - Get quiz questions for a place
router.get('/:placeId', async (req, res, next) => {
  try {
    const place = await prisma.place.findUnique({
      where: { id: req.params.placeId },
      select: {
        id: true,
        name: true,
        category: true,
        era: true,
        year: true,
        description: true,
      },
    });

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const storedQuestions = await prisma.quizQuestion.findMany({
      where: { placeId: req.params.placeId },
      take: QUESTION_LIMIT
    });

    const otherPlaces = await prisma.place.findMany({
      where: { id: { not: req.params.placeId } },
      select: {
        name: true,
        category: true,
        era: true,
        year: true,
      },
    });

    const normalizedStoredQuestions = storedQuestions.map(normalizeStoredQuestion);
    const fallbackQuestions = buildFallbackQuestions(place, otherPlaces).filter(
      (candidate) => !normalizedStoredQuestions.some((question) => question.question === candidate.question)
    );

    const questions = [...normalizedStoredQuestions];

    for (const fallbackQuestion of fallbackQuestions) {
      if (questions.length >= QUESTION_LIMIT) break;
      questions.push(fallbackQuestion);
    }

    res.json(shuffle(questions).slice(0, QUESTION_LIMIT));
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

module.exports = router;
