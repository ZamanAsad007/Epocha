const axios = require('axios');
const prisma = require('./prisma');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

// ─────────────────────────────────────────────
// FIX 1: Split into TWO queries to avoid timeout
// Query A – War/Battle/Conflict places (uses UNION for subclass support)
// ─────────────────────────────────────────────
const WAR_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {

  # FIX 2: Use UNION + wdt:P31/wdt:P279* to catch subclasses
  # Without wdt:P279* (subclass traversal), most battlefields are missed
  {
    ?place wdt:P31/wdt:P279* wd:Q178561.  # battlefield (+ subclasses)
    BIND(wd:Q178561 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q180684.  # military conflict (+ subclasses)
    BIND(wd:Q180684 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q1194611. # ruined city (often war-destroyed)
    BIND(wd:Q1194611 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q157570.  # military cemetery
    BIND(wd:Q157570 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q1785071. # war memorial
    BIND(wd:Q1785071 AS ?instance)
  }

  # Must have coordinates
  ?place wdt:P625 ?coord.

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  ?place rdfs:label ?placeLabel.
  FILTER(LANG(?placeLabel) = "en")
}
LIMIT 1000
`;

// ─────────────────────────────────────────────
// Query B – Cultural/Heritage/Architecture places
// Uses direct wdt:P31 (no subclass) — these types are precise enough
// ─────────────────────────────────────────────
const CULTURAL_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {

  VALUES ?instance {
    wd:Q839954   # archaeological site
    wd:Q141400   # ruins
    wd:Q10969    # ruin
    wd:Q44539    # temple
    wd:Q32815    # mosque
    wd:Q16970    # church
    wd:Q49833    # monument
    wd:Q46970    # castle
    wd:Q16560    # palace
    wd:Q125932   # historic site
    wd:Q131681   # music venue
    wd:Q186749   # music museum
    wd:Q543619   # concert hall
    wd:Q187468   # opera house
    wd:Q570116   # tourist attraction
    wd:Q80707    # skyscraper
    wd:Q12280    # bridge
    wd:Q12518    # tower
    wd:Q23442    # island
    wd:Q5351     # city
  }

  ?place wdt:P31 ?instance.
  ?place wdt:P625 ?coord.

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  ?place rdfs:label ?placeLabel.
  FILTER(LANG(?placeLabel) = "en")
}
LIMIT 1000
`;

const mapCategory = (instanceId) => {
  const mapping = {
    // War types
    'Q178561':  'war',  // battlefield
    'Q180684':  'war',  // military conflict
    'Q157570':  'war',  // military cemetery
    'Q1785071': 'war',  // war memorial
    'Q1194611': 'war',  // ruined city (often war-destroyed)

    // Ruins
    'Q839954': 'ruins',
    'Q141400': 'ruins',
    'Q10969':  'ruins',

    // Religion
    'Q44539': 'religion',
    'Q32815': 'religion',
    'Q16970': 'religion',

    // Culture
    'Q49833':  'culture',
    'Q46970':  'culture',
    'Q16560':  'culture',
    'Q125932': 'culture',
    'Q570116': 'culture',
    'Q23442':  'culture',
    'Q5351':   'culture',

    // Music
    'Q131681': 'music',
    'Q186749': 'music',
    'Q543619': 'music',
    'Q187468': 'music',

    // Architecture
    'Q8119':  'architecture',
    'Q80707': 'architecture',
    'Q12280': 'architecture',
    'Q12518': 'architecture',
  };
  return mapping[instanceId] || 'culture';
};

const mapEra = (year) => {
  if (year === null || year === undefined) return 'modern';
  if (year < 500)  return 'ancient';
  if (year < 1500) return 'medieval';
  if (year < 1900) return 'colonial';
  return 'modern';
};

const parseYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/(-?\d{1,4})/);
  if (match) return parseInt(match[1]);
  return null;
};

const fetchWikipediaDescription = async (title) => {
  if (!title) return null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.data.extract || null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// FIX 4: Run BOTH queries and merge results
// ─────────────────────────────────────────────
const runSparqlQuery = async (query, label) => {
  console.log(`Running SPARQL query: ${label}...`);
  try {
    const response = await axios.get(WIKIDATA_SPARQL_URL, {
      params: { query, format: 'json' },
      headers: {
        'User-Agent': 'EpochaHistoryApp/1.0 (yourname@example.com)',
        'Accept': 'application/sparql-results+json',
      },
      timeout: 60000, // FIX 5: Increased timeout to 60s (was 30s)
    });

    return response.data.results.bindings.map(item => {
      const coordMatch = item.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
      const lng = coordMatch ? parseFloat(coordMatch[1]) : 0;
      const lat = coordMatch ? parseFloat(coordMatch[2]) : 0;

      const wikidataId   = item.place.value.split('/').pop();
      const instanceId   = item.instance.value.split('/').pop();

      const rawDate =
        item.inception?.value ||
        item.date_of_opening?.value ||
        item.point_in_time?.value ||
        item.start_time?.value;

      const year = parseYear(rawDate);

      const wikipediaUrl  = item.article?.value;
      const wikipediaSlug = wikipediaUrl
        ? decodeURIComponent(wikipediaUrl.split('/wiki/').pop())
        : null;

      return {
        wikidataId,
        name:         item.placeLabel.value,
        lat,
        lng,
        category:     mapCategory(instanceId),
        era:          mapEra(year),
        year,
        wikipediaSlug,
        imageUrl:     item.image?.value || null,
        description:  null,
      };
    });
  } catch (error) {
    console.error(`Error in query [${label}]:`, error.message);
    return [];
  }
};

const fetchHistoricalPlaces = async () => {
  // Run both queries in parallel for speed
  const [warPlaces, culturalPlaces] = await Promise.all([
    runSparqlQuery(WAR_SPARQL_QUERY,      'War & Conflicts'),
    runSparqlQuery(CULTURAL_SPARQL_QUERY, 'Cultural & Heritage'),
  ]);

  // FIX 6: Deduplicate by wikidataId (war query takes priority)
  const seen  = new Set();
  const merged = [];

  for (const place of [...warPlaces, ...culturalPlaces]) {
    if (!seen.has(place.wikidataId)) {
      seen.add(place.wikidataId);
      merged.push(place);
    }
  }

  console.log(`War places: ${warPlaces.length}`);
  console.log(`Cultural places: ${culturalPlaces.length}`);
  console.log(`Total unique places after merge: ${merged.length}`);

  return merged;
};

const seedDatabase = async () => {
  const places = await fetchHistoricalPlaces();
  console.log(`\nSeeding ${places.length} places into database...`);

  let count = 0;
  for (const place of places) {
    try {
      if (place.wikipediaSlug && !place.description) {
        place.description = await fetchWikipediaDescription(place.wikipediaSlug);
      }

      await prisma.place.upsert({
        where:  { wikidataId: place.wikidataId },
        update: place,
        create: place,
      });
      count++;

      if (count % 50 === 0) {
        console.log(`  Progress: ${count}/${places.length} seeded...`);
      }
    } catch (error) {
      console.error(`Failed to upsert [${place.name}]:`, error.message);
    }
  }

  console.log(`\n✅ Successfully seeded ${count} places.`);
  process.exit(0);
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { fetchHistoricalPlaces, seedDatabase };