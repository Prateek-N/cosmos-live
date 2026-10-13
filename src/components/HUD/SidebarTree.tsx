import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Globe,
  CircleDot,
  Rocket,
  Flame,
  Orbit,
} from 'lucide-react';
import type { CelestialBody } from '../../types/solar';
import { sound } from '../../services/sound';

interface SidebarTreeProps {
  bodies: CelestialBody[];
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBody | null) => void;
}

export const SidebarTree: React.FC<SidebarTreeProps> = ({
  bodies,
  selectedBodyId,
  onSelectBody,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const star = bodies.find((b) => b.type === 'star');
  const terrestrial = bodies.filter(
    (b) => b.type === 'planet' && ['mercury', 'venus', 'earth', 'mars'].includes(b.id)
  );
  const giants = bodies.filter(
    (b) => b.type === 'planet' && ['jupiter', 'saturn', 'uranus', 'neptune'].includes(b.id)
  );
  const dwarfPlanets = bodies.filter((b) => b.type === 'dwarf_planet');
  const moons = bodies.filter((b) => b.type === 'moon');
  const spacecraft = bodies.filter((b) => b.type === 'spacecraft');
  const smallBodies = bodies.filter(
    (b) => b.type === 'asteroid' || b.type === 'comet'
  );

  const renderBodyItem = (body: CelestialBody) => {
    const isSelected = body.id === selectedBodyId;
    return (
      <button
        key={body.id}
        onClick={() => {
          sound.playSelect();
          onSelectBody(body);
        }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
          isSelected
            ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-500/50 shadow-md shadow-cyan-950/50'
            : 'bg-slate-950/50 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800/60 hover:border-slate-700/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: body.color }}
          />
          <span className="truncate font-medium">{body.name}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {body.orbit.semiMajorAxisAU > 0 ? `${body.orbit.semiMajorAxisAU.toFixed(1)} AU` : ''}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed top-20 left-4 z-30 flex items-start pointer-events-none">
      <div
        className={`bg-slate-900/85 backdrop-blur-xl border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 pointer-events-auto flex flex-col ${
          isOpen ? 'w-64 max-h-[calc(100vh-160px)]' : 'w-0 border-none'
        }`}
      >
        {isOpen && (
          <div className="p-3 overflow-y-auto space-y-4 custom-scrollbar">
            {/* STAR */}
            {star && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase px-2 mb-1">
                  <Sun className="w-3 h-3" />
                  <span>Host Star</span>
                </div>
                {renderBodyItem(star)}
              </div>
            )}

            {/* TERRESTRIAL PLANETS */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase px-2 mb-1">
                <Globe className="w-3 h-3" />
                <span>Terrestrial Worlds</span>
              </div>
              <div className="space-y-1">{terrestrial.map(renderBodyItem)}</div>
            </div>

            {/* GAS & ICE GIANTS */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase px-2 mb-1">
                <Orbit className="w-3 h-3" />
                <span>Gas & Ice Giants</span>
              </div>
              <div className="space-y-1">{giants.map(renderBodyItem)}</div>
            </div>

            {/* DWARF PLANETS */}
            {dwarfPlanets.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-purple-400 uppercase px-2 mb-1">
                  <CircleDot className="w-3 h-3" />
                  <span>Dwarf Planets</span>
                </div>
                <div className="space-y-1">{dwarfPlanets.map(renderBodyItem)}</div>
              </div>
            )}

            {/* MOONS */}
            {moons.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase px-2 mb-1">
                  <CircleDot className="w-3 h-3" />
                  <span>Major Moons</span>
                </div>
                <div className="space-y-1">{moons.map(renderBodyItem)}</div>
              </div>
            )}

            {/* SPACECRAFT */}
            {spacecraft.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase px-2 mb-1">
                  <Rocket className="w-3 h-3" />
                  <span>Active Spacecraft</span>
                </div>
                <div className="space-y-1">{spacecraft.map(renderBodyItem)}</div>
              </div>
            )}

            {/* ASTEROIDS & COMETS */}
            {smallBodies.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-rose-400 uppercase px-2 mb-1">
                  <Flame className="w-3 h-3" />
                  <span>Asteroids & Comets</span>
                </div>
                <div className="space-y-0.5">{smallBodies.map(renderBodyItem)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOGGLE BUTTON TAB */}
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen)}
        }
        title={isOpen ? 'Collapse Tree' : 'Expand Solar System Hierarchy'}
        className="ml-2 mt-2 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 backdrop-blur-md shadow-xl pointer-events-auto transition-all"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
};
