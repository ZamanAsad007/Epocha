require('dotenv').config();
const axios = require('axios');
const prisma = require('./prisma');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

// War query helper used to split large historical queries by continent.
const WAR_INSTANCE_UNION = `
  {
    ?place wdt:P31/wdt:P279* wd:Q650711.   # battle
    BIND(wd:Q650711 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q178561.   # battlefield
    BIND(wd:Q178561 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q180684.   # military conflict
    BIND(wd:Q180684 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q831663.   # military campaign
    BIND(wd:Q831663 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q645883.   # military operation
    BIND(wd:Q645883 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q157570.   # military cemetery
    BIND(wd:Q157570 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q1785071.  # war memorial
    BIND(wd:Q1785071 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q3679228.  # fortification
    BIND(wd:Q3679228 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q44613.    # nuclear test site
    BIND(wd:Q44613 AS ?instance)
  }
`;

const buildWarSparqlQuery = ({ continentQid, limit = 250 } = {}) => `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {

  ${WAR_INSTANCE_UNION}

  ?place wdt:P625 ?coord.
  ${continentQid ? `
  ?place wdt:P17 ?country.
  ?country wdt:P30 wd:${continentQid}.
  ` : ''}

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?placeLabel
LIMIT ${limit}
`;

// Asia wars & battles
const WAR_ASIA_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {
  {
    ?place wdt:P31/wdt:P279* wd:Q650711.   # battle
    BIND(wd:Q650711 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q178561.   # battlefield
    BIND(wd:Q178561 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q180684.   # military conflict
    BIND(wd:Q180684 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q831663.   # military campaign
    BIND(wd:Q831663 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q645883.   # military operation
    BIND(wd:Q645883 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q157570.   # military cemetery
    BIND(wd:Q157570 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q1785071.  # war memorial
    BIND(wd:Q1785071 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q3679228.  # fortification
    BIND(wd:Q3679228 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q44613.    # nuclear test site
    BIND(wd:Q44613 AS ?instance)
  }

  ?place wdt:P625 ?coord.
  ?place wdt:P17 ?country.
  ?country wdt:P30 wd:Q48.                 # Asia

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?placeLabel
LIMIT 2000
`;

// Americas wars & battles (North & South America)
const WAR_AMERICAS_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {
  {
    ?place wdt:P31/wdt:P279* wd:Q650711.   # battle
    BIND(wd:Q650711 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q178561.   # battlefield
    BIND(wd:Q178561 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q180684.   # military conflict
    BIND(wd:Q180684 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q831663.   # military campaign
    BIND(wd:Q831663 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q645883.   # military operation
    BIND(wd:Q645883 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q157570.   # military cemetery
    BIND(wd:Q157570 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q1785071.  # war memorial
    BIND(wd:Q1785071 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q3679228.  # fortification
    BIND(wd:Q3679228 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q44613.    # nuclear test site
    BIND(wd:Q44613 AS ?instance)
  }

  ?place wdt:P625 ?coord.
  ?place wdt:P17 ?country.
  ?country wdt:P30 ?continent.
  VALUES ?continent { wd:Q49 wd:Q18 }        # North & South America

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?placeLabel
LIMIT 2000
`;

// ROW wars & battles (Africa & Oceania)
const WAR_ROW_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {
  {
    ?place wdt:P31/wdt:P279* wd:Q650711.   # battle
    BIND(wd:Q650711 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q178561.   # battlefield
    BIND(wd:Q178561 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q180684.   # military conflict
    BIND(wd:Q180684 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q831663.   # military campaign
    BIND(wd:Q831663 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q645883.   # military operation
    BIND(wd:Q645883 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q157570.   # military cemetery
    BIND(wd:Q157570 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q1785071.  # war memorial
    BIND(wd:Q1785071 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q3679228.  # fortification
    BIND(wd:Q3679228 AS ?instance)
  } UNION {
    ?place wdt:P31/wdt:P279* wd:Q44613.    # nuclear test site
    BIND(wd:Q44613 AS ?instance)
  }

  ?place wdt:P625 ?coord.
  ?place wdt:P17 ?country.
  ?country wdt:P30 ?continent.
  VALUES ?continent { wd:Q15 wd:Q666 }       # Africa & Oceania

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?placeLabel
LIMIT 2000
`;

// Architecture & Heritage Query — flat direct lookup (no recursive traversal!)
const ARCHITECTURE_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {
  VALUES ?instance {
    wd:Q839954   # archaeological site
    wd:Q141400   # archaeological remnant
    wd:Q10969    # ruined structure
    wd:Q1194611  # ruined city
    wd:Q2354482  # ancient city
    wd:Q15893266 # former settlement
    wd:Q56061    # abandoned city
    wd:Q1060829  # ancient settlement
    wd:Q3812007  # deserted village
    wd:Q9259     # UNESCO World Heritage Site
    wd:Q174782   # historical monument
  }

  ?place wdt:P31 ?instance.
  ?place wdt:P625 ?coord.

  ${continentQid ? `
  # Prefer continent coverage via country → continent
  ?place wdt:P17 ?country.
  ?country wdt:P30 wd:${continentQid}.
  ` : ''}

  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P1619 ?date_of_opening. }
  OPTIONAL { ?place wdt:P585 ?point_in_time. }
  OPTIONAL { ?place wdt:P580 ?start_time. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?placeLabel
LIMIT 2000
`;

const CULTURAL_SPARQL_QUERY = `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {

  VALUES ?instance {
    wd:Q44539    # temple
    wd:Q32815    # mosque
    wd:Q16970    # church
    wd:Q49833    # monument
    wd:Q46970    # castle
    wd:Q16560    # palace
    wd:Q125932   # historic site
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

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?placeLabel
LIMIT 2000
`;

const mapCategory = (instanceId) => {
  const mapping = {
    // War
    'Q650711':  'war',  // battle
    'Q178561':  'war',  // battlefield
    'Q180684':  'war',  // military conflict
    'Q198':     'war',  // war (WWI, WWII)
    'Q831663':  'war',  // military campaign
    'Q645883':  'war',  // military operation
    'Q157570':  'war',  // military cemetery
    'Q1785071': 'war',  // war memorial
    'Q3679228': 'war',  // fortification
    'Q44613':   'war',  // nuclear test site

    // Architecture & heritage
    'Q839954':   'architecture',  // archaeological site
    'Q141400':   'architecture',  // archaeological remnant
    'Q10969':    'architecture',  // ruined structure
    'Q1194611':  'architecture',  // ruined city
    'Q2354482':  'architecture',  // ancient city
    'Q15893266': 'architecture',  // former settlement
    'Q56061':    'architecture',  // abandoned city
    'Q1060829':  'architecture',  // ancient settlement
    'Q3812007':  'architecture',  // deserted village
    'Q9259':     'architecture',  // UNESCO World Heritage Site
    'Q174782':   'architecture',  // historical monument

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
  const continents = [
    { qid: 'Q46', label: 'Europe' },
    { qid: 'Q48', label: 'Asia' },
    { qid: 'Q49', label: 'North America' },
    { qid: 'Q18', label: 'South America' },
    { qid: 'Q15', label: 'Africa' },
    { qid: 'Q55643', label: 'Oceania' },
  ];

  // Run war queries per continent to avoid a skewed LIMIT sample
  const warByContinent = (await Promise.all(
    continents.map(c =>
      runSparqlQuery(
        buildWarSparqlQuery({ continentQid: c.qid, limit: 250 }),
        `War & Conflicts (${c.label})`
      )
    )
  )).flat();

  // Fallback war query for items without country/continent metadata
  const warFallback = await runSparqlQuery(
    buildWarSparqlQuery({ limit: 500 }),
    'War & Conflicts (Fallback)'
  );

  const warPlaces = [...warByContinent, ...warFallback];
  const architecturePlaces = await runSparqlQuery(
    ARCHITECTURE_SPARQL_QUERY,
    'Architecture & Heritage'
  );

  // Cultural/Heritage (single query)
  const culturalPlaces = await runSparqlQuery(CULTURAL_SPARQL_QUERY, 'Cultural & Heritage');

  const seen   = new Set();
  const merged = [];

  const allPlaces = [
    ...warPlaces,
    ...architecturePlaces,
    ...culturalPlaces
  ];

  for (const place of allPlaces) {
    if (!seen.has(place.wikidataId)) {
      seen.add(place.wikidataId);
      merged.push(place);
    }
  }

  console.log(`War places:          ${warPlaces.length}`);
  console.log(`Architecture places: ${architecturePlaces.length}`);
  console.log(`Cultural places:     ${culturalPlaces.length}`);
  console.log(`Total unique:        ${merged.length}`);

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