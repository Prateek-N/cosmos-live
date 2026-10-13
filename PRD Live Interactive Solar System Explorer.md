# PRD: Live Interactive Solar System Explorer

Oct 12, 2026 · @Prateek

A browser-based, real-time 3D solar system where users fly around any planet, moon, asteroid, comet or spacecraft and see live scientific data for it, pulled from NASA, JPL, NOAA and other open sources.

## 1. Overview

**Product name (working):** Cosmos Live

**Vision.** One interactive universe that is physically accurate, always current and explorable by anyone. Positions come from real ephemerides, facts come from authoritative APIs, and live feeds (ISS, space weather, close asteroid flybys, launches) make it feel alive rather than like a static atlas.

**Problem.** Solar system data is scattered across dozens of sites and APIs (NASA, JPL, NOAA, Minor Planet Center, CelesTrak). Existing tools are either pretty but shallow (planetarium apps) or deep but hard to use (JPL Horizons, raw APIs). Nobody gives a single, free, web-based 3D view that combines both.

**Solution.** A WebGL app with a true-scale-capable 3D scene, a time machine (past, present, future), a rich detail panel per object, and live data layers, all fed by a backend that aggregates and caches public APIs.

**What 'universe' means for v1.** The Sun, 8 planets, 5 dwarf planets, 200+ moons, about 1 million cataloged asteroids and comets (streamed by importance), the ISS and about 10,000 tracked satellites, major spacecraft, and a Milky Way / nearby-star backdrop. Exoplanets and deep-sky objects follow in later phases (see Roadmap).

**Core experience in one line.** Open the app, see the solar system as it is right now, click any body, orbit around it, and read everything known about it.

## 2. Goals, Non-Goals and Success Metrics

**Goals**

- Show every major solar system body at its real position for any chosen date and time, using real orbital mechanics.
- Let users orbit, zoom and fly to any object with smooth camera control, from the whole system down to a planet's surface.
- Surface all available public data per object (physical, orbital, atmosphere, missions, images, news) in one detail panel.
- Show live layers: ISS and satellites, space weather and aurora, near-Earth asteroid flybys, upcoming launches, NASA imagery.
- Run free for users, on public APIs and free-tier hosting, with no login required.

**Non-goals (v1)**

- No full galaxy or deep-space simulation (stars beyond a backdrop and exoplanet catalog are Phase 4).
- No N-body physics engine: positions come from published ephemerides and Keplerian elements, not our own integration.
- No native mobile apps; responsive web only.
- No user accounts, social features or paid tiers.
- No scraping of sites that prohibit it; official APIs and open datasets come first (see Risks).

**Success metrics**

| Metric | Target | How measured |
| --- | --- | --- |
| Time to first interactive 3D frame | under 4 s on a mid-range laptop, 4G | Lighthouse, RUM |
| Sustained frame rate | 60 fps desktop, 30 fps mid-range mobile | In-app FPS sampler |
| Position accuracy, planets | within 0.1 degree of JPL Horizons for 1900 to 2100 | Automated test vs Horizons |
| Objects with a populated detail panel | 100% of planets and major moons; 95% of top 10,000 small bodies | Data coverage report |
| Live data freshness | ISS under 5 s old; space weather under 5 min old | Backend health dashboard |
| Engagement | average session over 5 min; over 30% of sessions open 3+ objects | Analytics |
| Reliability | 99.5% monthly uptime of API proxy | Uptime monitor |

## 3. Target Users

| Persona | Need | What they do in the app |
| --- | --- | --- |
| Curious explorer (general public, 13+) | Beautiful, easy way to see space as it is today | Browse planets, click for facts, watch the ISS pass overhead |
| Student / teacher | Accurate visuals for learning and class demos | Scrub time, compare planet sizes and distances, use guided tours |
| Amateur astronomer | Know what is visible and when | Check planet positions, close approaches, moon phases, satellite passes |
| Space enthusiast / journalist | Latest missions, launches and events in context | Follow launches, asteroid flybys, solar storms with live data |
| Developer / researcher | Pull and cross-check open data | Use the object detail JSON and 'view source' links to original APIs |

**Primary persona for design decisions:** the curious explorer. If a feature needs a manual, it is wrong for v1.

