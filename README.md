# 🪐 Cosmos Live · Interactive 3D Solar System & Deep Space Explorer

<p align="center">
  <img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80" alt="Cosmos Live Banner" width="100%" style="border-radius: 12px; max-height: 400px; object-fit: cover;" />
</p>

<p align="center">
  <strong>A real-time, browser-native 3D planetary observatory and space science command center powered by live scientific APIs, Keplerian orbital mechanics, and WebGL.</strong>
</p>

<p align="center">
  <a href="https://cosmos-live.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-cosmos--live.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Data-NASA%20%7C%20NOAA%20%7C%20JPL-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" alt="Scientific Feeds" />
  <img src="https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20WebGL-049EF4?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <a href="https://react.dev"><img src="https://img.shields.io/badge/Framework-React%2019%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <img src="https://img.shields.io/badge/Tests-Vitest%20Passed-3178C6?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest Tests" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## 🌌 What is Cosmos Live?

**Cosmos Live** is a browser-native 3D digital planetarium, orbital simulation engine, and multi-mission space dashboard running in modern browsers without plugins or registration.

Rather than relying on static mockups or pre-rendered videos, **Cosmos Live streams live telemetry from NOAA, NASA, the Jet Propulsion Laboratory (JPL), and global satellite tracking feeds**. It computes real-time planetary positions via high-precision VSOP87 analytical theories and custom Keplerian equation solvers, renders custom GLSL atmospheric shaders, supports centuries of historical time travel, and seamlessly transitions from the macroscopic solar system down to road-level terrestrial maps and extraterrestrial landing coordinates.

---

## 📡 Live Telemetry & Verified Data Sources

Cosmos Live operates as a unified aggregation hub for open, authoritative scientific APIs. All external data requests feature automatic timeout aborts and offline fallback fixtures so the application never crashes during network interruptions:

| Data Stream | Provider / Service | What the Code Does & Telemetry Delivered | Refresh Rate / Protocol |
| :--- | :--- | :--- | :--- |
| **Near-Earth Asteroid Radar** | **NASA / JPL Small-Body Database (CAD API)** | Real-time tracking of close-approaching asteroids: miss distances (AU & Lunar Distances), relative velocities, absolute magnitudes, and potentially hazardous asteroid (PHA) flags. | Live Queries / 5-Min Refresh |
| **NOAA Space Weather** | **NOAA Space Weather Prediction Center (SWPC)** | Real-time Planetary K-index ($K_p$), solar wind velocity ($\text{km/s}$), interplanetary magnetic field ($B_z, B_t$), 10.7cm solar radio flux, and geomagnetic storm scales. | 60-Second Real-Time Poll |
| **NASA Deep Space Network (DSN)** | **NASA DSN Now (`eyes.nasa.gov`)** | Live dish antenna link status across Goldstone 🇺🇸, Madrid 🇪🇸, and Canberra 🇦🇺 complexes tracking active interplanetary probes (*Voyager 1/2*, *JWST*, *Parker Solar Probe*, *New Horizons*). | 15-Second Interval |
| **Solar Dynamics Observatory (SDO)** | **NASA SDO & NOAA GOES** | Multi-spectral imagery across AIA 304Å (chromosphere), AIA 171Å (corona loops), and HMI magnetograms, coupled with live GOES X-ray solar flare flux graphs. | 2-Minute Polling |
| **Earth Natural Hazards (EONET)** | **NASA Earth Science Division** | Global wildland fires, severe tropical storms, active volcanic eruptions, and polar ice shifts plotted directly as 3D pins on the Earth globe. | Live Feed Query |
| **DSCOVR EPIC Deep Space Views** | **NASA / NOAA (DSCOVR)** | Natural color full-disc Earth photography captured 1,000,000 miles away at Lagrange Point L1 with interactive date-stamped timelapse playback. | Daily Epoch Imagery |
| **Live ISS Position & Crew** | **WhereTheISS.at & Open Notify** | Live latitude, longitude, altitude, orbital velocity, sunlight/umbra status, and current astronaut roster onboard the International Space Station. | 4-Second Real-Time Poll |
| **Global Terrestrial Weather** | **Open-Meteo API** | Real-time temperature, wind speed, relative humidity, pressure, and cloud cover for any user-selected GPS coordinate on Earth. | On-Demand Click Query |
| **Upcoming Rocket Launches** | **The Space Devs (Launch Library 2)** | Upcoming global orbital missions: launch vehicles (Falcon 9, SLS, H3), mission destinations, launch pads, and countdown statuses. | 10-Minute Cache |
| **Planetary Positions & Ephemeris** | **`astronomy-engine` & Custom Kepler Solver** | VSOP87 analytical planetary algorithms for the Sun, Moon, and 8 classical planets, paired with a custom Newton-Raphson Kepler equation solver ($M = E - e\sin E$) for minor bodies. | 60 FPS Continuous Math |
| **Terrestrial Satellite Tracks** | **Analytical Inclined Orbital Propagator** | Real-time sub-satellite coordinate propagation computing instantaneous latitude/longitude, altitude, communication horizon radius, and 90-minute orbital ground tracks. | 1-Second Continuous Propagation |
| **Lunar & Surface Features Gazetteer** | **USGS Astrogeology & IAU Nomenclature** | Curated coordinates, mission profiles, and instruments for Apollo 11–17, Artemis zones, Curiosity, Perseverance, InSight, and Huygens, plus lunar maria and craters. | Curated Geological Catalog |

