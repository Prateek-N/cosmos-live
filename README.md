# 🪐 Cosmos Live · Interactive 3D Solar System & Deep Space Explorer

<p align="center">
  <img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80" alt="Cosmos Live Banner" width="100%" style="border-radius: 12px; max-height: 400px; object-fit: cover;" />
</p>

<p align="center">
  <strong>A real-time, browser-native 3D planetary observatory and space science command center powered by NASA APIs, JPL Horizons ephemeris, and WebGL.</strong>
</p>

<p align="center">
  <a href="#-live-telemetry--data-sources"><img src="https://img.shields.io/badge/Data-NASA%20Open%20APIs-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" alt="NASA Data" /></a>
  <a href="#-interactive-capabilities--features"><img src="https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20WebGL-049EF4?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/Framework-React%2019%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deployment-Vercel%20Edge-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌌 What is Cosmos Live?

**Cosmos Live** is a state-of-the-art interactive 3D digital planetarium, orbital simulation engine, and multi-mission space dashboard running entirely in modern web browsers without plugins.

Unlike static encyclopedias or pre-rendered videos, **Cosmos Live integrates live observational data feeds directly from NASA, the Jet Propulsion Laboratory (JPL), NOAA, and global satellite tracking networks**. It computes precise Keplerian orbits in real time, reproduces realistic planetary atmospheres with custom GLSL shaders, simulates time travel across centuries, and allows users to seamlessly zoom from the macroscopic scale of the solar system down to the landing coordinates of lunar and martian exploration rovers.

---

## 🎯 Key Use Cases & Benefits

### 1. 🎓 STEM Education & Academic Research
* **Visualizing Kepler’s Laws**: Students often struggle to comprehend orbital eccentricity, semi-major axes, and Keplerian orbital velocity in textbooks. Cosmos Live lets students alter time scale up to 100,000× speed to observe retrograde motion, orbital resonances, and perihelion vs. aphelion velocities in real time.
* **Scale of the Universe**: Switch between scientific true-scale distances and didactic enhanced-visibility modes to understand the sheer vastness of interplanetary space.
* **Lunar Mechanics**: Demystifies lunar phases, libration, orbital inclination (5.14°), and tidal locking through real-time 3D Earth-Moon system inspection.

### 2. 🔭 Amateur Astronomy & Stargazers
* **Real-Time Planetary Alignments**: Plan celestial observation nights by checking current planetary positions calculated via high-precision orbital ephemeris.
* **88 Constellation Stargazer Planetarium**: Look out at the celestial sphere from Earth's perspective with complete Bayer stellar designations, right ascension, and declination grids.
* **Space Weather Alerts**: Stay updated on Coronal Mass Ejections (CMEs) and Geomagnetic Storms (Kp index) that trigger terrestrial auroras (Northern/Southern Lights).

### 3. 🛰️ Space Exploration Tracking & Mission History
* **Live Deep Space Network (DSN)**: Inspect real-time downlink and uplink transmissions between NASA's Goldstone, Madrid, and Canberra giant dish antennas and active interplanetary probes (*Voyager 1*, *Voyager 2*, *New Horizons*, *Parker Solar Probe*, *JWST*).
* **Historical Landing Sites Directory**: Explore 3D interactive terrain sites for iconic historic missions, including *Apollo 11–17*, *Luna*, *Chang'e*, *Chandrayaan*, *Curiosity*, and *Perseverance*.
* **Live ISS Tracking**: Track the International Space Station’s orbital position, ground track, altitude, velocity, and currently orbiting astronaut crew members.

### 4. 🌍 Planetary Climate & Natural Event Monitoring
* **Earth Command Center**: Monitor real-time natural events reported by NASA EONET—active wildfires, severe tropical storms, active volcanic eruptions, and polar ice sheet shifts.
* **DSCOVR Daily Earth Views**: View full-disc color images of Earth captured by the EPIC camera situated 1 million miles away at Sun-Earth Lagrange Point L1.

### 5. 🛡️ Planetary Defense & Asteroid Awareness
* **Near-Earth Object (NEO) Dashboard**: Real-time tracking of daily close-approaching asteroids, classified by estimated diameter, miss distance (in Lunar Distances and Astronomical Units), and hazard level.

---

## 📡 Live Telemetry & API Data Sources

Cosmos Live acts as a unified aggregation hub for multiple scientific APIs and authoritative astronomical datasets:

