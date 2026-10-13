import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Search,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Sparkles,
  Ruler,
  Lock,
  Unlock,
  Check,
  Eye,
  Radio,
  Satellite,
  Sun,
  ShieldAlert,
  Flame,
  Moon,
} from 'lucide-react';
import type { CelestialBody, LayerVisibility, ScaleMode } from '../../types/solar';
import { sound } from '../../services/sound';

interface TopBarProps {
  bodies: CelestialBody[];
  onSelectBody: (body: CelestialBody | null) => void;
  scaleMode: ScaleMode;
  onToggleScaleMode: () => void;
  layers: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  cameraLock: boolean;
  onToggleCameraLock: () => void;
  onResetCamera: () => void;
  onOpenTours: () => void;
  onOpenMeasure: () => void;
  onOpenPlanetarium?: () => void;
  onOpenSunExplorer?: () => void;
  onOpenISSTracker?: () => void;
  onOpenAsteroids?: () => void;
  onOpenDSN?: () => void;
  onOpenEarthHazards?: () => void;
  onOpenLunarAtlas?: () => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  bodies,
  onSelectBody,
  scaleMode,
  onToggleScaleMode,
  layers,
  onToggleLayer,
  cameraLock,
  onToggleCameraLock,
  onResetCamera,
  onOpenTours,
  onOpenMeasure,
  onOpenPlanetarium,
  onOpenSunExplorer,
  onOpenISSTracker,
  onOpenAsteroids,
  onOpenDSN,
  onOpenEarthHazards,
  onOpenLunarAtlas,
  isAudioOn,
  onToggleAudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isObservatoriesOpen, setIsObservatoriesOpen] = useState(false);

  const filteredBodies = searchQuery.trim()
    ? bodies.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          b.naifId.toString().includes(searchQuery)
      )
    : [];

  const handleSelect = (b: CelestialBody) => {
    sound.playSelect();
    onSelectBody(b);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-2xl shadow-xl shadow-black/40">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-[1.5px]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
                Cosmos <span className="text-cyan-400">Live</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Real-time Ephemeris · NASA JPL
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative flex-1 max-w-md pointer-events-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search planet, moon, asteroid, spacecraft (e.g. Mars, ISS)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-900/85 backdrop-blur-md border border-slate-800 focus:border-cyan-500/80 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-lg transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && filteredBodies.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-50">
              <div className="p-1.5 space-y-1">
                {filteredBodies.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: b.color }}
                      />
                      <div>
                        <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                          {b.name}
                        </span>
                        <span className="ml-2 text-[10px] text-slate-500 font-mono">
                          {b.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      NAIF {b.naifId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* SCALE MODE TOGGLE */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleScaleMode();
            }}
            title={
              scaleMode === 'explorer'
                ? 'Explorer Mode: Exaggerated distances and sizes for visibility'
                : 'Realistic Mode: True astronomical scale distances'
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border backdrop-blur-md transition-all shadow-lg ${
              scaleMode === 'explorer'
                ? 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/60'
                : 'bg-amber-950/70 border-amber-700/60 text-amber-300 hover:bg-amber-900/60'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {scaleMode === 'explorer' ? 'Explorer Scale' : 'Realistic Scale'}
            </span>
          </button>

          {/* LAYERS TOGGLE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setIsLayersOpen(!isLayersOpen);
              }}
              title="Toggle Orbital & Visual Layers"
              className={`p-2 rounded-2xl border backdrop-blur-md text-slate-200 hover:text-cyan-300 transition-all shadow-lg ${
                isLayersOpen
                  ? 'bg-slate-800 border-cyan-500/60 text-cyan-300'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/70'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>

            {isLayersOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider font-mono">
                  Display Layers
                </div>
                {(
                  [
                    ['orbits', 'Orbit Lines'],
                    ['moons', 'Natural Moons'],
                    ['asteroids', 'Asteroid Belt'],
                    ['spacecraft', 'Spacecraft & ISS'],
                    ['atmosphereGlow', 'Atmosphere & Glow'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      sound.playClick();
                      onToggleLayer(key);
                    }}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    <span>{label}</span>
                    {layers[key] && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GUIDED TOURS BUTTON */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTours();
            }}
            title="Launch Guided Solar System Tours"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium bg-gradient-to-r from-indigo-900/70 to-purple-900/70 border border-indigo-700/60 text-indigo-200 hover:text-white backdrop-blur-md transition-all shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Tours</span>
          </button>

          {/* STARGAZER PLANETARIUM BUTTON */}
          {onOpenPlanetarium && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenPlanetarium();
              }}
              title="Launch Stargazer 360° Planetarium (Night Sky View from Any City)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-700/60 text-cyan-200 hover:text-white backdrop-blur-md transition-all shadow-lg"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Stargazer</span>
            </button>
          )}

          {/* LIVE OBSERVATORIES DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setIsObservatoriesOpen(!isObservatoriesOpen);
              }}
              title="Live Observatories: ISS, NASA SDO Sun, Asteroid Defense, Deep Space Network"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border backdrop-blur-md transition-all shadow-lg ${
                isObservatoriesOpen
                  ? 'bg-slate-800 border-cyan-500/60 text-cyan-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:text-cyan-300 hover:bg-slate-800/70'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Observatory</span>
            </button>

            {isObservatoriesOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider font-mono">
                  Live Instruments &amp; Feeds
                </div>

                {onOpenISSTracker && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsObservatoriesOpen(false);
                      onOpenISSTracker();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-slate-800/90 text-slate-200 hover:text-cyan-300 transition-colors text-left"
                  >
                    <Satellite className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">ISS Tracker &amp; Passes</div>
                      <div className="text-[10px] text-slate-400 font-mono">Live orbit map, crew &amp; city predictions</div>
                    </div>
                  </button>
                )}

                {onOpenSunExplorer && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsObservatoriesOpen(false);
                      onOpenSunExplorer();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-slate-800/90 text-slate-200 hover:text-amber-300 transition-colors text-left"
                  >
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">SDO Solar Observatory</div>
                      <div className="text-[10px] text-slate-400 font-mono">NASA 304Å, 171Å &amp; X-ray flares</div>
                    </div>
                  </button>
                )}

                {onOpenAsteroids && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsObservatoriesOpen(false);
                      onOpenAsteroids();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-slate-800/90 text-slate-200 hover:text-rose-300 transition-colors text-left"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Asteroid Defense Radar</div>
                      <div className="text-[10px] text-slate-400 font-mono">JPL Near-Earth Objects &amp; Close Approaches</div>
                    </div>
                  </button>
                )}

                {onOpenDSN && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsObservatoriesOpen(false);
                      onOpenDSN();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-slate-800/90 text-slate-200 hover:text-emerald-300 transition-colors text-left"
                  >
                    <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Deep Space Network</div>
                      <div className="text-[10px] text-slate-400 font-mono">Real-time dish telemetry &amp; probes</div>
                    </div>
                  </button>
                )}

                {onOpenEarthHazards && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsObservatoriesOpen(false);
                      onOpenEarthHazards();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-slate-800/90 text-slate-200 hover:text-orange-300 transition-colors text-left"
                  >
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">NASA Earth Hazards (EONET)</div>
                      <div className="text-[10px] text-slate-400 font-mono">Live wildfires, storms &amp; volcanoes</div>
                    </div>
                  </button>
                )}

                {onOpenLunarAtlas && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsObservatoriesOpen(false);
                      onOpenLunarAtlas();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-slate-800/90 text-slate-200 hover:text-purple-300 transition-colors text-left"
                  >
                    <Moon className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Lunar Atlas &amp; Surface Stations</div>
                      <div className="text-[10px] text-slate-400 font-mono">20+ missions, maria, craters &amp; live phase</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MEASURE DISTANCE BUTTON */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMeasure();
            }}
            title="Measure Distance Between Bodies"
            className="p-2 rounded-2xl border bg-slate-900/80 border-slate-800 text-slate-200 hover:text-cyan-300 hover:bg-slate-800/70 backdrop-blur-md transition-all shadow-lg hidden sm:flex"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* CAMERA LOCK TOGGLE */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleCameraLock();
            }}
            title={cameraLock ? 'Camera Locked: Orbiting with Target' : 'Camera Free'}
            className={`p-2 rounded-2xl border backdrop-blur-md transition-all shadow-lg ${
              cameraLock
                ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cameraLock ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* RESET CAMERA */}
          <button
            onClick={() => {
              sound.playClick();
              onResetCamera();
            }}
            title="Reset Camera to Full System"
            className="p-2 rounded-2xl border bg-slate-900/80 border-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 backdrop-blur-md transition-all shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* AUDIO TOGGLE */}
          <button
            onClick={() => {
              onToggleAudio();
              sound.playClick();
            }}
            title={isAudioOn ? 'Mute Audio Effects' : 'Enable Audio Effects'}
            className="p-2 rounded-2xl border bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 backdrop-blur-md transition-all shadow-lg"
          >
            {isAudioOn ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
