import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Compass,
  Thermometer,
  RotateCcw,
} from 'lucide-react';
import type { GuidedTour, CelestialBody } from '../../types/solar';
import { GUIDED_TOURS } from '../../data/tours';
import { sound } from '../../services/sound';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodies: CelestialBody[];
  onFocusBody: (body: CelestialBody) => void;
}

const STEP_DURATION_SEC = 14;

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  bodies,
  onFocusBody,
}) => {
  const [selectedTour, setSelectedTour] = useState<GuidedTour>(GUIDED_TOURS[0]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(STEP_DURATION_SEC);
  const [isNarrationAudio, setIsNarrationAudio] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speak narration when step changes if audio narration is on
  const speakCurrentStep = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!isNarrationAudio) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop audio on close or unmount
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsAutoPlaying(false);
    }
  }, [isOpen]);

  // Handle focus body & speech whenever step changes
  useEffect(() => {
    if (!isOpen) return;
    const currentStep = selectedTour.steps[stepIndex];
    if (!currentStep) return;

    const target = bodies.find((b) => b.id === currentStep.targetId);
    if (target) {
      onFocusBody(target);
    }

    speakCurrentStep(currentStep.narration);
    setTimeRemaining(STEP_DURATION_SEC);
  }, [stepIndex, selectedTour, isOpen]);

  // Auto-advance timer
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next step
          if (stepIndex < selectedTour.steps.length - 1) {
            setStepIndex((s) => s + 1);
          } else {
            // Tour finished
            setIsAutoPlaying(false);
          }
          return STEP_DURATION_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isAutoPlaying, stepIndex, selectedTour.steps.length]);

  if (!isOpen) return null;

  const currentStep = selectedTour.steps[stepIndex];
  const targetBody = bodies.find((b) => b.id === currentStep?.targetId);

  const handleNext = () => {
    sound.playClick();
    if (stepIndex < selectedTour.steps.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      sound.playSelect();
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    }
  };

  const handleSelectTour = (tour: GuidedTour) => {
    sound.playClick();
    setSelectedTour(tour);
    setStepIndex(0);
    setIsAutoPlaying(false);
  };

  const toggleAutoPlay = () => {
    sound.playClick();
    setIsAutoPlaying((prev) => !prev);
  };

  const toggleNarrationAudio = () => {
    sound.playClick();
    const next = !isNarrationAudio;
    setIsNarrationAudio(next);
    if (next && currentStep) {
      speakCurrentStep(currentStep.narration);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const restartTour = () => {
    sound.playClick();
    setStepIndex(0);
    setTimeRemaining(STEP_DURATION_SEC);
  };

  // ----------------------------------------------------
  // MINIMIZED DOCKED HUD PLAYER
  // ----------------------------------------------------
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-auto animate-fade-in">
        <div className="bg-slate-900/95 border border-indigo-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-lg"
              style={{ backgroundColor: targetBody?.color || '#6366f1' }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                  {selectedTour.title} · {stepIndex + 1}/{selectedTour.steps.length}
                </span>
                {isAutoPlaying && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    {timeRemaining}s
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-100 truncate">
                {currentStep?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleAutoPlay}
              className={`p-1.5 rounded-xl transition-colors ${
                isAutoPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isAutoPlaying ? 'Pause tour' : 'Auto-play tour'}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Expand tour modal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              title="Close tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL EXPANDED TOUR MODAL
  // ----------------------------------------------------
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto animate-fade-in"
    >
      <div className="w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950 border border-indigo-700/60 text-indigo-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide font-mono uppercase">
                  Guided Astronomical Expeditions
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  PRD N-07
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Narrated multi-stop journeys with automated 3D cinematic camera choreography
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleNarrationAudio}
              className={`p-2 rounded-xl transition-colors ${
                isNarrationAudio
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isNarrationAudio ? 'Voice Narration: Enabled' : 'Voice Narration: Disabled'}
            >
              {isNarrationAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Minimize to floating HUD"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TOUR CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 custom-scrollbar">
          {GUIDED_TOURS.map((t) => {
            const isSelected = selectedTour.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTour(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {t.title}
              </button>
            );
          })}
        </div>

        {/* ACTIVE TOUR SUBTITLE */}
        <div className="px-1 text-xs text-indigo-300 font-mono flex items-center justify-between shrink-0">
          <span>{selectedTour.subtitle}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {selectedTour.steps.length} STOPS · ~{selectedTour.durationMinutes} MIN
          </span>
        </div>

        {/* CURRENT STEP CARD (SCROLLABLE CONTENT) */}
        {currentStep && (
          <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 custom-scrollbar min-h-0">
            {/* STOP TITLE & TARGET COLOR */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  STOP {stepIndex + 1} OF {selectedTour.steps.length}
                </span>
                <span className="text-sm font-bold text-slate-100">{currentStep.title}</span>
              </div>
              {targetBody && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {targetBody.name}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-lg"
                    style={{ backgroundColor: targetBody.color }}
                  />
                </div>
              )}
            </div>

            {/* TARGET ASTRONOMICAL TELEMETRY STRIP */}
            {targetBody && (
              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-500">DIST:</span>
                  <span className="font-semibold text-slate-200">
                    {targetBody.orbit.semiMajorAxisAU > 0
                      ? `${targetBody.orbit.semiMajorAxisAU} AU`
                      : 'Orbiting Earth'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-500">TEMP:</span>
                  <span className="font-semibold text-slate-200">
                    {targetBody.physical.meanTempC != null
                      ? `${targetBody.physical.meanTempC}°C`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500">DIAM:</span>
                  <span className="font-semibold text-slate-200">
                    {targetBody.physical.meanRadiusKm
                      ? `${Math.round(targetBody.physical.meanRadiusKm * 2).toLocaleString()} km`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* NARRATION PARAGRAPH */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-850">
              {currentStep.narration}
            </p>

            {/* STEP HIGHLIGHTS */}
            {currentStep.highlights && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Scientific Highlights &amp; Discovery Facts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentStep.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 text-[11px] text-slate-300 font-mono p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60"
                    >
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER & PROGRESS CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 shrink-0">
          {/* STEP INDICATORS */}
          <div className="flex items-center gap-1">
            {selectedTour.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  sound.playClick();
                  setStepIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-6 bg-indigo-500'
                    : i < stepIndex
                    ? 'w-2 bg-indigo-900 hover:bg-indigo-700'
                    : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Jump to stop ${i + 1}`}
              />
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            {/* RESTART */}
            <button
              onClick={restartTour}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Restart Tour from Stop 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* AUTO-PLAY TOGGLE */}
            <button
              onClick={toggleAutoPlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                isAutoPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isAutoPlaying ? `Auto (${timeRemaining}s)` : 'Auto-Play'}</span>
            </button>

            {/* PREVIOUS */}
            <button
              onClick={handlePrev}
              disabled={stepIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-300 text-xs font-medium transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* NEXT / FINISH */}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>{stepIndex === selectedTour.steps.length - 1 ? 'Finish Tour' : 'Next Stop'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