## 4. Functional Requirements

Priority: **P0** = must ship in v1, **P1** = v1.x, **P2** = later.

### 4.1 3D scene and rendering

| ID | Requirement | Priority |
| --- | --- | --- |
| F-01 | Render Sun, 8 planets, dwarf planets and all major moons with real textures, axial tilt, rotation and orbital paths | P0 |
| F-02 | Real positions for any date from ephemeris data (JPL / Keplerian elements) | P0 |
| F-03 | Two scale modes: 'Realistic' (true distances and sizes) and 'Explorer' (log-scaled distances, enlarged bodies so everything is visible); one-click toggle | P0 |
| F-04 | Saturn rings, Earth day/night with city lights and clouds, atmosphere glow, Sun corona and lens flare | P0 |
| F-05 | Orbit lines for each body, toggle per category (planets, moons, asteroids, comets, satellites) | P0 |
| F-06 | Starfield and Milky Way skybox, plus named bright stars and constellation lines | P1 |
| F-07 | Asteroid belt and Kuiper belt as GPU-instanced point clouds (100k+ objects) | P1 |
| F-08 | Real-time Earth view: day/night terminator, cloud layer, optional NASA EPIC latest image | P1 |
| F-09 | Surface-level views: high-res maps for Moon, Mars (and others where available) with landing sites and rover locations | P2 |

### 4.2 Navigation and camera

| ID | Requirement | Priority |
| --- | --- | --- |
| N-01 | Orbit, pan and zoom around any selected object; pinch and touch on mobile | P0 |
| N-02 | Click or tap an object to select it; camera flies to it with eased animation | P0 |
| N-03 | 'Revolve around globe' mode: camera locked to the selected body, orbiting it as it moves, with auto-rotate option | P0 |
| N-04 | Free-fly camera (WASD + mouse) and a 'reset to full system' button | P1 |
| N-05 | Search box with autocomplete over all objects (name, designation, NAIF ID) | P0 |
| N-06 | Object tree / list sidebar grouped by Sun, planets, moons, dwarf planets, asteroids, comets, spacecraft | P0 |
| N-07 | Guided tours (Inner planets, Giant planets, Mars missions, Dwarf planets) with narrated steps | P2 |

### 4.3 Time control

| ID | Requirement | Priority |
| --- | --- | --- |
| T-01 | Time bar: pause, play, reverse, and speed from real-time to 1 year per second | P0 |
| T-02 | Date picker to jump to any date between 1900 and 2100 (extended range where ephemeris allows) | P0 |
| T-03 | 'Now' button returns to live time | P0 |
| T-04 | Event markers on the time bar (eclipses, oppositions, close approaches, launches) | P1 |

### 4.4 Object detail panel

| ID | Requirement | Priority |
| --- | --- | --- |
| D-01 | Panel opens on select with: name, type, image, summary description, key facts | P0 |
| D-02 | Physical data: mass, radius, density, gravity, escape velocity, rotation period, axial tilt, temperature, atmosphere composition | P0 |
| D-03 | Orbital data: semi-major axis, eccentricity, inclination, period, perihelion, aphelion, current distance from Sun and Earth, current speed | P0 |
| D-04 | Live readouts that update with the simulation clock (distance, speed, light-travel time from Earth) | P0 |
| D-05 | Moons list, discovery info, naming origin | P1 |
| D-06 | Missions tab: past, current and planned missions with dates and links | P1 |
| D-07 | Media tab: NASA Image and Video Library results and APOD tie-ins for that object | P1 |
| D-08 | News tab: recent articles about the object | P2 |
| D-09 | 'Data sources' footer listing every API behind the panel, with links and last-updated time | P0 |
| D-10 | Measure tool: distance between any two objects, with light-travel time | P1 |

### 4.5 Live data layers

