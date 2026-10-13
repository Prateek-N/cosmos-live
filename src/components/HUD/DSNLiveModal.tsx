import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDSNStatus, type DSNTelemetry, type DSNDish } from '../../services/realtimeFeeds';

interface DSNLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATION_COORDS: Record<string, { lat: number; lon: number; flag: string }> = {
  Goldstone: { lat: 35.43, lon: -116.89, flag: '🇺🇸' },
  Madrid: { lat: 40.43, lon: -4.25, flag: '🇪🇸' },
  Canberra: { lat: -35.4, lon: 148.98, flag: '🇦🇺' },
};

const SPACECRAFT_FACTS: Record<string, { distance: string; launched: string; mission: string }> = {
  'VGR1': { distance: '23.9 billion km', launched: 'Sep 5, 1977', mission: 'Interstellar space exploration' },
  'VGR2': { distance: '20.0 billion km', launched: 'Aug 20, 1977', mission: 'Planetary grand tour' },
  'JWST': { distance: '1.5 million km', launched: 'Dec 25, 2021', mission: 'Infrared universe observation' },
  'JNO': { distance: '780 million km', launched: 'Aug 5, 2011', mission: 'Jupiter atmospheric study' },
  'SPP': { distance: 'Variable', launched: 'Aug 12, 2018', mission: 'Solar corona exploration' },
  'NH': { distance: '8.8 billion km', launched: 'Jan 19, 2006', mission: 'Pluto flyby and beyond' },
};

