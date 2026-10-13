import type { CelestialBody } from '../types/solar';

export const CELESTIAL_BODIES: CelestialBody[] = [
  // --- STAR ---
  {
    id: 'sun',
    name: 'Sun',
    naifId: 10,
    type: 'star',
    color: '#ffcc33',
    secondaryColor: '#ff5500',
    glowColor: '#ffaa00',
    textureType: 'sun',
    hasAtmosphere: true,
    physical: {
      meanRadiusKm: 696340,
      massKg: 1.989e30,
      massEarthRelative: 333000,
      densityGcm3: 1.408,
      gravityMs2: 274.0,
      escapeVelocityKms: 617.7,
      rotationPeriodHours: 609.12, // ~25.38 days at equator
      axialTiltDeg: 7.25,
      meanTempC: 5505, // surface
      surfaceFeatures: ['Corona', 'Sunspots', 'Solar Flares', 'Photosphere', 'Chromosphere'],
      atmosphereComposition: [
        { gas: 'Hydrogen (H2)', percentage: 73.46 },
        { gas: 'Helium (He)', percentage: 24.85 },
        { gas: 'Oxygen & Carbon', percentage: 1.69 },
      ],
    },
    orbit: {
      semiMajorAxisAU: 0,
      eccentricity: 0,
      inclinationDeg: 0,
      orbitalPeriodDays: 0,
      orbitalSpeedKms: 0,
      perihelionAU: 0,
      aphelionAU: 0,
    },
    summary: 'The yellow dwarf star at the center of our Solar System, comprising 99.86% of the system\'s total mass. Its nuclear fusion fuels all planetary life and space weather.',
    funFacts: [
      'Over 1.3 million Earths could fit inside the Sun.',
      'The core generates energy equivalent to 100 billion hydrogen bombs exploding each second.',
      'Light takes approximately 8 minutes and 20 seconds to travel from the Sun to Earth.',
      'A solar flare can release the energy of millions of 100-megaton hydrogen bombs.'
    ],
    missions: [
      { name: 'Parker Solar Probe', agency: 'NASA', year: 2018, status: 'Active', description: 'Closest human spacecraft to the Sun, diving into the outer corona.' },
      { name: 'Solar Orbiter', agency: 'ESA/NASA', year: 2020, status: 'Active', description: 'Provides first high-res imagery of the Sun\'s polar regions.' },
      { name: 'SOHO', agency: 'ESA/NASA', year: 1995, status: 'Active', description: 'Continuously monitors solar wind and coronal mass ejections.' }
    ],
    tags: ['star', 'host', 'solar wind', 'fusion'],
    provenance: [
      { source: 'NASA Science Solar System', url: 'https://science.nasa.gov/sun/', lastUpdated: '2026-10-01' },
      { source: 'JPL Planetary Physical Parameters', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html', lastUpdated: '2026-09-15' }
    ]
  },

  // --- TERRESTRIAL PLANETS ---
  {
    id: 'mercury',
    name: 'Mercury',
    naifId: 199,
    type: 'planet',
    parentId: 'sun',
    color: '#a3a09a',
    secondaryColor: '#5c5852',
    textureType: 'rocky',
    physical: {
      meanRadiusKm: 2439.7,
      massKg: 3.3011e23,
      massEarthRelative: 0.055,
      densityGcm3: 5.427,
      gravityMs2: 3.7,
      escapeVelocityKms: 4.25,
      rotationPeriodHours: 1407.6, // 58.6 days
      axialTiltDeg: 0.034,
      meanTempC: 167,
      minTempC: -180,
      maxTempC: 430,
      surfaceFeatures: ['Caloris Basin', 'Discovery Rupes', 'Impact Craters', 'Polar Ice Pockets'],
      atmosphereComposition: [
        { gas: 'Oxygen', percentage: 42.0 },
        { gas: 'Sodium', percentage: 29.0 },
        { gas: 'Hydrogen', percentage: 22.0 },
        { gas: 'Helium', percentage: 6.0 },
        { gas: 'Potassium', percentage: 0.5 },
      ],
      atmosphericPressureKPa: 0.000000001,
    },
    orbit: {
      semiMajorAxisAU: 0.3871,
      eccentricity: 0.2056,
      inclinationDeg: 7.00,
      orbitalPeriodDays: 87.97,
      orbitalSpeedKms: 47.36,
      perihelionAU: 0.3075,
      aphelionAU: 0.4667,
    },
    summary: 'The smallest and innermost planet, enduring scorching days and freezing nights with a heavily cratered surface resembling our Moon.',
    funFacts: [
      'A year on Mercury is only 88 Earth days, but one solar day takes 176 Earth days!',
      'Despite proximity to the Sun, water ice exists deep within permanently shadowed polar craters.',
      'It has the highest orbital speed of any planet, racing at 47 km/s (105,000 mph).'
    ],
    missions: [
      { name: 'MESSENGER', agency: 'NASA', year: 2004, status: 'Past', description: 'First probe to orbit Mercury, mapping 100% of its volcanic terrain.' },
      { name: 'BepiColombo', agency: 'ESA/JAXA', year: 2018, status: 'Active', description: 'Dual orbiter studying magnetic fields and exosphere.' }
    ],
    tags: ['terrestrial', 'inner', 'extreme temperatures'],
    provenance: [
      { source: 'JPL Horizons Ephemeris', url: 'https://ssd-api.jpl.nasa.gov/doc/horizons.html', lastUpdated: '2026-10-01' },
      { source: 'NASA Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html', lastUpdated: '2026-09-01' }
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    naifId: 299,
    type: 'planet',
    parentId: 'sun',
    color: '#e3bb7b',
    secondaryColor: '#c28b38',
    glowColor: '#ffd79e',
    textureType: 'rocky',
    hasAtmosphere: true,
    hasClouds: true,
    physical: {
      meanRadiusKm: 6051.8,
      massKg: 4.8675e24,
      massEarthRelative: 0.815,
      densityGcm3: 5.243,
      gravityMs2: 8.87,
      escapeVelocityKms: 10.36,
      rotationPeriodHours: -5832.5, // Retrograde rotation! 243 days
      axialTiltDeg: 177.36,
      meanTempC: 464,
      surfaceFeatures: ['Maxwell Montes', 'Aphrodite Terra', 'Maat Mons Volcano', 'Pancake Domes'],
      atmosphereComposition: [
        { gas: 'Carbon Dioxide (CO2)', percentage: 96.5 },
        { gas: 'Nitrogen (N2)', percentage: 3.5 },
        { gas: 'Sulfur Dioxide (SO2)', percentage: 0.015 },
      ],
      atmosphericPressureKPa: 9200, // 92 bar!
    },
    orbit: {
      semiMajorAxisAU: 0.7233,
      eccentricity: 0.0067,
      inclinationDeg: 3.39,
      orbitalPeriodDays: 224.7,
      orbitalSpeedKms: 35.02,
      perihelionAU: 0.7184,
      aphelionAU: 0.7282,
    },
    summary: 'Earth\'s "evil twin", enveloped in thick sulfuric acid clouds with a runaway greenhouse effect making it the hottest planet in the Solar System.',
    funFacts: [
      'Venus rotates backwards compared to most planets; on Venus, the Sun rises in the west and sets in the east.',
      'Surface atmospheric pressure is equivalent to being 900 meters (3,000 ft) underwater on Earth.',
      'It is the brightest natural object in Earth\'s night sky after the Moon, often called the Morning Star.'
    ],
    missions: [
      { name: 'Venera 13', agency: 'USSR', year: 1981, status: 'Past', description: 'Transmitted the first color surface photos and survived 127 minutes in extreme heat.' },
      { name: 'Magellan', agency: 'NASA', year: 1989, status: 'Past', description: 'Radar-mapped 98% of the surface beneath cloud layers.' },
      { name: 'DAVINCI+', agency: 'NASA', year: 2029, status: 'Planned', description: 'Atmospheric descent probe to sample noble gases and analyze clouds.' }
    ],
    tags: ['terrestrial', 'greenhouse', 'sulfur clouds', 'retrograde'],
    provenance: [
      { source: 'NASA Science Venus', url: 'https://science.nasa.gov/venus/', lastUpdated: '2026-10-01' },
      { source: 'JPL Planetary Parameters', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html', lastUpdated: '2026-09-20' }
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    naifId: 399,
    type: 'planet',
    parentId: 'sun',
    color: '#2980b9',
    secondaryColor: '#27ae60',
    glowColor: '#5dade2',
    textureType: 'earth',
    hasAtmosphere: true,
    hasClouds: true,
    physical: {
      meanRadiusKm: 6371.0,
      massKg: 5.9722e24,
      massEarthRelative: 1.0,
      densityGcm3: 5.514,
      gravityMs2: 9.807,
      escapeVelocityKms: 11.186,
      rotationPeriodHours: 23.934,
      axialTiltDeg: 23.44,
      meanTempC: 15,
      minTempC: -89.2,
      maxTempC: 56.7,
      surfaceFeatures: ['Pacific Ocean', 'Himalayas', 'Mariana Trench', 'Amazon Basin', 'Atmospheric Aurora'],
      atmosphereComposition: [
        { gas: 'Nitrogen (N2)', percentage: 78.08 },
        { gas: 'Oxygen (O2)', percentage: 20.95 },
        { gas: 'Argon (Ar)', percentage: 0.93 },
        { gas: 'Carbon Dioxide (CO2)', percentage: 0.04 },
      ],
      atmosphericPressureKPa: 101.325,
    },
    orbit: {
      semiMajorAxisAU: 1.0000,
      eccentricity: 0.0167,
      inclinationDeg: 0.000,
      orbitalPeriodDays: 365.256,
      orbitalSpeedKms: 29.78,
      perihelionAU: 0.9833,
      aphelionAU: 1.0167,
    },
    summary: 'The only known astronomical body harboring life, dynamic oceans, active plate tectonics, and a protective magnetosphere.',
    funFacts: [
      'Earth is the only planet not named after a Greek or Roman deity.',
      'Oceans cover about 70.8% of the surface, with an average depth of 3,688 meters.',
      'Earth\'s magnetic shield deflects harsh solar particles, producing breathtaking polar auroras.'
    ],
    missions: [
      { name: 'International Space Station (ISS)', agency: 'Multinational', year: 1998, status: 'Active', description: 'Continuously inhabited orbital research laboratory.' },
      { name: 'Landsat 9', agency: 'NASA/USGS', year: 2021, status: 'Active', description: 'Global multispectral Earth imaging observatory.' },
      { name: 'Sentinel-6', agency: 'ESA/NASA', year: 2020, status: 'Active', description: 'Precision radar altimetry tracking sea level rise.' }
    ],
    tags: ['terrestrial', 'habitable', 'oceans', 'life', 'magnetosphere'],
    provenance: [
      { source: 'NASA Earth Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', lastUpdated: '2026-10-01' },
      { source: 'USGS Astrogeology', url: 'https://astrogeology.usgs.gov/', lastUpdated: '2026-09-10' }
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    naifId: 499,
    type: 'planet',
    parentId: 'sun',
    color: '#c0392b',
    secondaryColor: '#d35400',
    glowColor: '#e74c3c',
    textureType: 'mars',
    hasAtmosphere: true,
    physical: {
      meanRadiusKm: 3389.5,
      massKg: 6.4171e23,
      massEarthRelative: 0.107,
      densityGcm3: 3.933,
      gravityMs2: 3.72,
      escapeVelocityKms: 5.03,
      rotationPeriodHours: 24.623, // 1 sol
      axialTiltDeg: 25.19,
      meanTempC: -63,
      minTempC: -140,
      maxTempC: 20,
      surfaceFeatures: ['Olympus Mons', 'Valles Marineris', 'Gale Crater', 'Jezero Crater', 'Polar Ice Caps'],
      atmosphereComposition: [
        { gas: 'Carbon Dioxide (CO2)', percentage: 95.32 },
        { gas: 'Nitrogen (N2)', percentage: 2.6 },
        { gas: 'Argon (Ar)', percentage: 1.9 },
        { gas: 'Oxygen & Water Vapor', percentage: 0.18 },
      ],
      atmosphericPressureKPa: 0.61, // ~0.6% of Earth
    },
    orbit: {
      semiMajorAxisAU: 1.5237,
      eccentricity: 0.0934,
      inclinationDeg: 1.85,
      orbitalPeriodDays: 686.98,
      orbitalSpeedKms: 24.07,
      perihelionAU: 1.3814,
      aphelionAU: 1.6660,
    },
    summary: 'The Red Planet, home to the solar system\'s highest volcano (Olympus Mons) and vast canyon systems with ancient evidence of flowing water.',
    funFacts: [
      'Olympus Mons is 22 km (13.6 miles) high — nearly triple the height of Mount Everest.',
      'Valles Marineris is over 4,000 km long, 200 km wide and up to 7 km deep, stretching across the entire width of the US.',
      'Sunsets on Mars appear blue due to dust particles scattering light in its thin atmosphere.'
    ],
    missions: [
      { name: 'Perseverance & Ingenuity', agency: 'NASA', year: 2020, status: 'Active', description: 'Collecting biosignature core samples in Jezero Crater; first powered flight on another planet.' },
      { name: 'Curiosity', agency: 'NASA', year: 2011, status: 'Active', description: 'Investigating ancient habitability in Gale Crater.' },
      { name: 'Hope Probe (Emirates)', agency: 'UAESA', year: 2020, status: 'Active', description: 'Studying diurnal atmospheric dynamics and loss mechanisms.' }
    ],
    tags: ['terrestrial', 'red planet', 'rovers', 'canyons', 'volcanoes'],
    provenance: [
      { source: 'NASA Mars Exploration', url: 'https://mars.nasa.gov/', lastUpdated: '2026-10-01' },
      { source: 'JPL Planetary Physical Parameters', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html', lastUpdated: '2026-09-01' }
    ]
  },

  // --- GAS & ICE GIANTS ---
  {
    id: 'jupiter',
    name: 'Jupiter',
    naifId: 599,
    type: 'planet',
    parentId: 'sun',
    color: '#d4a373',
    secondaryColor: '#bc6c25',
    glowColor: '#e09f3e',
    textureType: 'gas_giant',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadiusAU: 0.0008,
    ringOuterRadiusAU: 0.0015,
    ringColors: ['rgba(180, 140, 100, 0.25)', 'rgba(120, 90, 60, 0.05)'],
    physical: {
      meanRadiusKm: 69911,
      massKg: 1.8982e27,
      massEarthRelative: 317.8,
      densityGcm3: 1.326,
      gravityMs2: 24.79,
      escapeVelocityKms: 59.5,
      rotationPeriodHours: 9.93, // Fast spinner!
      axialTiltDeg: 3.13,
      meanTempC: -110,
      surfaceFeatures: ['Great Red Spot', 'Equatorial Belts', 'Ammonia Ice Clouds', 'Powerful Auroras'],
      atmosphereComposition: [
        { gas: 'Hydrogen (H2)', percentage: 89.8 },
        { gas: 'Helium (He)', percentage: 10.2 },
        { gas: 'Methane & Ammonia', percentage: 0.3 },
      ],
    },
    orbit: {
      semiMajorAxisAU: 5.2044,
      eccentricity: 0.0489,
      inclinationDeg: 1.304,
      orbitalPeriodDays: 4332.59,
      orbitalSpeedKms: 13.07,
      perihelionAU: 4.9501,
      aphelionAU: 5.4588,
    },
    summary: 'The king of planets, with more mass than all other planets combined. Acts as a cosmic gravitational shield deflecting comets away from inner worlds.',
    funFacts: [
      'The Great Red Spot is a persistent anticyclonic storm larger than Earth that has raged for over 350 years.',
      'Jupiter rotates faster than any other planet: a full day takes under 10 hours.',
      'It possesses a colossal magnetosphere extending past Saturn\'s orbit.'
    ],
    missions: [
      { name: 'Juno', agency: 'NASA', year: 2011, status: 'Active', description: 'Investigating deep atmospheric structure, gravity fields, and auroral magnetosphere.' },
      { name: 'Galileo', agency: 'NASA', year: 1989, status: 'Past', description: 'First dedicated Jupiter orbiter; deployed atmospheric parachute probe.' },
      { name: 'JUICE', agency: 'ESA', year: 2023, status: 'Active', description: 'Cruising to study ocean-bearing icy moons Ganymede, Europa, and Callisto.' },
      { name: 'Europa Clipper', agency: 'NASA', year: 2024, status: 'Active', description: 'Heading to perform dozens of close Europa flybys to analyze subsurface oceans.' }
    ],
    tags: ['gas giant', 'great red spot', 'radiation belts', 'massive'],
    provenance: [
      { source: 'NASA Science Jupiter', url: 'https://science.nasa.gov/jupiter/', lastUpdated: '2026-10-01' },
      { source: 'JPL SSD Parameters', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html', lastUpdated: '2026-09-01' }
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    naifId: 699,
    type: 'planet',
    parentId: 'sun',
    color: '#e2ca76',
    secondaryColor: '#ab9353',
    glowColor: '#e9d8a6',
    textureType: 'ringed_giant',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadiusAU: 0.00045,
    ringOuterRadiusAU: 0.00095,
    ringColors: ['rgba(220, 200, 150, 0.85)', 'rgba(160, 140, 90, 0.2)'],
    physical: {
      meanRadiusKm: 58232,
      massKg: 5.6834e26,
      massEarthRelative: 95.16,
      densityGcm3: 0.687, // Less dense than water!
      gravityMs2: 10.44,
      escapeVelocityKms: 35.5,
      rotationPeriodHours: 10.66,
      axialTiltDeg: 26.73,
      meanTempC: -140,
      surfaceFeatures: ['Spectacular Ring System', 'North Polar Hexagon', 'Cassini Division', 'Atmospheric Banding'],
      atmosphereComposition: [
        { gas: 'Hydrogen (H2)', percentage: 96.3 },
        { gas: 'Helium (He)', percentage: 3.25 },
        { gas: 'Methane (CH4)', percentage: 0.45 },
      ],
    },
    orbit: {
      semiMajorAxisAU: 9.5826,
      eccentricity: 0.0565,
      inclinationDeg: 2.485,
      orbitalPeriodDays: 10759.22,
      orbitalSpeedKms: 9.68,
      perihelionAU: 9.0412,
      aphelionAU: 10.1238,
    },
    summary: 'Adorned by an iconic ring system made of billions of icy particles, Saturn is a gas giant with density so low it would float in a giant ocean.',
    funFacts: [
      'Saturn\'s rings span up to 282,000 km across, yet are remarkably paper-thin (typically only 10 to 30 meters thick!).',
      'The mysterious hexagon storm at Saturn\'s north pole has sides longer than Earth\'s diameter.',
      'It has 146 confirmed moons, more than any other planet in the Solar System.'
    ],
    missions: [
      { name: 'Cassini-Huygens', agency: 'NASA/ESA', year: 1997, status: 'Past', description: '13-year tour of Saturn, its rings, and landed Huygens probe on Titan.' },
      { name: 'Voyager 1 & 2', agency: 'NASA', year: 1977, status: 'Past', description: 'Revealed intricate ring structures and spoke dynamics during flybys.' },
      { name: 'Dragonfly', agency: 'NASA', year: 2028, status: 'Planned', description: 'Rotorcraft lander mission to explore organic chemistry on moon Titan.' }
    ],
    tags: ['gas giant', 'rings', 'hexagon', 'titan', 'floating planet'],
    provenance: [
      { source: 'NASA Science Saturn', url: 'https://science.nasa.gov/saturn/', lastUpdated: '2026-10-01' },
      { source: 'JPL Cassini Archive', url: 'https://science.nasa.gov/mission/cassini/', lastUpdated: '2026-08-15' }
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    naifId: 799,
    type: 'planet',
    parentId: 'sun',
    color: '#70d6ff',
    secondaryColor: '#4ea8de',
    glowColor: '#a0e7e5',
    textureType: 'ice_giant',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadiusAU: 0.00025,
    ringOuterRadiusAU: 0.00035,
    ringColors: ['rgba(100, 180, 220, 0.4)', 'rgba(50, 100, 150, 0.1)'],
    physical: {
      meanRadiusKm: 25362,
      massKg: 8.6810e25,
      massEarthRelative: 14.54,
      densityGcm3: 1.27,
      gravityMs2: 8.69,
      escapeVelocityKms: 21.3,
      rotationPeriodHours: -17.24, // Retrograde & tilted on side
      axialTiltDeg: 97.77, // Rotates on its side!
      meanTempC: -195,
      minTempC: -224, // Coldest planetary atmosphere
      surfaceFeatures: ['Methane Haze Bands', 'Collisional Ring System', 'Tilted Magnetosphere', 'Extreme Seasonal Shifts'],
      atmosphereComposition: [
        { gas: 'Hydrogen (H2)', percentage: 82.5 },
        { gas: 'Helium (He)', percentage: 15.2 },
        { gas: 'Methane (CH4)', percentage: 2.3 },
      ],
    },
    orbit: {
      semiMajorAxisAU: 19.2184,
      eccentricity: 0.0463,
      inclinationDeg: 0.773,
      orbitalPeriodDays: 30685.4,
      orbitalSpeedKms: 6.80,
      perihelionAU: 18.33,
      aphelionAU: 20.11,
    },
    summary: 'The tilted ice giant orbiting virtually on its side at an extreme 98° axial tilt, enveloped in pale aquamarine methane clouds.',
    funFacts: [
      'Because of its extreme 97.8° axial tilt, its poles experience 42 years of continuous sunlight followed by 42 years of complete darkness.',
      'Uranus holds the record for the coldest recorded atmospheric temperature in the Solar System at -224°C (-371°F).',
      'Its 27 known moons are uniquely named after characters from William Shakespeare and Alexander Pope.'
    ],
    missions: [
      { name: 'Voyager 2', agency: 'NASA', year: 1986, status: 'Past', description: 'Only probe ever to visit Uranus, discovering 10 new moons and 2 new rings.' }
    ],
    tags: ['ice giant', 'extreme tilt', 'methane', 'coldest'],
    provenance: [
      { source: 'NASA Uranus Fact Sheet', url: 'https://science.nasa.gov/uranus/', lastUpdated: '2026-10-01' },
      { source: 'JPL Planetary Physical Parameters', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html', lastUpdated: '2026-09-01' }
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    naifId: 899,
    type: 'planet',
    parentId: 'sun',
    color: '#3a86ff',
    secondaryColor: '#1d3557',
    glowColor: '#4361ee',
    textureType: 'ice_giant',
    hasAtmosphere: true,
    hasRings: true,
    ringInnerRadiusAU: 0.0003,
    ringOuterRadiusAU: 0.00045,
    ringColors: ['rgba(60, 100, 200, 0.3)', 'rgba(30, 50, 100, 0.05)'],
    physical: {
      meanRadiusKm: 24622,
      massKg: 1.0241e26,
      massEarthRelative: 17.15,
      densityGcm3: 1.638,
      gravityMs2: 11.15,
      escapeVelocityKms: 23.5,
      rotationPeriodHours: 16.11,
      axialTiltDeg: 28.32,
      meanTempC: -201,
      surfaceFeatures: ['Great Dark Spot', 'High-Altitude Cirrus Clouds', 'Supersonic Jet Streams', 'Clumpy Ring Arcs'],
      atmosphereComposition: [
        { gas: 'Hydrogen (H2)', percentage: 80.0 },
        { gas: 'Helium (He)', percentage: 19.0 },
        { gas: 'Methane (CH4)', percentage: 1.5 },
      ],
    },
    orbit: {
      semiMajorAxisAU: 30.0700,
      eccentricity: 0.0086,
      inclinationDeg: 1.770,
      orbitalPeriodDays: 60190.0, // ~164.8 Earth years!
      orbitalSpeedKms: 5.43,
      perihelionAU: 29.81,
      aphelionAU: 30.33,
    },
    summary: 'The windy, deep-blue sentinel of the planetary realm, whipped by supersonic storms exceeding 2,100 km/h (1,300 mph).',
    funFacts: [
      'Neptune was the first planet located via mathematical prediction before it was directly observed through a telescope.',
      'Winds on Neptune are the fastest in the Solar System, breaking the sound barrier at over 2,100 km/h.',
      'Since its discovery in 1846, Neptune completed its first full orbit in 2011!'
    ],
    missions: [
      { name: 'Voyager 2', agency: 'NASA', year: 1989, status: 'Past', description: 'Discovered the Great Dark Spot, active geysers on Triton, and Neptune\'s faint rings.' }
    ],
    tags: ['ice giant', 'supersonic winds', 'outer planet', 'triton'],
    provenance: [
      { source: 'NASA Science Neptune', url: 'https://science.nasa.gov/neptune/', lastUpdated: '2026-10-01' },
      { source: 'JPL Planetary Parameters', url: 'https://ssd.jpl.nasa.gov/planets/phys_par.html', lastUpdated: '2026-09-01' }
    ]
  },

  // --- DWARF PLANETS ---
  {
    id: 'pluto',
    name: 'Pluto',
    designation: '134340 Pluto',
    naifId: 999,
    type: 'dwarf_planet',
    parentId: 'sun',
    color: '#d4a373',
    secondaryColor: '#9c6644',
    textureType: 'rocky',
    hasAtmosphere: true,
    physical: {
      meanRadiusKm: 1188.3,
      massKg: 1.303e22,
      massEarthRelative: 0.0022,
      densityGcm3: 1.854,
      gravityMs2: 0.62,
      escapeVelocityKms: 1.21,
      rotationPeriodHours: -153.29, // 6.38 days retrograde
      axialTiltDeg: 122.53,
      meanTempC: -229,
      surfaceFeatures: ['Sputnik Planitia (Heart)', 'Cthulhu Macula', 'Water Ice Mountains', 'Methane Dunes'],
      atmosphereComposition: [
        { gas: 'Nitrogen (N2)', percentage: 99.0 },
        { gas: 'Methane (CH4)', percentage: 0.5 },
        { gas: 'Carbon Monoxide (CO)', percentage: 0.5 },
      ],
      atmosphericPressureKPa: 0.001,
    },
    orbit: {
      semiMajorAxisAU: 39.482,
      eccentricity: 0.2488,
      inclinationDeg: 17.16,
      orbitalPeriodDays: 90560.0, // 248 years
      orbitalSpeedKms: 4.74,
      perihelionAU: 29.66,
      aphelionAU: 49.31,
    },
    summary: 'The beloved Kuiper Belt dwarf planet featuring towering water ice glaciers and Sputnik Planitia, a bright nitrogen ice heart.',
    funFacts: [
      'Pluto and its largest moon Charon form a binary system; they are tidally locked face-to-face forever.',
      'Pluto has a highly eccentric orbit that brings it closer to the Sun than Neptune for 20 years out of every 248-year journey.',
      'Mountains on Pluto are made of water ice so frozen and hard it behaves like rock.'
    ],
    missions: [
      { name: 'New Horizons', agency: 'NASA', year: 2006, status: 'Past', description: 'Historic 2015 flyby capturing iconic high-resolution images of Pluto\'s heart and mountains.' }
    ],
    tags: ['dwarf planet', 'kuiper belt', 'sputnik planitia', 'charon'],
    provenance: [
      { source: 'NASA Science Pluto', url: 'https://science.nasa.gov/dwarf-planets/pluto/', lastUpdated: '2026-10-01' },
      { source: 'JPL Small-Body Database', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=Pluto', lastUpdated: '2026-09-01' }
    ]
  },
  {
    id: 'ceres',
    name: 'Ceres',
    designation: '1 Ceres',
    naifId: 2000001,
    type: 'dwarf_planet',
    parentId: 'sun',
    color: '#8d99ae',
    secondaryColor: '#4a4e69',
    textureType: 'rocky',
    physical: {
      meanRadiusKm: 469.7,
      massKg: 9.3835e20,
      massEarthRelative: 0.00016,
      densityGcm3: 2.161,
      gravityMs2: 0.28,
      escapeVelocityKms: 0.51,
      rotationPeriodHours: 9.07,
      axialTiltDeg: 4.0,
      meanTempC: -106,
      surfaceFeatures: ['Occator Crater (Bright Spots)', 'Ahuna Mons Cryovolcano', 'Carbonate Deposits'],
    },
    orbit: {
      semiMajorAxisAU: 2.767,
      eccentricity: 0.0758,
      inclinationDeg: 10.59,
      orbitalPeriodDays: 1682.0,
      orbitalSpeedKms: 17.88,
      perihelionAU: 2.557,
      aphelionAU: 2.977,
    },
    summary: 'The largest object in the main asteroid belt between Mars and Jupiter, containing roughly one-third of the asteroid belt\'s total mass and evidence of subsurface brine.',
    funFacts: [
      'Ceres is classified as both a dwarf planet and the largest asteroid.',
      'The glowing bright spots inside Occator crater are sodium carbonate salt deposits left by evaporated subsurface brine.',
      'Ahuna Mons is an ice volcano that erupted slushy mud and salts.'
    ],
    missions: [
      { name: 'Dawn', agency: 'NASA', year: 2007, status: 'Past', description: 'Orbited both asteroid Vesta and dwarf planet Ceres.' }
    ],
    tags: ['dwarf planet', 'asteroid belt', 'bright spots', 'cryovolcano'],
    provenance: [
      { source: 'NASA Science Ceres', url: 'https://science.nasa.gov/dwarf-planets/ceres/', lastUpdated: '2026-10-01' }
    ]
  },

  // --- MAJOR MOONS ---
  {
    id: 'moon',
    name: 'Moon',
    naifId: 301,
    type: 'moon',
    parentId: 'earth',
    color: '#d6d6d6',
    secondaryColor: '#8c8c8c',
    textureType: 'moon',
    physical: {
      meanRadiusKm: 1737.4,
      massKg: 7.342e22,
      massEarthRelative: 0.0123,
      densityGcm3: 3.344,
      gravityMs2: 1.62,
      escapeVelocityKms: 2.38,
      rotationPeriodHours: 655.7, // Tidally locked (27.32 days)
      axialTiltDeg: 1.54,
      meanTempC: -20,
      minTempC: -246, // Coldest PSRs (Hermite crater)
      maxTempC: 120, // Subsolar lunar midday
      surfaceFeatures: [
        'Mare Tranquillitatis',
        'Oceanus Procellarum',
        'Mare Imbrium',
        'Tycho Crater',
        'Copernicus Crater',
        'South Pole–Aitken Basin',
        'Shackleton Crater',
        'Hadley Rille',
        'Reiner Gamma Swirl',
      ],
      atmosphereComposition: [
        { gas: 'Helium (He)', percentage: 40.0 },
        { gas: 'Neon (Ne)', percentage: 40.0 },
        { gas: 'Hydrogen (H2)', percentage: 10.0 },
        { gas: 'Argon-40 (Ar)', percentage: 7.0 },
        { gas: 'Methane & Ammonia', percentage: 3.0 },
      ],
      atmosphericPressureKPa: 0.0000000000003, // Surface boundary exosphere
    },
    orbit: {
      semiMajorAxisAU: 0.00257, // ~384,400 km
      eccentricity: 0.0549,
      inclinationDeg: 5.14,
      orbitalPeriodDays: 27.322,
      orbitalSpeedKms: 1.022,
      perihelionAU: 0.00243,
      aphelionAU: 0.00271,
      parentBodyId: 'earth'
    },
    summary: 'Earth\'s sole natural satellite, formed 4.5 billion years ago in a giant impact between proto-Earth and Mars-sized Theia. Tidally locked to Earth, stabilizing our planet\'s rotational axis and driving global ocean tides.',
    funFacts: [
      'The Moon is tidally locked to Earth; we only ever see one side (~59% over time via orbital libration wobble).',
      'Laser retroreflectors placed by Apollo 11, 14, 15 and Lunokhod 1 & 2 still measure Earth-Moon distance to millimeter precision daily.',
      'The Moon is slowly drifting away from Earth at a rate of 3.8 cm (1.5 inches) per year due to tidal friction.',
      'Temperatures in permanently shadowed polar craters like Hermite drop to -246°C (27 K), colder than the surface of Pluto.',
      'Apollo seismometers recorded over 12,000 moonquakes, proving deep quakes are triggered by Earth\'s tidal gravity at perigee.',
      'China\'s Chang\'e 4 made the first far-side landing in 2019, and Chang\'e 6 returned the first far-side samples to Earth in June 2024.'
    ],
    missions: [
      { name: 'Apollo Program', agency: 'NASA', year: 1969, status: 'Past', description: 'Six crewed landings (Apollo 11–17), landing 12 humans and returning 382 kg of lunar samples.' },
      { name: 'Soviet Luna Program', agency: 'Soviet Union', year: 1966, status: 'Past', description: 'First soft landing (Luna 9), first robotic rover (Lunokhod 1), and first robotic sample returns (Luna 16, 20, 24).' },
      { name: 'Chang\'e Program', agency: 'CNSA', year: 2013, status: 'Active', description: 'First far-side landing (Chang\'e 4), and sample returns from both near side (Chang\'e 5) and far side (Chang\'e 6).' },
      { name: 'Chandrayaan-3', agency: 'ISRO', year: 2023, status: 'Past', description: 'First successful landing in the Lunar South Polar region, confirming sulfur and steep regolith thermal gradients.' },
      { name: 'SLIM "Moon Sniper"', agency: 'JAXA', year: 2024, status: 'Past', description: 'Pinpoint landing within 55m of target at Shioli Crater, deploying LEV-1 and transformable LEV-2 SORA-Q rover.' },
      { name: 'Artemis Program', agency: 'NASA / International', year: 2024, status: 'Active', description: 'Humanity\'s return to the Moon, targeting the South Pole for sustainable long-term exploration and Lunar Gateway.' },
      { name: 'Lunar Reconnaissance Orbiter', agency: 'NASA', year: 2009, status: 'Active', description: 'High-resolution global topography, radar, and thermal mapping of the Moon for over 15 years.' }
    ],
    tags: ['moon', 'earth', 'apollo', 'artemis', 'tides', 'craters', 'regolith', 'water ice'],
    provenance: [
      { source: 'NASA Lunar Science', url: 'https://moon.nasa.gov/', lastUpdated: '2026-10-01' },
      { source: 'LRO Science Mission Directorate', url: 'https://lunar.gsfc.nasa.gov/', lastUpdated: '2026-09-15' }
    ]
  },
  {
    id: 'europa',
    name: 'Europa',
    naifId: 502,
    type: 'moon',
    parentId: 'jupiter',
    color: '#e0d6c3',
    secondaryColor: '#a67c52',
    textureType: 'rocky',
    physical: {
      meanRadiusKm: 1560.8,
      massKg: 4.8e22,
      densityGcm3: 3.013,
      gravityMs2: 1.315,
      escapeVelocityKms: 2.025,
      rotationPeriodHours: 85.2,
      axialTiltDeg: 0.1,
      meanTempC: -160,
      surfaceFeatures: ['Lineae (Red Cracks)', 'Chaos Terrain', 'Smooth Ice Crust', 'Subsurface Salty Ocean'],
    },
    orbit: {
      semiMajorAxisAU: 0.00448, // ~670,900 km from Jupiter
      eccentricity: 0.009,
      inclinationDeg: 0.47,
      orbitalPeriodDays: 3.551,
      orbitalSpeedKms: 13.74,
      perihelionAU: 0.00444,
      aphelionAU: 0.00452,
      parentBodyId: 'jupiter'
    },
    summary: 'A pristine ice-covered moon concealing a global liquid saltwater ocean underneath containing more water than all of Earth\'s oceans combined.',
    funFacts: [
      'Europa has the smoothest surface of any solid body in the Solar System, lacking high mountains or deep craters.',
      'Tidal flexing from Jupiter keeps its subterranean ocean warm and liquid.',
      'It is one of the top candidates in our solar system for discovering extraterrestrial microbial life.'
    ],
    missions: [
      { name: 'Europa Clipper', agency: 'NASA', year: 2024, status: 'Active', description: 'Flagship mission to assess habitability through close orbital passes.' },
      { name: 'Galileo Orbiter', agency: 'NASA', year: 1995, status: 'Past', description: 'Discovered induced magnetic field proving a salty subsurface ocean.' }
    ],
    tags: ['moon', 'jupiter', 'ocean world', 'astrobiology', 'ice crust'],
    provenance: [
      { source: 'NASA Science Europa', url: 'https://science.nasa.gov/jupiter/moons/europa/', lastUpdated: '2026-10-01' }
    ]
  },
  {
    id: 'titan',
    name: 'Titan',
    naifId: 606,
    type: 'moon',
    parentId: 'saturn',
    color: '#e09f3e',
    secondaryColor: '#bc6c25',
    textureType: 'gas_giant',
    hasAtmosphere: true,
    hasClouds: true,
    physical: {
      meanRadiusKm: 2574.7,
      massKg: 1.3452e23,
      massEarthRelative: 0.0225,
      densityGcm3: 1.88,
      gravityMs2: 1.352,
      escapeVelocityKms: 2.64,
      rotationPeriodHours: 382.7,
      axialTiltDeg: 0,
      meanTempC: -179,
      surfaceFeatures: ['Kraken Mare (Methane Sea)', 'Dune Fields', 'Liquid Hydrocarbon Rivers', 'Tholin Haze'],
      atmosphereComposition: [
        { gas: 'Nitrogen (N2)', percentage: 95.0 },
        { gas: 'Methane (CH4)', percentage: 4.9 },
        { gas: 'Hydrogen & Organics', percentage: 0.1 },
      ],
      atmosphericPressureKPa: 146.7, // 1.45 atm
    },
    orbit: {
      semiMajorAxisAU: 0.00817, // ~1.22 million km from Saturn
      eccentricity: 0.0288,
      inclinationDeg: 0.35,
      orbitalPeriodDays: 15.945,
      orbitalSpeedKms: 5.57,
      perihelionAU: 0.00793,
      aphelionAU: 0.00841,
      parentBodyId: 'saturn'
    },
    summary: 'The only moon with a dense atmosphere and stable surface liquids (seas and lakes of liquid methane and ethane).',
    funFacts: [
      'Titan is larger than planet Mercury and 50% wider than Earth\'s Moon.',
      'Surface atmospheric density is so high and gravity so low that a human could strap on artificial wings and fly like a bird!',
      'Methane on Titan plays the exact same role as water on Earth: it clouds, rains, cuts rivers, and collects in lakes.'
    ],
    missions: [
      { name: 'Huygens Probe', agency: 'ESA', year: 2005, status: 'Past', description: 'First landing in the outer solar system, photographing rounded ice pebbles.' },
      { name: 'Dragonfly', agency: 'NASA', year: 2028, status: 'Planned', description: 'Autonomous octocopter flying across Titan\'s organic sand dunes.' }
    ],
    tags: ['moon', 'saturn', 'methane seas', 'dense atmosphere', 'prebiotic'],
    provenance: [
      { source: 'NASA Science Titan', url: 'https://science.nasa.gov/saturn/moons/titan/', lastUpdated: '2026-10-01' }
    ]
  },

  // --- SPACECRAFT ---
  {
    id: 'iss',
    name: 'International Space Station',
    designation: 'ISS (ZARYA)',
    naifId: -125544,
    type: 'spacecraft',
    parentId: 'earth',
    color: '#00ffff',
    secondaryColor: '#ffffff',
    glowColor: '#00b4d8',
    textureType: 'spacecraft',
    physical: {
      meanRadiusKm: 0.054, // ~109m x 73m
      massKg: 444615,
      densityGcm3: 0.05,
      gravityMs2: 0.0001,
      escapeVelocityKms: 0,
      rotationPeriodHours: 1.55,
      axialTiltDeg: 51.64,
      meanTempC: 22,
      surfaceFeatures: ['Cupola Window', 'Solar Array Wings', 'Kibo Module', 'Columbus Lab'],
    },
    orbit: {
      semiMajorAxisAU: 0.000045, // ~418 km altitude
      eccentricity: 0.0006,
      inclinationDeg: 51.64,
      orbitalPeriodDays: 0.0645, // ~92.9 minutes
      orbitalSpeedKms: 7.66,
      perihelionAU: 0.0000445,
      aphelionAU: 0.0000455,
      parentBodyId: 'earth'
    },
    summary: 'A football-field sized orbital habitat flying at 28,000 km/h where multinational astronaut crews conduct microgravity science.',
    funFacts: [
      'The ISS circles Earth every 90 minutes, seeing 16 sunrises and sunsets every single day.',
      'It has been continuously inhabited by humans since November 2000.',
      'It is visible to the naked eye from Earth as a bright moving star.'
    ],
    missions: [
      { name: 'Expedition Crews', agency: 'NASA / Roscosmos / ESA / JAXA / CSA', year: 2000, status: 'Active', description: 'Over 270 astronauts from 21 nations have lived aboard.' }
    ],
    tags: ['spacecraft', 'orbit', 'astronauts', 'microgravity'],
    provenance: [
      { source: 'Where The ISS At API', url: 'https://wheretheiss.at/', lastUpdated: '2026-10-12' }
    ]
  },
  {
    id: 'voyager1',
    name: 'Voyager 1',
    naifId: -31,
    type: 'spacecraft',
    parentId: 'sun',
    color: '#ff9e00',
    secondaryColor: '#ffea00',
    textureType: 'spacecraft',
    physical: {
      meanRadiusKm: 0.002,
      massKg: 825.5,
      densityGcm3: 1.0,
      gravityMs2: 0,
      escapeVelocityKms: 0,
      rotationPeriodHours: 0,
      axialTiltDeg: 0,
      meanTempC: -200,
      surfaceFeatures: ['High-Gain 3.7m Antenna', 'Golden Record', 'RTG Power Source'],
    },
    orbit: {
      semiMajorAxisAU: 164.8, // Currently ~164 AU from Sun!
      eccentricity: 1.0, // Hyperbolic escape
      inclinationDeg: 35.0,
      orbitalPeriodDays: 999999,
      orbitalSpeedKms: 16.9,
      perihelionAU: 1.0,
      aphelionAU: 999.0,
    },
    summary: 'The most distant human-made object in history, cruising through interstellar space beyond our Sun\'s heliosphere with the Golden Record aboard.',
    funFacts: [
      'Voyager 1 is over 24 billion kilometers (164 AU) away; a radio signal takes over 22 hours to reach it.',
      'It carries a gold-plated phonograph record containing sounds and images selected to portray the diversity of life on Earth.',
      'In 1990, it turned around to take the famous "Pale Blue Dot" photograph of Earth from 6 billion km away.'
    ],
    missions: [
      { name: 'Voyager Interstellar Mission', agency: 'NASA / JPL', year: 1977, status: 'Active', description: 'Measuring interstellar magnetic fields and cosmic rays.' }
    ],
    tags: ['spacecraft', 'interstellar', 'golden record', 'pale blue dot'],
    provenance: [
      { source: 'NASA JPL Voyager Telemetry', url: 'https://voyager.jpl.nasa.gov/', lastUpdated: '2026-10-01' }
    ]
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    naifId: -170,
    type: 'spacecraft',
    parentId: 'sun',
    color: '#ffd166',
    secondaryColor: '#06d6a0',
    textureType: 'spacecraft',
    physical: {
      meanRadiusKm: 0.01,
      massKg: 6161,
      densityGcm3: 0.5,
      gravityMs2: 0,
      escapeVelocityKms: 0,
      rotationPeriodHours: 0,
      axialTiltDeg: 0,
      meanTempC: -233,
      surfaceFeatures: ['6.5m Beryllium Gold Mirror', '5-Layer Sunshield', 'NIRCam & MIRI Instruments'],
    },
    orbit: {
      semiMajorAxisAU: 1.01, // Orbiting Sun-Earth L2 Lagrangian point (~1.5M km from Earth)
      eccentricity: 0.016,
      inclinationDeg: 0.1,
      orbitalPeriodDays: 365.25,
      orbitalSpeedKms: 29.8,
      perihelionAU: 0.99,
      aphelionAU: 1.03,
    },
    summary: 'Humanity\'s premier space science observatory, observing deep infrared light from the very first galaxies formed after the Big Bang.',
    funFacts: [
      'JWST\'s primary mirror is coated with a microscopic layer of real gold only 100 nanometers thick (about a golf ball\'s worth of gold).',
      'It operates at cryogenic temperatures below -233°C (-388°F) behind a tennis-court-sized sunshield.',
      'It orbits the Sun-Earth L2 point, never entering Earth\'s shadow.'
    ],
    missions: [
      { name: 'Webb Science Operations', agency: 'NASA / ESA / CSA', year: 2021, status: 'Active', description: 'Peering back over 13.5 billion years into early cosmic history.' }
    ],
    tags: ['spacecraft', 'telescope', 'l2', 'gold mirror', 'infrared'],
    provenance: [
      { source: 'NASA JWST Mission', url: 'https://webb.nasa.gov/', lastUpdated: '2026-10-01' }
    ]
  },

  // --- NOTABLE ASTEROIDS & COMETS ---
  {
    id: 'apophis',
    name: '99942 Apophis',
    naifId: 2099942,
    type: 'asteroid',
    parentId: 'sun',
    color: '#9a8c98',
    secondaryColor: '#4a4e69',
    textureType: 'rocky',
    physical: {
      meanRadiusKm: 0.17, // ~340m diameter
      massKg: 6.1e10,
      densityGcm3: 3.2,
      gravityMs2: 0.0001,
      escapeVelocityKms: 0.0002,
      rotationPeriodHours: 30.56,
      axialTiltDeg: 165.0,
      meanTempC: -30,
      surfaceFeatures: ['Peanut/Elongated Shape', 'Silicate Boulders'],
    },
    orbit: {
      semiMajorAxisAU: 0.9224,
      eccentricity: 0.1912,
      inclinationDeg: 3.33,
      orbitalPeriodDays: 323.6,
      orbitalSpeedKms: 30.73,
      perihelionAU: 0.746,
      aphelionAU: 1.099,
    },
    summary: 'A notorious near-Earth asteroid that will make an exceptionally close flyby within 31,600 km (19,600 mi) of Earth\'s surface on April 13, 2029.',
    funFacts: [
      'During its 2029 close approach, Apophis will pass closer to Earth than our geostationary weather and TV satellites!',
      'It will be visible to the naked eye for billions of people across Europe, Africa, and Asia.',
      'Earth\'s gravitational tides during the flyby will noticeably alter Apophis\'s spin rate and surface regolith.'
    ],
    missions: [
      { name: 'OSIRIS-APEX', agency: 'NASA', year: 2029, status: 'Planned', description: 'Rendezvous spacecraft to orbit and study tidal deformation of Apophis.' }
    ],
    tags: ['asteroid', 'neo', 'close approach', '2029'],
    provenance: [
      { source: 'JPL Center for Near-Earth Object Studies (CNEOS)', url: 'https://cneos.jpl.nasa.gov/', lastUpdated: '2026-10-01' }
    ]
  },
  {
    id: 'halley',
    name: '1P/Halley',
    naifId: 1000028,
    type: 'comet',
    parentId: 'sun',
    color: '#80ed99',
    secondaryColor: '#38a3a5',
    textureType: 'rocky',
    physical: {
      meanRadiusKm: 5.5, // ~15km x 8km nucleus
      massKg: 2.2e14,
      densityGcm3: 0.6,
      gravityMs2: 0.001,
      escapeVelocityKms: 0.002,
      rotationPeriodHours: 52.8,
      axialTiltDeg: 18.0,
      meanTempC: -100,
      surfaceFeatures: ['Icy Nucleus', 'Active Gas Jets', 'Ion Tail', 'Dust Tail'],
    },
    orbit: {
      semiMajorAxisAU: 17.83,
      eccentricity: 0.967,
      inclinationDeg: 162.26, // Retrograde orbit
      orbitalPeriodDays: 27500.0, // ~75.3 years
      orbitalSpeedKms: 54.5, // At perihelion!
      perihelionAU: 0.586,
      aphelionAU: 35.08,
    },
    summary: 'The most famous periodic comet in human history, returning to the inner solar system every 75–76 years. Next perihelion: July 2061.',
    funFacts: [
      'Halley is the only known short-period comet that is regularly visible to the naked eye from Earth.',
      'Observations of Halley date back over 2,200 years to Chinese and Babylonian records in 240 BC.',
      'Debris shed by Halley creates two annual meteor showers on Earth: the Eta Aquariids (May) and the Orionids (October).'
    ],
    missions: [
      { name: 'Giotto', agency: 'ESA', year: 1986, status: 'Past', description: 'First spacecraft to capture close-up images of a comet\'s nucleus.' }
    ],
    tags: ['comet', 'halley', 'meteor showers', 'retrograde'],
    provenance: [
      { source: 'JPL Small-Body Database', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1P', lastUpdated: '2026-10-01' }
    ]
  }
];
