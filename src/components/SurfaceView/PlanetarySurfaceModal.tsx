import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
  X,
  Compass,
  Zap,
  Radio,
  Sparkles,
  MapPin,
  Moon,
  Layers,
  Thermometer,
  Activity,
  Droplets,
  Calendar,
  Globe2,
} from 'lucide-react';
import type { LandingSite, SurfaceTargetBody } from '../../types/surfaceExplorer';
import { SURFACE_LANDING_SITES } from '../../data/surfaceLandingSites';
import {
  LUNAR_GEOLOGICAL_FEATURES,
  type LunarFeature,
} from '../../data/lunarFeatures';
import {
  calculateLunarTelemetry,
  type LunarTelemetry,
} from '../../services/lunarEphemeris';
import { getCelestialBodyTexture, getMilkyWayTexture } from '../Canvas3D/textures';
import { sound } from '../../services/sound';

interface PlanetarySurfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBody?: SurfaceTargetBody;
}

export const PlanetarySurfaceModal: React.FC<PlanetarySurfaceModalProps> = ({
  isOpen,
  onClose,
  initialBody = 'mars',
}) => {
  const [activeBody, setActiveBody] = useState<SurfaceTargetBody>(initialBody);
  const [moonTab, setMoonTab] = useState<'landers' | 'features' | 'ephemeris' | 'science'>('landers');
  const [featureFilter, setFeatureFilter] = useState<'all' | 'mare' | 'crater' | 'mountain' | 'rille' | 'swirl'>('all');

  const sitesForBody = useMemo(() => {
    return SURFACE_LANDING_SITES.filter((s) => s.targetBody === activeBody);
  }, [activeBody]);

  const [selectedSite, setSelectedSite] = useState<LandingSite>(
    () => sitesForBody[0] || SURFACE_LANDING_SITES[0]
  );
  const [selectedFeature, setSelectedFeature] = useState<LunarFeature>(
    () => LUNAR_GEOLOGICAL_FEATURES[0]
  );

  const lunarTelemetry = useMemo<LunarTelemetry>(() => {
    return calculateLunarTelemetry(new Date());
  }, [isOpen]);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);

  // Sync body when initialBody changes
  useEffect(() => {
    setActiveBody(initialBody);
    const available = SURFACE_LANDING_SITES.filter((s) => s.targetBody === initialBody);
    if (available.length > 0) {
      setSelectedSite(available[0]);
    }
  }, [initialBody]);

  // When changing target body inside modal
  const handleSwitchBody = (body: SurfaceTargetBody) => {
    sound.playClick();
    setActiveBody(body);
    const available = SURFACE_LANDING_SITES.filter((s) => s.targetBody === body);
    if (available.length > 0) {
      setSelectedSite(available[0]);
    }
  };

  // Convert (lat, lon) to 3D sphere Cartesian coordinates
  const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Focus globe camera on selected landing site
  const focusOnSite = (site: LandingSite) => {
    sound.playSelect();
    setSelectedSite(site);

    const latRad = (site.coordinates.lat * Math.PI) / 180;
    const lonRad = (site.coordinates.lon * Math.PI) / 180;
    targetRotationRef.current = {
      x: latRad * 0.75,
      y: -lonRad - Math.PI / 2,
    };
  };

  // Focus globe camera on selected geological feature
  const focusOnFeature = (feature: LunarFeature) => {
    sound.playSelect();
    setSelectedFeature(feature);

    const latRad = (feature.coordinates.lat * Math.PI) / 180;
    const lonRad = (feature.coordinates.lon * Math.PI) / 180;
    targetRotationRef.current = {
      x: latRad * 0.75,
      y: -lonRad - Math.PI / 2,
    };
  };

  // Filtered geological features
  const filteredFeatures = useMemo(() => {
    if (featureFilter === 'all') return LUNAR_GEOLOGICAL_FEATURES;
    return LUNAR_GEOLOGICAL_FEATURES.filter((f) => f.type === featureFilter);
  }, [featureFilter]);

  // --- 3D THREE.JS GLOBE SETUP ---
  useEffect(() => {
    if (!isOpen || !canvasMountRef.current) return;

    const container = canvasMountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Star backdrop
    const skyGeo = new THREE.SphereGeometry(120, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      map: getMilkyWayTexture(),
      side: THREE.BackSide,
      transparent: false,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // Globe sphere
    const globeRadius = 4.2;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const texture =
      activeBody === 'mars'
        ? getCelestialBodyTexture('mars', 'rocky', '#c1440e')
        : getCelestialBodyTexture('moon', 'rocky', '#e0e0e0');

    const globeMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
      metalness: 0.05,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // Atmospheric rim glow for Mars
    if (activeBody === 'mars') {
      const glowGeo = new THREE.SphereGeometry(globeRadius * 1.025, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf97316),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      globeMesh.add(glowMesh);
    }

    // Dynamic Markers Group
    const markersGroup = new THREE.Group();
    globeMesh.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const clickableMeshes: { id: string; isFeature: boolean; mesh: THREE.Mesh }[] = [];

    // Add Markers based on body and mode
    if (activeBody === 'mars' || (activeBody === 'moon' && moonTab === 'landers')) {
      sitesForBody.forEach((site) => {
        const pos = latLonToVector3(site.coordinates.lat, site.coordinates.lon, globeRadius * 1.015);
        const isSelected = site.id === selectedSite.id;
        const col = isSelected ? 0x38bdf8 : activeBody === 'mars' ? 0xf97316 : 0xa855f7;

        // Outer ring
        const ringGeo = new THREE.RingGeometry(0.12, 0.16, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        markersGroup.add(ringMesh);

        // Center sphere pin
        const pinGeo = new THREE.SphereGeometry(0.065, 12, 12);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos.clone().multiplyScalar(1.008));
        pinMesh.userData = { id: site.id, isFeature: false };
        markersGroup.add(pinMesh);

        clickableMeshes.push({ id: site.id, isFeature: false, mesh: pinMesh });
      });
    } else if (activeBody === 'moon' && moonTab === 'features') {
      filteredFeatures.forEach((feat) => {
        const pos = latLonToVector3(feat.coordinates.lat, feat.coordinates.lon, globeRadius * 1.015);
        const isSelected = feat.id === selectedFeature.id;
        const colHex = parseInt(feat.color.replace('#', '0x'), 16);

        // Outer ring
        const ringGeo = new THREE.RingGeometry(0.14, 0.19, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x38bdf8 : colHex,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
        markersGroup.add(ringMesh);

        // Center beacon pin
        const pinGeo = new THREE.SphereGeometry(0.075, 12, 12);
        const pinMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xffffff : colHex,
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(pos.clone().multiplyScalar(1.008));
        pinMesh.userData = { id: feat.id, isFeature: true };
        markersGroup.add(pinMesh);

        clickableMeshes.push({ id: feat.id, isFeature: true, mesh: pinMesh });
      });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(15, 12, 18);
    scene.add(dirLight);

    // Interactive Drag / Orbit
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        targetRotationRef.current = null;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        globeMesh.rotation.y += dx * 0.006;
        globeMesh.rotation.x = Math.max(-1.1, Math.min(1.1, globeMesh.rotation.x + dy * 0.006));
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const rect = container.getBoundingClientRect();
      const dx = Math.abs(e.clientX - prevMouse.x);
      const dy = Math.abs(e.clientY - prevMouse.y);

      if (dx < 5 && dy < 5) {
        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);

        const hits = raycaster.intersectObjects(clickableMeshes.map((b) => b.mesh));
        if (hits.length > 0) {
          const hitData = hits[0].object.userData;
          if (hitData.isFeature) {
            const foundFeat = LUNAR_GEOLOGICAL_FEATURES.find((f) => f.id === hitData.id);
            if (foundFeat) focusOnFeature(foundFeat);
          } else {
            const foundSite = sitesForBody.find((s) => s.id === hitData.id);
            if (foundSite) focusOnSite(foundSite);
          }
        }
      }
    };

    container.addEventListener('pointerdown', onMouseDown);
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerup', onMouseUp);

    // Initial item focus
    if (activeBody === 'moon' && moonTab === 'features') {
      const initialLat = (selectedFeature.coordinates.lat * Math.PI) / 180;
      const initialLon = (selectedFeature.coordinates.lon * Math.PI) / 180;
      globeMesh.rotation.x = initialLat * 0.75;
      globeMesh.rotation.y = -initialLon - Math.PI / 2;
    } else {
      const initialLat = (selectedSite.coordinates.lat * Math.PI) / 180;
      const initialLon = (selectedSite.coordinates.lon * Math.PI) / 180;
      globeMesh.rotation.x = initialLat * 0.75;
      globeMesh.rotation.y = -initialLon - Math.PI / 2;
    }

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth lerp to target coordinate rotation
      if (targetRotationRef.current) {
        globeMesh.rotation.x = THREE.MathUtils.lerp(
          globeMesh.rotation.x,
          targetRotationRef.current.x,
          delta * 4.0
        );
        globeMesh.rotation.y = THREE.MathUtils.lerp(
          globeMesh.rotation.y,
          targetRotationRef.current.y,
          delta * 4.0
        );

        const dist =
          Math.abs(globeMesh.rotation.x - targetRotationRef.current.x) +
          Math.abs(globeMesh.rotation.y - targetRotationRef.current.y);
        if (dist < 0.001) {
          targetRotationRef.current = null;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onMouseDown);
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointerup', onMouseUp);
      renderer.dispose();
    };
  }, [isOpen, activeBody, moonTab, selectedSite.id, selectedFeature.id, featureFilter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 font-sans"
      style={{
        background: 'rgba(2, 6, 23, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
    >
      <div
        className="relative flex flex-col rounded-3xl overflow-hidden shadow-2xl text-slate-100"
        style={{
          width: '96%',
          maxWidth: '1360px',
          height: '88vh',
          maxHeight: '900px',
          background: 'linear-gradient(135deg, #090e1a 0%, #060a14 50%, #030712 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* --- MODAL TOP HEADER --- */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border ${
                activeBody === 'mars'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}
            >
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  {activeBody === 'mars' ? 'Mars Planetary Surface Explorer' : 'The Moon: Complete Lunar Atlas & Explorer'}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    activeBody === 'mars'
                      ? 'bg-orange-950/80 text-orange-400 border border-orange-700/60'
                      : 'bg-purple-950/80 text-purple-400 border border-purple-700/60'
                  }`}
                >
                  {activeBody === 'mars'
                    ? `${sitesForBody.length} LANDERS`
                    : `${sitesForBody.length} MISSIONS · ${LUNAR_GEOLOGICAL_FEATURES.length} LANDMARKS`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeBody === 'mars'
                  ? 'Interactive 3D landing coordinates, surface rover odometry, and scientific discoveries'
                  : 'Public NASA/USGS lunar maria, craters, Apollo landing sites, international rovers, and real-time ephemeris'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Target Switcher */}
            <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => handleSwitchBody('mars')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeBody === 'mars'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔴</span>
                <span>Mars</span>
              </button>
              <button
                onClick={() => handleSwitchBody('moon')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeBody === 'moon'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌕</span>
                <span>The Moon</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
              title="Close surface explorer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- MOON SPECIFIC NAVIGATION SUB-BAR --- */}
        {activeBody === 'moon' && (
          <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(
                [
                  ['landers', '🚀 Surface Landers & Rovers', sitesForBody.length],
                  ['features', '🌕 Geological Atlas & Craters', LUNAR_GEOLOGICAL_FEATURES.length],
                  ['ephemeris', '🔭 Live Phase & Ephemeris', null],
                  ['science', '🔬 Apollo Seismology & Cold Traps', null],
                ] as const
              ).map(([tabKey, tabLabel, count]) => (
                <button
                  key={tabKey}
                  onClick={() => {
                    sound.playClick();
                    setMoonTab(tabKey);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moonTab === tabKey
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tabLabel}</span>
                  {count !== null && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/60 text-slate-300">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Geological Category Filter Pills (when features tab is active) */}
            {moonTab === 'features' && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {(
                  [
                    ['all', 'All'],
                    ['mare', 'Maria (Seas)'],
                    ['crater', 'Craters'],
                    ['mountain', 'Mountains'],
                    ['rille', 'Rilles & Swirls'],
                  ] as const
                ).map(([catKey, catLabel]) => (
                  <button
                    key={catKey}
                    onClick={() => {
                      sound.playClick();
                      setFeatureFilter(catKey as any);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      featureFilter === catKey
                        ? 'bg-purple-950 border border-purple-500/70 text-purple-200'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {catLabel}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- MAIN SPLIT VIEW (60% 3D CANVAS + 40% DOSSIER CARDS) --- */}
        <div className="flex-1 flex overflow-hidden relative modal-split-layout" style={{ minHeight: 0 }}>
          {/* LEFT: 3D INTERACTIVE GLOBE VIEWPORT (60%) */}
          <div
            className="relative flex flex-col bg-slate-950 overflow-hidden modal-split-left"
            style={{ width: '60%', height: '100%', minHeight: 0 }}
          >
            <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ minHeight: 0 }} />

            {/* Viewport Overlay Controls */}
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2 shadow-xl">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {activeBody === 'moon' && moonTab === 'features'
                    ? `LANDMARK: ${selectedFeature.name} (${selectedFeature.coordinates.lat.toFixed(2)}°, ${selectedFeature.coordinates.lon.toFixed(2)}°)`
                    : `TARGET: ${selectedSite.name} (${selectedSite.coordinates.lat.toFixed(2)}°, ${selectedSite.coordinates.lon.toFixed(2)}°)`}
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800/60 text-[10px] text-slate-400">
                Drag to rotate globe · Click any beacon to focus
              </div>
            </div>

            {/* Quick Chips Carousel on Bottom of Canvas */}
            <div className="absolute bottom-4 inset-x-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {activeBody === 'moon' && moonTab === 'features'
                ? filteredFeatures.map((feat) => {
                    const isSelected = feat.id === selectedFeature.id;
                    return (
                      <button
                        key={feat.id}
                        onClick={() => focusOnFeature(feat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-950 border border-cyan-300'
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: feat.color }}
                        />
                        <span>{feat.name.split('(')[0].trim()}</span>
                      </button>
                    );
                  })
                : sitesForBody.map((site) => {
                    const isSelected = site.id === selectedSite.id;
                    return (
                      <button
                        key={site.id}
                        onClick={() => focusOnSite(site)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                          isSelected
                            ? activeBody === 'mars'
                              ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-950 border border-orange-400'
                              : 'bg-purple-500 text-white font-bold shadow-lg shadow-purple-950 border border-purple-400'
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <span>{site.flag}</span>
                        <span>{site.name}</span>
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* RIGHT: DETAILED SURFACE DOSSIER PANEL (40%) */}
          <div
            className="flex flex-col overflow-y-auto p-5 space-y-4 custom-scrollbar modal-split-right"
            style={{
              width: '40%',
              height: '100%',
              minHeight: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              borderLeft: '1px solid rgba(51, 65, 85, 0.6)',
            }}
          >
            {/* --- TAB: SURFACE LANDERS (MARS & MOON) --- */}
            {(activeBody === 'mars' || (activeBody === 'moon' && moonTab === 'landers')) && (
              <>
                {/* Mission Hero Card */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{selectedSite.flag}</span>
                        <h3 className="text-lg font-bold text-white tracking-tight">{selectedSite.name}</h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {selectedSite.mission} · {selectedSite.agency} ({selectedSite.country})
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold ${
                        selectedSite.status === 'Operational'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {selectedSite.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{selectedSite.summary}</p>

                  {/* Coordinates & Region */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">COORDINATES</div>
                      <div className="text-cyan-400 font-bold mt-0.5">
                        {selectedSite.coordinates.lat >= 0
                          ? `${selectedSite.coordinates.lat.toFixed(2)}° N`
                          : `${Math.abs(selectedSite.coordinates.lat).toFixed(2)}° S`}
                        ,{' '}
                        {selectedSite.coordinates.lon >= 0
                          ? `${selectedSite.coordinates.lon.toFixed(2)}° E`
                          : `${Math.abs(selectedSite.coordinates.lon).toFixed(2)}° W`}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">REGION / CRATER</div>
                      <div className="text-amber-300 font-bold mt-0.5 truncate" title={selectedSite.coordinates.craterRegion}>
                        {selectedSite.coordinates.craterRegion}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">TOUCHDOWN DATE</div>
                      <div className="text-slate-200 mt-0.5">{selectedSite.landingDate}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">
                        {selectedSite.distanceTraveledKm ? 'ODOMETRY (TRAVELED)' : 'MISSION LIFETIME'}
                      </div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        {selectedSite.distanceTraveledKm
                          ? `${selectedSite.distanceTraveledKm} km`
                          : `${selectedSite.missionDurationDays} days`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Scientific Discoveries */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Historic Discoveries & Milestones</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedSite.keyDiscoveries.map((disc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{disc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Science Instrument Suite */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Scientific Instruments</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedSite.instruments.map((inst) => (
                      <div
                        key={inst.name}
                        className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs space-y-0.5"
                      >
                        <div className="font-mono font-bold text-cyan-300 text-[11px]">{inst.name}</div>
                        <div className="text-slate-400 text-[11px] leading-relaxed">{inst.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* --- TAB: MOON GEOLOGICAL ATLAS & CRATERS --- */}
            {activeBody === 'moon' && moonTab === 'features' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block shadow-sm"
                          style={{ backgroundColor: selectedFeature.color }}
                        />
                        <h3 className="text-lg font-bold text-white tracking-tight">{selectedFeature.name}</h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        Era: {selectedFeature.geologicalEra} Epoch · Type: {selectedFeature.type.toUpperCase()}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-bold ${
                        selectedFeature.visibleFromEarth
                          ? 'bg-blue-950 text-blue-300 border border-blue-700/60'
                          : 'bg-purple-950 text-purple-300 border border-purple-700/60'
                      }`}
                    >
                      {selectedFeature.visibleFromEarth ? 'Near Side' : 'Far Side'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{selectedFeature.summary}</p>

                  {/* Feature Dimensions & Coordinates */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">DIAMETER</div>
                      <div className="text-cyan-400 font-bold mt-0.5">{selectedFeature.diameterKm} km</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">DEPTH / ELEVATION</div>
                      <div className="text-amber-300 font-bold mt-0.5">
                        {selectedFeature.depthOrElevationM !== undefined
                          ? `${selectedFeature.depthOrElevationM > 0 ? '+' : ''}${selectedFeature.depthOrElevationM} m`
                          : 'Basin Floor'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">COORDINATES</div>
                      <div className="text-slate-200 mt-0.5">
                        {selectedFeature.coordinates.lat >= 0
                          ? `${selectedFeature.coordinates.lat.toFixed(1)}° N`
                          : `${Math.abs(selectedFeature.coordinates.lat).toFixed(1)}° S`}
                        ,{' '}
                        {selectedFeature.coordinates.lon >= 0
                          ? `${selectedFeature.coordinates.lon.toFixed(1)}° E`
                          : `${Math.abs(selectedFeature.coordinates.lon).toFixed(1)}° W`}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">EARTH VISIBILITY</div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        {selectedFeature.visibleFromEarth ? 'Tidally Facing Earth' : 'Hidden Far Side'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Geology Details */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Geological Structure & Mineralogy</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {selectedFeature.geology}
                  </div>
                </div>

                {/* Scientific & Exploration Significance */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scientific Significance & Spacecraft Visits</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <p>{selectedFeature.significance}</p>
                    {selectedFeature.apolloOrMissionLink && (
                      <div className="text-[11px] font-mono text-cyan-300 pt-1 border-t border-slate-800/80">
                        🛰️ Linked Missions: <span className="text-white">{selectedFeature.apolloOrMissionLink}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* --- TAB: LIVE LUNAR PHASE & EPHEMERIS --- */}
            {activeBody === 'moon' && moonTab === 'ephemeris' && (
              <div className="space-y-4">
                {/* Live Phase Hero */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-6 h-6 text-amber-300 animate-pulse" />
                      <div>
                        <h3 className="text-base font-bold text-white">{lunarTelemetry.phaseName}</h3>
                        <div className="text-xs text-cyan-400 font-mono">
                          Phase Angle: {lunarTelemetry.phaseAngleDeg}° · Age: {lunarTelemetry.moonAgeDays} days
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-bold font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                      {lunarTelemetry.illuminationPct}
                    </span>
                  </div>

                  {/* Illumination Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: lunarTelemetry.illuminationPct }}
                    />
                  </div>

                  {/* Earth-Moon Distance Gauge */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">DISTANCE FROM EARTH</div>
                      <div className="text-cyan-400 font-bold mt-0.5">
                        {lunarTelemetry.distanceKm.toLocaleString()} km
                      </div>
                      <div className="text-[10px] text-slate-400">{lunarTelemetry.distanceMiles.toLocaleString()} miles</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">ORBIT STATUS</div>
                      <div className="text-emerald-400 font-bold mt-0.5">{lunarTelemetry.distanceScale}</div>
                      <div className="text-[10px] text-slate-400">
                        {lunarTelemetry.distanceScale === 'Perigee' ? 'Closer to Earth (Supermoon)' : 'Near average ~384,400 km'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">APPARENT DIAMETER</div>
                      <div className="text-slate-200 font-bold mt-0.5">{lunarTelemetry.apparentDiameterArcmin} arcmin</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">VISUAL MAGNITUDE</div>
                      <div className="text-amber-300 font-bold mt-0.5">{lunarTelemetry.visualMagnitude} mag</div>
                    </div>
                  </div>
                </div>

                {/* Sub-Earth Libration */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Lunar Libration (Wobble View Angle)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Because of orbital eccentricity and tilt, the Moon appears to "wobble" slightly, revealing up to 59% of its surface over time instead of exactly 50%.
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px]">SUB-EARTH LAT: </span>
                      <span className="text-cyan-300 font-bold">{lunarTelemetry.subEarthLibration.latDeg}°</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 text-[10px]">SUB-EARTH LON: </span>
                      <span className="text-cyan-300 font-bold">{lunarTelemetry.subEarthLibration.lonDeg}°</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Primary Phases */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Upcoming Primary Lunar Phases</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {lunarTelemetry.upcomingPhases.map((phase) => (
                      <div
                        key={phase.name}
                        className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
                      >
                        <span className="text-slate-200 font-semibold">{phase.name}</span>
                        <span className="text-cyan-400 text-[11px]">
                          {phase.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {phase.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: GEOPHYSICS, SEISMOLOGY & WATER ICE --- */}
            {activeBody === 'moon' && moonTab === 'science' && (
              <div className="space-y-3.5">
                {/* Diurnal Thermal Extremes */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Extreme Diurnal Temperatures</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    With virtually no insulating atmosphere, surface temperatures swing wildly across the 29.5-day synodic cycle:
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300">
                      <div className="text-[10px] text-rose-400">LUNAR NOON</div>
                      <div className="text-sm font-bold">+120°C (248°F)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-300">
                      <div className="text-[10px] text-blue-400">14-DAY NIGHT</div>
                      <div className="text-sm font-bold">-130°C (-202°F)</div>
                    </div>
                  </div>
                </div>

                {/* Polar Cryogenic Cold Traps & Water Ice */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-800/60 space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Water Ice &amp; Permanently Shadowed Regions</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Because the Moon's axial tilt is just 1.54°, sunlight never reaches the bottoms of deep polar craters. Temperatures inside Hermite and Shackleton crater floors drop down to <span className="text-cyan-300 font-bold font-mono">-246°C (27 Kelvin)</span> — colder than the surface of Pluto!
                  </p>
                  <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-slate-300 font-mono space-y-1">
                    <div>• LCROSS impact plume (2009): confirmed 5.5% water ice by mass in Cabeus crater.</div>
                    <div>• Chandrayaan-1 M3 spectrometer: detected molecular surface ice in &gt;300 polar cold traps.</div>
                    <div>• SOFIA airborne telescope (2020): detected trapped molecular H2O in sunlit Clavius crater regolith.</div>
                  </div>
                </div>

                {/* Apollo Passive Seismic Network */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Apollo Passive Seismic Network (Moonquakes)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Seismometers deployed by Apollo 12, 14, 15, and 16 operated until 1977, recording over 12,000 seismic events:
                  </p>
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-amber-400 font-bold">Deep Moonquakes (700–1,200 km):</span> Occur in periodic monthly cycles triggered by gravitational tidal forces as the Moon orbits perigee/apogee.
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-rose-400 font-bold">Shallow Moonquakes (up to Mw 5.5):</span> Tectonic stresses caused by global planetary contraction as the interior continues to cool and shrink.
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-cyan-400 font-bold">Thermal Quakes &amp; Meteoroids:</span> Rapid expansion/contraction of rock surfaces at sunrise and frequent micrometeorite strikes.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