| ID | Requirement | Priority |
| --- | --- | --- |
| L-01 | ISS live position, orbit track, and next pass over the user's location | P0 |
| L-02 | Satellites layer (Starlink, GPS, weather, stations) from TLE data, propagated in the browser | P1 |
| L-03 | Near-Earth asteroids: upcoming close approaches list, plotted in 3D with distance in lunar distances | P0 |
| L-04 | Space weather panel: solar flares, CMEs, Kp index, aurora oval overlay on Earth | P1 |
| L-05 | Sun view with latest SDO / SOHO imagery and sunspot count | P1 |
| L-06 | Upcoming launches and active spacecraft positions (Voyager, Juno, Perseverance, JWST, etc.) | P1 |
| L-07 | Comets and newly discovered objects from JPL and Minor Planet Center feeds | P1 |
| L-08 | Mars weather (InSight archive) and rover photos (Curiosity, Perseverance) | P2 |

### 4.6 Extended universe (later phases)

| ID | Requirement | Priority |
| --- | --- | --- |
| X-01 | Confirmed exoplanets and host stars from NASA Exoplanet Archive, shown on a 3D star map | P2 |
| X-02 | Nearby stars (within about 100 light years) with real positions from Gaia / Hipparcos data | P2 |
| X-03 | Deep-sky objects (Messier catalog) as sky markers | P2 |
| X-04 | VR/AR mode via WebXR | P2 |

### 4.7 Core user stories

1. As an explorer, I want to click Saturn and see its rings, moons and facts, so I can learn about it without leaving the scene.
2. As a student, I want to drag the time bar to 1969 and see where the Moon and Earth were, so I can follow Apollo 11 visually.
3. As an amateur astronomer, I want to see which planets are above my horizon tonight, so I can plan observing.
4. As a space fan, I want to see the asteroid that passes Earth next week and how close it comes, so I can follow the news in context.
5. As a teacher, I want to switch to Realistic scale, so students feel how empty space is.

## 5. Data Source Catalog

About 30 free, public sources cover almost everything asked for; only the NASA Open APIs need a (free) key. Rate limits below are approximate and change, so re-check each provider's docs at build time and always cache behind our own backend.

### 5.1 Positions, orbits and small bodies

