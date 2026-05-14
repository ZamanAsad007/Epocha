require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const placesRoutes = require('./routes/places');
const quizRoutes = require('./routes/quiz');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Epocha API is running' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
