// src/data/historicalEvents.js

export const HISTORICAL_EVENTS = [
  {
    year: -323,
    title: 'Death of Alexander the Great',
    description: 'The Macedonian Empire begins to fragment into the Diadochi kingdoms',
    type: 'political',
    region: [20.8, 38.9] // coordinates to fly to (optional)
  },
  {
    year: -27,
    title: 'Roman Empire Established',
    description: 'Augustus becomes the first Roman Emperor, beginning centuries of Roman dominance',
    type: 'political',
    region: [12.5, 41.9]
  },
  {
    year: 476,
    title: 'Fall of the Western Roman Empire',
    description: 'Romulus Augustulus is deposed, ending the Western Roman Empire',
    type: 'political',
    region: [12.5, 41.9]
  },
  {
    year: 622,
    title: 'Rise of Islam',
    description: 'The Hijra marks the beginning of the Islamic calendar and rapid expansion',
    type: 'cultural',
    region: [39.8, 21.4]
  },
  {
    year: 800,
    title: "Charlemagne's Empire",
    description: 'Charlemagne crowned Holy Roman Emperor, uniting much of Western Europe',
    type: 'political',
    region: [2.3, 48.8]
  },
  {
    year: 1206,
    title: 'Mongol Empire Founded',
    description: 'Genghis Khan unites the Mongol tribes, beginning the largest land empire in history',
    type: 'political',
    region: [106.9, 47.9]
  },
  {
    year: 1453,
    title: 'Fall of Constantinople',
    description: 'Ottoman Empire captures Constantinople, ending the Byzantine Empire',
    type: 'war',
    region: [28.9, 41.0]
  },
  {
    year: 1492,
    title: 'Columbus Reaches the Americas',
    description: 'European colonization of the Americas begins, reshaping the world',
    type: 'exploration',
    region: [-74.0, 40.7]
  },
  {
    year: 1776,
    title: 'American Independence',
    description: 'United States declares independence from Britain',
    type: 'political',
    region: [-77.0, 38.9]
  },
  {
    year: 1789,
    title: 'French Revolution',
    description: 'The French monarchy falls, reshaping European politics and borders',
    type: 'political',
    region: [2.3, 48.8]
  },
  {
    year: 1914,
    title: 'World War I Begins',
    description: 'The assassination of Archduke Franz Ferdinand triggers the Great War',
    type: 'war',
    region: [18.4, 43.8]
  },
  {
    year: 1918,
    title: 'World War I Ends',
    description: 'New nations emerge from the collapsed German, Austro-Hungarian and Ottoman empires',
    type: 'war',
    region: [13.4, 52.5]
  },
  {
    year: 1939,
    title: 'World War II Begins',
    description: 'Nazi Germany invades Poland, triggering the deadliest conflict in history',
    type: 'war',
    region: [21.0, 52.2]
  },
  {
    year: 1945,
    title: 'World War II Ends',
    description: 'The world is divided into Western and Soviet spheres of influence',
    type: 'war',
    region: [13.4, 52.5]
  },
  {
    year: 1947,
    title: 'Indian Independence & Partition',
    description: 'British India is partitioned into India and Pakistan',
    type: 'political',
    region: [77.2, 28.6]
  },
  {
    year: 1991,
    title: 'Soviet Union Dissolves',
    description: 'The USSR breaks into 15 independent nations including Russia, Ukraine and the Baltic states',
    type: 'political',
    region: [37.6, 55.7]
  },
  {
    year: 1992,
    title: 'Post-Soviet World',
    description: 'The Cold War era ends. New nations establish their borders across Eastern Europe and Central Asia',
    type: 'political',
    region: [37.6, 55.7]
  },
];

export const getEventForYear = (prevYear, currentYear) => {
  if (prevYear === currentYear) return null;
  return HISTORICAL_EVENTS.find(event =>
    (event.year > prevYear && event.year <= currentYear) ||
    (event.year < prevYear && event.year >= currentYear)
  ) || null;
};
