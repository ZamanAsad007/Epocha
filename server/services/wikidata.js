require('dotenv').config();
const axios = require('axios');
const prisma = require('./prisma');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

// Reusable WAR instance union (matches many war-related types)
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
  ` : `
  OPTIONAL { ?place wdt:P17 ?country. }
  `}

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

const buildRuinsSparqlQuery = ({ continentQid, limit = 250 } = {}) => `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {
  VALUES ?instance {
    wd:Q839954   # archaeological site
    wd:Q141400   # ruins
    wd:Q10969    # ruin
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
  ?place wdt:P17 ?country.
  ?country wdt:P30 wd:${continentQid}.
  ` : `
  OPTIONAL { ?place wdt:P17 ?country. }
  `}

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

const buildArchitectureSparqlQuery = ({ continentQid, limit = 500 } = {}) => `
SELECT DISTINCT ?place ?placeLabel ?coord ?instance ?article ?image
                ?inception ?date_of_opening ?point_in_time ?start_time WHERE {
  VALUES ?instance {
    wd:Q839954
    wd:Q141400
    wd:Q10969
    wd:Q1194611
    wd:Q2354482
    wd:Q15893266
    wd:Q56061
    wd:Q1060829
    wd:Q3812007
    wd:Q9259
    wd:Q174782
  }

  ?place wdt:P31 ?instance.
  ?place wdt:P625 ?coord.
  ${continentQid ? `
  ?place wdt:P17 ?country.
  ?country wdt:P30 wd:${continentQid}.
  ` : `
  OPTIONAL { ?place wdt:P17 ?country. }
  `}

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

const buildCulturalSparqlQuery = ({ limit = 2000 } = {}) => `
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
LIMIT ${limit}
`;

const mapCategory = (instanceId) => {
  const mapping = {
    // War
    'Q650711':  'war',
    'Q178561':  'war',
    'Q180684':  'war',
    'Q198':     'war',
    'Q831663':  'war',
    'Q645883':  'war',
    'Q157570':  'war',
    'Q1785071': 'war',
    'Q3679228': 'war',
    'Q44613':   'war',

    // Architecture / Ruins -> map to 'architecture'
    'Q839954':   'architecture',
    'Q141400':   'architecture',
    'Q10969':    'architecture',
    'Q1194611':  'architecture',
    'Q2354482':  'architecture',
    'Q15893266': 'architecture',
    'Q56061':    'architecture',
    'Q1060829':  'architecture',
    'Q3812007':  'architecture',
    'Q9259':     'architecture',
    'Q174782':   'architecture',

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

    // Architecture extras
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
  const match = dateStr.match(/(-?\\d{1,4})/);
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

const runSparqlQuery = async (query, label) => {
  console.log(`Running SPARQL query: ${label}...`);
  try {
    const response = await axios.get(WIKIDATA_SPARQL_URL, {
      params: { query, format: 'json' },
      headers: {
        'User-Agent': 'EpochaHistoryApp/1.0 (contact@epocha.local)',
        'Accept': 'application/sparql-results+json',
      },
      timeout: 60000,
    });

    return response.data.results.bindings.map(item => {
      const coordMatch = item.coord?.value?.match(/Point\(([-\\d.]+) ([-\\d.]+)\)/);
      const lng = coordMatch ? parseFloat(coordMatch[1]) : 0;
      const lat = coordMatch ? parseFloat(coordMatch[2]) : 0;

      const wikidataId   = item.place.value.split('/').pop();
      const instanceId   = item.instance?.value?.split('/').pop();

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
    console.error(`Error in query [${label}]:`, error.message || error);
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

  const architecturePlaces = await Promise.all(
    continents.map(c =>
      runSparqlQuery(buildArchitectureSparqlQuery({ continentQid: c.qid, limit: 500 }), `Architecture (${c.label})`)
    )
  ).then(arrs => arrs.flat());

  const culturalPlaces = await runSparqlQuery(buildCulturalSparqlQuery({ limit: 2000 }), 'Cultural & Heritage');

  const ruinsPlaces = await Promise.all(
    continents.map(c => runSparqlQuery(buildRuinsSparqlQuery({ continentQid: c.qid, limit: 500 }), `Ruins (${c.label})`))
  ).then(arrs => arrs.flat());

  const seen   = new Set();
  const merged = [];

  const allPlaces = [
    ...warPlaces,
    ...architecturePlaces,
    ...ruinsPlaces,
    ...culturalPlaces,
  ];

  for (const place of allPlaces) {
    if (!seen.has(place.wikidataId)) {
      seen.add(place.wikidataId);
      merged.push(place);
    }
  }

  console.log(`War places:          ${warPlaces.length}`);
  console.log(`Architecture places: ${architecturePlaces.length}`);
  console.log(`Ruins places:        ${ruinsPlaces.length}`);
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
      console.error(`Failed to upsert [${place.name}]:`, error.message || error);
    }
  }

  console.log(`\n✅ Successfully seeded ${count} places.`);
  process.exit(0);
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { fetchHistoricalPlaces, seedDatabase };