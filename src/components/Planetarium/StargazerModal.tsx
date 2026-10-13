import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  X,
  Compass,
  Eye,
  Star,
  MapPin,
  Satellite,
} from 'lucide-react';
import { GLOBAL_WEATHER_CITIES, type GlobalWeatherCity } from '../../services/weatherService';
import { getMilkyWayTexture } from '../Canvas3D/textures';
import { sound } from '../../services/sound';

interface StargazerModalProps {
  isOpen: boolean;
  onClose: () => void;
  simDate: Date;
}

// Major visible constellations with approximate RA (hours) and Dec (degrees) and star lines
interface ConstellationData {
  id: string;
  name: string;
  english: string;
  raHours: number;
  decDeg: number;
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn' | 'Circumpolar';
  brightestStar: string;
  mythology: string;
}

const MAJOR_CONSTELLATIONS: ConstellationData[] = [
  {
    id: 'orion',
    name: 'Orion',
    english: 'The Hunter',
    raHours: 5.5,
    decDeg: 0.0,
    season: 'Winter',
    brightestStar: 'Rigel & Betelgeuse',
    mythology: 'The iconic celestial hunter adorned with his three-star belt, Betelgeuse (red supergiant), and blue supergiant Rigel.',
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major',
    english: 'The Great Bear / Big Dipper',
    raHours: 11.3,
    decDeg: 55.0,
    season: 'Circumpolar',
    brightestStar: 'Alioth',
    mythology: 'Contains the seven stars of the Big Dipper pointer stars (Merak & Dubhe) pointing toward Polaris the North Star.',
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    english: 'The Queen',
    raHours: 1.0,
    decDeg: 60.0,
    season: 'Circumpolar',
    brightestStar: 'Schedar',
    mythology: 'Distinctive W-shaped constellation opposite the Big Dipper across the celestial pole.',
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    english: 'The Swan / Northern Cross',
    raHours: 20.6,
    decDeg: 42.0,
    season: 'Summer',
    brightestStar: 'Deneb',
    mythology: 'Flying along the Milky Way; Deneb forms the prominent Summer Triangle with Vega and Altair.',
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    english: 'The Scorpion',
    raHours: 16.9,
    decDeg: -30.0,
    season: 'Summer',
    brightestStar: 'Antares',
    mythology: 'Curving tail marked by glowing red supergiant Antares ("Rival of Mars") in the heart of the galaxy.',
  },
  {
    id: 'taurus',
    name: 'Taurus',
    english: 'The Bull',
    raHours: 4.6,
    decDeg: 16.0,
    season: 'Winter',
    brightestStar: 'Aldebaran',
    mythology: 'Contains the magnificent Pleiades (Seven Sisters) open star cluster and fiery orange Aldebaran.',
  },
  {
    id: 'crux',
    name: 'Crux',
    english: 'The Southern Cross',
    raHours: 12.4,
    decDeg: -60.0,
    season: 'Spring',
    brightestStar: 'Acrux',
    mythology: 'The most famous asterism of the Southern Hemisphere, used for centuries to find the South Celestial Pole.',
  },
  {
    id: 'leo',
    name: 'Leo',
    english: 'The Lion',
    raHours: 10.7,
    decDeg: 15.0,
    season: 'Spring',
    brightestStar: 'Regulus',
    mythology: 'Features the distinctive sickle-shaped head and heart star Regulus, ushering in spring skies.',
  },
];

