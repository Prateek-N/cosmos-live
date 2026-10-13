import React, { useState, useEffect } from 'react';
import {
  Satellite,
  X,
  Search,
  Rocket,
  MapPin,
  Calendar,
  Globe,
  Radio,
  Eye,
  CheckCircle2,
  Navigation,
  Sun,
  Moon,
} from 'lucide-react';
import { EARTH_SATELLITES } from '../../data/earthSatellites';
import type { EarthSatellite, SatelliteCategory } from '../../types/satellite';
import { sound } from '../../services/sound';
import { calculateSatelliteLiveTrack, type SatelliteLiveTrack } from '../../services/satelliteTracker';

interface EarthSatellitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSatellite?: (sat: EarthSatellite) => void;
}

const CATEGORY_LABELS: Record<SatelliteCategory | 'all', string> = {
  all: 'All Satellites',
  station: 'Space Stations',
  observatory: 'Observatories',
  earth_observation: 'Earth Science',
  weather: 'Weather (GEO)',
  navigation: 'Navigation (GPS)',
  communications: 'Communications',
  historic: 'Historic',
};

const CATEGORY_COLORS: Record<SatelliteCategory, { bg: string; text: string; border: string }> = {
  station: { bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-800' },
  observatory: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800' },
  earth_observation: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800' },
  weather: { bg: 'bg-sky-950/80', text: 'text-sky-300', border: 'border-sky-800' },
  navigation: { bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-800' },
  communications: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800' },
  historic: { bg: 'bg-slate-800/80', text: 'text-slate-300', border: 'border-slate-700' },
};

export const EarthSatellitesModal: React.FC<EarthSatellitesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SatelliteCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSat, setSelectedSat] = useState<EarthSatellite>(EARTH_SATELLITES[0]);
  const [liveTrack, setLiveTrack] = useState<SatelliteLiveTrack>(() =>
    calculateSatelliteLiveTrack(EARTH_SATELLITES[0])
  );

  useEffect(() => {
    if (!isOpen) return;
    const update = () => setLiveTrack(calculateSatelliteLiveTrack(selectedSat));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedSat]);

  if (!isOpen) return null;

  const filteredSatellites = EARTH_SATELLITES.filter((sat) => {
    const matchesCategory = selectedCategory === 'all' || sat.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      sat.displayName.toLowerCase().includes(query) ||
      sat.name.toLowerCase().includes(query) ||
      sat.origin.country.toLowerCase().includes(query) ||
      sat.origin.agency.toLowerCase().includes(query) ||
      sat.origin.launchVehicle.toLowerCase().includes(query) ||
      sat.origin.launchSite.toLowerCase().includes(query) ||
      sat.purpose.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto font-sans"
      style={{
        background: 'rgba(2, 6, 23, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="flex flex-col rounded-3xl overflow-hidden text-slate-100 shadow-2xl relative"
        style={{
          width: '95%',
          maxWidth: '1240px',
          height: '88vh',
          maxHeight: '880px',
          background: 'linear-gradient(135deg, #090e1a 0%, #060a14 50%, #030712 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold uppercase tracking-wider font-mono text-slate-100">
                  Earth Orbital Fleet &amp; Satellite Catalog
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  NORAD / CelesTrak Open Data
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Provenance, launch origins, spaceports, and mission telemetry of spacecraft orbiting Earth
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by satellite, country, agency, spaceport, rocket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* CATEGORY TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
            {(Object.keys(CATEGORY_LABELS) as (SatelliteCategory | 'all')[]).map((catKey) => {
              const active = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(catKey);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-xl font-mono whitespace-nowrap transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {CATEGORY_LABELS[catKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN SPLIT (40% LIST + 60% DOSSIER) */}
        <div className="flex-1 flex overflow-hidden min-h-0 modal-split-layout">
          {/* LEFT COLUMN: SATELLITE LIST (40%) */}
          <div
            className="flex flex-col overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-950/40 shrink-0 modal-split-left"
            style={{ width: '40%', height: '100%', minHeight: 0, borderRight: '1px solid rgba(51, 65, 85, 0.6)' }}
          >
            <div className="px-2 py-1 text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>ORBITING SPACECRAFT ({filteredSatellites.length})</span>
              <span>ALTITUDE / REGIME</span>
            </div>

            {filteredSatellites.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No satellites matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredSatellites.map((sat) => {
                const isSelected = selectedSat.id === sat.id;
                const catStyle = CATEGORY_COLORS[sat.category];
                return (
                  <button
                    key={sat.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSat(sat);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{sat.origin.countryFlag}</span>
                        <div className="font-bold text-xs text-slate-100 truncate">
                          {sat.displayName}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                        <span className="font-mono text-slate-300">{sat.origin.agency.split('/')[0].trim()}</span>
                        <span>·</span>
                        <span className="truncate">{sat.origin.launchVehicle.split('(')[0].trim()}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-mono border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {sat.orbit.regime}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 font-semibold">
                        {sat.orbit.altitudeKm.toLocaleString()} km
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: SATELLITE ORIGIN & MISSION DOSSIER (60%) */}
          <div
            className="flex flex-col overflow-y-auto custom-scrollbar p-6 space-y-5 bg-slate-900/40 min-h-0 modal-split-right"
            style={{ width: '60%', height: '100%', minHeight: 0 }}
          >
            {/* SATELLITE HEADER */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedSat.origin.countryFlag}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {selectedSat.displayName}
                    </h3>
                    <div className="text-xs font-mono text-cyan-400">
                      NORAD #{selectedSat.origin.noradId} · COSPAR {selectedSat.origin.cosparId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedSat.status}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedSat.summary}
              </p>
            </div>

            {/* ORIGIN & LAUNCH PROVENANCE (ANSWERS: HOW SENDED IT & WHAT WAS THE ORIGIN) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                <span>Launch Provenance &amp; Origin Details</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {/* COUNTRY */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">ORIGIN NATION</div>
                  <div className="text-slate-200 font-bold mt-0.5 flex items-center gap-1.5">
                    <span>{selectedSat.origin.countryFlag}</span>
                    <span className="truncate">{selectedSat.origin.country}</span>
                  </div>
                </div>

                {/* AGENCY / OPERATOR */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">OPERATING AGENCY</div>
                  <div className="text-slate-200 font-bold mt-0.5 truncate">
                    {selectedSat.origin.agency}
                  </div>
                </div>

                {/* LAUNCH VEHICLE */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Rocket className="w-2.5 h-2.5 text-indigo-400" />
                    <span>LAUNCH VEHICLE</span>
                  </div>
                  <div className="text-indigo-300 font-bold mt-0.5 truncate">
                    {selectedSat.origin.launchVehicle}
                  </div>
                </div>

                {/* LAUNCH DATE */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-amber-400" />
                    <span>LAUNCH DATE</span>
                  </div>
                  <div className="text-amber-300 font-bold mt-0.5">
                    {selectedSat.origin.launchDate}
                  </div>
                </div>
              </div>

              {/* LAUNCH SITE & SPACEPORT */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-rose-400" />
                  <span>LAUNCH SPACEPORT &amp; PAD ORIGIN</span>
                </div>
                <div className="text-slate-200 font-semibold mt-0.5">
                  {selectedSat.origin.launchSite} · <span className="text-slate-400">{selectedSat.origin.launchPad}</span>
                </div>
              </div>
            </div>

            {/* MISSION PURPOSE & WHAT IT DOES */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                <span>Mission Purpose &amp; Scientific Objective</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedSat.purpose}
              </p>

              {/* INSTRUMENTS */}
              {selectedSat.instruments && selectedSat.instruments.length > 0 && (
                <div className="pt-2">
                  <div className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase">Primary Onboard Payloads &amp; Instruments:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSat.instruments.map((inst, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LIVE ORBITAL FLIGHT DYNAMICS */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Orbital Dynamics &amp; Flight Telemetry</span>
                </div>
                <span className="text-[10px] text-slate-500">Live Keplerian State</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-500">ALTITUDE</div>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">
                    {selectedSat.orbit.altitudeKm.toLocaleString()}
                  </div>
                  <div className="text-[8px] text-slate-500">km</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-500">VELOCITY</div>
                  <div className="text-slate-100 font-bold text-sm mt-0.5">
                    {selectedSat.orbit.velocityKmh.toLocaleString()}
                  </div>
                  <div className="text-[8px] text-slate-500">km/h</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-500">INCLINATION</div>
                  <div className="text-slate-100 font-bold text-sm mt-0.5">
                    {selectedSat.orbit.inclinationDeg}°
                  </div>
                  <div className="text-[8px] text-slate-500">equatorial</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-500">PERIOD</div>
                  <div className="text-slate-100 font-bold text-sm mt-0.5">
                    {selectedSat.orbit.periodMinutes}
                  </div>
                  <div className="text-[8px] text-slate-500">minutes</div>
                </div>
              </div>
            </div>

            {/* LIVE SUB-SATELLITE GROUND TRACK & COORDINATES */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Real-time Sub-Satellite Geographic Footprint</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>LIVE TRACKING</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-500">SUB-SAT LATITUDE</div>
                  <div className="text-emerald-400 font-bold text-xs mt-0.5">
                    {Math.abs(liveTrack.latitude).toFixed(3)}° {liveTrack.latitude >= 0 ? 'N' : 'S'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-500">SUB-SAT LONGITUDE</div>
                  <div className="text-emerald-400 font-bold text-xs mt-0.5">
                    {Math.abs(liveTrack.longitude).toFixed(3)}° {liveTrack.longitude >= 0 ? 'E' : 'W'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-500">LIGHTING REGIME</div>
                  <div className="text-amber-300 font-bold text-xs mt-0.5 flex items-center justify-center gap-1">
                    {liveTrack.isDaylight ? (
                      <>
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span>Daylight</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3 h-3 text-sky-400" />
                        <span>Umbra / Eclipse</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-500">TOTAL REVOLUTIONS</div>
                  <div className="text-cyan-300 font-bold text-xs mt-0.5">
                    {liveTrack.totalOrbitsCompleted > 0 ? liveTrack.totalOrbitsCompleted.toLocaleString() : '1,200+'}
                  </div>
                  <div className="text-[8px] text-slate-500">orbits around Earth</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
