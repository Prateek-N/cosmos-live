import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  ArrowLeft,
  Globe,
  Satellite as SatelliteIcon,
  Compass,
  Wind,
  Thermometer,
  ZoomIn,
  X,
  Flame,
  ExternalLink,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EARTH_SATELLITES } from '../../data/earthSatellites';
import type { EarthSatellite } from '../../types/satellite';
import {
  getCelestialBodyTexture,
  getEarthCloudsTexture,
  getEarthNightTexture,
  createEarthDayNightMaterial,
  getMilkyWayTexture,
} from '../Canvas3D/textures';
import {
  fetchLiveEarthWeather,
  GLOBAL_WEATHER_CITIES,
  type EarthWeather,
} from '../../services/weatherService';
import {
  calculateSatelliteLiveTrack,
  type SatelliteLiveTrack,
} from '../../services/satelliteTracker';
import {
  fetchEONETEvents,
  type EONETEvent,
  type EONETEventType,
} from '../../services/eonetService';
import { sound } from '../../services/sound';

interface EarthCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'weather' | 'eonet' | 'satellites';
}

export const EarthCommandCenter: React.FC<EarthCommandCenterProps> = ({
  isOpen,
  onClose,
  initialTab = 'weather',
}) => {
  const [viewMode, setViewMode] = useState<'orbit' | 'surface'>('orbit');
  const [selectedSat, setSelectedSat] = useState<EarthSatellite | null>(EARTH_SATELLITES[0]);
  const [weatherData, setWeatherData] = useState<EarthWeather | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [activeCity, setActiveCity] = useState<string>('Tokyo');
  const [liveTrack, setLiveTrack] = useState<SatelliteLiveTrack>(() =>
    calculateSatelliteLiveTrack(EARTH_SATELLITES[0])
  );
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(true);

  // EONET Live Natural Events State
  const [activeTab, setActiveTab] = useState<'weather' | 'eonet' | 'satellites'>(initialTab);
  const [eonetEvents, setEonetEvents] = useState<EONETEvent[]>([]);
  const [isEonetLoading, setIsEonetLoading] = useState<boolean>(false);
  const [eonetFilter, setEonetFilter] = useState<EONETEventType | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<EONETEvent | null>(null);

  // 3D Canvas Mount Ref
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  // Leaflet Map Mount Ref
  const mapMountRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const hazardGroupRef = useRef<THREE.Group | null>(null);
  const targetCoordsRef = useRef<[number, number] | null>(null);

  // 0. Synchronize initial tab
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // 1. Initial Weather Load
  useEffect(() => {
    if (!isOpen) return;
    const initialCity = GLOBAL_WEATHER_CITIES[0];
    setIsWeatherLoading(true);
    fetchLiveEarthWeather(initialCity.lat, initialCity.lon, initialCity.name, initialCity.country)
      .then((w) => {
        setWeatherData(w);
        setIsWeatherLoading(false);
      });
  }, [isOpen]);

  // 1b. Load NASA EONET Live Natural Hazards
  useEffect(() => {
    if (!isOpen) return;
    setIsEonetLoading(true);
    fetchEONETEvents(60).then((events) => {
      setEonetEvents(events);
      if (events.length > 0 && !selectedEvent) {
        setSelectedEvent(events[0]);
      }
      setIsEonetLoading(false);
    });
  }, [isOpen]);

  // 2. Real-time satellite ground track ticker
  useEffect(() => {
    if (!isOpen || !selectedSat) return;
    const update = () => setLiveTrack(calculateSatelliteLiveTrack(selectedSat));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedSat]);

  // -----------------------------------------------------------------
  // 3. THREE.JS 3D EARTH WITH DAY/NIGHT TERMINATOR & 3D SATELLITES
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || viewMode !== 'orbit' || !canvasMountRef.current) return;

    const container = canvasMountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Cosmic Milky Way Backdrop Dome
    const skyGeo = new THREE.SphereGeometry(150, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      map: getMilkyWayTexture(),
      side: THREE.BackSide,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // Earth Sphere (radius 5)
    const earthRadius = 5;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const dayTex = getCelestialBodyTexture('earth', 'earth', '#22d3ee');
    const nightTex = getEarthNightTexture();

    // Simulated Sun position (from upper right front: +X, +Y, +Z)
    const sunPos = new THREE.Vector3(25, 12, 18);
    const sunDir = sunPos.clone().normalize();
    const earthMat = createEarthDayNightMaterial(dayTex, nightTex, sunDir);

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMeshRef.current = earthMesh;
    scene.add(earthMesh);

    // Realistic Atmospheric Clouds (alphaMap ensures black background is 100% transparent)
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.012, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      alphaMap: getEarthCloudsTexture(),
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // Ambient & Directional Sun Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    // 3D Polar Auroral Ovals (Aurora Borealis & Australis)
    const createAuroraRing = (isNorth: boolean) => {
      const ringGeo = new THREE.RingGeometry(earthRadius * 0.32, earthRadius * 0.52, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x22c55e), // Emerald atomic oxygen line (557.7nm)
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = isNorth ? earthRadius * 0.94 : -earthRadius * 0.94;
      return ringMesh;
    };
    const auroraNorth = createAuroraRing(true);
    const auroraSouth = createAuroraRing(false);
    earthMesh.add(auroraNorth);
    earthMesh.add(auroraSouth);

    // 3D Active Natural Hazards Group (EONET Markers on Earth Surface)
    const hazardGroup = new THREE.Group();
    earthMesh.add(hazardGroup);
    hazardGroupRef.current = hazardGroup;

    // 3D Satellites Constellation Shell
    const satGroup = new THREE.Group();
    scene.add(satGroup);

    const beaconMeshes: { sat: EarthSatellite; mesh: THREE.Mesh; orbR: number; speed: number; angle: number; inc: number }[] = [];

    EARTH_SATELLITES.forEach((sat, i) => {
      let orbR = earthRadius * 1.25;
      let col = 0x22d3ee; // LEO cyan
      let speed = 0.8;

      if (sat.category === 'observatory') {
        orbR = earthRadius * 1.45;
        col = 0xfbbf24;
        speed = 0.65;
      } else if (sat.category === 'earth_observation') {
        orbR = earthRadius * 1.6;
        col = 0x34d399;
        speed = 0.55;
      } else if (sat.category === 'navigation') {
        orbR = earthRadius * 2.3;
        col = 0x818cf8;
        speed = 0.35;
      } else if (sat.category === 'weather') {
        orbR = earthRadius * 3.5;
        col = 0x38bdf8;
        speed = 0.2;
      } else if (sat.category === 'communications') {
        orbR = earthRadius * 1.35;
        col = 0xc084fc;
        speed = 0.75;
      }

      // Orbit Line
      const incRad = (sat.orbit.inclinationDeg * Math.PI) / 180;
      const curve = new THREE.EllipseCurve(0, 0, orbR, orbR, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(64);
      const orbGeo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0, p.y)));
      const orbMat = new THREE.LineBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.3,
      });
      const orbLine = new THREE.Line(orbGeo, orbMat);
      orbLine.rotation.x = incRad;
      orbLine.rotation.y = (i * 0.45);
      satGroup.add(orbLine);

      // Beacon Mesh
      const bGeo = new THREE.SphereGeometry(earthRadius * 0.045, 12, 12);
      const bMat = new THREE.MeshBasicMaterial({ color: col });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.userData = { satId: sat.id };
      satGroup.add(bMesh);

      beaconMeshes.push({
        sat,
        mesh: bMesh,
        orbR,
        speed,
        angle: (i * 1.2),
        inc: incRad,
      });
    });

    // Raycaster for clicking satellites in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let mouseDownPos = { x: 0, y: 0 };

    const handleClickCanvas = (e: MouseEvent) => {
      const moved = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (moved > 6) return; // Ignore drag release

      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // 1. Check natural hazard marker clicks on Earth surface
      if (hazardGroupRef.current) {
        const hazardHits = raycaster.intersectObjects(hazardGroupRef.current.children);
        if (hazardHits.length > 0) {
          sound.playSelect();
          const ev = hazardHits[0].object.userData.event as EONETEvent;
          if (ev) {
            setSelectedEvent(ev);
            setActiveTab('eonet');
            targetCoordsRef.current = [ev.latitude, ev.longitude];
            return;
          }
        }
      }

      // 2. Check satellite clicks
      const satIntersects = raycaster.intersectObjects(beaconMeshes.map((b) => b.mesh));
      if (satIntersects.length > 0) {
        sound.playSelect();
        const hitSatId = satIntersects[0].object.userData.satId;
        const found = EARTH_SATELLITES.find((s) => s.id === hitSatId);
        if (found) {
          setSelectedSat(found);
          setIsDossierOpen(true);
          setActiveTab('satellites');
        }
        return;
      }

      // 3. Check 3D Earth surface click to fetch weather anywhere in the world
      const earthIntersects = raycaster.intersectObject(earthMesh);
      if (earthIntersects.length > 0) {
        const hit = earthIntersects[0];
        const localPt = hit.point.clone().applyMatrix4(earthMesh.matrixWorld.clone().invert()).normalize();
        const lat = Math.asin(Math.max(-1, Math.min(1, localPt.y))) * (180 / Math.PI);
        let lon = (Math.atan2(localPt.x, localPt.z) * (180 / Math.PI)) - 90;
        if (lon > 180) lon -= 360;
        if (lon < -180) lon += 360;

        sound.playClick();
        setActiveTab('weather');
        targetCoordsRef.current = [lat, lon];
        setIsWeatherLoading(true);
        const coordName = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;
        setActiveCity(coordName);
        fetchLiveEarthWeather(lat, lon, 'Clicked Earth Coordinates', coordName).then((w) => {
          setWeatherData(w);
          setIsWeatherLoading(false);
        });
      }
    };

    container.addEventListener('click', handleClickCanvas);

    // Orbit controls drag
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      earthMesh.rotation.y += dx * 0.005;
      cloudMesh.rotation.y += dx * 0.006;
      satGroup.rotation.y += dx * 0.003;
      camera.position.y = Math.max(-15, Math.min(15, camera.position.y - dy * 0.04));
      camera.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.015;
      camera.position.z = Math.max(7.5, Math.min(45, camera.position.z + zoomDelta));
      camera.position.y = (camera.position.z / 22) * 8;
      camera.lookAt(0, 0, 0);

      // Infinite zoom threshold: if zoomed very close (< 8.2), calculate exact coordinate being zoomed into
      if (camera.position.z <= 8.2 && e.deltaY < 0) {
        sound.playWarp();

        // Raycast from mouse cursor (or center of view) onto 3D Earth
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        let hits = raycaster.intersectObject(earthMesh);
        if (hits.length === 0) {
          // If cursor was near edge of sphere, raycast from center of camera
          raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
          hits = raycaster.intersectObject(earthMesh);
        }

        if (hits.length > 0) {
          const localPt = hits[0].point.clone().applyMatrix4(earthMesh.matrixWorld.clone().invert()).normalize();
          const lat = Math.asin(Math.max(-1, Math.min(1, localPt.y))) * (180 / Math.PI);
          let lon = (Math.atan2(localPt.x, localPt.z) * (180 / Math.PI)) - 90;
          if (lon > 180) lon -= 360;
          if (lon < -180) lon += 360;
          targetCoordsRef.current = [lat, lon];
        }

        setViewMode('surface');
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Axial rotation
      earthMesh.rotation.y += delta * 0.08;
      cloudMesh.rotation.y += delta * 0.11;

      // Satellite orbital progression
      beaconMeshes.forEach((b) => {
        b.angle += delta * b.speed * 0.4;
        const x = b.orbR * Math.cos(b.angle);
        const y = b.orbR * Math.sin(b.angle) * Math.sin(b.inc);
        const z = b.orbR * Math.sin(b.angle) * Math.cos(b.inc);
        b.mesh.position.set(x, y, z);
      });

      // Update sun direction in shader relative to Earth rotation
      if (earthMat.uniforms?.uSunDirection) {
        earthMat.uniforms.uSunDirection.value.copy(sunDir);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('click', handleClickCanvas);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [isOpen, viewMode]);

  // -----------------------------------------------------------------
  // 4. LEAFLET MAP: INFINITE ZOOM DOWN TO ROADS & CITIES
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || viewMode !== 'surface' || !mapMountRef.current) return;

    const targetCenter: [number, number] = targetCoordsRef.current
      ? targetCoordsRef.current
      : weatherData
      ? [weatherData.latitude, weatherData.longitude]
      : [35.6762, 139.6503];

    if (!mapInstanceRef.current) {
      const map = L.map(mapMountRef.current, {
        center: targetCenter,
        zoom: 12,
        minZoom: 3,
        maxZoom: 19,
        zoomControl: false,
      });

      // 1. High-resolution Satellite Imagery (Esri World Imagery)
      const esriSatellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri World Imagery & NASA',
          maxZoom: 19,
        }
      );
      esriSatellite.addTo(map);

      // 2. High-contrast Roads, Highways & Street Names Overlay
      const roadOverlay = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'OpenStreetMap Roads & Transportation',
          maxZoom: 19,
          opacity: 0.95,
        }
      );
      roadOverlay.addTo(map);

      // 3. Place Labels & Boundaries Overlay
      const labelsOverlay = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          opacity: 0.9,
        }
      );
      labelsOverlay.addTo(map);

      // Map Click to fetch live weather at that exact clicked coordinate
      map.on('click', (e: L.LeafletMouseEvent) => {
        sound.playClick();
        setIsWeatherLoading(true);
        const { lat, lng } = e.latlng;
        fetchLiveEarthWeather(lat, lng, 'Selected Map Location', 'Earth Coordinates').then((w) => {
          setWeatherData(w);
          setIsWeatherLoading(false);
        });
      });

      mapInstanceRef.current = map;
    } else if (targetCoordsRef.current) {
      mapInstanceRef.current.setView(targetCoordsRef.current, 12);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, viewMode]);

  // 4b. LIVE SATELLITE GROUND TRACK & FOOTPRINT OVERLAY ON LEAFLET MAP
  useEffect(() => {
    if (!isOpen || viewMode !== 'surface' || !mapInstanceRef.current || !selectedSat) return;
    const map = mapInstanceRef.current;

    const existingLayer = (map as any)._satLayerGroup as L.LayerGroup | undefined;
    if (existingLayer) {
      existingLayer.clearLayers();
      map.removeLayer(existingLayer);
    }

    const satGroup = L.layerGroup();

    // Line-of-sight communication horizon footprint
    const horizonRadiusMeters = Math.min(3000000, Math.max(500000, selectedSat.orbit.altitudeKm * 1500));
    const footprint = L.circle([liveTrack.latitude, liveTrack.longitude], {
      radius: horizonRadiusMeters,
      color: '#06b6d4',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#06b6d4',
      fillOpacity: 0.08,
    });
    footprint.addTo(satGroup);

    // Projected sinusoidal ground track (next 90 minutes)
    const trackPoints: [number, number][] = [];
    const stepMin = 3;
    for (let m = -30; m <= 90; m += stepMin) {
      const futureDate = new Date(Date.now() + m * 60 * 1000);
      const pt = calculateSatelliteLiveTrack(selectedSat, futureDate);
      trackPoints.push([pt.latitude, pt.longitude]);
    }

    const segments: [number, number][][] = [[]];
    for (let i = 0; i < trackPoints.length; i++) {
      const cur = trackPoints[i];
      const prev = trackPoints[i - 1];
      if (prev && Math.abs(cur[1] - prev[1]) > 180) {
        segments.push([cur]);
      } else {
        segments[segments.length - 1].push(cur);
      }
    }

    segments.forEach((seg) => {
      if (seg.length > 1) {
        L.polyline(seg, {
          color: '#22d3ee',
          weight: 2,
          opacity: 0.6,
          dashArray: '6, 6',
        }).addTo(satGroup);
      }
    });

    // Sub-Satellite Marker with Custom Glowing Icon
    const satIcon = L.divIcon({
      className: 'satellite-leaflet-marker',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:#0891b2;border:2px solid #67e8f9;border-radius:50%;box-shadow:0 0 12px #22d3ee;cursor:pointer;">
        <span style="font-size:12px;">🛰️</span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker([liveTrack.latitude, liveTrack.longitude], { icon: satIcon });
    marker.bindTooltip(`<b>${selectedSat.displayName}</b><br/>Alt: ${selectedSat.orbit.altitudeKm} km`, {
      direction: 'top',
      offset: [0, -12],
    });
    marker.addTo(satGroup);

    satGroup.addTo(map);
    (map as any)._satLayerGroup = satGroup;

    return () => {
      if (map && (map as any)._satLayerGroup) {
        (map as any)._satLayerGroup.clearLayers();
        map.removeLayer((map as any)._satLayerGroup);
        (map as any)._satLayerGroup = null;
      }
    };
  }, [isOpen, viewMode, selectedSat, liveTrack.latitude, liveTrack.longitude]);

  // 4c. 3D EONET HAZARD PINS UPDATE ON 3D EARTH GLOBE
  useEffect(() => {
    if (!hazardGroupRef.current || viewMode !== 'orbit') return;
    const group = hazardGroupRef.current;
    group.clear();

    const filtered = eonetEvents.filter(
      (ev) => eonetFilter === 'all' || ev.type === eonetFilter
    );

    const earthRadius = 5;
    filtered.forEach((ev) => {
      const phi = (90 - ev.latitude) * (Math.PI / 180);
      const theta = (ev.longitude + 90) * (Math.PI / 180);
      const r = earthRadius * 1.018; // slightly above clouds
      const x = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);

      // Outer glowing ring
      const ringGeo = new THREE.RingGeometry(0.08, 0.16, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ev.glowColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x, y, z);
      ringMesh.lookAt(x * 2, y * 2, z * 2);
      group.add(ringMesh);

      // Center sphere
      const geo = new THREE.SphereGeometry(0.09, 10, 10);
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ev.color) });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { event: ev };
      group.add(mesh);
    });
  }, [isOpen, viewMode, eonetEvents, eonetFilter]);

  // 4d. LIVE EONET NATURAL HAZARDS ON LEAFLET MAP
  useEffect(() => {
    if (!isOpen || viewMode !== 'surface' || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const existingLayer = (map as any)._eonetLayerGroup as L.LayerGroup | undefined;
    if (existingLayer) {
      existingLayer.clearLayers();
      map.removeLayer(existingLayer);
    }

    const eonetGroup = L.layerGroup();
    const filtered = eonetEvents.filter(
      (ev) => eonetFilter === 'all' || ev.type === eonetFilter
    );

    filtered.forEach((ev) => {
      const icon = L.divIcon({
        className: 'eonet-leaflet-icon',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:${ev.color}28;border:2px solid ${ev.color};border-radius:50%;box-shadow:0 0 12px ${ev.glowColor};cursor:pointer;font-size:14px;">
          ${ev.emoji}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([ev.latitude, ev.longitude], { icon });
      marker.bindTooltip(`<b>${ev.emoji} ${ev.title}</b><br/><span style="color:#94a3b8;font-size:10px;">${ev.category} · ${ev.date}</span>`, {
        direction: 'top',
        offset: [0, -14],
      });

      marker.on('click', () => {
        sound.playSelect();
        setSelectedEvent(ev);
        setActiveTab('eonet');
      });

      marker.addTo(eonetGroup);
    });

    eonetGroup.addTo(map);
    (map as any)._eonetLayerGroup = eonetGroup;

    return () => {
      if (map && (map as any)._eonetLayerGroup) {
        (map as any)._eonetLayerGroup.clearLayers();
        map.removeLayer((map as any)._eonetLayerGroup);
        (map as any)._eonetLayerGroup = null;
      }
    };
  }, [isOpen, viewMode, eonetEvents, eonetFilter]);

  const handleEventSelect = (ev: EONETEvent) => {
    sound.playSelect();
    setSelectedEvent(ev);
    setActiveTab('eonet');
    targetCoordsRef.current = [ev.latitude, ev.longitude];

    if (viewMode === 'surface' && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([ev.latitude, ev.longitude], 9, { duration: 1.8 });
    } else if (earthMeshRef.current) {
      const targetRotY = -((ev.longitude + 90) * Math.PI) / 180;
      earthMeshRef.current.rotation.y = targetRotY;
    }

    fetchLiveEarthWeather(ev.latitude, ev.longitude, ev.title, ev.category).then((w) => {
      setWeatherData(w);
    });
  };

  const handleCitySelect = (city: (typeof GLOBAL_WEATHER_CITIES)[0]) => {
    sound.playSelect();
    setActiveCity(city.name);
    targetCoordsRef.current = [city.lat, city.lon];
    setIsWeatherLoading(true);
    fetchLiveEarthWeather(city.lat, city.lon, city.name, city.country).then((w) => {
      setWeatherData(w);
      setIsWeatherLoading(false);
    });

    if (viewMode === 'surface' && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lon], 13, { duration: 1.8 });
    } else if (earthMeshRef.current) {
      // Orient 3D globe to face the chosen city
      const targetRotY = -((city.lon + 90) * Math.PI) / 180;
      earthMeshRef.current.rotation.y = targetRotY;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 pointer-events-auto overflow-hidden animate-fade-in">
      {/* ------------------------------------------------------------- */}
      {/* TOP COMMAND BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="h-16 px-4 md:px-6 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-semibold transition-all shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Return to Solar System</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Globe className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-100">
                  Earth Command Station
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  LIVE DIGITAL TWIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Day/Night Terminator · 3D Satellite Shell · Street-Level Road Zoom · Live Weather
              </p>
            </div>
          </div>
        </div>

        {/* VIEW MODE SWITCHER PILL */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('orbit');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              viewMode === 'orbit'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <SatelliteIcon className="w-3.5 h-3.5" />
            <span>3D Orbital Space</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setViewMode('surface');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
              viewMode === 'surface'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Surface Roads &amp; Streets</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEWPORT: 3D ORBIT VS DEEP-ZOOM SURFACE ROADS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 relative overflow-hidden">
        {/* VIEW 1: 3D ORBITAL SPACE */}
        {viewMode === 'orbit' && (
          <div className="w-full h-full relative">
            <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* FLOATING ZOOM HELPER */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-none hidden sm:flex items-center gap-2 p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 font-mono text-xs">
              <ZoomIn className="w-4 h-4 text-cyan-400" />
              <span>Scroll mouse wheel inward toward Earth to enter Street-Level Zoom</span>
            </div>

            {/* SWITCH TO STREET VIEW BUTTON */}
            <div className="absolute top-6 left-6 z-20">
              <button
                onClick={() => {
                  sound.playWarp();
                  setViewMode('surface');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-700/80 text-indigo-300 hover:text-white font-mono text-xs font-bold backdrop-blur-md shadow-xl transition-all"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Zoom Down to City Roads &amp; Streets</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LEAFLET DEEP-ZOOM MAP (SATELLITE + ROADS & STREET NAMES) */}
        {viewMode === 'surface' && (
          <div className="w-full h-full relative">
            <div ref={mapMountRef} className="w-full h-full z-10" />

            {/* MAP ZOOM CONTROLS OVERLAY */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('orbit');
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs font-semibold backdrop-blur-md shadow-xl transition-all"
              >
                <SatelliteIcon className="w-4 h-4 text-cyan-400" />
                <span>Zoom Out to 3D Orbit</span>
              </button>

              <div className="px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 backdrop-blur-md hidden sm:block">
                <span>Click anywhere on map to inspect live weather</span>
              </div>
            </div>
          </div>
        )}

        {/* QUICK GLOBAL CITY JUMP DOCK (VISIBLE IN BOTH 3D ORBIT & 2D MAP VIEWS) */}
        <div className="absolute bottom-6 left-6 right-6 md:right-96 z-20 overflow-x-auto pb-1 custom-scrollbar pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl max-w-max shadow-2xl">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase px-2 shrink-0 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>World Weather:</span>
            </span>
            {GLOBAL_WEATHER_CITIES.map((c) => (
              <button
                key={c.name}
                onClick={() => handleCitySelect(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  activeCity === c.name
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{c.country.split(' ')[1] || '🌍'} {c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT DRAWER: LIVE WEATHER RADAR & SELECTED SATELLITE DOSSIER */}
        {/* ------------------------------------------------------------- */}
        <aside className="absolute top-4 right-4 z-20 w-80 md:w-88 max-h-[calc(100vh-100px)] flex flex-col gap-3 pointer-events-auto overflow-y-auto custom-scrollbar">
          {/* TOP TAB SWITCHER: WEATHER / EONET HAZARDS / SATELLITES */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('weather');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'weather'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Weather</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('eonet');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'eonet'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-300" />
              <span>Hazards ({eonetEvents.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('satellites');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'satellites'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SatelliteIcon className="w-3.5 h-3.5" />
              <span>Satellites</span>
            </button>
          </div>

          {/* TAB 1: LIVE WEATHER RADAR CARD */}
          {activeTab === 'weather' && (
            <div className="p-4 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Live Earth Weather API</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Open-Meteo Global
                </span>
              </div>

              {/* Quick Worldwide Region / City Dropdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>SELECT GLOBAL CITY:</span>
                  <span className="text-cyan-400 font-bold">{GLOBAL_WEATHER_CITIES.length} Megacities</span>
                </div>
                <select
                  value={GLOBAL_WEATHER_CITIES.some((c) => c.name === activeCity) ? activeCity : ''}
                  onChange={(e) => {
                    const found = GLOBAL_WEATHER_CITIES.find((c) => c.name === e.target.value);
                    if (found) handleCitySelect(found);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs font-mono outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="" disabled>
                    -- Choose City across Continents --
                  </option>
                  <optgroup label="Asia & Oceania">
                    {GLOBAL_WEATHER_CITIES.filter(
                      (c) =>
                        c.region === 'Asia' ||
                        c.region === 'Oceania' ||
                        c.region === 'Middle East' ||
                        c.region === 'Pacific'
                    ).map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Europe">
                    {GLOBAL_WEATHER_CITIES.filter((c) => c.region === 'Europe').map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Americas">
                    {GLOBAL_WEATHER_CITIES.filter(
                      (c) => c.region === 'North America' || c.region === 'South America'
                    ).map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Africa">
                    {GLOBAL_WEATHER_CITIES.filter((c) => c.region === 'Africa').map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Polar Extremes">
                    {GLOBAL_WEATHER_CITIES.filter((c) => c.region === 'Polar').map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[10px] text-cyan-300">
                <span>💡 Click anywhere on the 3D globe or 2D map to inspect real-time weather at that exact geographic coordinate!</span>
              </div>

              {isWeatherLoading || !weatherData ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  <span>Streaming live atmospheric telemetry...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{weatherData.cityName}</div>
                      <div className="text-[10px] text-slate-400">{weatherData.country}</div>
                    </div>
                    <div className="text-2xl">{weatherData.conditionIcon}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[9px] text-slate-500">TEMPERATURE</div>
                      <div className="text-base font-bold text-amber-300 mt-0.5">
                        {weatherData.temperatureC}°C <span className="text-xs text-slate-400 font-normal">/ {weatherData.temperatureF}°F</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-[9px] text-slate-500">WIND SPEED</div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5 flex items-center justify-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{weatherData.windSpeedKmh} <span className="text-[10px] text-slate-400 font-normal">km/h</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">CONDITION</span>
                    <span className="text-slate-200 font-semibold">{weatherData.conditionText}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NASA EONET NATURAL HAZARDS */}
          {activeTab === 'eonet' && (
            <div className="p-4 rounded-3xl bg-slate-900/95 border border-rose-800/80 shadow-2xl backdrop-blur-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                  <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>NASA EONET v3 Hazards</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {eonetEvents.length} Active
                </span>
              </div>

              {/* CATEGORY FILTER CHIPS */}
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ['all', `All (${eonetEvents.length})`],
                    ['wildfires', `🔥 Fires (${eonetEvents.filter((e) => e.type === 'wildfires').length})`],
                    ['severeStorms', `🌀 Storms (${eonetEvents.filter((e) => e.type === 'severeStorms').length})`],
                    ['volcanoes', `🌋 Volcanoes (${eonetEvents.filter((e) => e.type === 'volcanoes').length})`],
                    ['floods', `🌊 Floods (${eonetEvents.filter((e) => e.type === 'floods').length})`],
                    ['seaLakeIce', `🧊 Ice (${eonetEvents.filter((e) => e.type === 'seaLakeIce').length})`],
                  ] as const
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setEonetFilter(cat as any);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                      eonetFilter === cat
                        ? 'bg-rose-500 text-white font-bold border-rose-400 shadow-md'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* SELECTED EVENT HERO CARD */}
              {selectedEvent && (
                <div
                  className="p-3 rounded-2xl space-y-2 border transition-all"
                  style={{
                    background: `${selectedEvent.color}15`,
                    borderColor: `${selectedEvent.color}45`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedEvent.emoji}</span>
                      <div>
                        <div className="font-bold text-slate-100 text-xs leading-snug">
                          {selectedEvent.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {selectedEvent.category} · {selectedEvent.date}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800/80">
                    <span>COORDINATES:</span>
                    <span className="text-cyan-300 font-bold">
                      {Math.abs(selectedEvent.latitude).toFixed(2)}°{selectedEvent.latitude >= 0 ? 'N' : 'S'},{' '}
                      {Math.abs(selectedEvent.longitude).toFixed(2)}°{selectedEvent.longitude >= 0 ? 'E' : 'W'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleEventSelect(selectedEvent)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] text-center shadow-md transition-all flex items-center justify-center gap-1"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Fly to Hazard Location</span>
                    </button>
                    <a
                      href={selectedEvent.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                      title="View NASA Observatory Report"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* LIST OF FILTERED EVENTS */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider px-1">
                  Active Planetary Hazard Feed:
                </div>
                {isEonetLoading ? (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    Loading NASA EONET events...
                  </div>
                ) : (
                  eonetEvents
                    .filter((ev) => eonetFilter === 'all' || ev.type === eonetFilter)
                    .map((ev) => {
                      const isSelected = selectedEvent?.id === ev.id;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => handleEventSelect(ev)}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between gap-2 border transition-all ${
                            isSelected
                              ? 'bg-rose-950/80 text-rose-200 border-rose-500/80 shadow-md'
                              : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{ev.emoji}</span>
                            <span className="truncate text-[11px] font-semibold">{ev.title}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                            {Math.abs(ev.latitude).toFixed(0)}°{ev.latitude >= 0 ? 'N' : 'S'}
                          </span>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SATELLITE INSPECTION DOSSIER & QUICK SELECT CHIPS */}
          {activeTab === 'satellites' && (
            <>
              {selectedSat && isDossierOpen && (
                <div className="p-4 rounded-3xl bg-slate-900/95 border border-cyan-800/80 shadow-2xl backdrop-blur-xl space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{selectedSat.origin.countryFlag}</span>
                      <div className="font-bold text-xs text-slate-100 truncate">{selectedSat.displayName}</div>
                    </div>
                    <button
                      onClick={() => setIsDossierOpen(false)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* PROVENANCE SUMMARY */}
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">AGENCY</span>
                      <span className="text-slate-200 font-bold truncate max-w-[150px]">
                        {selectedSat.origin.agency}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">ROCKET</span>
                      <span className="text-indigo-300 font-bold">{selectedSat.origin.launchVehicle}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">SPACEPORT</span>
                      <span className="text-slate-300 font-semibold truncate max-w-[150px]">
                        {selectedSat.origin.launchSite}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">LAUNCH DATE</span>
                      <span className="text-amber-300 font-bold">{selectedSat.origin.launchDate}</span>
                    </div>
                  </div>

                  {/* LIVE SUB-SATELLITE GROUND TRACK */}
                  <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase">
                      <span>LIVE SUB-SAT GROUND FOOTPRINT</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>COORDINATES:</span>
                      <span className="text-emerald-400 font-bold">
                        {Math.abs(liveTrack.latitude).toFixed(2)}°{liveTrack.latitude >= 0 ? 'N' : 'S'},{' '}
                        {Math.abs(liveTrack.longitude).toFixed(2)}°{liveTrack.longitude >= 0 ? 'E' : 'W'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>ALTITUDE / SPEED:</span>
                      <span className="text-cyan-300 font-bold">
                        {selectedSat.orbit.altitudeKm} km · {selectedSat.orbit.velocityKmh.toLocaleString()} km/h
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {selectedSat.purpose}
                  </p>
                </div>
              )}

              {/* SATELLITE QUICK SELECT CHIPS */}
              <div className="p-3 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
                  Select Orbiting Spacecraft:
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {EARTH_SATELLITES.map((sat) => {
                    const isSelected = selectedSat?.id === sat.id;
                    return (
                      <button
                        key={sat.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedSat(sat);
                          setIsDossierOpen(true);
                        }}
                        className={`text-[10px] font-mono px-2 py-1 rounded-xl transition-all border ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span>{sat.origin.countryFlag} {sat.displayName.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};
