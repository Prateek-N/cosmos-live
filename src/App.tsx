import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  CelestialBody,
  LayerVisibility,
  ScaleMode,
  LiveTelemetry,
} from './types/solar';
import { CELESTIAL_BODIES } from './data/celestialBodies';
import { INITIAL_LIVE_TELEMETRY } from './data/liveFeeds';
import {
  fetchLiveISSPosition,
  fetchNOAASpaceWeather,
  fetchDSNStatus,
  fetchJPLCloseApproaches,
  fetchUpcomingLaunches,
} from './services/realtimeFeeds';
import { SolarSystemCanvas } from './components/Canvas3D/SolarSystemCanvas';
import { TopBar } from './components/HUD/TopBar';
import { SidebarTree } from './components/HUD/SidebarTree';
import { DetailDrawer } from './components/HUD/DetailDrawer';
import { TimeController } from './components/HUD/TimeController';
import { LiveTelemetryPills } from './components/HUD/LiveTelemetryPills';
import { GuidedTourModal } from './components/HUD/GuidedTourModal';
import { MeasureModal } from './components/HUD/MeasureModal';
import { EarthSatellitesModal } from './components/HUD/EarthSatellitesModal';
import { EarthEpicModal } from './components/HUD/EarthEpicModal';
import { EarthCommandCenter } from './components/EarthView/EarthCommandCenter';
import { PlanetarySurfaceModal } from './components/SurfaceView/PlanetarySurfaceModal';
import { StargazerModal } from './components/Planetarium/StargazerModal';
import { ISSTrackerModal } from './components/HUD/ISSTrackerModal';
import { SunExplorerModal } from './components/HUD/SunExplorerModal';
import { AsteroidDashboard } from './components/HUD/AsteroidDashboard';
import { DSNLiveModal } from './components/HUD/DSNLiveModal';
import type { SurfaceTargetBody } from './types/surfaceExplorer';
import { sound } from './services/sound';
import { type HistoricalMilestone } from './data/historicalMilestones';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  // Main Selection & Navigation State
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [hoveredBody, setHoveredBody] = useState<CelestialBody | null>(null);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('explorer');
  const [cameraLock, setCameraLock] = useState<boolean>(true);

  // Time Machine Simulation State
  const [simDate, setSimDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(86400); // 1 Day per second default
  const [isReversed, setIsReversed] = useState<boolean>(false);

  // Layer Visibility
  const [layers, setLayers] = useState<LayerVisibility>({
    orbits: true,
    labels: true,
    moons: true,
    asteroids: true,
    spacecraft: true,
    atmosphereGlow: true,
    grid: false,
    constellations: true,
  });

  // Live Telemetry
  const [telemetry, setTelemetry] = useState<LiveTelemetry>(INITIAL_LIVE_TELEMETRY);

  // Modals & Panels
  const [isToursOpen, setIsToursOpen] = useState<boolean>(false);
  const [isMeasureOpen, setIsMeasureOpen] = useState<boolean>(false);
  const [measureInitialId, setMeasureInitialId] = useState<string | undefined>(undefined);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);
  const [isSatellitesOpen, setIsSatellitesOpen] = useState<boolean>(false);
  const [isEpicOpen, setIsEpicOpen] = useState<boolean>(false);
  const [isEarthCommandCenterOpen, setIsEarthCommandCenterOpen] = useState<boolean>(false);
  const [earthCommandCenterTab, setEarthCommandCenterTab] = useState<'weather' | 'eonet' | 'satellites'>('weather');
  const [isSurfaceExplorerOpen, setIsSurfaceExplorerOpen] = useState<boolean>(false);
  const [surfaceTargetBody, setSurfaceTargetBody] = useState<SurfaceTargetBody>('mars');
  const [isPlanetariumOpen, setIsPlanetariumOpen] = useState<boolean>(false);
  const [isISSTrackerOpen, setIsISSTrackerOpen] = useState<boolean>(false);
  const [isSunExplorerOpen, setIsSunExplorerOpen] = useState<boolean>(false);
  const [isAsteroidsOpen, setIsAsteroidsOpen] = useState<boolean>(false);
  const [isDSNOpen, setIsDSNOpen] = useState<boolean>(false);
  const [activeMilestone, setActiveMilestone] = useState<HistoricalMilestone | null>(null);

  const handleSelectMilestone = (milestone: HistoricalMilestone) => {
    setSimDate(new Date(milestone.date));
    setActiveMilestone(milestone);
    const target = CELESTIAL_BODIES.find((b) => b.id === milestone.targetBodyId) || null;
    if (target) {
      setSelectedBody(target);
    }
  };

  // Reset Camera Callback reference
  const resetCameraFnRef = useRef<(() => void) | null>(null);

  // Simulation Clock Tick (60 FPS)
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick);
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && deltaSec > 0 && deltaSec < 0.2) {
        setSimDate((prev) => {
          const sign = isReversed ? -1 : 1;
          const advanceMs = deltaSec * speedMultiplier * 1000 * sign;
          return new Date(prev.getTime() + advanceMs);
        });
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, speedMultiplier, isReversed]);

  // Live Multi-Stream Telemetry Ingestion (ISS, NOAA Space Weather, NASA DSN, JPL NEOs, Launches)
  useEffect(() => {
    let mounted = true;

    // 1. High-frequency ISS tracking (every 4 seconds)
    const updateISS = async () => {
      const liveISS = await fetchLiveISSPosition();
      if (mounted) {
        setTelemetry((prev) => ({ ...prev, iss: liveISS }));
      }
    };

    // 2. NOAA Space Weather operations (every 60 seconds)
    const updateSpaceWeather = async () => {
      const sw = await fetchNOAASpaceWeather();
      if (mounted) {
        setTelemetry((prev) => ({ ...prev, spaceWeather: sw }));
      }
    };

    // 3. NASA Deep Space Network links (every 15 seconds)
    const updateDSN = async () => {
      const dsn = await fetchDSNStatus();
      if (mounted && dsn) {
        setTelemetry((prev) => ({ ...prev, dsn }));
      }
    };

    // 4. JPL Close Approach NEOs (every 5 minutes)
    const updateNEO = async () => {
      const neos = await fetchJPLCloseApproaches();
      if (mounted) {
        setTelemetry((prev) => ({ ...prev, nearEarthObjects: neos }));
      }
    };

    // 5. Global Rocket Launches (every 10 minutes)
    const updateLaunches = async () => {
      const launches = await fetchUpcomingLaunches();
      if (mounted) {
        setTelemetry((prev) => ({ ...prev, upcomingLaunches: launches }));
      }
    };

    // Initial triggers
    updateISS();
    updateSpaceWeather();
    updateDSN();
    updateNEO();
    updateLaunches();

    const issInterval = setInterval(updateISS, 4000);
    const swInterval = setInterval(updateSpaceWeather, 60000);
    const dsnInterval = setInterval(updateDSN, 15000);
    const neoInterval = setInterval(updateNEO, 300000);
    const launchInterval = setInterval(updateLaunches, 600000);

    return () => {
      mounted = false;
      clearInterval(issInterval);
      clearInterval(swInterval);
      clearInterval(dsnInterval);
      clearInterval(neoInterval);
      clearInterval(launchInterval);
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        sound.playClick();
        setIsPlaying((p) => !p);
      } else if (e.key === 'Escape') {
        setSelectedBody(null);
        if (resetCameraFnRef.current) resetCameraFnRef.current();
      } else if (e.key.toLowerCase() === 'e') {
        sound.playClick();
        setScaleMode((m) => (m === 'explorer' ? 'realistic' : 'explorer'));
      } else if (e.key.toLowerCase() === 'r') {
        sound.playClick();
        setSelectedBody(null);
        if (resetCameraFnRef.current) resetCameraFnRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleScale = () => {
    setScaleMode((prev) => (prev === 'explorer' ? 'realistic' : 'explorer'));
  };

  const handleToggleLayer = (key: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetCamera = () => {
    setSelectedBody(null);
    if (resetCameraFnRef.current) {
      resetCameraFnRef.current();
    }
  };

  const handleOpenMeasureWith = (bodyId: string) => {
    setMeasureInitialId(bodyId);
    setIsMeasureOpen(true);
  };

  const handleTourFocusBody = (body: CelestialBody) => {
    setSelectedBody(body);
    setCameraLock(true);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. 3D WEBGL INTERACTIVE CANVAS */}
      <SolarSystemCanvas
        selectedBodyId={selectedBody?.id || null}
        onSelectBody={(b) => setSelectedBody(b)}
        hoveredBodyId={hoveredBody?.id || null}
        onHoverBody={(b) => setHoveredBody(b)}
        scaleMode={scaleMode}
        simDate={simDate}
        layers={layers}
        cameraLock={cameraLock}
        onResetViewRef={(fn) => {
          resetCameraFnRef.current = fn;
        }}
      />

      {/* 2. HOVER MINI CARD (CURSOR TOOLTIP) */}
      {hoveredBody && !selectedBody && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs text-slate-100 flex items-center gap-2 shadow-xl animate-slide-in">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: hoveredBody.color }}
          />
          <span className="font-semibold">{hoveredBody.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {hoveredBody.type.replace('_', ' ')}
          </span>
          {hoveredBody.orbit.semiMajorAxisAU > 0 && (
            <span className="text-[10px] text-cyan-400 font-mono">
              · {hoveredBody.orbit.semiMajorAxisAU.toFixed(2)} AU
            </span>
          )}
        </div>
      )}

      {/* 2b. ACTIVE HISTORIC MILESTONE BANNER */}
      {activeMilestone && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-xl w-[92%] sm:w-full px-3 animate-slide-in">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="w-2.5 h-8 rounded-full shrink-0 shadow-md"
                style={{ backgroundColor: activeMilestone.badgeColor }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-100 truncate">
                    {activeMilestone.label}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeMilestone.epochYear}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">
                    {activeMilestone.category}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  🚀 {activeMilestone.craft} • 🎯 <span className="text-cyan-300">{activeMilestone.targetBodyName}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveMilestone(null)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Dismiss epoch banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. TOP BAR HUD */}
      <TopBar
        bodies={CELESTIAL_BODIES}
        onSelectBody={(b) => setSelectedBody(b)}
        scaleMode={scaleMode}
        onToggleScaleMode={handleToggleScale}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        cameraLock={cameraLock}
        onToggleCameraLock={() => setCameraLock(!cameraLock)}
        onResetCamera={handleResetCamera}
        onOpenTours={() => setIsToursOpen(true)}
        onOpenMeasure={() => {
          setMeasureInitialId(selectedBody?.id || 'earth');
          setIsMeasureOpen(true);
        }}
        onOpenPlanetarium={() => setIsPlanetariumOpen(true)}
        onOpenSunExplorer={() => setIsSunExplorerOpen(true)}
        onOpenISSTracker={() => setIsISSTrackerOpen(true)}
        onOpenAsteroids={() => setIsAsteroidsOpen(true)}
        onOpenDSN={() => setIsDSNOpen(true)}
        onOpenEarthHazards={() => {
          setEarthCommandCenterTab('eonet');
          setIsEarthCommandCenterOpen(true);
        }}
        onOpenLunarAtlas={() => {
          setSurfaceTargetBody('moon');
          setIsSurfaceExplorerOpen(true);
        }}
        isAudioOn={isAudioOn}
        onToggleAudio={() => {
          const next = !isAudioOn;
          setIsAudioOn(next);
          sound.setEnabled(next);
        }}
      />

      {/* 4. LEFT OBJECT HIERARCHY TREE */}
      <SidebarTree
        bodies={CELESTIAL_BODIES}
        selectedBodyId={selectedBody?.id || null}
        onSelectBody={(b) => setSelectedBody(b)}
      />

      {/* 5. RIGHT OBJECT DETAIL DRAWER */}
      <DetailDrawer
        body={selectedBody}
        onClose={() => setSelectedBody(null)}
        simDate={simDate}
        onOpenMeasureWith={handleOpenMeasureWith}
        onOpenSatellites={() => setIsSatellitesOpen(true)}
        onOpenEpic={() => setIsEpicOpen(true)}
        onOpenEarthCommandCenter={() => {
          setEarthCommandCenterTab('weather');
          setIsEarthCommandCenterOpen(true);
        }}
        onOpenSurfaceExplorer={(target) => {
          setSurfaceTargetBody(target);
          setIsSurfaceExplorerOpen(true);
        }}
        onOpenSunExplorer={() => setIsSunExplorerOpen(true)}
        onOpenISSTracker={() => setIsISSTrackerOpen(true)}
        onOpenAsteroids={() => setIsAsteroidsOpen(true)}
        onOpenDSN={() => setIsDSNOpen(true)}
      />

      {/* 6. BOTTOM TIME CONTROLLER */}
      <TimeController
        simDate={simDate}
        onChangeSimDate={(d) => setSimDate(d)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        speedMultiplier={speedMultiplier}
        onChangeSpeedMultiplier={(s) => setSpeedMultiplier(s)}
        isReversed={isReversed}
        onToggleReverse={() => setIsReversed(!isReversed)}
        onSelectMilestone={handleSelectMilestone}
      />

      {/* 7. LIVE TELEMETRY PILLS (ISS, SPACE WEATHER, DSN, ASTEROIDS) */}
      <LiveTelemetryPills
        telemetry={telemetry}
        onOpenISSTracker={() => setIsISSTrackerOpen(true)}
        onOpenSunExplorer={() => setIsSunExplorerOpen(true)}
        onOpenDSN={() => setIsDSNOpen(true)}
        onOpenAsteroids={() => setIsAsteroidsOpen(true)}
      />

      {/* 8. GUIDED TOURS MODAL */}
      <GuidedTourModal
        isOpen={isToursOpen}
        onClose={() => setIsToursOpen(false)}
        bodies={CELESTIAL_BODIES}
        onFocusBody={handleTourFocusBody}
      />

      {/* 9. DISTANCE MEASURE MODAL */}
      <MeasureModal
        isOpen={isMeasureOpen}
        onClose={() => setIsMeasureOpen(false)}
        bodies={CELESTIAL_BODIES}
        initialBodyAId={measureInitialId}
        simDate={simDate}
      />

      {/* 10. EARTH SATELLITE FLEET & ORIGIN DOSSIER MODAL */}
      <EarthSatellitesModal
        isOpen={isSatellitesOpen}
        onClose={() => setIsSatellitesOpen(false)}
      />

      {/* 11. NASA EPIC DAILY FULL-DISK EARTH MODAL */}
      <EarthEpicModal
        isOpen={isEpicOpen}
        onClose={() => setIsEpicOpen(false)}
      />

      {/* 12. FULL-SCREEN EARTH 3D DIGITAL TWIN COMMAND STATION & ROAD ZOOM */}
      <EarthCommandCenter
        isOpen={isEarthCommandCenterOpen}
        onClose={() => setIsEarthCommandCenterOpen(false)}
        initialTab={earthCommandCenterTab}
      />

      {/* 13. PLANETARY SURFACE & ROVER EXPLORER (MARS & MOON) */}
      <PlanetarySurfaceModal
        isOpen={isSurfaceExplorerOpen}
        onClose={() => setIsSurfaceExplorerOpen(false)}
        initialBody={surfaceTargetBody}
      />

      {/* 14. STARGAZER 360° PLANETARIUM NIGHT SKY */}
      <StargazerModal
        isOpen={isPlanetariumOpen}
        onClose={() => setIsPlanetariumOpen(false)}
        simDate={simDate}
      />

      {/* 15. ISS REAL-TIME TRACKER & PASS PREDICTOR */}
      <ISSTrackerModal
        isOpen={isISSTrackerOpen}
        onClose={() => setIsISSTrackerOpen(false)}
      />

      {/* 16. SDO SOLAR OBSERVATORY & SPACE WEATHER */}
      <SunExplorerModal
        isOpen={isSunExplorerOpen}
        onClose={() => setIsSunExplorerOpen(false)}
        kpIndex={telemetry.spaceWeather.kpIndex}
      />

      {/* 17. JPL PLANETARY DEFENSE ASTEROID RADAR */}
      <AsteroidDashboard
        isOpen={isAsteroidsOpen}
        onClose={() => setIsAsteroidsOpen(false)}
      />

      {/* 18. NASA DEEP SPACE NETWORK LIVE COMMS */}
      <DSNLiveModal
        isOpen={isDSNOpen}
        onClose={() => setIsDSNOpen(false)}
      />
    </div>
  );
};

export default App;
