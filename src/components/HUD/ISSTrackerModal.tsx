import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchISSPosition,
  fetchISSCrew,
  fetchISSPasses,
  computeISSOrbitNumber,
  type ISSPosition,
  type ISSCrew,
  type ISSPassPrediction,
} from '../../services/issTracker';

interface ISSTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPassTime(unix: number): string {
  if (!unix) return 'Unknown';
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatPassDate(unix: number): string {
  if (!unix) return '';
  const d = new Date(unix * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

const CITY_PRESETS = [
  { name: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'London', lat: 51.51, lon: -0.13 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Tokyo', lat: 35.68, lon: 139.69 },
  { name: 'Sydney', lat: -33.87, lon: 151.21 },
  { name: 'Dubai', lat: 25.2, lon: 55.27 },
  { name: 'São Paulo', lat: -23.55, lon: -46.63 },
  { name: 'Lagos', lat: 6.52, lon: 3.38 },
];

export const ISSTrackerModal: React.FC<ISSTrackerModalProps> = ({ isOpen, onClose }) => {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [crew, setCrew] = useState<ISSCrew[]>([]);
  const [passes, setPasses] = useState<ISSPassPrediction[]>([]);
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [orbitNumber, setOrbitNumber] = useState(0);

  const posIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshPosition = useCallback(async () => {
    const pos = await fetchISSPosition();
    setPosition(pos);
    setOrbitNumber(computeISSOrbitNumber());
  }, []);

  const loadPasses = useCallback(async (lat: number, lon: number) => {
    setPassLoading(true);
    const p = await fetchISSPasses(lat, lon);
    setPasses(p);
    setPassLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refreshPosition();
    fetchISSCrew().then(setCrew);
    loadPasses(selectedCity.lat, selectedCity.lon);

    posIntervalRef.current = setInterval(refreshPosition, 5000);
    return () => {
      if (posIntervalRef.current) clearInterval(posIntervalRef.current);
    };
  }, [isOpen]);

  const handleCityChange = (city: typeof CITY_PRESETS[0]) => {
    setSelectedCity(city);
    setUseCustom(false);
    loadPasses(city.lat, city.lon);
  };

  const handleGeolocate = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(3));
        const lon = parseFloat(pos.coords.longitude.toFixed(3));
        setCustomLat(String(lat));
        setCustomLon(String(lon));
        setUseCustom(true);
        setGeoLoading(false);
        loadPasses(lat, lon);
      },
      () => {
        setGeoLoading(false);
        alert('Location access denied. Please enter coordinates manually.');
      }
    );
  };

