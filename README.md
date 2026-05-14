# 🗺️ Epocha
### Explore History. One Pin at a Time.

Epocha is an interactive historical map web application that lets users explore significant historical places across the world. Click any marker to read its history, filter by category, travel through time with the era slider, test your knowledge with pop quizzes, and view global statistics — all in one beautiful map experience.

---

## ✨ Features

### 🌍 Core (Available to all users)
- **Interactive World Map** — powered by Leaflet.js + OpenStreetMap, no API key required
- **Historical Markers** — color-coded pins for every category across all continents
- **Category Filtering** — toggle War ⚔️, Culture 🏛️, Music 🎵, Religion 🕌, Ruins 🗿
- **Place Details Sidebar** — click any marker to read a live Wikipedia description, view era and category badges
- **Pop Quiz ↔ Statistics Toggle** — switch between testing your knowledge and viewing global stats
- **Time Slider** — locked at 1945 AD for guests (see premium)

### 🔐 Premium (Logged in users only)
- **Full Time Slider** — travel from 3000 BCE to present, markers update live
- **AI Story Mode** — AI-generated narrative of what it was like to be at that place during its peak
- **Daily History Banner** — "On This Day" historical event shown every day
- **Bookmarks** — save places to your personal collection
- **Quiz Score Tracking** — your scores saved across sessions

### 🔗 Coming Soon
- **Share a Place** — generate a shareable link for any historical location
- **Civilization Overlays** — view historical empire boundaries on the map
- **User Submissions** — suggest missing historical sites

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework and dev server |
| Leaflet.js + React-Leaflet | Interactive map |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| Axios | HTTP requests |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database access layer |
| Supabase Auth | Authentication (email + OAuth) |
| PostgreSQL + PostGIS | Database with geo query support |

### External APIs (all free)
| API | Purpose |
|---|---|
| OpenStreetMap Tiles | Map rendering |
| Wikidata SPARQL | Historical places + coordinates |
| Wikipedia REST API | Place descriptions + images |
| Wikimedia Commons | Historical photographs |
| Anthropic Claude API | AI Story Mode (premium) |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Railway / Supabase | PostgreSQL database hosting |
| Upstash Redis | API response caching |

---

## 📁 Project Structure

```
epocha/
│
├── client/                          # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapView.jsx          # Core Leaflet map
│   │   │   │   ├── MarkerLayer.jsx      # Historical markers
│   │   │   │   ├── MarkerPopup.jsx      # Marker click popup
│   │   │   │   └── TimeSlider.jsx       # Era timeline slider
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx          # Sidebar wrapper
│   │   │   │   ├── PlaceDetail.jsx      # Place info + Wikipedia
│   │   │   │   ├── QuizPanel.jsx        # Pop quiz
│   │   │   │   └── StatsPanel.jsx       # Statistics panel
│   │   │   ├── Filters/
│   │   │   │   └── FilterBar.jsx        # Category toggles
│   │   │   ├── Auth/
│   │   │   │   ├── LoginModal.jsx       # Login form
│   │   │   │   └── SignupModal.jsx      # Signup form
│   │   │   └── UI/
│   │   │       ├── Navbar.jsx
│   │   │       ├── ShareButton.jsx      # (Phase 3)
│   │   │       ├── LockBadge.jsx        # Premium lock icon
│   │   │       └── LoadingSpinner.jsx
│   │   ├── data/
│   │   │   └── places.js               # Hardcoded seed places (Phase 1)
│   │   ├── hooks/
│   │   │   ├── useWikipedia.js          # Wikipedia API hook
│   │   │   ├── usePlaces.js             # Filtered places hook
│   │   │   └── useAuth.js               # Auth state hook
│   │   ├── store/
│   │   │   └── mapStore.js             # Zustand global store
│   │   └── utils/
│   │       └── categoryConfig.js       # Category colors + icons
│   │
└── server/                             # Express backend
    ├── routes/
    │   ├── places.js                   # GET /api/places
    │   ├── quiz.js                     # GET /api/quiz/:placeId
    │   ├── stats.js                    # GET /api/stats
    │   └── auth.js                     # POST /api/auth/*
    ├── services/
    │   ├── wikidata.js                 # Wikidata SPARQL queries
    │   ├── wikipedia.js                # Wikipedia proxy
    │   └── supabase.js                 # Supabase client
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorHandler.js
    └── prisma/
        └── schema.prisma
```

