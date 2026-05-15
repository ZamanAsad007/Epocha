const axios = require('axios');
const prisma = require('./prisma');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

const SPARQL_QUERY = `
SELECT ?place ?placeLabel ?coord ?instance ?article ?image ?inception WHERE {
  ?place wdt:P31 ?instance.
  ?place wdt:P625 ?coord.
  
    # Filter by core historical categories
    VALUES ?instance {
      wd:Q178561 # battlefield
      wd:Q839954 # archaeological site
      wd:Q141400 # ruins
      wd:Q44539  # temple
      wd:Q49833  # monument
      wd:Q46970  # castle
      wd:Q16560  # palace
      wd:Q125932 # historic site
      wd:Q131681 # music venue
      wd:Q186749 # music museum
      wd:Q543619 # concert hall
      wd:Q187468 # opera house
      wd:Q8119   # building (architecture)
      wd:Q570116 # tourist attraction
      wd:Q80707  # skyscraper
      wd:Q12280  # bridge
      wd:Q12518  # tower
      wd:Q23442  # island (often historical)
      wd:Q5351   # city (historical capitals)
    }
  
  OPTIONAL { ?place wdt:P571 ?inception. }
  OPTIONAL { ?place wdt:P18 ?image. }
  OPTIONAL {
    ?article schema:about ?place;
             schema:isPartOf <https://en.wikipedia.org/>.
  }
  
  ?place rdfs:label ?placeLabel.
  FILTER(LANG(?placeLabel) = "en")
}
LIMIT 200
`;

const mapCategory = (instanceId) => {
  const mapping = {
    'Q178561': 'war',
    'Q839954': 'ruins',
    'Q141400': 'ruins',
    'Q44539': 'religion',
    'Q49833': 'culture',
    'Q46970': 'culture',
    'Q16560': 'culture',
    'Q125932': 'ruins',
    'Q131681': 'music',
    'Q186749': 'music',
    'Q543619': 'music',
    'Q187468': 'music',
    'Q8119': 'architecture',
    'Q80707': 'architecture',
    'Q12280': 'architecture',
    'Q12518': 'architecture',
    'Q570116': 'culture',
    'Q23442': 'culture',
    'Q5351': 'culture',
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

const fetchWikipediaDescription = async (title) => {
  if (!title) return null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await axios.get(url);
    return response.data.extract || null;
  } catch (error) {
    return null;
  }
};

const fetchHistoricalPlaces = async () => {
  console.log('Fetching historical places from Wikidata...');
  try {
    const response = await axios.get(WIKIDATA_SPARQL_URL, {
      params: {
        query: SPARQL_QUERY,
        format: 'json'
      },
      headers: {
        'User-Agent': 'EpochaHistoryApp/1.0 (https://github.com/yourusername/epocha; yourname@example.com)'
      },
      timeout: 30000 // 30 seconds
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
        description: null // Will be populated during seeding
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
      // Fetch description from Wikipedia if slug is available
      if (place.wikipediaSlug && !place.description) {
        console.log(`Fetching description for: ${place.name}...`);
        place.description = await fetchWikipediaDescription(place.wikipediaSlug);
      }

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
