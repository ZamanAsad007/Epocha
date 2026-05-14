const axios = require('axios');
const prisma = require('./prisma');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

const SPARQL_QUERY = `
SELECT ?place ?placeLabel ?coord ?instance ?instanceLabel ?article ?image ?inception WHERE {
  ?place wdt:P31 ?instance.
  ?place wdt:P625 ?coord.
  
  # Filter by relevant instances
  VALUES ?instance {
    wd:Q178561 # battlefield
    wd:Q11266  # military base
    wd:Q839954 # archaeological site
    wd:Q141400 # ruins
    wd:Q32815  # mosque
    wd:Q16970  # church
    wd:Q44539  # temple
    wd:Q861697 # concert hall
    wd:Q1194382 # music venue
    wd:Q49833  # monument
    wd:Q206577 # cultural heritage
  }
  
  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
LIMIT 100
`;

const mapCategory = (instanceId) => {
  const mapping = {
    'Q178561': 'war',
    'Q11266': 'war',
    'Q839954': 'ruins',
    'Q141400': 'ruins',
    'Q32815': 'religion',
    'Q16970': 'religion',
    'Q44539': 'religion',
    'Q861697': 'music',
    'Q1194382': 'music',
    'Q49833': 'culture',
    'Q206577': 'culture',
  };
  return mapping[instanceId] || 'culture';
};

const mapEra = (year) => {
  if (!year) return 'modern';
  if (year < 500) return 'ancient';
  if (year < 1500) return 'medieval';
  if (year < 1900) return 'colonial';
  return 'modern';
};

const parseYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/-?\d{4}/);
  return match ? parseInt(match[0]) : null;
};

const fetchHistoricalPlaces = async () => {
  console.log('Fetching historical places from Wikidata...');
  try {
    const response = await axios.get(WIKIDATA_SPARQL_URL, {
      params: {
        query: SPARQL_QUERY,
        format: 'json'
      }
    });

    return response.data.results.bindings.map(item => {
      // Parse coordinates Point(longitude latitude)
      const coordMatch = item.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
      const lng = coordMatch ? parseFloat(coordMatch[1]) : 0;
      const lat = coordMatch ? parseFloat(coordMatch[2]) : 0;

      const wikidataId = item.place.value.split('/').pop();
      const instanceId = item.instance.value.split('/').pop();
      const year = parseYear(item.inception?.value);
      
      const wikipediaUrl = item.article?.value;
      const wikipediaSlug = wikipediaUrl ? decodeURIComponent(wikipediaUrl.split('/wiki/').pop()) : null;

      return {
        wikidataId,
        name: item.placeLabel.value,
        lat,
        lng,
        category: mapCategory(instanceId),
        era: mapEra(year),
        year,
        wikipediaSlug,
        imageUrl: item.image?.value || null,
        description: null // Will be fetched via Wikipedia API later
      };
    });
  } catch (error) {
    console.error('Error fetching from Wikidata:', error.message);
    return [];
  }
};

const seedDatabase = async () => {
  const places = await fetchHistoricalPlaces();
  console.log(`Found ${places.length} places. Seeding database...`);

  let count = 0;
  for (const place of places) {
    try {
      await prisma.place.upsert({
        where: { wikidataId: place.wikidataId },
        update: place,
        create: place,
      });
      count++;
    } catch (error) {
      console.error(`Failed to upsert place ${place.name}:`, error.message);
    }
  }

  console.log(`Successfully seeded ${count} places.`);
  process.exit(0);
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { fetchHistoricalPlaces, seedDatabase };
