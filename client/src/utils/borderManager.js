// src/utils/borderManager.js

export const BORDER_SNAPSHOTS = [
  { year: -500, file: 'world_bc500.geojson', label: '500 BC' },
  { year: -300, file: 'world_bc300.geojson', label: '300 BC' },
  { year: -100, file: 'world_bc100.geojson', label: '100 BC' },
  { year: 1,    file: 'world_bc1.geojson',   label: '1 AD' },
  { year: 200,  file: 'world_200.geojson',   label: '200 AD' },
  { year: 400,  file: 'world_400.geojson',   label: '400 AD' },
  { year: 600,  file: 'world_600.geojson',   label: '600 AD' },
  { year: 800,  file: 'world_800.geojson',   label: '800 AD' },
  { year: 1000, file: 'world_1000.geojson',  label: '1000 AD' },
  { year: 1200, file: 'world_1200.geojson',  label: '1200 AD' },
  { year: 1400, file: 'world_1400.geojson',  label: '1400 AD' },
  { year: 1700, file: 'world_1700.geojson',  label: '1700 AD' },
  { year: 1800, file: 'world_1800.geojson',  label: '1800 AD' },
  { year: 1880, file: 'world_1880.geojson',  label: '1880 AD' },
  { year: 1914, file: 'world_1914.geojson',  label: '1914 AD' },
  { year: 1920, file: 'world_1920.geojson',  label: '1920 AD' },
  { year: 1938, file: 'world_1938.geojson',  label: '1938 AD' },
  { year: 1945, file: 'world_1945.geojson',  label: '1945 AD' },
  { year: 1960, file: 'world_1960.geojson',  label: '1960 AD' },
  { year: 1991, file: 'world_1994.geojson',  label: '1991 AD' },
  { year: 1992, file: 'world_1994.geojson',  label: '1992 AD' },
  { year: 2000, file: 'world_2000.geojson',  label: '2000 AD' },
  { year: 2024, file: 'ne_110m_admin_0_countries.json', label: '2024 AD' }
];

const loadFunctions = {
  'world_bc500.geojson': () => import('../data/world_bc500.geojson?raw'),
  'world_bc300.geojson': () => import('../data/world_bc300.geojson?raw'),
  'world_bc100.geojson': () => import('../data/world_bc100.geojson?raw'),
  'world_bc1.geojson': () => import('../data/world_bc1.geojson?raw'),
  'world_200.geojson': () => import('../data/world_200.geojson?raw'),
  'world_400.geojson': () => import('../data/world_400.geojson?raw'),
  'world_600.geojson': () => import('../data/world_600.geojson?raw'),
  'world_800.geojson': () => import('../data/world_800.geojson?raw'),
  'world_1000.geojson': () => import('../data/world_1000.geojson?raw'),
  'world_1200.geojson': () => import('../data/world_1200.geojson?raw'),
  'world_1400.geojson': () => import('../data/world_1400.geojson?raw'),
  'world_1700.geojson': () => import('../data/world_1700.geojson?raw'),
  'world_1800.geojson': () => import('../data/world_1800.geojson?raw'),
  'world_1880.geojson': () => import('../data/world_1880.geojson?raw'),
  'world_1914.geojson': () => import('../data/world_1914.geojson?raw'),
  'world_1920.geojson': () => import('../data/world_1920.geojson?raw'),
  'world_1938.geojson': () => import('../data/world_1938.geojson?raw'),
  'world_1945.geojson': () => import('../data/world_1945.geojson?raw'),
  'world_1960.geojson': () => import('../data/world_1960.geojson?raw'),
  'world_1994.geojson': () => import('../data/world_1994.geojson?raw'),
  'world_2000.geojson': () => import('../data/world_2000.geojson?raw'),
  'ne_110m_admin_0_countries.json': () => import('../data/ne_110m_admin_0_countries.json?raw'),
};

export const getNearestSnapshot = (year) => {
  let nearest = BORDER_SNAPSHOTS[0];
  for (const snapshot of BORDER_SNAPSHOTS) {
    if (snapshot.year <= year) {
      nearest = snapshot;
    } else {
      break;
    }
  }
  return nearest;
};

// Cache structure: cache[file] = geojson
const cache = {};
const cacheOrder = [];

const addToCache = (file, data) => {
  if (!cache[file]) {
    cache[file] = data;
    cacheOrder.push(file);
    
    // Keep only 3 files in memory at once (LRU eviction)
    if (cacheOrder.length > 3) {
      const evictedFile = cacheOrder.shift();
      delete cache[evictedFile];
    }
  }
};

export const loadBorders = async (year) => {
  const snapshot = getNearestSnapshot(year);
  if (cache[snapshot.file]) {
    return cache[snapshot.file];
  }
  
  const loadFn = loadFunctions[snapshot.file];
  if (!loadFn) {
    throw new Error(`No loader defined for snapshot file: ${snapshot.file}`);
  }

  const module = await loadFn();
  const rawData = module.default;
  const geojson = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  
  addToCache(snapshot.file, geojson);
  
  // Preload the next likely snapshot in the background
  preloadNextSnapshot(year);

  return geojson;
};

export const preloadNextSnapshot = (year) => {
  const currentIndex = BORDER_SNAPSHOTS.findIndex(s => s.year > year);
  if (currentIndex !== -1 && currentIndex < BORDER_SNAPSHOTS.length) {
    const nextSnapshot = BORDER_SNAPSHOTS[currentIndex];
    if (!cache[nextSnapshot.file]) {
      const loadFn = loadFunctions[nextSnapshot.file];
      if (loadFn) {
        // Load in background
        loadFn()
          .then(module => {
            const rawData = module.default;
            const geojson = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            addToCache(nextSnapshot.file, geojson);
          })
          .catch(err => {
            console.debug('Failed to preload next snapshot', err);
          });
      }
    }
  }
};
