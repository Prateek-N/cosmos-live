import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Rewind,
  Clock,
  Sparkles,
  Search,
  X,
  Compass,
  Rocket,
  Calendar,
} from 'lucide-react';
import { sound } from '../../services/sound';
import {
  HISTORICAL_MILESTONES,
  type HistoricalMilestone,
} from '../../data/historicalMilestones';

interface TimeControllerProps {
  simDate: Date;
  onChangeSimDate: (date: Date) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speedMultiplier: number;
  onChangeSpeedMultiplier: (speed: number) => void;
  isReversed: boolean;
  onToggleReverse: () => void;
  onSelectMilestone?: (milestone: HistoricalMilestone) => void;
}

const SPEED_PRESETS = [
  { label: '1x (Realtime)', value: 1 },
  { label: '100x', value: 100 },
  { label: '10,000x', value: 10000 },
  { label: '1 Day/s', value: 86400 },
  { label: '1 Mon/s', value: 2592000 },
  { label: '1 Yr/s', value: 31536000 },
];

export const TimeController: React.FC<TimeControllerProps> = ({
  simDate,
  onChangeSimDate,
  isPlaying,
  onTogglePlay,
  speedMultiplier,
  onChangeSpeedMultiplier,
  isReversed,
  onToggleReverse,
  onSelectMilestone,
}) => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'landing' | 'flyby' | 'orbit' | 'celestial'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formattedDate = simDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = simDate.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleSetNow = () => {
    sound.playClick();
    onChangeSimDate(new Date());
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const d = new Date(e.target.value);
      if (!isNaN(d.getTime())) {
        onChangeSimDate(d);
      }
    }
  };

  const handleSelectEpoch = (milestone: HistoricalMilestone) => {
    sound.playWarp();
    onChangeSimDate(new Date(milestone.date));
    if (onSelectMilestone) {
      onSelectMilestone(milestone);
    }
    setShowEventModal(false);
  };

  const filteredMilestones = useMemo(() => {
    return HISTORICAL_MILESTONES.filter((m) => {
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.label.toLowerCase().includes(q) ||
        m.craft.toLowerCase().includes(q) ||
        m.targetBodyName.toLowerCase().includes(q) ||
        m.epochYear.toString().includes(q) ||
        m.agency.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, searchQuery]);

  return (
    <>
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-4xl px-4">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-3.5 shadow-2xl shadow-black/60 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* DATE & TIME DISPLAY */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-100">{formattedDate}</div>
                <div className="text-[10px] text-cyan-400 font-medium">{formattedTime} UTC</div>
              </div>
            </div>

            {/* NOW BUTTON */}
            <button
              onClick={handleSetNow}
              title="Reset to Present Live Time"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-950/70 border border-slate-700 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 text-xs font-mono font-semibold transition-all"
            >
              NOW
            </button>
          </div>

          {/* PLAYBACK CONTROLS */}
          <div className="flex items-center gap-2">
            {/* REVERSE TOGGLE */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleReverse();
              }}
              title={isReversed ? 'Reverse Time Active' : 'Forward Time'}
              className={`p-2 rounded-2xl border transition-all ${
                isReversed
                  ? 'bg-rose-950/70 border-rose-700/60 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Rewind className="w-4 h-4" />
            </button>

            {/* PLAY / PAUSE */}
            <button
              onClick={() => {
                sound.playClick();
                onTogglePlay();
              }}
              title={isPlaying ? 'Pause Simulation' : 'Run Simulation'}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* WARP SPEED PRESET SELECTOR */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-2xl p-1 gap-1">
              {SPEED_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    sound.playWarp();
                    onChangeSpeedMultiplier(p.value);
                  }}
                  className={`px-2 py-1 rounded-xl text-[10px] font-mono font-medium transition-all ${
                    speedMultiplier === p.value
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* HISTORIC EVENTS & JUMP PICKER */}
          <div className="relative flex items-center gap-2">
            {/* HISTORIC MILESTONES BUTTON */}
            <button
              onClick={() => {
                sound.playClick();
                setShowEventModal(true);
              }}
              title="Browse Historic Celestial Milestones & Space Missions"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 hover:from-amber-900/90 hover:to-yellow-900/90 border border-amber-600/60 text-amber-200 text-xs font-semibold shadow-lg shadow-amber-950/40 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Epochs</span>
            </button>

            {/* DATE PICKER INPUT */}
            <div className="relative">
              <input
                type="date"
                value={simDate.toISOString().split('T')[0]}
                onChange={handleDateInput}
                min="1900-01-01"
                max="2100-12-31"
                className="bg-slate-800/80 border border-slate-700 text-slate-200 text-xs rounded-2xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* HISTORIC MILESTONES MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl shadow-black/90 overflow-hidden">
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Historic Celestial Milestones
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 font-mono">
                      {HISTORICAL_MILESTONES.length} Epochs
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jump solar system simulation to iconic landings, deep-space flybys &amp; orbital insertions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH & CATEGORY FILTERS */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {(
                  [
                    ['all', 'All Epochs'],
                    ['landing', 'Landings'],
                    ['flyby', 'Flybys'],
                    ['orbit', 'Orbit Insertions'],
                    ['celestial', 'Celestial Events'],
                  ] as const
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setCategoryFilter(cat);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search missions, bodies, years..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 font-sans"
                />
              </div>
            </div>

            {/* MILESTONE CARDS LIST */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {filteredMilestones.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No historical milestones found matching your search.
                </div>
              ) : (
                filteredMilestones.map((m) => {
                  const mDateStr = m.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  const mTimeStr = m.date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={m.id}
                      className="group bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                            style={{ backgroundColor: m.badgeColor }}
                          />
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {m.label}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {m.epochYear}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400">
                            {mDateStr}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">
                            {m.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {m.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Rocket className="w-3 h-3 text-cyan-400" />
                            {m.craft} ({m.agency})
                          </span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Compass className="w-3 h-3" />
                            Target: {m.targetBodyName}
                          </span>
                          {m.highlightCoordinates && (
                            <span className="text-slate-500 hidden sm:inline">
                              • {m.highlightCoordinates}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-emerald-400/90 font-medium pt-0.5">
                          ⭐ <span className="text-slate-300">{m.significance}</span>
                        </div>
                      </div>

                      {/* JUMP ACTION BUTTON */}
                      <button
                        onClick={() => handleSelectEpoch(m)}
                        className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-900/30 transition-all active:scale-95 group/btn"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-200 group-hover/btn:scale-110 transition-transform" />
                        <span>Jump to {mTimeStr} UTC</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3 bg-slate-950/70 border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono">
              Selecting an epoch adjusts orbital time coordinates and focuses camera onto the target celestial body.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