> **100% Keyless & Zero-Config**: All live integrations connect directly to open, public scientific endpoints with graceful offline fallback fixtures. No API keys or environment variables are required.

---

## 🚀 Core Capabilities & Technical Architecture

### 1. 🪐 3D Solar System Engine & Custom GLSL Shaders
* **Photorealistic Planetary Textures**: High-resolution 2K photographic surface maps for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, the Moon, and dwarf planets, with procedural canvas fallbacks.
* **Custom Day/Night Earth Terminator Shader**: A custom Three.js `ShaderMaterial` blending NASA daylight imagery with NASA Black Marble golden city night lights across the twilight zone, enhanced with atmospheric Rayleigh limb scattering.
* **Saturn's Ring System**: Annular ring geometry with radial UV coordinates mapped to Saturn's ring alpha map with Cassini division transparency.
* **Procedural 3D Spacecraft Models**: Bespoke 3D procedural meshes for the **ISS** (pressurized modules, truss spine, 8 solar wings, radiators), **Voyager 1** (high-gain dish, RTG boom, magnetometer), and **JWST** (18-segment hexagonal beryllium mirror, Kapton sunshield).
* **Asteroid Belt**: 3,500 particles distributed between 2.1 and 3.3 AU with vertical dispersion and additive blending.

### 2. 📐 Dual Scale Modes (Logarithmic vs. Realistic)
* **`explorer` Mode (Default)**: Uses a radial logarithmic distance compression function:
  $$r_{\text{scene}} = \log_{10}(1 + 15r) \cdot 32 + \sqrt{r} \cdot 8$$
  Planetary radii are scaled logarithmically so that inner rocky planets and outer gas giants remain clearly visible, distinct, and clickable.
* **`realistic` Mode**: Renders true Euclidean astronomical units ($1\text{ AU} = 60\text{ scene units}$) and physical scale radii, exposing the true scale and vastness of the interplanetary void.

