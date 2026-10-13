import React, { useState } from 'react';
import { Ruler, X, ArrowRight, Clock } from 'lucide-react';
import type { CelestialBody } from '../../types/solar';
import {
  AU_IN_KM,
  SPEED_OF_LIGHT_KMS,
  getHeliocentricPositionAU,
} from '../../services/ephemeris';
import { sound } from '../../services/sound';

interface MeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodies: CelestialBody[];
  initialBodyAId?: string;
  simDate: Date;
}

export const MeasureModal: React.FC<MeasureModalProps> = ({
  isOpen,
  onClose,
  bodies,
  initialBodyAId,
  simDate,
}) => {
  const [bodyAId, setBodyAId] = useState<string>(initialBodyAId || 'earth');
  const [bodyBId, setBodyBId] = useState<string>('mars');

  if (!isOpen) return null;

  const bodyA = bodies.find((b) => b.id === bodyAId) || bodies[0];
  const bodyB = bodies.find((b) => b.id === bodyBId) || bodies[1];

  const posA = getHeliocentricPositionAU(bodyA, simDate);
  const posB = getHeliocentricPositionAU(bodyB, simDate);

  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  const dz = posA.z - posB.z;
  const distAU = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const distKm = distAU * AU_IN_KM;
  const distMiles = distKm * 0.621371;

  const lightTravelSec = distKm / SPEED_OF_LIGHT_KMS;
  let formattedLight = '';
  if (lightTravelSec < 60) {
    formattedLight = `${lightTravelSec.toFixed(2)} seconds`;
  } else if (lightTravelSec < 3600) {
    const m = Math.floor(lightTravelSec / 60);
    const s = Math.round(lightTravelSec % 60);
    formattedLight = `${m} min ${s} sec`;
  } else {
    const h = Math.floor(lightTravelSec / 3600);
    const m = Math.round((lightTravelSec % 3600) / 60);
    formattedLight = `${h} hr ${m} min`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-in">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Cosmic Interplanetary Distance Tool
              </h2>
              <p className="text-xs text-slate-400">
                True euclidean separation at current simulation epoch
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY SELECTORS */}
        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Origin Body
            </label>
            <select
              value={bodyAId}
              onChange={(e) => {
                sound.playClick();
                setBodyAId(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {bodies.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Target Body
            </label>
            <select
              value={bodyBId}
              onChange={(e) => {
                sound.playClick();
                setBodyBId(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {bodies.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>{bodyA.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>{bodyB.name}</span>
            </span>
            <span className="text-cyan-400 font-bold">{distAU.toFixed(4)} AU</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-500 uppercase">Kilometers</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {distKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-[10px] text-slate-500 uppercase">Statute Miles</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {distMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">
                Light-Travel & Radio Signal Delay
              </div>
              <div className="text-sm font-bold text-cyan-300">{formattedLight}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