| Data Source / API | Provider | Telemetry Data Stream | Refresh Rate / Coverage |
| :--- | :--- | :--- | :--- |
| **JPL Horizons Ephemeris** | NASA / JPL | Orbital vectors, Keplerian orbital elements (semi-major axis, eccentricity, inclination, longitude of ascending node, perihelion, mean anomaly) | Continuous Real-Time Calculation |
| **NeoWs (Near Earth Object Web Service)** | NASA Open APIs | Asteroid close approaches, miss distances, relative velocities, estimated minimum/maximum diameters, potentially hazardous asteroid flags | Daily Updates / Real-Time Feed |
| **EONET (Earth Observatory Natural Event Tracker)** | NASA Earth Science | Active wildland fires, tropical cyclones, volcanic eruptions, iceberg calvings, flood events with GPS coordinates | Real-Time Live Feed |
| **EPIC (Earth Polychromatic Imaging Camera)** | NASA / NOAA (DSCOVR) | Full-disc natural color Earth photography from Lagrange Point 1 (1,000,000 miles deep space) with cloud formations | Daily Images |
| **DONKI (Space Weather Database)** | NASA Goddard Space Flight Center | Coronal Mass Ejections (CME), Solar Energetic Particles (SEP), Geomagnetic Storms, Solar Flare classifications (M-Class, X-Class) | Live Notifications & Forecasts |
| **Mars Rover Photos API** | NASA Open APIs | High-resolution raw photography from *Perseverance*, *Curiosity*, *Opportunity*, and *Spirit* rovers with camera filter selections | By Mission Sol / Earth Date |
| **APOD (Astronomy Picture of the Day)** | NASA | Daily featured astronomical photograph or video curated by professional astrophysicists with detailed explanations | Daily 00:00 UTC |
| **Where The ISS At? & OpenNotify** | Open Source ISS API | Real-time latitude, longitude, altitude, velocity, and human crew roster onboard the International Space Station | Live 5-Second Interval |
| **CelesTrak / TLE Ephemeris** | Space-Track / CelesTrak | Two-Line Element orbital sets for active low Earth orbit satellites (Hubble, Starlink, GPS, GOES Weather) | Real-time SGP4 propagation |
| **IAU & USGS Lunar Gazetteer** | USGS Astrogeology Science Center | Named lunar maria, craters, impact basins, mountain ranges, and Apollo/Artemis exploration landing coordinates | Curated Spatial Dataset |

> **Graceful Offline Architecture**: All data feeds feature built-in fallback fixtures and intelligent caching. If external NASA APIs encounter rate limits or network interruptions, Cosmos Live seamlessly falls back to pre-calculated astronomical tables without crashing or freezing.

---

## 🚀 Key Interactive Features

### 1. 🪐 Photorealistic 3D Solar System Engine
* **Planetary Realism**: High-resolution photorealistic surface textures for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.
* **Atmospheric Rayleigh Scattering**: Custom WebGL GLSL fragment & vertex shaders rendering atmospheric glow for Earth, Venus, Mars, Titan, and gas giants.
* **Solar Corona & Dynamics**: Animated solar flares, surface prominence shaders, and granular convection cells on the Sun.
* **Planetary Rings**: Textured, shadow-casting ring systems for Saturn, Uranus, and Neptune with accurate tilt angles.

### 2. ⏳ Time-Scrubbing & Orbital Simulation
* **Precise Temporal Controls**: Travel backward or forward in time with variable warp speeds:
  `Real-time (1×)` · `10×` · `60× (1 sec = 1 min)` · `3,600× (1 sec = 1 hour)` · `86,400× (1 sec = 1 day)` · `Up to 100,000×`.
* **Play / Pause / Reset to Real Time**: Instantly resynchronize to the current UTC second.
* **Orbital Path Visualizations**: Dynamic elliptical orbital trails rendered using Keplerian mechanics with perihelion and aphelion indicators.

### 3. 🔍 Macro-to-Micro Seamless Navigation
* **Free Orbital Camera**: Smooth 60 FPS orbit, pan, and zoom controls.
* **Target Focusing**: Lock camera focus onto any planet, dwarf planet, moon, or spacecraft with a single click.
* **Zoom All the Way In**: Zooming past planetary orbit smoothly transitions into planetary surface modes and continental terrain views.