| Source | Provides | Access and key | Notes |
| --- | --- | --- | --- |
| [JPL Horizons API](https://ssd-api.jpl.nasa.gov/doc/horizons.html) | High-precision positions, velocities and orbital elements for planets, moons, asteroids, comets and spacecraft (NAIF IDs) | REST, no key | Gold standard; use for validation and spacecraft trajectories; keep requests batched and cached |
| [astronomy-engine](https://github.com/cosinekitty/astronomy) (npm) | Offline positions of Sun, Moon, planets; rise/set, phases, eclipses, oppositions | Library, no key | Runs in the browser; default engine for planets so the scene works without network |
| [JPL SBDB API](https://ssd-api.jpl.nasa.gov/doc/sbdb.html) and [Query API](https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html) | Orbital elements, physical parameters, discovery data for asteroids and comets | REST, no key | Source for detail panels of small bodies |
| [JPL Close-Approach (CAD) API](https://ssd-api.jpl.nasa.gov/doc/cad.html) | Past and future close approaches to planets, in AU | REST, no key | Drives the 'close approaches' layer |
| [JPL Sentry](https://ssd-api.jpl.nasa.gov/doc/sentry.html), [Scout](https://ssd-api.jpl.nasa.gov/doc/scout.html), [Fireball](https://ssd-api.jpl.nasa.gov/doc/fireball.html) | Impact risk table, newly found object tracking, fireball events | REST, no key | Optional 'planetary defense' tab |
| [Minor Planet Center data](https://minorplanetcenter.net/data) | MPCORB bulk orbit file for 1M+ minor planets, comet elements, new discoveries | Bulk file download, no key | Nightly ingest into our database; drives the instanced asteroid cloud |
| [Le Système Solaire API](https://api.le-systeme-solaire.net/en/) | Physical data (mass, radius, gravity, moons, discovery) for about 280 bodies | REST, no key | Fast bootstrap dataset; cross-check against NASA values |
| [JPL planetary physical parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html) and [satellite parameters](https://ssd.jpl.nasa.gov/sats/phys_par/) | Authoritative radii, masses, rotation, moon orbital data | HTML tables, no API | Scraped once, versioned in our repo (changes rarely) |

### 5.2 Space weather and the Sun

| Source | Provides | Access and key | Notes |
| --- | --- | --- | --- |
| [NOAA SWPC JSON services](https://services.swpc.noaa.gov/) | Kp index, solar wind, X-ray flux, aurora oval (OVATION), alerts | JSON files, no key | Poll every 1 to 5 min via backend |
| [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) via api.nasa.gov | Flares, CMEs, geomagnetic storms, solar energetic particles with analysis | REST, NASA key | Event feed on the time bar |
| [Helioviewer API](https://api.helioviewer.org/docs/v2/) | Latest SDO, SOHO and other solar imagery, any date | REST, no key | Sun detail panel and texture |
| [SILSO sunspot data](https://www.sidc.be/SILSO/datafiles) | Daily and monthly sunspot numbers since 1818 | Text files, no key | Sunspot chart in Sun panel |

### 5.3 Earth orbit, satellites and launches

| Source | Provides | Access and key | Notes |
| --- | --- | --- | --- |
| [Where the ISS at](https://wheretheiss.at/w/developer) | ISS lat, lon, altitude, velocity, visibility | REST, no key | About 1 request per second limit; backend polls once and fans out via websocket |
| [Open Notify](http://open-notify.org/Open-Notify-API/) | ISS position, people in space | REST over HTTP only, no key | Needs backend proxy (mixed-content); fallback to the above |
| [CelesTrak GP data](https://celestrak.org/NORAD/documentation/gp-data-formats.php) | TLE / OMM orbital data for active satellites, Starlink, GPS, stations | REST, no key | Refresh every few hours; propagate in browser with satellite.js |
| [Space-Track.org](https://www.space-track.org/documentation) | Full US catalog incl. debris, decay data | REST, free account login | P2; optional |
| [Launch Library 2](https://thespacedevs.com/llapi) | Upcoming and past launches, rockets, agencies, pads, astronauts | REST, no key on free tier (tight hourly limit) | Cache aggressively; paid tier if traffic grows |
| [NASA TechPort](https://api.nasa.gov/) and mission pages | Mission and technology descriptions | REST with NASA key / HTML | Missions tab enrichment |

### 5.4 Imagery, media and knowledge

| Source | Provides | Access and key | Notes |
| --- | --- | --- | --- |
| [NASA Open APIs](https://api.nasa.gov/) | APOD, NeoWs (near-Earth objects), EPIC Earth images, Earth imagery, EONET natural events | REST, **free key** (DEMO\_KEY is heavily limited; a registered key allows about 1,000 requests per hour) | One key for all NASA endpoints; store server-side only |
| [NASA Image and Video Library](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf) | Search over 100k public-domain images, video, audio by keyword | REST, no key | Media tab per object |
| [NASA Exoplanet Archive TAP](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html) | 6,000+ confirmed exoplanets and host stars | SQL-like TAP over HTTP, no key | Phase 4 |
| [Wikipedia REST](https://en.wikipedia.org/api/rest_v1/) and [Wikidata](https://www.wikidata.org/wiki/Wikidata:Data_access) | Summaries, thumbnails, structured facts (discoverer, naming) | REST / SPARQL, no key | CC BY-SA: show attribution |
| [Spaceflight News API](https://api.spaceflightnewsapi.net/v4/docs/) | Space news articles, blogs, reports, filterable by launch or event | REST, no key | News tab |
| [SIMBAD / VizieR (CDS)](https://simbad.cds.unistra.fr/guide/sim-url.htx) and [Gaia archive](https://gea.esac.esa.int/archive/) | Star and deep-sky catalog data, parallax, magnitudes | TAP, no key | Phase 4 star map |
| [HYG star database](https://github.com/astronexus/HYG-Database) | Bundled star catalog (Hipparcos, Yale, Gliese) for the backdrop | CSV download | CC BY-SA; ship as static JSON |

### 5.5 Textures, maps and 3D models

| Source | Provides | License | Notes |
| --- | --- | --- | --- |
| [Solar System Scope textures](https://www.solarsystemscope.com/textures/) | 2K to 8K planet, moon, Sun and Milky Way textures | CC BY 4.0 | Main texture set; credit required |
| [NASA Visible Earth](https://visibleearth.nasa.gov/) | Blue Marble, Black Marble (city lights), clouds, elevation | Mostly public domain | Earth day, night, cloud layers |
| [NASA Scientific Visualization Studio](https://svs.gsfc.nasa.gov/) | Moon and planet maps, CGI kits, data visualizations | Mostly public domain | Check each item's credit line |
| [NASA 3D Resources](https://science.nasa.gov/3d-resources/) | glTF / OBJ models of spacecraft, rovers, asteroids, planets | Generally public domain | ISS, Voyager, JWST, Curiosity models |
| [NASA Trek portals](https://trek.nasa.gov/) and [USGS Astrogeology](https://astrogeology.usgs.gov/) | High-resolution surface mosaics and tile services for Moon, Mars, Mercury, Vesta, Ceres and others | Public domain | Phase 3 surface views (tiled layers) |

### 5.6 Scrape-only data (no official API)

Use only where no API exists, only for public pages whose terms allow it, and only inside the scheduled ingestion job (never from the user's browser). Each item is fetched at most daily, with a clear User-Agent and respect for robots.txt.

| Target | Data wanted | Method | Fallback if blocked |
| --- | --- | --- | --- |
| [NASA Science solar system pages](https://science.nasa.gov/solar-system/) | Fact sheets, overview text, 'by the numbers' for each body | HTML parse, daily | Wikipedia / Wikidata summary |
| JPL planetary and satellite parameter pages (see 5.1) | Mass, radius, rotation, moon elements | HTML table parse, on change | Le Système Solaire API |
| NASA Mars raw image pages | Latest rover raw photos | Public JSON feed behind the page, verify before use | NASA Image Library search |
| NASA planetary fact sheets (NSSDCA) | Reference values for cross-checking | HTML table parse | JPL values |

**Rule of thumb:** API first, bulk file second, scrape last. Every scraped record stores its source URL and fetch date for display in the panel footer (D-09).

## 6. Data Architecture

The browser never calls third-party APIs directly. A thin backend ingests, normalizes and caches everything, hides the NASA key, and serves one consistent schema. This protects us from rate limits, CORS and HTTP-only endpoints, and lets the app keep working when an upstream API is down.

**Principles**

1. **Static first.** Data that rarely changes (planet physical data, textures, star catalog, moon list) is built into versioned JSON at deploy time and served from a CDN.
2. **Cache second.** Semi-live data (NEO feed, launches, news, space weather) is fetched by scheduled jobs into the database and served with short cache headers.
3. **Live last.** Only the ISS position and space-weather alerts are pushed in near real time, over a single websocket or server-sent events stream.
4. **Compute in the browser.** Planet and satellite positions are calculated locally (astronomy-engine, satellite.js) from cached elements, so time travel costs no network.
5. **Provenance everywhere.** Every field carries source name, URL and fetch time.

**Unified object model**

```json
{
  "id": "499",
  "naifId": 499,
  "name": "Mars",
  "type": "planet",
  "parent": "sun",
  "physical": { "meanRadiusKm": 3389.5, "massKg": 6.4171e23, "gravityMs2": 3.72, "rotationPeriodH": 24.62, "axialTiltDeg": 25.19 },
  "orbit": { "a_au": 1.5237, "e": 0.0934, "i_deg": 1.85, "periodDays": 686.98, "epoch": "2000-01-01" },
  "atmosphere": { "composition": ["CO2", "N2", "Ar"], "pressureKPa": 0.6 },
  "textures": { "color": "/tex/mars_4k.jpg", "bump": "/tex/mars_bump.jpg" },
  "text": { "summary": "...", "summarySource": "wikipedia" },
  "relations": { "moons": ["401", "402"], "missions": ["mars2020"] },
  "provenance": [{ "field": "physical", "source": "JPL SSD", "url": "https://ssd.jpl.nasa.gov/...", "fetchedAt": "2026-10-01" }]
}
```

(Values shown are illustrative; real values come from the ingestion job.)

**Refresh cadence**

| Dataset | Source | Refresh | Stored in | Delivered via |
| --- | --- | --- | --- | --- |
| Planets, moons, dwarf planets (physical + elements) | JPL, Le Système Solaire, Wikidata | Build time, monthly review | Static JSON | CDN |
| Asteroid and comet elements | MPC bulk file, SBDB | Daily | Database + binary tiles | REST + CDN |
| Close approaches, Sentry, Scout | JPL CAD APIs | Every 6 h | Database | REST |
| NEO feed, APOD, EPIC | NASA Open APIs | Hourly / daily | Database | REST |
| Space weather, Kp, aurora | NOAA SWPC, DONKI | Every 1 to 5 min | Memory cache | REST + SSE |
| ISS position | Where the ISS at | Every 1 to 5 s (one upstream poller) | Memory | Websocket |
| Satellite TLEs | CelesTrak | Every 2 to 6 h | Database | REST (compressed) |
| Launches, news | Launch Library 2, Spaceflight News | Every 15 to 60 min | Database | REST |
| Images and media metadata | NASA Image Library, Wikipedia | On demand, cached 7 days | Cache | REST |

**Resilience.** If an upstream call fails, serve the last good copy with a 'data as of' timestamp. If the backend is down, the app still renders the planets from the bundled static data and astronomy-engine.

**Search.** The backend exposes /search over object names, designations and NAIF IDs (Postgres full-text or Meilisearch).

## 7. Frontend and Tech Stack

**Recommendation:** React + TypeScript with **Three.js via React Three Fiber (R3F)** for the 3D scene. It is the most mature WebGL stack, has the largest ecosystem for planets, rings, atmospheres and post-processing, and keeps UI (React) and scene (Three) in one codebase.

| Layer | Choice | Why | Alternative |
| --- | --- | --- | --- |
| 3D engine | Three.js + @react-three/fiber + @react-three/drei | Camera controls, text, instancing, loaders | Babylon.js (heavier, great tooling) |
| Effects | @react-three/postprocessing | Bloom for Sun, atmosphere glow | Custom shaders |
| Orbital math | astronomy-engine (planets, Moon) + custom Keplerian solver (small bodies) | Accurate, offline, small | Horizons vectors cached |
| Satellites | satellite.js (SGP4) | Standard TLE propagation in browser | Server-side propagation |
| App state | Zustand | Simple store for selection, clock, layers | Redux Toolkit |
| Data fetching | TanStack Query | Caching, retries, stale-while-revalidate | SWR |
| UI | Tailwind CSS + Radix UI | Fast, accessible panels | MUI |
| Charts in panels | D3 or visx | Sunspots, orbit diagrams | Recharts |
| Build | Vite | Fast dev, code splitting | Next.js (only if SSR/SEO is needed) |
| Backend | Node.js (Fastify) or Python (FastAPI) + Postgres + Redis | Scheduled ingestion, caching, websocket | Serverless + KV for MVP |
| Hosting | Static site on CDN + small API service | Cheap, scalable | Vercel / Cloudflare + Fly.io |

**Handling the scale problem.** Real distances span 10 orders of magnitude, which breaks 32-bit float precision in the GPU.

- Use a **floating origin**: the selected object (or camera) is the scene origin, and everything else is positioned relative to it.
- Compute positions in 64-bit JavaScript numbers, convert to camera-relative 32-bit floats at render time.
- Use a **logarithmic depth buffer** to avoid z-fighting between near planets and far stars.
- Keep two scale modes (F-03) sharing the same math; Explorer mode applies a display transform, not different data.

**Performance techniques**

- Level of detail: textures 1K / 2K / 4K / 8K chosen by on-screen size; KTX2 compressed textures.
- GPU instancing and custom shaders for the asteroid belt and satellites (one draw call per layer).
- Stream small bodies by importance (size, brightness, user zoom) in binary tiles instead of loading 1M objects up front.
- Move heavy math (satellite propagation, belt updates) to a Web Worker.
- Adaptive quality: automatically drop resolution, shadows and effects if frame time exceeds budget.

**Why not CesiumJS or a prebuilt planetarium?** Cesium is excellent for Earth but not built for a full solar system. Embedding NASA Eyes or Stellarium Web gives less control over our data and UX; use them as design references only.

## 8. UX and UI Specification

**Layout (desktop)**

| Zone | Position | Contents |
| --- | --- | --- |
| 3D canvas | Full screen background | Scene, labels, selection ring |
| Top bar | Top | Logo, search, scale toggle (Realistic / Explorer), layer menu, settings |
| Object list | Left drawer (collapsible) | Tree: Sun, planets, moons, dwarfs, asteroids, comets, spacecraft |
| Detail panel | Right drawer | Tabs: Overview, Physical, Orbit, Missions, Media, News, Data sources |
| Time bar | Bottom | Play / pause / reverse, speed, date picker, 'Now', event markers |
| Info chips | Bottom left | Live ISS status, Kp index, next launch |

**Layout (mobile).** Canvas full screen; search and layers in a top sheet; detail panel as a bottom sheet with three snap heights (peek, half, full); time bar collapses to a single play button plus a date chip.

**Key interactions**

- **Orbit around a globe:** select a body, then drag to rotate the camera around it; scroll or pinch to zoom from orbit altitude down to near the surface. Camera stays locked to the body as it moves along its orbit. Double-click empties space to unlock.
- **Fly-to:** selecting from search or list animates the camera along a smooth path (about 2 to 4 s, scaled by distance), with an optional 'skip' tap.
- **Hover:** shows label and a mini card (name, type, distance from Sun).
- **Layers menu:** toggle Orbits, Labels, Moons, Asteroids, Comets, Satellites, ISS, Constellations, Aurora, Close approaches.
- **Share:** URL encodes selected object, date, camera and layers so any view can be linked.
- **Compare:** pick two bodies to see size and distance side by side (P1).

**Design language.** Dark, minimal, data-forward. Glassmorphism panels over the scene, one accent color, tabular numbers for live values, clear unit labels (km, AU, light-minutes) with a units switcher (metric / imperial).

**Onboarding.** A 20-second first-run intro: 'Drag to rotate, scroll to zoom, click any object, use the time bar to travel.' Skippable and never shown again.

**Loading experience.** Show the Sun and inner planets within the first seconds using low-res textures, then progressively upgrade; skeleton loaders in the panel while data arrives.

**Empty and error states.** Missing data shows 'Not available' with the reason; offline shows a banner and keeps the scene interactive.

**Accessibility.** Keyboard control for selection (Tab through the object list, Enter to fly), focus-visible styles, ARIA on panels, 4.5:1 text contrast, reduced-motion setting that disables fly-to animation and auto-rotate, screen-reader text summary of the selected object, WCAG 2.1 AA target.

**Localization.** English at launch; strings externalized for later languages.

## 9. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Performance | 60 fps on a 2020 laptop with integrated GPU; 30 fps on a mid-range phone; initial JS bundle under 300 KB gzipped (3D code split); initial scene under 5 MB of assets |
| Load time | First interactive frame under 4 s on 4G; full-quality textures stream in afterwards |
| Accuracy | Planet positions within 0.1 degree of Horizons (1900 to 2100); satellite positions within a few km of CelesTrak TLE epoch; displayed values rounded to meaningful precision |
| Reliability | API uptime 99.5%; graceful degradation to static data if any upstream or the backend fails |
| Security | NASA and any other keys live only on the backend (environment secrets, never shipped to the client); HTTPS only; strict CORS; rate limiting per IP; input validation on search; dependency scanning |
| Privacy | No account, no tracking cookies; optional privacy-friendly analytics; location (for ISS passes and sky view) requested only on user action and never stored |
| Scalability | CDN serves static data and textures; backend is stateless behind a load balancer; websockets fan out one upstream poll to all clients |
| Browser support | Last 2 versions of Chrome, Edge, Firefox, Safari; WebGL 2 required, WebGPU optional later; mobile Safari and Chrome Android |
| Accessibility | WCAG 2.1 AA for UI; reduced-motion mode; keyboard navigation |
| Observability | Structured logs, upstream success rate and latency per API, frame-rate and load-time RUM, alerts on stale data (for example ISS older than 60 s) |
| Cost | Target under 50 USD per month at 100k monthly users (CDN, small API server, small database) |
| Maintainability | TypeScript strict mode, unit tests for orbital math, snapshot tests for ingestion parsers, contract tests against each upstream API so format changes are caught early |

## 10. System Architecture

&#91;embedded content: system architecture · sources, backend, browser, CDN\]

Third-party APIs feed scheduled jobs; the browser reads only from our gateway and a CDN, so keys stay hidden and upstream rate limits never reach users.

### 10.1 Keys and accounts checklist

Only one key is mandatory. Everything else is open access, but should still be called with a descriptive User-Agent and a contact email.

| Item | Needed | Where to get it | Notes |
| --- | --- | --- | --- |
| NASA API key | Yes (free) | [api.nasa.gov](https://api.nasa.gov/) | Instant by email; keep on the backend only; covers APOD, NeoWs, DONKI, EPIC, EONET and more |
| Space-Track account | Optional (P2) | [space-track.org](https://www.space-track.org/) | Free login for the full satellite catalog and debris |
| Launch Library 2 token | Optional | [thespacedevs.com](https://thespacedevs.com/llapi) | Free tier works without it; paid tier lifts the hourly limit |
| JPL APIs, MPC, NOAA SWPC, CelesTrak, Where the ISS at, Open Notify, NASA Image Library, Wikipedia, Wikidata, Spaceflight News, Exoplanet Archive, SIMBAD, Gaia | No | None | Open access; respect published rate guidance |
| Hosting, domain, error tracking, analytics | Yes | Your choice | Not data keys, but needed to ship |

## 11. Roadmap and Milestones

&#91;embedded content: roadmap · 5 phases, 4 gates\]

Week ranges are planning estimates for a small team (about 2 to 3 engineers and 1 designer) and should be re-baselined after Phase 0. A phase starts only when the gate above it is met.

**Definition of done for v1 (end of Phase 3):** all P0 and P1 requirements pass, the success metrics in section 2 are met on target devices, every displayed value shows its source, and the attribution page is live.

## 12. Risks, Legal and Open Questions

### 12.1 Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Upstream API rate limits or outages (NASA, Launch Library, Where the ISS at) | High | Medium | Central backend cache, one poller per upstream, stale-while-revalidate, fallback sources |
| Upstream format changes or API retirement (for example Mars rover photo feeds, community APIs) | Medium | Medium | Contract tests, adapter layer per source, feature flags to hide a layer |
| Rendering performance on weak devices | High | High | LOD, instancing, adaptive quality, Explorer mode defaults on mobile |
| Float precision and depth artifacts at solar-system scale | High | High | Floating origin, log depth buffer, 64-bit CPU math (see section 7) |
| Scraping blocked or against a site's terms | Medium | Low | API and bulk file first; scrape only permitted pages; fallback to Wikidata and JPL |
| Data inconsistency between sources | Medium | Medium | Source priority order (JPL > NASA > Wikidata > Wikipedia), show the source for each value |
| Scope creep into the whole universe | High | High | Phase gates in the roadmap; exoplanets and deep space only after Phase 3 |
| Cost growth with traffic | Low | Medium | CDN-first design, caching, ISS fan-out by websocket |

### 12.2 Licensing and attribution

- **NASA and JPL content** is generally public domain, but individual images, logos and some third-party material have restrictions; follow NASA's media usage guidelines and do not imply NASA endorsement.
- **CC BY / CC BY-SA assets** (Solar System Scope textures, Wikipedia text, HYG catalog) require visible credit; add an 'Attributions' page and per-panel credits.
- **Terms of service:** read and comply with each API's terms (for example CelesTrak usage guidance, Launch Library tier limits). Use a descriptive User-Agent and contact email.
- **Scraping:** respect robots.txt and published terms; no login-gated, paywalled or rate-abusive scraping.
- **Legal review:** this PRD is not legal advice; have the license list reviewed before public launch.

### 12.3 Open questions

- [ ] Is this a free public project, a portfolio piece, or a product with a revenue plan? (Affects hosting tier and Launch Library plan.)
- [ ] Should Phase 1 target desktop first, or mobile at equal priority?
- [ ] Are guided tours and educational content in scope for v1, and who writes them?
- [ ] Is SEO / shareable object pages (for example /planet/mars) required? If yes, consider Next.js with server rendering.
- [ ] Preferred backend language and hosting provider?
- [ ] Which languages beyond English matter first?
