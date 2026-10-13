import React, { useState, useEffect, useCallback } from 'react';
import { fetchJPLCloseApproaches } from '../../services/realtimeFeeds';

interface NeoObject {
  name: string;
  closeApproachDate: string;
  missDistanceKm: number;
  missDistanceLunar: number;
  velocityKms: number;
  isPotentiallyHazardous: boolean;
}

interface AsteroidDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

function getThreatLevel(neo: NeoObject): { level: 'critical' | 'high' | 'moderate' | 'low'; label: string; color: string } {
  if (neo.missDistanceLunar < 0.5 || (neo.isPotentiallyHazardous && neo.missDistanceLunar < 2)) {
    return { level: 'critical', label: 'WATCH', color: '#ef5350' };
  }
  if (neo.missDistanceLunar < 2 || neo.isPotentiallyHazardous) {
    return { level: 'high', label: 'ELEVATED', color: '#ff7043' };
  }
  if (neo.missDistanceLunar < 5) {
    return { level: 'moderate', label: 'MONITOR', color: '#ffd54f' };
  }
  return { level: 'low', label: 'SAFE', color: '#81c784' };
}

const EARTH_MOON_DIST_KM = 384400;

export const AsteroidDashboard: React.FC<AsteroidDashboardProps> = ({ isOpen, onClose }) => {
  const [neos, setNeos] = useState<NeoObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNeo, setSelectedNeo] = useState<NeoObject | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchJPLCloseApproaches();
    setNeos(data);
    setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
    setIsLoading(false);
    if (data.length > 0) setSelectedNeo(data[0]);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
    const interval = setInterval(loadData, 300000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const maxDist = Math.max(...neos.map(n => n.missDistanceLunar), 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0a0500 0%, #120800 40%, #060306 100%)',
          border: '1px solid rgba(255, 140, 0, 0.3)',
          boxShadow: '0 0 80px rgba(255, 100, 0, 0.15)',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,140,0,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">☄️</div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Planetary Defense Dashboard</h2>
              <p className="text-xs" style={{ color: 'rgba(255,140,0,0.6)' }}>
                JPL Close Approach Data · Updated {lastUpdated || '…'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', color: '#ffa726' }}
            >
              🔄 Refresh
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <div className="text-4xl animate-spin">☄️</div>
            <p className="text-slate-400">Querying JPL Planetary Defense Database…</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* LEFT: Threat list */}
            <div className="flex flex-col overflow-y-auto" style={{ width: '45%', borderRight: '1px solid rgba(255,140,0,0.1)' }}>
              {/* Summary bar */}
              <div
                className="p-4 shrink-0"
                style={{ borderBottom: '1px solid rgba(255,140,0,0.1)', background: 'rgba(255,140,0,0.04)' }}
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Tracked', value: neos.length, color: '#94a3b8' },
                    { label: 'Hazardous', value: neos.filter(n => n.isPotentiallyHazardous).length, color: '#ef5350' },
                    { label: 'Close (<3 LD)', value: neos.filter(n => n.missDistanceLunar < 3).length, color: '#ffd54f' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEO list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {neos.map((neo, i) => {
                  const threat = getThreatLevel(neo);
                  const isSelected = selectedNeo?.name === neo.name;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedNeo(neo)}
                      className="w-full text-left p-3 rounded-xl transition-all"
                      style={{
                        background: isSelected ? `${threat.color}15` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? threat.color + '50' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white truncate pr-2">{neo.name}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0"
                          style={{ background: threat.color + '25', color: threat.color }}
                        >
                          {threat.label}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>📅 {neo.closeApproachDate.split(' ')[0]}</span>
                        <span>🌙 {neo.missDistanceLunar.toFixed(2)} LD</span>
                      </div>
                      {/* Distance bar */}
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (neo.missDistanceLunar / maxDist) * 100)}%`,
                            background: `linear-gradient(to right, ${threat.color}, ${threat.color}60)`,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Selected NEO detail */}
            <div className="flex flex-col flex-1 overflow-y-auto p-6" style={{ minWidth: 0 }}>
              {selectedNeo ? (
                <>
                  {/* Radar visualization */}
                  <div className="relative flex items-center justify-center mb-6" style={{ height: 200 }}>
                    {/* Concentric rings (Earth-Moon system) */}
                    {[1, 0.5, 0.25].map((scale, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: `${scale * 180}px`,
                          height: `${scale * 180}px`,
                          border: `1px dashed rgba(30, 136, 229, ${0.15 + i * 0.1})`,
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    ))}

                    {/* Earth */}
                    <div
                      className="absolute w-8 h-8 rounded-full z-10 flex items-center justify-center text-sm"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle at 35% 35%, #4fc3f7, #1565c0)',
                        boxShadow: '0 0 12px rgba(79, 195, 247, 0.5)',
                      }}
                    >
                      🌍
                    </div>

                    {/* Moon */}
                    <div
                      className="absolute text-base"
                      style={{
                        top: '50%',
                        left: 'calc(50% + 90px)',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      🌕
                    </div>
                    <div className="absolute text-[10px] text-slate-500 font-mono" style={{ top: 'calc(50% + 15px)', left: 'calc(50% + 90px)', transform: 'translateX(-50%)' }}>
                      1 LD
                    </div>

                    {/* Asteroid position */}
                    {(() => {
                      const ldRatio = selectedNeo.missDistanceLunar;
                      const plotDist = Math.min(ldRatio * 90, 130); // scale to pixels
                      const angle = -35; // degrees from x-axis
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * plotDist;
                      const y = Math.sin(rad) * plotDist;
                      const threat = getThreatLevel(selectedNeo);
                      return (
                        <>
                          <div
                            className="absolute w-4 h-4 rounded-full flex items-center justify-center text-xs z-10"
                            style={{
                              top: `calc(50% - ${y}px)`,
                              left: `calc(50% + ${x}px)`,
                              transform: 'translate(-50%, -50%)',
                              background: threat.color + '30',
                              border: `2px solid ${threat.color}`,
                              boxShadow: `0 0 8px ${threat.color}80`,
                            }}
                          >
                            ☄
                          </div>
                          {/* Trajectory line */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line
                              x1="50%"
                              y1="50%"
                              x2={`calc(50% + ${x}px)`}
                              y2={`calc(50% - ${y}px)`}
                              stroke={threat.color}
                              strokeWidth="0.5"
                              strokeDasharray="3,3"
                              opacity="0.4"
                            />
                          </svg>
                        </>
                      );
                    })()}
                  </div>

                  {/* NEO title */}
                  <div className="mb-4">
                    {(() => {
                      const threat = getThreatLevel(selectedNeo);
                      return (
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{selectedNeo.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: threat.color + '25', color: threat.color }}>
                            {threat.label}
                          </span>
                          {selectedNeo.isPotentiallyHazardous && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,83,80,0.15)', color: '#ef5350', border: '1px solid rgba(239,83,80,0.3)' }}>
                              ⚠ PHA
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <p className="text-xs text-slate-500">Potentially Hazardous Asteroid · JPL Close Approach Database</p>
                  </div>

                  {/* Data grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Close Approach', value: selectedNeo.closeApproachDate.split(' ')[0], color: '#ffd54f' },
                      { label: 'Miss Distance', value: `${selectedNeo.missDistanceLunar.toFixed(3)} LD`, color: '#4fc3f7' },
                      { label: 'Distance (km)', value: selectedNeo.missDistanceKm.toLocaleString(), color: '#81c784' },
                      { label: 'Velocity', value: `${selectedNeo.velocityKms.toFixed(2)} km/s`, color: '#ff7043' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 rounded-xl"
                        style={{ background: `${item.color}0d`, border: `1px solid ${item.color}25` }}
                      >
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
                        <div className="text-base font-bold font-mono mt-1" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Context comparison */}
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distance in Context</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Geostationary orbit (GPS)', km: 42164, emoji: '🛰️' },
                        { label: 'Moon distance', km: EARTH_MOON_DIST_KM, emoji: '🌕' },
                        { label: 'This asteroid', km: selectedNeo.missDistanceKm, emoji: '☄️', highlight: true },
                      ].sort((a, b) => a.km - b.km).map((item) => {
                        const maxK = Math.max(EARTH_MOON_DIST_KM, selectedNeo.missDistanceKm) * 1.1;
                        const width = (item.km / maxK) * 100;
                        const threat = getThreatLevel(selectedNeo);
                        return (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span style={{ color: item.highlight ? threat.color : '#94a3b8' }}>
                                {item.emoji} {item.label}
                              </span>
                              <span className="font-mono text-slate-400">{(item.km / 1000).toFixed(0)}k km</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${width}%`,
                                  background: item.highlight ? threat.color : '#334155',
                                  transition: 'width 0.5s ease',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-600">
                    Data source: JPL Small-Body Database Close-Approach API · ssd-api.jpl.nasa.gov/cad.api
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                  Select an asteroid to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