export const StargazerModal: React.FC<StargazerModalProps> = ({ isOpen, onClose, simDate }) => {
  const [selectedCity, setSelectedCity] = useState<GlobalWeatherCity>(GLOBAL_WEATHER_CITIES[0]); // Tokyo default
  const [selectedConstellation, setSelectedConstellation] = useState<ConstellationData>(MAJOR_CONSTELLATIONS[0]);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  // Compute Local Sidereal Time and calculate Alt/Az for a given RA and Dec
  const calculateAltAz = (raHours: number, decDeg: number, latDeg: number, lonDeg: number, date: Date) => {
    // Greenwich Mean Sidereal Time (GMST) approximation
    const d = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / (1000 * 86400);
    const gmstHours = (18.697374558 + 24.06570982441908 * d) % 24;
    const lstHours = (gmstHours + lonDeg / 15 + 24) % 24;

    const haHours = (lstHours - raHours + 24) % 24;
    const haRad = (haHours * 15 * Math.PI) / 180;
    const decRad = (decDeg * Math.PI) / 180;
    const latRad = (latDeg * Math.PI) / 180;

    // Altitude
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
    const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const altDeg = (altRad * 180) / Math.PI;

    // Azimuth
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altRad)) / (Math.cos(latRad) * Math.cos(altRad));
    let azDeg = (Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180) / Math.PI;
    if (Math.sin(haRad) > 0) azDeg = 360 - azDeg;

    return {
      altitudeDeg: altDeg,
      azimuthDeg: azDeg,
      isVisible: altDeg > 0,
    };
  };

  // 3D Planetarium Canvas
  useEffect(() => {
    if (!isOpen || !canvasMountRef.current) return;

    const container = canvasMountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Deep celestial sphere skybox
    const skyGeo = new THREE.SphereGeometry(100, 48, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      map: getMilkyWayTexture(),
      side: THREE.BackSide,
      transparent: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Local Horizon Ground Plane (Circle showing terrestrial ground below Alt = 0)
    const groundGeo = new THREE.CircleGeometry(40, 64);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x050c18,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = Math.PI / 2;
    groundMesh.position.y = -0.5;
    scene.add(groundMesh);

    // Compass ring on the horizon
    const horizonRingGeo = new THREE.RingGeometry(39.5, 40.2, 64);
    const horizonRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const horizonRing = new THREE.Mesh(horizonRingGeo, horizonRingMat);
    horizonRing.rotation.x = Math.PI / 2;
    horizonRing.position.y = -0.48;
    scene.add(horizonRing);

    // Constellation Marker Beacons in Planetarium Coordinates
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    MAJOR_CONSTELLATIONS.forEach((c) => {
      const { altitudeDeg, azimuthDeg, isVisible } = calculateAltAz(
        c.raHours,
        c.decDeg,
        selectedCity.lat,
        selectedCity.lon,
        simDate
      );

      // Convert Alt/Az to 3D dome direction:
      // Azimuth 0 = North (+Z), 90 = East (+X), 180 = South (-Z), 270 = West (-X)
      const altRad = (altitudeDeg * Math.PI) / 180;
      const azRad = (azimuthDeg * Math.PI) / 180;
      const r = 50;

      const y = r * Math.sin(altRad);
      const x = r * Math.cos(altRad) * Math.sin(azRad);
      const z = -r * Math.cos(altRad) * Math.cos(azRad);

      const starGeo = new THREE.SphereGeometry(c.id === selectedConstellation.id ? 0.75 : 0.45, 12, 12);
      const starMat = new THREE.MeshBasicMaterial({
        color: isVisible ? (c.id === selectedConstellation.id ? 0x38bdf8 : 0xfde047) : 0x475569,
        transparent: true,
        opacity: isVisible ? 1.0 : 0.3,
      });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.position.set(x, y, z);
      constellationGroup.add(starMesh);

      // Connect subtle vertical altitude guide line to horizon if visible
      if (isVisible) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0, z),
          new THREE.Vector3(x, y, z),
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.18,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        constellationGroup.add(line);
      }
    });

    // Interactive Drag to Pan 360° Sky
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let cameraYaw = 0;
    let cameraPitch = 0.35; // Looking slightly upward toward zenith

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        cameraYaw -= dx * 0.005;
        cameraPitch = Math.max(-0.2, Math.min(1.4, cameraPitch + dy * 0.005));
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onMouseDown);
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Camera look direction from yaw and pitch
      const targetX = Math.sin(cameraYaw) * Math.cos(cameraPitch);
      const targetY = Math.sin(cameraPitch);
      const targetZ = -Math.cos(cameraYaw) * Math.cos(cameraPitch);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onMouseDown);
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointerup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [isOpen, selectedCity, selectedConstellation, simDate]);

  if (!isOpen) return null;

  const currentAltAz = calculateAltAz(
    selectedConstellation.raHours,
    selectedConstellation.decDeg,
    selectedCity.lat,
    selectedCity.lon,
    simDate
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Eye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">Stargazer Planetarium · Night Sky View</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-indigo-950/80 text-indigo-400 border border-indigo-700/60">
                  REAL-TIME CELESTIAL HORIZON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stand in {selectedCity.name}, {selectedCity.country} and look up at visible constellations and planets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* City Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  sound.playClick();
                  const found = GLOBAL_WEATHER_CITIES.find((c) => c.name === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {GLOBAL_WEATHER_CITIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-slate-900 text-slate-200">
                    {c.name}, {c.country} ({c.lat.toFixed(1)}°, {c.lon.toFixed(1)}°)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title="Close Planetarium"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- MAIN SPLIT (360° PLANETARIUM DOME + CONSTELLATION DOSSIER) --- */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* LEFT: 360° PLANETARIUM DOME CANVAS */}
          <div className="relative flex-1 h-[45vh] lg:h-auto bg-slate-950 overflow-hidden">
            <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Compass HUD Badge */}
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2 shadow-xl">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>OBSERVER: {selectedCity.name} ({selectedCity.lat.toFixed(2)}°N, {selectedCity.lon.toFixed(2)}°E)</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800/60 text-[10px] text-slate-400">
                Drag to look around 360° · Horizon ring marks local ground
              </div>
            </div>

            {/* Cardinal Direction Badges Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-300 shadow-xl">
              <span className="text-cyan-400 font-bold">N</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-bold">E</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-bold">S</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-bold">W</span>
              <span className="text-slate-500 text-[10px] ml-2">Cardinal Horizon Ring</span>
            </div>
          </div>

          {/* RIGHT: CONSTELLATIONS & SATELLITE FLYOVER CARDS */}
          <div className="w-full lg:w-[440px] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/80 overflow-y-auto p-5 space-y-4">
            {/* Selected Constellation Hero Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                    <h3 className="text-lg font-bold text-white tracking-tight">{selectedConstellation.name}</h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedConstellation.english} · {selectedConstellation.season} Sky
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold ${
                    currentAltAz.isVisible
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {currentAltAz.isVisible ? 'VISIBLE NOW' : 'BELOW HORIZON'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedConstellation.mythology}</p>

              {/* Alt / Azimuth Stats */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">ALTITUDE (ELEVATION)</div>
                  <div
                    className={`font-bold mt-0.5 ${
                      currentAltAz.altitudeDeg > 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {currentAltAz.altitudeDeg.toFixed(1)}° {currentAltAz.altitudeDeg > 0 ? 'Above Horizon' : 'Below Ground'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">AZIMUTH (BEARING)</div>
                  <div className="text-cyan-400 font-bold mt-0.5">
                    {currentAltAz.azimuthDeg.toFixed(1)}° Compass
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">BRIGHTEST STAR</div>
                  <div className="text-amber-300 font-bold mt-0.5 truncate">{selectedConstellation.brightestStar}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">CELESTIAL COORD</div>
                  <div className="text-slate-300 mt-0.5 font-bold">
                    RA {selectedConstellation.raHours}h · Dec {selectedConstellation.decDeg}°
                  </div>
                </div>
              </div>
            </div>

            {/* Constellation Browser List */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center justify-between">
                <span>Constellations Directory</span>
                <span className="text-[10px] text-slate-500">Pick to inspect</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {MAJOR_CONSTELLATIONS.map((c) => {
                  const isSelected = c.id === selectedConstellation.id;
                  const stat = calculateAltAz(c.raHours, c.decDeg, selectedCity.lat, selectedCity.lon, simDate);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedConstellation(c);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/80 shadow-lg'
                          : 'bg-slate-950/40 hover:bg-slate-850 text-slate-300 border border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stat.isVisible ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <div>
                          <div className="text-xs font-bold text-white">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.english}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <div className={stat.isVisible ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          Alt {stat.altitudeDeg.toFixed(0)}°
                        </div>
                        <div className="text-slate-500">Az {stat.azimuthDeg.toFixed(0)}°</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Naked-Eye ISS Flyover Prediction */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 uppercase">
                <Satellite className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Next Visible ISS Flyover Pass</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The International Space Station appears as a bright star traversing from West to East over{' '}
                <span className="text-indigo-300 font-bold">{selectedCity.name}</span>. Visible magnitude reaches{' '}
                <span className="text-amber-300 font-bold">-3.2</span> (brighter than Sirius).
              </p>
              <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-400">
                <span>Peak Elevation: 68° High</span>
                <span className="text-indigo-400 font-bold">Duration: ~6 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
