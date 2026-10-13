import React, { useState } from 'react';
import {
  Satellite,
  Sun,
  AlertTriangle,
  Rocket,
  Radio,
  Activity,
  X,
  Zap,
} from 'lucide-react';
import type { LiveTelemetry } from '../../types/solar';
import { sound } from '../../services/sound';

interface LiveTelemetryPillsProps {
  telemetry: LiveTelemetry;
  onOpenISSTracker?: () => void;
  onOpenSunExplorer?: () => void;
  onOpenDSN?: () => void;
  onOpenAsteroids?: () => void;
}

export const LiveTelemetryPills: React.FC<LiveTelemetryPillsProps> = ({
  telemetry,
  onOpenISSTracker,
  onOpenSunExplorer,
  onOpenDSN,
  onOpenAsteroids,
}) => {
  const [activeModal, setActiveModal] = useState<'iss' | 'weather' | 'dsn' | 'neo' | 'launch' | null>(
    null
  );

  const sw = telemetry.spaceWeather;
  const dsn = telemetry.dsn;

  return (
    <>
      {/* FLOATING PILLS DOCK */}
      <div className="fixed bottom-24 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        {/* ISS PILL */}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenISSTracker) {
              onOpenISSTracker();
            } else {
              setActiveModal(activeModal === 'iss' ? null : 'iss');
            }
          }}
          className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 backdrop-blur-xl shadow-lg text-xs transition-all group"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px] text-slate-200">
            ISS {telemetry.iss.latitude > 0 ? '+' : ''}
            {telemetry.iss.latitude}° / {telemetry.iss.longitude}°
          </span>
        </button>

        {/* NOAA SPACE WEATHER PILL */}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenSunExplorer) {
              onOpenSunExplorer();
            } else {
              setActiveModal(activeModal === 'weather' ? null : 'weather');
            }
          }}
          className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 backdrop-blur-xl shadow-lg text-xs transition-all group"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px] text-slate-200">
            NOAA Kp {sw.kpIndex} · {sw.geomagneticStormStatus}
          </span>
        </button>

        {/* NASA DEEP SPACE NETWORK (DSN NOW) PILL */}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenDSN) {
              onOpenDSN();
            } else {
              setActiveModal(activeModal === 'dsn' ? null : 'dsn');
            }
          }}
          className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 backdrop-blur-xl shadow-lg text-xs transition-all group"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-200">
            DSN: {dsn?.trackedSpacecraft.length || 7} Probes Linked
          </span>
        </button>

        {/* CLOSE APPROACH ALERT PILL */}
        <button
          onClick={() => {
            sound.playClick();
            if (onOpenAsteroids) {
              onOpenAsteroids();
            } else {
              setActiveModal(activeModal === 'neo' ? null : 'neo');
            }
          }}
          className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 backdrop-blur-xl shadow-lg text-xs transition-all group"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-mono text-[11px] text-slate-200">
            NEO: {telemetry.nearEarthObjects[0]?.name || 'Apophis'} ({telemetry.nearEarthObjects[0]?.missDistanceLunar || 0.08} LD)
          </span>
        </button>

        {/* NEXT LAUNCH */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveModal(activeModal === 'launch' ? null : 'launch');
          }}
          className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-800 backdrop-blur-xl shadow-lg text-xs transition-all group"
        >
          <Rocket className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] text-slate-200">
            Launch: {telemetry.upcomingLaunches[0]?.mission.substring(0, 16)}...
          </span>
        </button>
      </div>

      {/* POPUP DETAILS MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono uppercase">
                {activeModal === 'iss' && (
                  <>
                    <Satellite className="w-4 h-4 text-cyan-400" />
                    <span>International Space Station Live Track</span>
                  </>
                )}
                {activeModal === 'weather' && (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>NOAA Space Weather Operations (Live)</span>
                  </>
                )}
                {activeModal === 'dsn' && (
                  <>
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>NASA Deep Space Network (DSN Now)</span>
                  </>
                )}
                {activeModal === 'neo' && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>JPL Planetary Defense · Close Approaches</span>
                  </>
                )}
                {activeModal === 'launch' && (
                  <>
                    <Rocket className="w-4 h-4 text-indigo-400" />
                    <span>Upcoming Space Missions & Launches</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL 1: ISS LIVE TRACK */}
            {activeModal === 'iss' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">LATITUDE</div>
                    <div className="text-cyan-400 font-bold mt-1 text-sm">
                      {telemetry.iss.latitude > 0 ? '+' : ''}{telemetry.iss.latitude}°
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">LONGITUDE</div>
                    <div className="text-cyan-400 font-bold mt-1 text-sm">
                      {telemetry.iss.longitude > 0 ? '+' : ''}{telemetry.iss.longitude}°
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">ALTITUDE</div>
                    <div className="text-slate-200 font-bold mt-1 text-sm">
                      {telemetry.iss.altitudeKm} km
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500">ORBITAL VELOCITY</div>
                    <div className="text-slate-200 font-bold mt-1 text-sm">
                      {telemetry.iss.velocityKmh.toLocaleString()} km/h
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span className="text-slate-500">Solar Illumination:</span>
                  <span className="text-emerald-400 font-semibold uppercase">{telemetry.iss.visibility}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Data source: wheretheiss.at live satellite propagation engine
                </div>
              </div>
            )}

            {/* MODAL 2: NOAA SPACE WEATHER */}
            {activeModal === 'weather' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>PLANETARY Kp INDEX</span>
                      <Activity className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-amber-400 font-bold mt-1 text-lg">
                      {sw.kpIndex} <span className="text-xs text-slate-500 font-normal">/ 9.0</span>
                    </div>
                    <div className="text-[10px] mt-1 text-slate-400">
                      Status: <span className="text-emerald-400 font-semibold">{sw.geomagneticStormStatus}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>SOLAR WIND SPEED</span>
                      <Zap className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="text-slate-100 font-bold mt-1 text-lg">
                      {sw.solarWindSpeedKms} <span className="text-xs text-slate-500 font-normal">km/s</span>
                    </div>
                    <div className="text-[10px] mt-1 text-slate-400">
                      IMF Bz: <span className="text-cyan-400">{sw.solarWindBz ?? 0} nT</span> · Bt: {sw.solarWindBt ?? 5} nT
                    </div>
                  </div>
                </div>

                {/* NOAA SCALES PILLS */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">NOAA Space Weather Scales</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[9px] text-slate-500">RADIO BLACKOUT</div>
                      <div className="text-amber-300 font-bold text-sm mt-0.5">{sw.radioBlackoutScale || 'R0'}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">HF Comms</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[9px] text-slate-500">SOLAR RADIATION</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5">{sw.solarRadiationScale || 'S0'}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">Satellite Bio</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[9px] text-slate-500">GEOMAGNETIC</div>
                      <div className="text-cyan-400 font-bold text-sm mt-0.5">{sw.geomagneticScale || 'G0'}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">Power Grids</div>
                    </div>
                  </div>
                </div>

                {/* Kp INDEX 24H TREND */}
                {sw.kpTrend && sw.kpTrend.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>RECENT 24-HOUR Kp TREND</span>
                      <span className="text-[9px] text-slate-600">3-Hour Intervals</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-14 pt-2">
                      {sw.kpTrend.map((t, idx) => {
                        const heightPct = Math.min(100, Math.max(12, (t.kp / 9) * 100));
                        const isHigh = t.kp >= 5;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t transition-all ${
                                isHigh ? 'bg-rose-500' : t.kp >= 3.5 ? 'bg-amber-500' : 'bg-cyan-500/80'
                              }`}
                            />
                            <span className="text-[8px] text-slate-500 truncate w-full text-center">
                              {t.time}
                            </span>
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 hidden group-hover:block bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-white whitespace-nowrap shadow-md z-10">
                              Kp {t.kp}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">10.7cm Solar Radio Flux:</span>
                  <span className="text-amber-300 font-bold">{sw.solarRadioFlux10cm ?? 122} sfu</span>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{sw.lastUpdated}</span>
                  <span className="text-slate-600">NOAA Space Weather Prediction Center</span>
                </div>
              </div>
            )}

            {/* MODAL 3: NASA DEEP SPACE NETWORK (DSN NOW) */}
            {activeModal === 'dsn' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  Real-time communications link status between NASA deep space antenna complexes and interplanetary spacecraft.
                </div>

                {/* TRACKED SPACECRAFT LIST */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Active Interplanetary Links</div>
                  {dsn?.trackedSpacecraft && dsn.trackedSpacecraft.length > 0 ? (
                    dsn.trackedSpacecraft.map((sc) => (
                      <div
                        key={sc.code}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-200">{sc.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Ground Station: <span className="text-emerald-400">{sc.station}</span> ({sc.dish})
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>RECEIVING</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                      Tracking: Voyager 1, Voyager 2, JWST, Juno, Parker Solar Probe, Curiosity
                    </div>
                  )}
                </div>

                {/* GROUND COMPLEXES */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">GOLDSTONE</div>
                    <div className="text-slate-200 font-bold text-xs mt-0.5">California, USA</div>
                    <div className="text-[9px] text-emerald-400 mt-1">DSS 14, 24, 25</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">MADRID</div>
                    <div className="text-slate-200 font-bold text-xs mt-0.5">Robledo, Spain</div>
                    <div className="text-[9px] text-emerald-400 mt-1">DSS 54, 55, 63</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[9px] text-slate-500">CANBERRA</div>
                    <div className="text-slate-200 font-bold text-xs mt-0.5">Tidbinbilla, AUS</div>
                    <div className="text-[9px] text-emerald-400 mt-1">DSS 34, 36, 43</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500">
                  Data source: NASA JPL Eyes on the Earth / DSN Now real-time telemetry stream
                </div>
              </div>
            )}

            {/* MODAL 4: JPL NEAR-EARTH OBJECTS */}
            {activeModal === 'neo' && (
              <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">
                  NASA JPL Close Approach Monitoring (&lt; 10 Lunar Distances)
                </div>
                {telemetry.nearEarthObjects.map((neo) => (
                  <div
                    key={neo.name}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{neo.name}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full ${
                          neo.isPotentiallyHazardous
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {neo.isPotentiallyHazardous ? 'Hazardous Trajectory' : 'Standard Pass'}
                      </span>
                    </div>
                    <div className="text-[11px] text-cyan-400">
                      Approach Date: {neo.closeApproachDate}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Miss Distance: {neo.missDistanceKm.toLocaleString()} km ({neo.missDistanceLunar} LD)</span>
                      <span className="text-amber-400">{neo.velocityKms} km/s</span>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] text-slate-500 pt-1">
                  Data source: NASA JPL Center for Near Earth Object Studies (CNEOS / CAD API)
                </div>
              </div>
            )}

            {/* MODAL 5: UPCOMING LAUNCHES */}
            {activeModal === 'launch' && (
              <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">
                  Global Rocket Launch Tracker (Launch Library 2)
                </div>
                {telemetry.upcomingLaunches.map((launch) => (
                  <div
                    key={launch.mission}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-indigo-300">{launch.mission}</div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {launch.statusText || 'Go for Launch'}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Vehicle: <span className="text-slate-100 font-semibold">{launch.rocket}</span> · {launch.agency}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Pad: {launch.padName || launch.destination}</span>
                      <span className="text-cyan-400 font-semibold">{launch.date}</span>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] text-slate-500 pt-1">
                  Data source: The Space Devs / Launch Library 2 (Verified Global Manifest)
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