  const handleCustomSubmit = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) return;
    setUseCustom(true);
    loadPasses(lat, lon);
  };

  if (!isOpen) return null;

  // ISS ground track arc (simplified visual)
  const trackPoints: [number, number][] = position
    ? Array.from({ length: 21 }, (_, i) => {
        const t = (i - 10) * 4.5; // minutes offset
        const lon = ((position.longitude + t * 0.067 * 360 / 90) + 540) % 360 - 180;
        const lat = Math.sin(((position.latitude / 51.6) + (i / 10)) * Math.PI) * 51.6;
        return [lon, lat] as [number, number];
      })
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #020b18 0%, #050f1e 50%, #02080f 100%)',
          border: '1px solid rgba(0, 200, 255, 0.25)',
          boxShadow: '0 0 80px rgba(0, 180, 255, 0.15)',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(0,200,255,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🛰️</div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">ISS Live Tracker</h2>
              <p className="text-xs text-cyan-400/60">International Space Station — Real-time tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)' }}>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-mono">LIVE · 5s</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* LEFT: Map + Position */}
          <div className="flex flex-col" style={{ width: '52%', borderRight: '1px solid rgba(0,200,255,0.1)' }}>
            {/* World Map with ISS position */}
            <div className="relative flex-1 overflow-hidden" style={{ background: '#000510', minHeight: 240 }}>
              {/* Simple SVG world map background */}
              <svg viewBox="0 0 360 180" className="w-full h-full opacity-20" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid meet">
                <rect width="360" height="180" fill="#0a1628" />
                {/* Latitude/longitude grid */}
                {[-60, -30, 0, 30, 60].map(lat => (
                  <line key={lat} x1="0" y1={90 - lat} x2="360" y2={90 - lat} stroke="#1e3a5f" strokeWidth="0.4" />
                ))}
                {[-120, -60, 0, 60, 120, 180].map(lon => (
                  <line key={lon} x1={lon + 180} y1="0" x2={lon + 180} y2="180" stroke="#1e3a5f" strokeWidth="0.4" />
                ))}
              </svg>

              {/* ISS position dot */}
              {position && (
                <>
                  {/* Ground track */}
                  <svg viewBox="0 0 360 180" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid meet">
                    {/* Footprint circle */}
                    <circle
                      cx={(position.longitude + 180)}
                      cy={(90 - position.latitude)}
                      r={position.footprintRadiusKm / 222.4}
                      fill="rgba(0,200,255,0.06)"
                      stroke="rgba(0,200,255,0.2)"
                      strokeWidth="0.5"
                    />
                    {/* Ground track line */}
                    <polyline
                      points={trackPoints.map(([lon, lat]) => `${(lon + 180)},${(90 - lat)}`).join(' ')}
                      fill="none"
                      stroke="rgba(0,200,255,0.4)"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    {/* ISS position */}
                    <circle cx={position.longitude + 180} cy={90 - position.latitude} r="2.5" fill="#00e5ff" />
                    <circle cx={position.longitude + 180} cy={90 - position.latitude} r="5" fill="none" stroke="#00e5ff" strokeWidth="0.8" opacity="0.5" />
                  </svg>
                </>
              )}

              {/* Coordinates overlay */}
              {position && (
                <div className="absolute bottom-3 left-3 font-mono text-xs space-y-0.5">
                  <div style={{ color: '#00e5ff' }}>
                    {position.latitude >= 0 ? '▲' : '▼'} {Math.abs(position.latitude).toFixed(3)}° {position.latitude >= 0 ? 'N' : 'S'}
                  </div>
                  <div style={{ color: '#00e5ff' }}>
                    {position.longitude >= 0 ? '▶' : '◀'} {Math.abs(position.longitude).toFixed(3)}° {position.longitude >= 0 ? 'E' : 'W'}
                  </div>
                  <div className="text-slate-500">
                    {position.visibility === 'in eclipse' ? '🌑 Eclipse' : '☀️ Sunlit'}
                  </div>
                </div>
              )}
            </div>

            {/* Live Telemetry grid */}
            <div className="grid grid-cols-2 gap-0 shrink-0" style={{ borderTop: '1px solid rgba(0,200,255,0.1)' }}>
              {[
                { label: 'Altitude', value: position ? `${position.altitudeKm.toFixed(1)} km` : '—', color: '#00e5ff' },
                { label: 'Velocity', value: position ? `${position.velocityKmh.toLocaleString()} km/h` : '—', color: '#00e5ff' },
                { label: 'Orbit #', value: orbitNumber.toLocaleString(), color: '#7c4dff' },
                { label: 'Crew', value: `${crew.length} aboard`, color: '#66bb6a' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="py-3 px-4"
                  style={{ borderRight: i % 2 === 0 ? '1px solid rgba(0,200,255,0.08)' : 'none', borderBottom: i < 2 ? '1px solid rgba(0,200,255,0.08)' : 'none' }}
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Crew list */}
            <div className="p-4 shrink-0 overflow-y-auto" style={{ borderTop: '1px solid rgba(0,200,255,0.1)', maxHeight: 160 }}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Crew (Expedition 72)</h3>
              <div className="flex flex-wrap gap-1.5">
                {crew.map((person, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(102,187,106,0.1)', border: '1px solid rgba(102,187,106,0.25)', color: '#a5d6a7' }}
                  >
                    👨‍🚀 {person.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Pass Predictor */}
          <div className="flex flex-col flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
            <div className="p-4 shrink-0" style={{ borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
              <h3 className="text-sm font-bold text-white mb-3">🔭 Pass Predictor</h3>

              {/* City preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCityChange(city)}
                    className="px-2 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: !useCustom && selectedCity.name === city.name ? 'rgba(0,200,255,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${!useCustom && selectedCity.name === city.name ? 'rgba(0,200,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: !useCustom && selectedCity.name === city.name ? '#00e5ff' : '#94a3b8',
                    }}
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              {/* Custom location input */}
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Lat"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg text-xs font-mono text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <input
                  type="number"
                  placeholder="Lon"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg text-xs font-mono text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  onClick={handleCustomSubmit}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(0,200,255,0.15)', border: '1px solid rgba(0,200,255,0.35)', color: '#00e5ff' }}
                >
                  Go
                </button>
                <button
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  className="px-2 py-1 rounded-lg text-lg transition-all"
                  title="Use my location"
                  style={{ background: 'rgba(102,187,106,0.1)', border: '1px solid rgba(102,187,106,0.3)', color: '#81c784' }}
                >
                  {geoLoading ? '⏳' : '📍'}
                </button>
              </div>

              <div className="text-xs text-slate-500 mt-1">
                Predicting passes over: <span style={{ color: '#00e5ff' }}>{useCustom ? `${customLat}°, ${customLon}°` : selectedCity.name}</span>
              </div>
            </div>

            {/* Pass list */}
            <div className="p-4 flex-1">
              {passLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  Calculating passes…
                </div>
              ) : passes.length === 0 ? (
                <p className="text-slate-500 text-sm">No passes predicted for the next 5 days.</p>
              ) : (
                <div className="space-y-2">
                  {passes.map((pass, i) => {
                    const isNext = i === 0;
                    const now = Math.floor(Date.now() / 1000);
                    const minsUntil = Math.max(0, Math.round((pass.riseTime - now) / 60));
                    const hoursUntil = Math.floor(minsUntil / 60);
                    const remainMins = minsUntil % 60;
                    const countdownStr = hoursUntil > 0 ? `${hoursUntil}h ${remainMins}m` : `${minsUntil} min`;

                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl"
                        style={{
                          background: isNext ? 'rgba(0,200,255,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isNext ? 'rgba(0,200,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {isNext && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(0,200,255,0.2)', color: '#00e5ff' }}>NEXT</span>}
                            <span className="text-sm font-mono font-bold text-white">{formatPassTime(pass.riseTime)}</span>
                            <span className="text-xs text-slate-500">{formatPassDate(pass.riseTime)}</span>
                          </div>
                          <span className="text-xs font-mono" style={{ color: isNext ? '#00e5ff' : '#64748b' }}>
                            in {countdownStr}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>⏱ {formatDuration(pass.duration)}</span>
                          <span>⬆ {pass.maxElevationDeg}° max</span>
                          <span>↗ {pass.riseAzimuth} → {pass.setAzimuth}</span>
                        </div>
                        {pass.maxElevationDeg >= 40 && (
                          <div className="mt-1 text-xs" style={{ color: '#81c784' }}>⭐ Excellent viewing opportunity!</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ISS facts */}
            <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(0,200,255,0.1)' }}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ISS Specifications</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  { label: 'Launch', value: 'Nov 20, 1998' },
                  { label: 'Mass', value: '419,725 kg' },
                  { label: 'Length', value: '109 m' },
                  { label: 'Width', value: '73 m (with solar arrays)' },
                  { label: 'Orbital Period', value: '92.65 min' },
                  { label: 'Inclination', value: '51.6°' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-0.5">
                    <span className="text-[10px] text-slate-500">{label}</span>
                    <span className="text-[10px] text-slate-300 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
