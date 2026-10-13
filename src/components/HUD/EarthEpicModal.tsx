import React, { useState, useEffect } from 'react';
import {
  Globe,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Radio,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { EpicImage } from '../../types/epic';
import { fetchNASAEPICImages } from '../../services/epicService';
import { sound } from '../../services/sound';

interface EarthEpicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EarthEpicModal: React.FC<EarthEpicModalProps> = ({ isOpen, onClose }) => {
  const [images, setImages] = useState<EpicImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load EPIC imagery on mount or when opened
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchNASAEPICImages().then((imgs) => {
      if (isMounted) {
        setImages(imgs);
        setCurrentIndex(0);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Timelapse playback loop
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  if (!isOpen) return null;

  const currentImg = images[currentIndex];

  const handlePrev = () => {
    sound.playClick();
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    sound.playClick();
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const togglePlay = () => {
    sound.playClick();
    setIsPlaying((prev) => !prev);
  };

  // Helper to describe region from coordinates
  const getRegionName = (lat: number, lon: number): string => {
    const hemi = lat >= 0 ? 'Northern' : 'Southern';
    if (lon >= -180 && lon < -120) return `${hemi} Central Pacific Basin`;
    if (lon >= -120 && lon < -60) return `${hemi} Americas & East Pacific`;
    if (lon >= -60 && lon < 0) return `${hemi} Atlantic Ocean & South America`;
    if (lon >= 0 && lon < 60) return `${hemi} Europe, Africa & Mediterranean`;
    if (lon >= 60 && lon < 120) return `${hemi} Indian Ocean & Central Asia`;
    return `${hemi} East Asia & Western Pacific`;
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md pointer-events-auto"
    >
      <div className="w-full max-w-5xl h-[90vh] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shadow-inner">
              <Globe className="w-5 h-5 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold uppercase tracking-wider font-mono text-slate-100">
                  NASA EPIC: Daily Full-Disk Earth Feed
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800 font-mono">
                  NOAA DSCOVR · Sun-Earth L1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Earth Polychromatic Imaging Camera from 1.5 million kilometers (1 million miles) away in deep space
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

        {/* MAIN BODY */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* LEFT: INTERACTIVE IMAGE VIEWER & ROTATION TIMELAPSE */}
          <div className="flex-1 flex flex-col p-4 bg-slate-950/60 overflow-y-auto custom-scrollbar">
            {/* IMAGE CONTAINER */}
            <div className="relative flex-1 min-h-[300px] flex items-center justify-center bg-black/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl group">
              {isLoading || !currentImg ? (
                <div className="flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-xs">
                  <Globe className="w-10 h-10 animate-spin text-cyan-500" style={{ animationDuration: '4s' }} />
                  <span>Streaming latest Earth photography from DSCOVR L1...</span>
                </div>
              ) : (
                <>
                  <img
                    src={currentImg.imageUrl}
                    alt="NASA EPIC True-Color Earth"
                    className="max-h-full max-w-full object-contain select-none transition-opacity duration-300 drop-shadow-[0_0_35px_rgba(56,189,248,0.2)]"
                    onError={(e) => {
                      // Fallback to thumbnail if high-res image has transient network glitch
                      (e.target as HTMLImageElement).src = currentImg.thumbUrl;
                    }}
                  />

                  {/* OVERLAY BADGE */}
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>{currentImg.date} UTC</span>
                  </div>

                  {/* OVERLAY REGION */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>
                      {getRegionName(currentImg.centroidLat, currentImg.centroidLon)} ({currentImg.centroidLat >= 0 ? '+' : ''}{currentImg.centroidLat}°, {currentImg.centroidLon >= 0 ? '+' : ''}{currentImg.centroidLon}°)
                    </span>
                  </div>

                  {/* FRAME COUNTER */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400">
                    FRAME {currentIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* TIMELAPSE CONTROLS STRIP */}
            <div className="flex items-center justify-between gap-3 mt-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-bold ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause Rotation' : 'Play Earth Rotation'}</span>
                </button>

                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Previous frame"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Next frame"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* TIMELINE SCRUBBER SLIDER */}
              <div className="flex-1 max-w-xs flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, images.length - 1)}
                  value={currentIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentIndex(parseInt(e.target.value, 10));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <span className="text-[11px] text-slate-400">
                {currentImg ? currentImg.date.split(' ')[1] : ''} UTC
              </span>
            </div>

            {/* THUMBNAIL CAROUSEL */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar">
              {images.map((img, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={img.identifier}
                    onClick={() => {
                      sound.playClick();
                      setIsPlaying(false);
                      setCurrentIndex(idx);
                    }}
                    className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-cyan-400 scale-105 shadow-lg'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={img.thumbUrl}
                      alt={`Frame ${idx + 1}`}
                      className="w-full h-full object-cover bg-black"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-center text-slate-300 truncate">
                      {img.date.split(' ')[1]?.slice(0, 5)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: SCIENTIFIC TELEMETRY & ABOUT DSCOVR */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/40 p-4 space-y-4 overflow-y-auto custom-scrollbar shrink-0">
            {/* SPACECRAFT TELEMETRY CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>DSCOVR Flight Telemetry</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500">OBSERVER DISTANCE</span>
                  <span className="text-cyan-300 font-bold">
                    {currentImg?.dscovrDistanceKm.toLocaleString() || '1,565,000'} km
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500">ORBIT LOCATION</span>
                  <span className="text-slate-200 font-bold">Sun-Earth L1 Halo</span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500">DISTANCE TO SUN</span>
                  <span className="text-amber-300 font-bold">
                    {currentImg ? (currentImg.sunDistanceKm / 149597870.7).toFixed(3) : '0.995'} AU
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500">CENTROID LAT / LON</span>
                  <span className="text-emerald-300 font-bold">
                    {currentImg ? `${currentImg.centroidLat}°, ${currentImg.centroidLon}°` : '0°, 0°'}
                  </span>
                </div>
              </div>
            </div>

            {/* ABOUT NASA EPIC CARD */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About NASA EPIC &amp; DSCOVR</span>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                The <strong>Earth Polychromatic Imaging Camera (EPIC)</strong> is a 10-channel spectroradiometer aboard NOAA&apos;s DSCOVR satellite, orbiting approximately 1 million miles toward the Sun at Lagrange Point 1.
              </p>

              <p className="text-slate-400 leading-relaxed font-sans text-xs">
                It captures true-color images of the fully illuminated sunlit face of Earth as it rotates, providing continuous tracking of aerosol plumes, ozone distribution, cloud height, and global vegetation.
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">NASA Goddard Space Flight Center</span>
                <a
                  href="https://epic.gsfc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