function getSignalDelay(sc: string): string {
  const km = SPACECRAFT_FACTS[sc]?.distance;
  if (!km) return 'Unknown';
  const numStr = km.replace(/[^0-9.]/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num)) return 'Variable';
  const factor = km.includes('billion') ? 1e9 : km.includes('million') ? 1e6 : 1e3;
  const totalKm = num * factor;
  const seconds = totalKm / 299792;
  if (seconds > 3600) return `${(seconds / 3600).toFixed(1)}h`;
  if (seconds > 60) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.round(seconds)}s`;
}

export const DSNLiveModal: React.FC<DSNLiveModalProps> = ({ isOpen, onClose }) => {
  const [dsnData, setDsnData] = useState<DSNTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState<DSNDish | null>(null);
  const [signalBeam, setSignalBeam] = useState(0); // animation progress 0-1
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const data = await fetchDSNStatus();
    setDsnData(data);
    if (!isLoading) setIsLoading(false);
    if (data?.activeDishes && data.activeDishes.length > 0) {
      setSelectedDish(data.activeDishes[0]);
    }
    setIsLoading(false);
  }, [isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    load();
    intervalRef.current = setInterval(load, 15000);
    // Animate signal beam
    beamRef.current = setInterval(() => {
      setSignalBeam(p => (p + 0.04) % 1);
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (beamRef.current) clearInterval(beamRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stations = ['Goldstone', 'Madrid', 'Canberra'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #020714 0%, #050b1a 50%, #010509 100%)',
          border: '1px solid rgba(100, 181, 246, 0.25)',
          boxShadow: '0 0 80px rgba(33, 150, 243, 0.12)',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(100,181,246,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">📡</div>
            <div>
              <h2 className="text-lg font-bold text-white">Deep Space Network</h2>
              <p className="text-xs text-blue-400/60">NASA DSN Live · Real-time antenna status</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(33,150,243,0.1)', border: '1px solid rgba(33,150,243,0.25)' }}>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400 font-mono">LIVE · 15s</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white" style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <div className="text-4xl animate-pulse">📡</div>
            <p className="text-slate-400">Connecting to DSN Now…</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* LEFT: Station + Dish list */}
            <div className="flex flex-col overflow-y-auto" style={{ width: '42%', borderRight: '1px solid rgba(100,181,246,0.1)' }}>
              {/* Globe icon row */}
              <div className="p-4 shrink-0" style={{ borderBottom: '1px solid rgba(100,181,246,0.1)' }}>
                <div className="flex justify-center gap-6">
                  {stations.map(station => {
                    const info = STATION_COORDS[station];
                    const activeDishes = dsnData?.activeDishes.filter((d: DSNDish) => d.station === station) || [];
                    return (
                      <div key={station} className="text-center">
                        <div className="text-2xl mb-1">{info.flag}</div>
                        <div className="text-xs font-bold text-white">{station}</div>
                        <div className="text-[10px] text-slate-500">{activeDishes.length} active</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active dishes */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">
                  Active Antennas ({dsnData?.activeDishes.length || 0})
                </div>
                {dsnData?.activeDishes.length === 0 ? (
                  <div className="text-slate-500 text-sm p-3 text-center">
                    No active downlinks at this moment.<br />
                    <span className="text-xs">Try again in a few minutes.</span>
                  </div>
                ) : (
                  dsnData?.activeDishes.map((dish: DSNDish, i: number) => {
                    const isSelected = selectedDish?.dishId === dish.dishId;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDish(dish)}
                        className="w-full text-left p-3 rounded-xl transition-all"
                        style={{
                          background: isSelected ? 'rgba(33,150,243,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? 'rgba(33,150,243,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">{dish.name}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: 'rgba(33,150,243,0.15)', color: '#64b5f6' }}
                          >
                            {dish.station}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {dish.targets.length > 0
                            ? dish.targets.slice(0, 2).join(', ')
                            : dish.activity}
                        </div>
                        <div className="flex gap-3 mt-1 text-[10px] text-slate-600">
                          <span>Az {dish.azimuthDeg}°</span>
                          <span>El {dish.elevationDeg}°</span>
                          {dish.windSpeedKmh > 0 && <span>💨 {dish.windSpeedKmh} km/h</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Tracked spacecraft */}
              <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(100,181,246,0.1)' }}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tracked Spacecraft ({dsnData?.trackedSpacecraft.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(dsnData?.trackedSpacecraft || []).map((sc: { code: string; name: string; station: string; dish: string }, i: number) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: 'rgba(100,181,246,0.08)', border: '1px solid rgba(100,181,246,0.2)', color: '#90caf9' }}
                    >
                      🛸 {sc.name.length > 20 ? sc.name.slice(0, 20) + '…' : sc.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Signal beam visualization + selected dish detail */}
            <div className="flex flex-col flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
              {/* Signal beam animation */}
              <div
                className="relative flex items-center justify-center shrink-0"
                style={{ height: 180, background: 'linear-gradient(to bottom, #010f1f, #000608)', borderBottom: '1px solid rgba(100,181,246,0.1)' }}
              >
                <svg width="100%" height="180" className="absolute inset-0">
                  {/* Earth center */}
                  <circle cx="50%" cy="50%" r="20" fill="#1565c0" opacity="0.8" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="20">🌍</text>

                  {/* Animated signal beams to "deep space" */}
                  {[30, 70, 110, 150].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const endX = 50 + Math.cos(rad) * 45;
                    const endY = 50 + Math.sin(rad) * 35;
                    const t = (signalBeam + i * 0.25) % 1;
                    const px = 50 + Math.cos(rad) * 45 * t;
                    const py = 50 + Math.sin(rad) * 35 * t;
                    return (
                      <g key={i}>
                        <line
                          x1="50%"
                          y1="50%"
                          x2={`${endX}%`}
                          y2={`${endY}%`}
                          stroke="rgba(33,150,243,0.15)"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                        <circle
                          cx={`${px}%`}
                          cy={`${py}%`}
                          r="3"
                          fill="#42a5f5"
                          opacity={0.8}
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute bottom-2 text-xs text-slate-600 text-center">
                  Simulated signal animation · Real-time dish data from NASA DSN Now
                </div>
              </div>

              {/* Selected dish detail */}
              <div className="flex-1 p-5 overflow-y-auto">
                {selectedDish ? (
                  <>
                    <h3 className="text-lg font-bold text-white mb-1">{selectedDish.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">{selectedDish.station} · {STATION_COORDS[selectedDish.station]?.flag} {selectedDish.activity}</p>

                    {/* Pointing info */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: 'Azimuth', value: `${selectedDish.azimuthDeg}°`, color: '#64b5f6' },
                        { label: 'Elevation', value: `${selectedDish.elevationDeg}°`, color: '#4fc3f7' },
                        { label: 'Wind', value: `${selectedDish.windSpeedKmh} km/h`, color: '#81c784' },
                      ].map(item => (
                        <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: `${item.color}0d`, border: `1px solid ${item.color}25` }}>
                          <div className="text-[10px] text-slate-500 uppercase">{item.label}</div>
                          <div className="text-lg font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tracked spacecraft details */}
                    {selectedDish.targets.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Communicating With</h4>
                        {selectedDish.targets.map((code: string) => {
                          const facts = SPACECRAFT_FACTS[code];
                          const delay = getSignalDelay(code);
                          return (
                            <div
                              key={code}
                              className="p-4 rounded-xl"
                              style={{ background: 'rgba(33,150,243,0.07)', border: '1px solid rgba(33,150,243,0.2)' }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-white">
                                  🛸 {dsnData?.trackedSpacecraft.find((sc: { code: string; name: string }) => sc.code === code)?.name || code}
                                </span>
                                <span className="text-xs font-mono text-blue-300">{code}</span>
                              </div>
                              {facts && (
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Distance</span>
                                    <span className="text-slate-300 font-mono">{facts.distance}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Signal delay</span>
                                    <span className="font-mono" style={{ color: '#64b5f6' }}>{delay} one-way</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Mission</span>
                                    <span className="text-slate-400">{facts.mission}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* DSN info */}
                    <div className="mt-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-xs text-slate-500">
                        The Deep Space Network (DSN) is NASA's international array of giant radio antennas supporting interplanetary spacecraft missions. 
                        Three complexes at Goldstone (California), Madrid (Spain), and Canberra (Australia) provide 24/7 coverage.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-600">
                    No active dish contacts at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