### 4. 🌕 Moon & Planetary Surface Exploration Hub
* **Landing Site Coordinates**: Interactive 3D surface landing markers for historical Apollo missions (11, 12, 14, 15, 16, 17), Artemis exploration zones, Luna probes, Chang'e landers, and Chandrayaan-3.
* **Topography & Features**: Detailed geological profiles for Oceanus Procellarum, Mare Tranquillitatis, Tycho Crater, Copernicus Crater, and lunar south pole permanently shadowed regions.
* **Surface Telemetry**: Surface gravity, temperature range (-130°C to +120°C), escape velocity, and tidal lock parameters.

### 5. 🛰️ Spacecraft & Deep Space Network (DSN)
* **Real-Time Dish Telemetry**: Track which ground stations (Canberra 🇦🇺, Madrid 🇪🇸, Goldstone 🇺🇸) are transmitting to deep space probes.
* **Signal Travel Time**: Calculates light-speed communication delays (e.g., >22 hours one-way for Voyager 1).

### 6. 🎧 Cosmic Audio Synthesizer
* **Synthesized Ambient Soundscapes**: Procedural Web Audio API sound generator that creates soothing, cinematic space soundscapes.
* **Planetary Frequency Hums**: Unique audio resonance tailored for each celestial body based on its electromagnetic signature and mass.

---

## 🛠️ Tech Stack & Architecture

```
cosmos-live/
├── src/
│   ├── components/
│   │   ├── Canvas3D/            # Three.js 3D scene, planetary meshes, shaders, orbits, rings
│   │   ├── EarthView/           # Earth Command Center, EONET events, continent inspection
│   │   ├── SurfaceView/         # High-resolution 3D surface landings & lunar/martian terrain
│   │   ├── Planetarium/         # 88 constellations & celestial sphere stargazer
│   │   └── HUD/                 # Live telemetry UI, DSN modal, NEO asteroid dashboard, time controls
│   ├── services/
│   │   ├── ephemeris.ts         # JPL Horizons & Keplerian orbital propagator
│   │   ├── lunarEphemeris.ts    # Moon orbit, libration & lunar phase calculations
│   │   ├── realtimeFeeds.ts     # NASA NeoWs, APOD, DONKI, Mars Rover integrations
│   │   ├── eonetService.ts      # NASA Earth Observatory Natural Events
│   │   ├── epicService.ts       # NASA DSCOVR full-disc Earth photography
│   │   ├── issTracker.ts        # ISS live position & astronaut manifest
│   │   ├── sound.ts             # Web Audio API ambient cosmic synthesizer
│   │   └── solarService.ts      # Space weather & solar flare telemetry
│   └── data/                    # Astronomical catalogs, landing sites, and offline fallback fixtures
```

* **Frontend Framework**: React 19 + TypeScript (Strict Type Safety)
* **3D Rendering**: Three.js (WebGL, Custom GLSL Shaders, Procedural Meshes)
* **Build System**: Vite (Rolldown / Lightning fast HMR & production bundling)
* **Audio**: Native Web Audio API (zero external audio asset dependencies)
* **Icons & Styling**: Lucide React + Glassmorphism Modern UI CSS Tokens
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

### 3. (Optional) Configure NASA API Key
By default, Cosmos Live operates seamlessly using NASA's `DEMO_KEY` and built-in offline caches. To unlock higher rate limits (up to 1,000 requests/hour):
1. Get a free API key at [api.nasa.gov](https://api.nasa.gov/).
2. Create a `.env.local` file in the project root:
```env
VITE_NASA_API_KEY=your_nasa_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `dist/`.

---

## 🚢 Deployment to Vercel

Cosmos Live is pre-configured for instant zero-configuration deployment on Vercel with [`vercel.json`](./vercel.json) handling SPA routing.

### Option A: 1-Click Import (Recommended)
1. Visit [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import the repository: `Prateek-N/cosmos-live`.
3. Vercel automatically detects the Vite framework settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

---

## 📜 Scientific References & Acknowledgements

* **NASA Open Data Program**: For public access to JPL Horizons, APOD, NeoWs, EONET, DONKI, and Mars Rover data.
* **Jet Propulsion Laboratory (JPL)**: For accurate Solar System planetary ephemerides and Keplerian orbital parameters.
* **USGS Astrogeology Science Center**: For lunar surface nomenclature, crater coordinates, and landing site elevations.
* **NOAA / NASA DSCOVR**: For Earth Polychromatic Imaging Camera (EPIC) full-disc deep space views.
* **OpenNotify & WhereTheISS.at**: For real-time ISS orbital tracking telemetry.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — free for educational, personal, and commercial exploration.