### 3. ⏳ Time Machine Simulation & Historical Milestones
* **Temporal Warp Speeds**: Variable simulation speeds from real-time ($1\times$), $100\times$, $10,000\times$, $86,400\times$ (1 day/s), $2,592,000\times$ (1 month/s), up to $31,536,000\times$ (1 year/s), with forward and reverse playback.
* **Historical Milestones**: Instant epoch jumping to historic space exploration milestones (e.g. Apollo 11 Moon landing 1969, Voyager 1 Jupiter flyby 1979, Halley's Comet perihelion armada 1986, Cassini Saturn orbit insertion 2004, Curiosity landing 2012). The orbital solver repositions every celestial body to its exact historical orbital coordinates.

### 4. 🌍 Earth Command Center & Leaflet Macro-to-Micro Zoom
* **3D Earth Digital Twin**: Displays atmospheric clouds, day/night city lights, emerald auroral oval rings at the magnetic poles, active 3D satellite constellation beacons, and NASA EONET hazard pins.
* **Seamless Surface Transition**: Zooming into Earth transitions from Three.js into an interactive **Leaflet** view with **Esri World Satellite Imagery**, OpenStreetMap transportation networks, and administrative boundaries down to street level (zoom 19).
* **Live Satellite Ground Track**: Visualizes the satellite's projected 90-minute sinusoidal ground track and communications horizon footprint.

### 5. 🔭 Stargazer Planetarium & Celestial Sphere
* Computes real-time **Greenwich Mean Sidereal Time (GMST)** and **Local Sidereal Time (LST)** based on simulation time and observer geographic coordinates.
* Converts Right Ascension ($\alpha$) and Declination ($\delta$) to local Altitude and Azimuth coordinates on a 360° celestial dome.
* Features major seasonal naked-eye constellations and asterisms (Orion, Ursa Major, Cassiopeia, Cygnus, Crux, Scorpius, Taurus, Canis Major, Gemini, Sagittarius, Lyra, Boötes, Pegasus, Andromeda, Centaurus, Leo) with horizon ground planes and altitude guides.

### 6. 🎧 Procedural Web Audio Synthesizer
* **Ambient Cosmic Space Drone**: Procedurally generated via three detuned oscillators ($55.0\text{ Hz } [A_1]$, $82.4\text{ Hz } [E_2]$, $110.2\text{ Hz } [A_2]$) through a resonant low-pass filter modulated by an ultra-slow $0.07\text{ Hz}$ LFO.
* **Stellar Wind Hiss**: Real-time pink noise generator providing cosmic background ambience.
* **Interactive UI Tones**: Web Audio synthesized audio chimes for button clicks, object selections, and warp transitions.

---

## 🛠️ Tech Stack & Directory Structure

```
cosmos-live/
├── .github/
│   └── workflows/ci.yml         # GitHub Actions automated lint, test & build pipeline
├── src/
│   ├── components/
│   │   ├── Canvas3D/            # Three.js scene, textures, shaders, procedural spacecraft
│   │   ├── EarthView/           # Earth Command Center, EONET hazards, Leaflet map
│   │   ├── SurfaceView/         # 3D planetary landing sites (Moon, Mars, Venus, Titan)
│   │   ├── Planetarium/         # 360° celestial sphere stargazer & constellations
│   │   └── HUD/                 # Live telemetry UI, DSN modal, NEO dashboard, time controls
│   ├── services/
│   │   ├── ephemeris.ts         # VSOP87 analytical theories & Keplerian equation solver
│   │   ├── lunarEphemeris.ts    # Moon phase, illumination fraction, libration & distance
│   │   ├── realtimeFeeds.ts     # NOAA Space Weather, NASA DSN, JPL CAD, Launch Library 2
│   │   ├── satelliteTracker.ts  # Analytical inclined satellite orbit propagation
│   │   ├── eonetService.ts      # NASA Earth Observatory Natural Events
│   │   ├── epicService.ts       # NASA DSCOVR full-disc Earth photography
│   │   ├── issTracker.ts        # ISS live position, astronaut roster, pass predictor
│   │   ├── weatherService.ts    # Open-Meteo live terrestrial weather integration
│   │   ├── solarService.ts      # SDO multi-spectral solar imagery & GOES X-ray flux
│   │   ├── sound.ts             # Web Audio API procedural cosmic synthesizer
│   │   └── __tests__/           # Automated unit test suite (Vitest)
│   └── data/                    # Astronomical bodies, satellite catalogs, landing sites
├── LICENSE                      # Official MIT License
├── package.json                 # Dependencies and test/build scripts
└── vercel.json                  # Vercel deployment configuration
```

* **Frontend Framework**: React 19 + TypeScript (Strict Type Safety)
* **3D Graphics Engine**: Three.js (WebGL, Logarithmic Depth Buffer, Custom GLSL Shaders)
* **2D Surface Mapping**: Leaflet + Esri World Satellite Imagery + OpenStreetMap Roads
* **Testing Suite**: Vitest (14 automated unit tests covering orbital math & failover resilience)
* **Continuous Integration**: GitHub Actions (`.github/workflows/ci.yml`)
* **Audio Engine**: Native Web Audio API (Zero audio assets downloaded)
* **Build Tool**: Vite (Lightning fast HMR & production bundling)
* **Deployment**: Vercel Serverless & Edge Network

---

## ⚡ Quickstart & Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* `npm` or `pnpm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/Prateek-N/cosmos-live.git
cd cosmos-live
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Automated Unit Tests
```bash
npm test
```
Executes the Vitest test suite validating:
- Keplerian equation Newton-Raphson solver and planetary heliocentric positions
- Logarithmic vs. realistic coordinate scale transformations
- Satellite inclined orbital propagation and geographic bounds
- Lunar phase angles, illumination fraction, and geocentric distances
- Network error recovery and offline fallback resilience across live feeds

### 5. Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `dist/`.

---

## 🚢 Deployment to Vercel

Cosmos Live is pre-configured for instant deployment on Vercel with [`vercel.json`](./vercel.json) handling SPA routing.

### Deploy via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repository directly to [Vercel](https://vercel.com/) for automated CI/CD deployments on push.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — free for educational, personal, and open-source exploration.
