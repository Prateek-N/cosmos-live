import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchSunLiveData,
  type SunLiveData,
} from '../../services/solarService';

interface SunExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpIndex?: number;
}

type ViewMode = '304' | '171' | 'hmi';

const VIEW_OPTIONS: { mode: ViewMode; label: string; desc: string; color: string }[] = [
  { mode: '304', label: 'AIA 304Å', desc: 'Chromosphere / Prominence', color: '#ff7043' },
  { mode: '171', label: 'AIA 171Å', desc: 'Corona / Magnetic Loops', color: '#ffb300' },
  { mode: 'hmi', label: 'HMI Magnetogram', desc: 'Magnetic Field Map', color: '#7e57c2' },
];

/** Format flux value to scientific notation for display */
function formatFlux(flux: number): string {
  if (flux >= 1e-4) return `${(flux / 1e-4).toFixed(2)}×10⁻⁴`;
  if (flux >= 1e-5) return `${(flux / 1e-5).toFixed(2)}×10⁻⁵`;
  if (flux >= 1e-6) return `${(flux / 1e-6).toFixed(2)}×10⁻⁶`;
  if (flux >= 1e-7) return `${(flux / 1e-7).toFixed(2)}×10⁻⁷`;
  return `${(flux / 1e-8).toFixed(2)}×10⁻⁸`;
}

function fluxToColor(flux: number): string {
  if (flux >= 1e-4) return '#ef5350';   // X-class — red
  if (flux >= 1e-5) return '#ff7043';   // M-class — orange
  if (flux >= 1e-6) return '#ffd54f';   // C-class — yellow
  if (flux >= 1e-7) return '#4fc3f7';   // B-class — blue
  return '#81c784';                       // A-class — green
}

function kpToAuroraZone(kp: number): string {
  if (kp >= 7) return 'Aurora visible to ~35° latitude (Alabama, Portugal)';
  if (kp >= 5) return 'Aurora visible to ~50° latitude (London, Vancouver)';
  if (kp >= 3) return 'Aurora visible to ~60° latitude (Oslo, Anchorage)';
  return 'Aurora limited to polar regions only (>70° latitude)';
}