---

## 🗄️ Database Schema

```prisma
model Place {
  id             String          @id
  name           String
  category       String          // war | culture | music | religion | ruins
  era            String          // ancient | medieval | colonial | modern
  lat            Float
  lng            Float
  wikidataId     String?         @unique
  wikipediaSlug  String?
  description    String?
  imageUrl       String?
  year           Int?            // negative = BC, positive = AD
  createdAt      DateTime        @default(now())
  quizQuestions  QuizQuestion[]
  bookmarks      Bookmark[]
  quizScores     QuizScore[]
}

model QuizQuestion {
  id            String   @id
  placeId       String
  question      String
  optionA       String
  optionB       String
  optionC       String
  optionD       String
  correctAnswer String   // a | b | c | d
  difficulty    String?  // easy | medium | hard
  place         Place    @relation(fields: [placeId], references: [id])
}

model User {
  id           String      @id  // matches Supabase Auth UUID
  email        String      @unique
  displayName  String?
  avatarUrl    String?
  isPremium    Boolean     @default(false)
  createdAt    DateTime    @default(now())
  bookmarks    Bookmark[]
  quizScores   QuizScore[]
}

model Bookmark {
  id        String   @id @default(cuid())
  userId    String
  placeId   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  place     Place    @relation(fields: [placeId], references: [id])

  @@unique([userId, placeId])
}

model QuizScore {
  id        String   @id @default(cuid())
  userId    String
  placeId   String
  score     Int
  total     Int
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  place     Place    @relation(fields: [placeId], references: [id])
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free at supabase.com)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/epocha.git
cd epocha
```

### 2. Set up the frontend
```bash
cd client
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

### 3. Set up the backend
```bash
cd server
npm install
cp .env.example .env
# Fill in your environment variables
npx prisma migrate dev
npm run dev
```

### 4. Environment Variables

**client/.env**
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**server/.env**
```env
DATABASE_URL=your_supabase_postgresql_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3000
```

---

## 🗺️ API Endpoints

### Places
```
GET  /api/places                    # Get all places (supports ?category= &era= filters)
GET  /api/places/:id                # Get single place with quiz questions
```

### Quiz
```
GET  /api/quiz/:placeId             # Get quiz questions for a place
POST /api/quiz/:placeId/score       # Save a quiz score (auth required)
```

### Stats
```
GET  /api/stats                     # Global statistics (total places, by category, by era)
```

### Auth
```
POST /api/auth/register             # Register new user
POST /api/auth/login                # Login
GET  /api/auth/me                   # Get current user profile (auth required)
```

---

## 🏗️ Development Phases

- [x] **Phase 1** — Map, markers, category filter, Wikipedia descriptions, time slider UI
- [ ] **Phase 2** — Auth, Wikidata integration, quiz system, stats panel, backend API
- [ ] **Phase 3** — Share a place, AI Story Mode, daily banner, bookmarks, civilization overlays

---

## 🌍 Data Sources

All historical data is sourced from open, freely licensed sources:

- **[Wikidata](https://www.wikidata.org)** — Structured data for historical places (CC0 license)
- **[Wikipedia](https://www.wikipedia.org)** — Descriptions and summaries (CC BY-SA license)
- **[Wikimedia Commons](https://commons.wikimedia.org)** — Historical photographs
- **[OpenStreetMap](https://www.openstreetmap.org)** — Map tiles (ODbL license)
- **[OpenHistoricalMap](https://www.openhistoricalmap.org)** — Historical geographic data

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, create a branch
git checkout -b feature/your-feature-name

# Make your changes, then
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# Open a Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

Built with ❤️ and a passion for history.

> *"The world is a book, and those who do not travel read only one page."*
> — Saint Augustine

---

⭐ If you find Epocha useful, please give it a star on GitHub!
