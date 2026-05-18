require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const placesRoutes = require('./routes/places');
const quizRoutes = require('./routes/quiz');
const statsRoutes = require('./routes/stats');
const authRoutes = require('./routes/auth');
const bannerRoutes = require('./routes/banner');

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
app.use('/api/banner', bannerRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Epocha API is running' });
});

// Error handling
app.use(errorHandler);

const supabase = require('./services/supabase');

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Quick check to see if Supabase is reachable
  const { error } = await supabase.from('places').select('id').limit(1);
  if (error && error.message !== 'JSON object requested, but no data was returned') {
    console.log('⚠️  Supabase Connection Error:', error.message);
  } else {
    console.log('✅ Supabase Connected Successfully');
  }
});
