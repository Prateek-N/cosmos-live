export interface HistoricalMilestone {
  id: string;
  label: string;
  date: Date;
  category: 'landing' | 'flyby' | 'orbit' | 'celestial';
  targetBodyId: string;
  targetBodyName: string;
  craft: string;
  agency: string;
  epochYear: number;
  highlightCoordinates?: string;
  description: string;
  significance: string;
  badgeColor: string;
}

export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    id: 'apollo-11',
    label: 'Apollo 11 Moon Landing',
    date: new Date('1969-07-20T20:17:40Z'),
    category: 'landing',
    targetBodyId: 'moon',
    targetBodyName: 'The Moon',
    craft: 'Eagle (LM-5) / Saturn V',
    agency: 'NASA',
    epochYear: 1969,
    highlightCoordinates: 'Mare Tranquillitatis (0.674° N, 23.473° E)',
    description: 'Neil Armstrong and Buzz Aldrin set foot on the lunar surface: "That\'s one small step for man, one giant leap for mankind."',
    significance: 'First humans to land on another celestial body, returning 21.5 kg of lunar soil.',
    badgeColor: '#fbbf24', // amber
  },
  {
    id: 'voyager-1-jupiter',
    label: 'Voyager 1 Jupiter Encounter',
    date: new Date('1979-03-05T12:05:00Z'),
    category: 'flyby',
    targetBodyId: 'jupiter',
    targetBodyName: 'Jupiter',
    craft: 'Voyager 1',
    agency: 'NASA / JPL',
    epochYear: 1979,
    highlightCoordinates: 'Closest approach @ 349,000 km',
    description: 'Voyager 1 passed closest to Jupiter, revealing active volcanic plumes on Io and a faint dust ring encircling Jupiter.',
    significance: 'First discovery of active cryovolcanism outside Earth and detailed imagery of the Great Red Spot.',
    badgeColor: '#f97316', // orange
  },
  {
    id: 'halleys-comet-1986',
    label: "Halley's Comet Perihelion Armada",
    date: new Date('1986-02-09T12:00:00Z'),
    category: 'celestial',
    targetBodyId: 'sun',
    targetBodyName: 'Sun / Inner Solar System',
    craft: 'Giotto, Vega 1 & 2',
    agency: 'ESA / Intercosmos / ISAS',
    epochYear: 1986,
    highlightCoordinates: 'Perihelion @ 0.586 AU',
    description: 'An international armada of robotic probes intercepted Halley\'s Comet, capturing the first close-up images of a cometary nucleus.',
    significance: 'Confirmed Fred Whipple\'s "dirty snowball" hypothesis and returned spectra of primitive carbonaceous material.',
    badgeColor: '#a855f7', // purple
  },
  {
    id: 'voyager-2-neptune',
    label: 'Voyager 2 Neptune Flyby',
    date: new Date('1989-08-25T03:56:00Z'),
    category: 'flyby',
    targetBodyId: 'neptune',
    targetBodyName: 'Neptune',
    craft: 'Voyager 2',
    agency: 'NASA / JPL',
    epochYear: 1989,
    highlightCoordinates: 'Closest approach @ 4,950 km above north pole',
    description: 'Voyager 2 became the first and only spacecraft to explore Neptune, discovering the Great Dark Spot, 6 new moons, and geysers on Triton.',
    significance: 'Marked the completion of the Grand Tour of the outer gas and ice giants.',
    badgeColor: '#38bdf8', // cyan/sky
  },
  {
    id: 'cassini-saturn',
    label: 'Cassini Saturn Orbit Insertion',
    date: new Date('2004-07-01T02:48:00Z'),
    category: 'orbit',
    targetBodyId: 'saturn',
    targetBodyName: 'Saturn',
    craft: 'Cassini-Huygens',
    agency: 'NASA / ESA / ASI',
    epochYear: 2004,
    highlightCoordinates: 'Passed between Rings F and G',
    description: 'Cassini executed its main engine burn to slip between Saturn\'s razor-thin rings and enter orbit for a 13-year flagship campaign.',
    significance: 'Discovered global subsurface oceans on Enceladus with active water geysers and liquid methane seas on Titan.',
    badgeColor: '#eab308', // yellow
  },
  {
    id: 'curiosity-mars',
    label: 'Curiosity Sky Crane Touchdown',
    date: new Date('2012-08-06T05:17:57Z'),
    category: 'landing',
    targetBodyId: 'mars',
    targetBodyName: 'Mars',
    craft: 'Curiosity (MSL)',
    agency: 'NASA / JPL',
    epochYear: 2012,
    highlightCoordinates: 'Gale Crater (4.5895° S, 137.4417° E)',
    description: 'In the thrilling "Seven Minutes of Terror", a rocket-powered sky crane lowered the 1-ton rover onto the Martian floor.',
    significance: 'Confirmed that ancient Mars possessed freshwater lakes and chemical ingredients capable of supporting microbial life.',
    badgeColor: '#ef4444', // red
  },
  {
    id: 'new-horizons-pluto',
    label: 'New Horizons Pluto Flyby',
    date: new Date('2015-07-14T11:49:57Z'),
    category: 'flyby',
    targetBodyId: 'pluto',
    targetBodyName: 'Pluto',
    craft: 'New Horizons',
    agency: 'NASA / JHUAPL',
    epochYear: 2015,
    highlightCoordinates: 'Closest approach @ 12,500 km',
    description: 'After a 9-year, 4.8-billion km voyage, New Horizons zipped past Pluto at 14 km/s, unveiling towering water-ice peaks and nitrogen glaciers.',
    significance: 'Transformed Pluto from an astronomical pixel into a dynamic, geologically active dwarf world with a nitrogen atmosphere.',
    badgeColor: '#ec4899', // pink
  },
  {
    id: 'perseverance-mars',
    label: 'Perseverance Rover & Ingenuity',
    date: new Date('2021-02-18T20:55:00Z'),
    category: 'landing',
    targetBodyId: 'mars',
    targetBodyName: 'Mars',
    craft: 'Perseverance & Ingenuity (Mars 2020)',
    agency: 'NASA / JPL',
    epochYear: 2021,
    highlightCoordinates: 'Jezero Crater (18.38° N, 77.58° E)',
    description: 'Perseverance touched down in an ancient river delta to collect core samples for future Mars Sample Return and deploy Ingenuity.',
    significance: 'Ingenuity achieved the first powered, controlled aerodynamic flight on another planet, logging 72 historic flights.',
    badgeColor: '#f87171', // light red
  },
  {
    id: 'jwst-l2',
    label: 'James Webb Space Telescope L2 Insertion',
    date: new Date('2022-01-24T19:00:00Z'),
    category: 'orbit',
    targetBodyId: 'earth',
    targetBodyName: 'Earth (Sun-Earth L2 Lagrange)',
    craft: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    epochYear: 2022,
    highlightCoordinates: 'Sun-Earth L2 Halo Orbit (~1.5M km from Earth)',
    description: 'JWST fired its thrusters for 297 seconds to slip into its permanent halo orbit around the Sun-Earth Second Lagrange Point.',
    significance: 'The premier deep-space observatory viewing the earliest galaxies formed 13.5 billion years ago.',
    badgeColor: '#6366f1', // indigo
  },
  {
    id: 'artemis-1',
    label: 'Artemis 1 Orion Deep Space Record',
    date: new Date('2022-11-25T21:52:00Z'),
    category: 'orbit',
    targetBodyId: 'moon',
    targetBodyName: 'The Moon',
    craft: 'Orion Spacecraft / SLS',
    agency: 'NASA / ESA',
    epochYear: 2022,
    highlightCoordinates: 'Distant Retrograde Orbit @ 432,210 km from Earth',
    description: 'Uncrewed Orion spacecraft shattered the distance record for a human-rated vehicle, traveling 432,210 km from Earth into deep retrograde lunar orbit.',
    significance: 'Proved the Space Launch System and Orion thermal heat shield for the upcoming Artemis crewed lunar return.',
    badgeColor: '#0ea5e9', // ocean sky
  },
  {
    id: 'eclipse-2024',
    label: 'Great North American Solar Eclipse',
    date: new Date('2024-04-08T18:17:18Z'),
    category: 'celestial',
    targetBodyId: 'earth',
    targetBodyName: 'Earth',
    craft: 'Natural Celestial Syzygy',
    agency: 'Solar System Dynamics',
    epochYear: 2024,
    highlightCoordinates: 'Totality Corridor from Mazatlán to Newfoundland',
    description: 'The Moon completely covered the Sun\'s disk for up to 4 minutes and 28 seconds during peak solar maximum activity.',
    significance: 'Observed by hundreds of millions, revealing spectacular pink coronal prominences and magnetic loops.',
    badgeColor: '#8b5cf6', // violet
  },
  {
    id: 'apophis-2029',
    label: 'Apophis Ultra-Close Earth Flyby',
    date: new Date('2029-04-13T21:46:00Z'),
    category: 'celestial',
    targetBodyId: 'earth',
    targetBodyName: 'Earth',
    craft: 'Asteroid 99942 Apophis',
    agency: 'Planetary Defense / OSIRIS-APEX',
    epochYear: 2029,
    highlightCoordinates: 'Perigee @ 31,600 km above Atlantic',
    description: 'The 340-meter asteroid Apophis will safely sweep closer than geostationary satellites, visible to the naked eye across Europe and Africa.',
    significance: 'Once-in-a-millennium close encounter allowing radar and spacecraft (OSIRIS-APEX) to study tidal distortion in real-time.',
    badgeColor: '#10b981', // emerald
  },
];