export const SunExplorerModal: React.FC<SunExplorerModalProps> = ({
  isOpen,
  onClose,
  kpIndex = 2.5,
}) => {
  const [sunData, setSunData] = useState<SunLiveData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('304');
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setImgError(false);
    try {
      const data = await fetchSunLiveData();
      setSunData(data);
      // Trigger CME pulse animation if strong activity
      const latestFlux = data.xrayFluxHistory[data.xrayFluxHistory.length - 1]?.flux || 0;
      if (latestFlux >= 1e-5 || kpIndex >= 5) {
        setPulseActive(true);
        setTimeout(() => setPulseActive(false), 3000);
      }
    } catch (err) {
      console.error('Sun data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [kpIndex]);

  useEffect(() => {
    if (!isOpen) return;
    load();
    intervalRef.current = setInterval(load, 120000); // refresh every 2 min
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, load]);

  if (!isOpen) return null;

  const currentImg = sunData?.imagery
    ? viewMode === '304'
      ? sunData.imagery.sdoUrl304
      : viewMode === '171'
        ? sunData.imagery.sdoUrl171
        : sunData.imagery.sdoUrlHmi
    : null;

  const latestFlux = sunData?.xrayFluxHistory[sunData.xrayFluxHistory.length - 1];
  const maxFlux = sunData?.xrayFluxHistory.reduce((a, b) => (a.flux > b.flux ? a : b), sunData.xrayFluxHistory[0]);
  const chartMax = maxFlux ? Math.max(maxFlux.flux, 1e-5) : 1e-5;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-6xl mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0d0006 0%, #1a0500 40%, #0a0a1a 100%)',
          border: '1px solid rgba(255, 100, 0, 0.3)',
          boxShadow: '0 0 80px rgba(255, 100, 0, 0.2), 0 0 160px rgba(255, 50, 0, 0.1)',
          maxHeight: '92vh',
        }}
      >
        {/* CME Burst Animation overlay */}
        {pulseActive && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,100,0,0.35) 0%, transparent 70%)',
              animation: 'ping 1s ease-out',
            }}
          />
        )}

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255, 100, 0, 0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
              style={{
                background: 'radial-gradient(circle, #ffb300, #ff6f00)',
                boxShadow: '0 0 20px rgba(255, 180, 0, 0.6)',
              }}
            >
              ☀️
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Live Sun Explorer</h2>
              <p className="text-xs text-orange-400/70">
                {sunData?.lastUpdated || 'Loading NASA SDO data…'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(255, 100, 0, 0.15)', border: '1px solid rgba(255, 100, 0, 0.3)' }}>
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-orange-400 font-mono">LIVE SDO</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* LEFT: Solar Image Viewer */}
          <div className="flex flex-col" style={{ width: '55%', borderRight: '1px solid rgba(255,100,0,0.15)' }}>
            {/* View mode tabs */}
            <div className="flex gap-1 p-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,100,0,0.1)' }}>
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => { setViewMode(opt.mode); setImgError(false); }}
                  className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: viewMode === opt.mode ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${viewMode === opt.mode ? opt.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    color: viewMode === opt.mode ? opt.color : '#94a3b8',
                  }}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Solar Image */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ background: '#000', minHeight: 0 }}>
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full animate-ping" style={{ background: 'radial-gradient(circle, #ffb300, #ff6f00)', opacity: 0.4 }} />
                  <span className="text-orange-400/60 text-sm">Loading SDO imagery…</span>
                </div>
              ) : imgError || !currentImg ? (
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <span className="text-4xl">☀️</span>
                  <span className="text-orange-300 text-sm">SDO imagery temporarily unavailable</span>
                  <span className="text-slate-500 text-xs">Using cached solar data</span>
                </div>
              ) : (
                <>
                  {/* Corona glow effect */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at center, ${
                        viewMode === '304' ? 'rgba(255,80,0,0.08)' :
                        viewMode === '171' ? 'rgba(255,180,0,0.08)' :
                        'rgba(100,60,200,0.08)'
                      } 40%, transparent 70%)`,
                    }}
                  />
                  <img
                    src={currentImg}
                    alt={`Sun — ${VIEW_OPTIONS.find(v => v.mode === viewMode)?.label}`}
                    className="w-full h-full object-contain"
                    style={{
                      maxHeight: '100%',
                      filter: viewMode === 'hmi' ? 'contrast(1.3) brightness(1.1)' : 'brightness(1.05)',
                    }}
                    onError={() => setImgError(true)}
                    onLoad={() => setImgError(false)}
                    crossOrigin="anonymous"
                  />
                  {/* Wavelength badge */}
                  <div
                    className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs font-mono"
                    style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${VIEW_OPTIONS.find(v => v.mode === viewMode)?.color}40`, color: VIEW_OPTIONS.find(v => v.mode === viewMode)?.color }}
                  >
                    NASA SDO · {sunData?.imagery?.timestamp ? new Date(sunData.imagery.timestamp).toLocaleDateString() : 'Latest'}
                  </div>
                </>
              )}
            </div>

            {/* Quick solar stats row */}
            <div className="grid grid-cols-3 gap-0 shrink-0" style={{ borderTop: '1px solid rgba(255,100,0,0.1)' }}>
              {[
                { label: 'Sunspots', value: sunData?.sunspotNumber ?? '—', unit: '' },
                { label: '10.7cm Flux', value: sunData ? Math.round(sunData.radioFlux10cm) : '—', unit: ' sfu' },
                { label: 'Flare Class', value: sunData?.currentFlareClass ?? '—', unit: '' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="py-3 px-4 text-center"
                  style={{ borderRight: i < 2 ? '1px solid rgba(255,100,0,0.1)' : 'none' }}
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-lg font-bold font-mono" style={{ color: '#ffb300' }}>
                    {stat.value}{stat.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Data panels */}
          <div className="flex flex-col flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
            {/* X-Ray Flux Chart */}
            <div className="p-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,100,0,0.1)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">GOES X-Ray Flux (6 Hours)</h3>
                {latestFlux && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                    style={{ background: fluxToColor(latestFlux.flux) + '22', color: fluxToColor(latestFlux.flux) }}
                  >
                    {latestFlux.flareClass}
                  </span>
                )}
              </div>

              {/* Flux chart — SVG bar chart */}
              <div className="relative" style={{ height: 80 }}>
                {/* Flare class threshold lines */}
                {[
                  { flux: 1e-4, label: 'X', color: '#ef5350' },
                  { flux: 1e-5, label: 'M', color: '#ff7043' },
                  { flux: 1e-6, label: 'C', color: '#ffd54f' },
                  { flux: 1e-7, label: 'B', color: '#4fc3f7' },
                ].map(({ flux, label, color }) => {
                  const y = 80 - (Math.log10(flux / 1e-9) / Math.log10(chartMax / 1e-9)) * 72;
                  if (y < 0 || y > 80) return null;
                  return (
                    <div
                      key={label}
                      className="absolute left-8 right-0 flex items-center gap-1"
                      style={{ top: y, borderTop: `1px dashed ${color}30` }}
                    >
                      <span className="text-[9px] font-mono -translate-y-2 absolute -left-7" style={{ color }}>{label}</span>
                    </div>
                  );
                })}

                {/* Bars */}
                <svg width="100%" height="80" className="absolute inset-0 left-8" style={{ width: 'calc(100% - 32px)' }}>
                  {sunData?.xrayFluxHistory.map((point, i) => {
                    const total = sunData.xrayFluxHistory.length;
                    const barW = Math.max(1, (100 / total) - 0.3);
                    const logH = Math.log10(point.flux / 1e-9) / Math.log10(chartMax / 1e-9);
                    const h = Math.max(1, logH * 72);
                    const x = (i / total) * 100;
                    return (
                      <rect
                        key={i}
                        x={`${x}%`}
                        y={80 - h}
                        width={`${barW}%`}
                        height={h}
                        fill={fluxToColor(point.flux)}
                        opacity={0.8}
                        rx={1}
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 mt-1 pl-8">
                <span>6h ago</span>
                <span>Now</span>
              </div>
            </div>

            {/* Current Conditions Grid */}
            <div className="p-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,100,0,0.1)' }}>
              <h3 className="text-sm font-bold text-white mb-3">Current Solar Conditions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'X-Ray Flux', value: latestFlux ? formatFlux(latestFlux.flux) : '—', sub: 'W/m²', color: latestFlux ? fluxToColor(latestFlux.flux) : '#94a3b8' },
                  { label: 'Flare Class', value: latestFlux?.flareClass ?? '—', sub: 'Current', color: latestFlux ? fluxToColor(latestFlux.flux) : '#94a3b8' },
                  { label: 'Kp Index', value: kpIndex.toFixed(1), sub: 'Geomagnetic', color: kpIndex >= 5 ? '#ef5350' : kpIndex >= 3 ? '#ffd54f' : '#81c784' },
                  { label: 'Sunspot No.', value: sunData?.sunspotNumber ?? '—', sub: 'Solar Cycle 25', color: '#ffb300' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl"
                    style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}
                  >
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
                    <div className="text-xl font-bold font-mono mt-1" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aurora Forecast */}
            <div className="p-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,100,0,0.1)' }}>
              <h3 className="text-sm font-bold text-white mb-2">🌌 Aurora Forecast</h3>
              <div
                className="p-3 rounded-xl text-sm"
                style={{
                  background: kpIndex >= 5 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(30, 136, 229, 0.08)',
                  border: `1px solid ${kpIndex >= 5 ? 'rgba(76,175,80,0.3)' : 'rgba(30,136,229,0.2)'}`,
                  color: kpIndex >= 5 ? '#81c784' : '#64b5f6',
                }}
              >
                <div className="font-semibold mb-1">Kp {kpIndex.toFixed(1)} — {kpIndex >= 7 ? 'Strong Storm' : kpIndex >= 5 ? 'Active' : kpIndex >= 3 ? 'Unsettled' : 'Quiet'}</div>
                <div className="text-xs opacity-80">{kpToAuroraZone(kpIndex)}</div>
              </div>
            </div>

            {/* Sun Facts */}
            <div className="p-4 shrink-0">
              <h3 className="text-sm font-bold text-white mb-3">Solar Physical Data</h3>
              <div className="space-y-2">
                {[
                  { label: 'Spectral Class', value: 'G2V (Yellow Dwarf)' },
                  { label: 'Age', value: '4.603 billion years' },
                  { label: 'Mass', value: '1.989 × 10³⁰ kg' },
                  { label: 'Radius', value: '696,340 km (109× Earth)' },
                  { label: 'Surface Temp', value: '5,778 K (photosphere)' },
                  { label: 'Core Temp', value: '~15 million K' },
                  { label: 'Rotation Period', value: '25.38 days (equatorial)' },
                  { label: 'Luminosity', value: '3.828 × 10²⁶ W' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs text-slate-300 font-mono">{value}</span>
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
