import React, { useState } from 'react';
import {
  X,
  Globe2,
  Atom,
  Compass,
  Rocket,
  ExternalLink,
  Zap,
  Info,
  Calendar,
  Ruler,
  Satellite,
  Globe,
  Moon,
} from 'lucide-react';
import type { CelestialBody } from '../../types/solar';
import { calculateTelemetry, getHeliocentricPositionAU } from '../../services/ephemeris';
import { calculateLunarTelemetry } from '../../services/lunarEphemeris';
import { sound } from '../../services/sound';

interface DetailDrawerProps {
  body: CelestialBody | null;
  onClose: () => void;
  simDate: Date;
  onOpenMeasureWith?: (bodyId: string) => void;
  onOpenSatellites?: () => void;
  onOpenEpic?: () => void;
  onOpenEarthCommandCenter?: () => void;
  onOpenSurfaceExplorer?: (target: 'mars' | 'moon') => void;
  onOpenSunExplorer?: () => void;
  onOpenISSTracker?: () => void;
  onOpenAsteroids?: () => void;
  onOpenDSN?: () => void;
}

type TabType = 'overview' | 'physical' | 'orbital' | 'missions' | 'sources';

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  body,
  onClose,
  simDate,
  onOpenMeasureWith,
  onOpenSatellites,
  onOpenEpic,
  onOpenEarthCommandCenter,
  onOpenSurfaceExplorer,
  onOpenSunExplorer,
  onOpenISSTracker,
  onOpenAsteroids,
  onOpenDSN,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMetric, setIsMetric] = useState<boolean>(true);

  if (!body) return null;

  // Compute live readouts for this body
  const bodyHelio = getHeliocentricPositionAU(body, simDate);
  const earthHelio = getHeliocentricPositionAU(
    { id: 'earth', type: 'planet', orbit: { semiMajorAxisAU: 1, eccentricity: 0.0167, inclinationDeg: 0, orbitalPeriodDays: 365.25, orbitalSpeedKms: 29.78, perihelionAU: 0.98, aphelionAU: 1.02 } } as CelestialBody,
    simDate
  );
  const telemetry = calculateTelemetry(body, bodyHelio, earthHelio);

  return (
    <aside className="fixed top-20 right-4 z-30 w-full max-w-md max-h-[calc(100vh-160px)] flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto transition-all animate-slide-in">
      {/* HEADER BANNER */}
      <div
        className="relative p-5 pb-4 border-b border-slate-800/80"
        style={{
          background: `linear-gradient(135deg, ${body.color}15 0%, rgba(15, 23, 42, 0.95) 75%)`,
        }}
      >
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border border-white/10"
            style={{ backgroundColor: body.color }}
          >
            <Globe2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">{body.name}</h2>
              {body.designation && (
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80">
                  {body.designation}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                {body.type.replace('_', ' ')}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-slate-400">NAIF {body.naifId}</span>
            </div>
          </div>
        </div>

        {/* LIVE CLOCK READOUT STRIP */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/70 font-mono text-center">
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Sun Distance</div>
            <div className="text-xs font-semibold text-amber-300">
              {telemetry.distSunAU.toFixed(2)} AU
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Earth Distance</div>
            <div className="text-xs font-semibold text-cyan-300">
              {telemetry.distEarthAU.toFixed(2)} AU
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase">Light Travel</div>
            <div className="text-xs font-semibold text-emerald-300">
              {telemetry.lightTimeFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center px-2 pt-2 border-b border-slate-800 bg-slate-950 text-xs overflow-x-auto custom-scrollbar">
        {(
          [
            ['overview', 'Overview', Info],
            ['physical', 'Physical', Atom],
            ['orbital', 'Orbital', Compass],
            ['missions', 'Missions', Rocket],
            ['sources', 'Sources', ExternalLink],
          ] as const
        ).map(([tabKey, label, Icon]) => (
          <button
            key={tabKey}
            onClick={() => {
              sound.playClick();
              setActiveTab(tabKey);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === tabKey
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/90 font-semibold shadow-inner'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT SCROLLER */}
      <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">{body.summary}</p>

            {/* Quick action: Measure */}
            {onOpenMeasureWith && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenMeasureWith(body.id);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border border-slate-800 hover:border-slate-700 transition-all font-medium text-xs shadow-lg group"
              >
                <Ruler className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Measure Distance from {body.name}</span>
              </button>
            )}

            {/* Earth Command Center Special Launch Button */}
            {body.id === 'earth' && onOpenEarthCommandCenter && (
              <button
                onClick={() => {
                  sound.playWarp();
                  onOpenEarthCommandCenter();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/60 hover:border-cyan-400 font-bold text-xs shadow-xl shadow-cyan-950/50 transition-all group"
              >
                <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
                <span>Launch Earth 3D Digital Twin &amp; Road Zoom</span>
              </button>
            )}

            {/* Earth Special: Satellite Fleet Browser */}
            {body.id === 'earth' && onOpenSatellites && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSatellites();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/80 hover:border-cyan-600 transition-all font-medium text-xs shadow-lg group"
              >
                <Satellite className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span>Explore Earth Satellites &amp; Launch Origins (30+ Tracked)</span>
              </button>
            )}

            {/* Earth Special: NASA EPIC Daily Full-Disk Feed */}
            {body.id === 'earth' && onOpenEpic && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenEpic();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-950/70 hover:bg-blue-900/70 text-cyan-300 border border-blue-800/80 hover:border-blue-600 transition-all font-medium text-xs shadow-lg group"
              >
                <Globe className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>NASA EPIC Daily Full-Disk Earth Feed (Live from L1)</span>
              </button>
            )}

            {/* Mars Special: Rover Landing Sites Explorer */}
            {body.id === 'mars' && onOpenSurfaceExplorer && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSurfaceExplorer('mars');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-950/80 hover:bg-orange-900/90 text-orange-300 border border-orange-500/60 hover:border-orange-400 font-bold text-xs shadow-xl shadow-orange-950/50 transition-all group"
              >
                <Compass className="w-4 h-4 text-orange-400 group-hover:rotate-45 transition-transform" />
                <span>Explore Mars Landing Sites &amp; Rovers (8 Tracked)</span>
              </button>
            )}

            {/* Moon Special: Lunar Landers, Geological Atlas & Real-time Ephemeris */}
            {body.id === 'moon' && onOpenSurfaceExplorer && (() => {
              const telemetry = calculateLunarTelemetry(simDate);
              return (
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 font-mono text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-200">
                      <span className="flex items-center gap-1.5 font-bold text-amber-300">
                        <Moon className="w-3.5 h-3.5" />
                        {telemetry.phaseName}
                      </span>
                      <span className="text-[11px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/50">
                        {telemetry.illuminationPct}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Earth-Moon Distance:</span>
                      <span className="text-white font-semibold">{telemetry.distanceKm.toLocaleString()} km</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenSurfaceExplorer('moon');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 hover:from-purple-900 hover:to-indigo-900 text-purple-200 hover:text-white border border-purple-500/60 hover:border-purple-400 font-bold text-xs shadow-xl shadow-purple-950/50 transition-all group"
                  >
                    <Compass className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform" />
                    <span>Launch Lunar Atlas &amp; Surface Stations (20+ Missions)</span>
                  </button>
                </div>
              );
            })()}

            {/* Sun Special: NASA SDO Live Solar Observatory */}
            {body.id === 'sun' && onOpenSunExplorer && (
              <button
                onClick={() => {
                  sound.playWarp();
                  onOpenSunExplorer();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-500/60 hover:border-amber-400 font-bold text-xs shadow-xl shadow-amber-950/50 transition-all group"
              >
                <Zap className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform animate-pulse" />
                <span>Open SDO Solar Observatory (Live Coronal Imagery & Flares)</span>
              </button>
            )}

            {/* Earth Special: ISS Real-time Tracker & Passes */}
            {body.id === 'earth' && onOpenISSTracker && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenISSTracker();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/60 hover:border-cyan-400 transition-all font-semibold text-xs shadow-lg group"
              >
                <Satellite className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                <span>Live ISS Orbit Map, Crew &amp; City Pass Predictions</span>
              </button>
            )}

            {/* Asteroid Special: Planetary Defense Radar */}
            {(body.type === 'asteroid' || body.type === 'comet') && onOpenAsteroids && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAsteroids();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-200 border border-rose-500/60 hover:border-rose-400 transition-all font-semibold text-xs shadow-lg group"
              >
                <Compass className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>JPL Planetary Defense · Close Approach Radar</span>
              </button>
            )}

            {/* Spacecraft Special: NASA DSN Link */}
            {body.type === 'spacecraft' && onOpenDSN && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenDSN();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/60 hover:border-emerald-400 transition-all font-semibold text-xs shadow-lg group"
              >
                <Rocket className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                <span>NASA Deep Space Network · Live Telemetry Link</span>
              </button>
            )}

            {/* Fun Facts */}
            {body.funFacts && body.funFacts.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                  Notable Discoveries & Facts
                </div>
                <div className="space-y-2">
                  {body.funFacts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-300 flex items-start gap-2.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Surface Features */}
            {body.physical.surfaceFeatures && (
              <div>
                <div className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1.5">
                  Prominent Features
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {body.physical.surfaceFeatures.map((feat) => (
                    <span
                      key={feat}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PHYSICAL DATA */}
        {activeTab === 'physical' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-mono text-slate-400 text-[11px]">System of Units</span>
              <button
                onClick={() => setIsMetric(!isMetric)}
                className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] hover:bg-slate-700"
              >
                {isMetric ? 'Metric (km, m/s²)' : 'Imperial (mi, ft/s²)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">MEAN RADIUS</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {isMetric
                    ? `${body.physical.meanRadiusKm.toLocaleString()} km`
                    : `${Math.round(body.physical.meanRadiusKm * 0.621371).toLocaleString()} mi`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">MASS</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.physical.massKg.toExponential(3)} kg
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">SURFACE GRAVITY</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {isMetric
                    ? `${body.physical.gravityMs2} m/s²`
                    : `${(body.physical.gravityMs2 * 3.28084).toFixed(2)} ft/s²`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">DENSITY</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.physical.densityGcm3} g/cm³
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">ESCAPE VELOCITY</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.physical.escapeVelocityKms} km/s
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">ROTATION PERIOD</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {Math.abs(body.physical.rotationPeriodHours)} hrs
                  {body.physical.rotationPeriodHours < 0 && ' (retrograde)'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">AXIAL TILT</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.physical.axialTiltDeg}°
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">MEAN TEMPERATURE</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {isMetric
                    ? `${body.physical.meanTempC}°C`
                    : `${Math.round(body.physical.meanTempC * 1.8 + 32)}°F`}
                </div>
              </div>
            </div>

            {/* Atmosphere composition breakdown */}
            {body.physical.atmosphereComposition && (
              <div className="space-y-2 mt-3">
                <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  Atmospheric Composition
                </div>
                <div className="space-y-1.5 font-mono">
                  {body.physical.atmosphereComposition.map((gas) => (
                    <div key={gas.gas} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300">{gas.gas}</span>
                        <span className="text-cyan-400">{gas.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(gas.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORBITAL MECHANICS */}
        {activeTab === 'orbital' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">SEMI-MAJOR AXIS</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.orbit.semiMajorAxisAU} AU
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">ECCENTRICITY</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.orbit.eccentricity}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">INCLINATION</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.orbit.inclinationDeg}°
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">ORBITAL PERIOD</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.orbit.orbitalPeriodDays > 365
                    ? `${(body.orbit.orbitalPeriodDays / 365.25).toFixed(2)} yrs`
                    : `${body.orbit.orbitalPeriodDays.toFixed(1)} days`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">PERIHELION</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.orbit.perihelionAU} AU
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500 text-[10px]">APHELION</div>
                <div className="text-slate-100 font-semibold mt-0.5">
                  {body.orbit.aphelionAU} AU
                </div>
              </div>
            </div>

            {/* Instantaneous Simulation Speed */}
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 font-mono">
              <div className="text-[10px] text-cyan-400 uppercase">
                Instantaneous Velocity (Simulation Epoch)
              </div>
              <div className="text-lg font-bold text-cyan-300 mt-1">
                {telemetry.currentSpeedKms.toFixed(2)} km/s
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Calculated via standard vis-viva equation: v = √(μ(2/r - 1/a))
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MISSIONS */}
        {activeTab === 'missions' && (
          <div className="space-y-3">
            {body.missions && body.missions.length > 0 ? (
              body.missions.map((m) => (
                <div
                  key={m.name}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{m.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        m.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : m.status === 'Planned'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{m.agency}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {m.year}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{m.description}</p>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-6">
                No dedicated robotic exploration recorded for this object.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROVENANCE & SOURCES */}
        {activeTab === 'sources' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Every coordinate, physical constant, and orbital element is referenced from authoritative scientific bodies:
            </div>
            {body.provenance.map((p, idx) => (
              <a
                key={idx}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1.5">
                    <span>{p.source}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-[280px]">
                    {p.url}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {p.lastUpdated}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
