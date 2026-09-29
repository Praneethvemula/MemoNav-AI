import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  ShieldAlert, 
  ArrowRight, 
  Compass, 
  BrainCircuit, 
  History, 
  Layers, 
  HelpCircle,
  Clock,
  Eye
} from 'lucide-react';

export function BeforeAfterDemo({ onStartLiveNavigation }) {
  const { speak, stopSpeaking } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation' | 'comparison'

  const demoSteps = [
    {
      step: 1,
      title: "Step 1: Starting the Journey (Home to City Hospital)",
      location: "Elmwood Court, Starting Point",
      standardApp: {
        voice: "Head north for 400 meters.",
        display: "Head North 400m",
        memoryAwareness: "None (Zero Context)",
        safetyStatus: "Neutral",
        statusColor: "text-slate-400"
      },
      memoNav: {
        voice: "Starting journey to City Hospital. Total distance is 820 meters. You usually take 18 minutes on this route. Walk straight on Elmwood Court.",
        display: "Hospital Route • 820m • 18m pace",
        memoryAwareness: "Past Journey Recall #148 • Pace Adapted",
        safetyStatus: "Optimal",
        statusColor: "text-emerald-400",
        memoryInsight: "MemoNav recalled your average walking pace and previous safe route history."
      }
    },
    {
      step: 2,
      title: "Step 2: Approaching Main Hospital Road Intersection (CRITICAL)",
      location: "Main Hospital Road Crossing (80m Ahead)",
      isCritical: true,
      standardApp: {
        voice: "Turn left at the intersection in 80 meters.",
        display: "Turn Left in 80m",
        memoryAwareness: "Ignorant of Hazard",
        safetyStatus: "DANGEROUS: Blindly guides user into heavy crowd and unchecked vehicular traffic",
        statusColor: "text-red-400",
        failureNote: "Standard GPS has NO memory that yesterday the user was stranded in traffic here."
      },
      memoNav: {
        voice: "Caution: You previously had difficulty crossing Main Hospital Road because of heavy crowd. I recommend using the audible pedestrian signal 20 meters further right, or waiting for signal chime.",
        display: "PROACTIVE MEMORY ALERT: Crowded Crossing",
        memoryAwareness: "Episodic Memory Activated (Confidence 98%)",
        safetyStatus: "PROTECTED: Proactive warning 80m prior to danger point",
        statusColor: "text-amber-400",
        memoryInsight: "Recalled memory from yesterday: 'User reported difficulty crossing due to heavy crowd and rapid traffic.'"
      }
    },
    {
      step: 3,
      title: "Step 3: Arriving at City General Hospital",
      location: "Hospital Boulevard, West Entrance",
      standardApp: {
        voice: "You have arrived at your destination.",
        display: "Arrived at City General Hospital",
        memoryAwareness: "Stops at road curb",
        safetyStatus: "Incomplete",
        statusColor: "text-slate-400",
        failureNote: "Leaves visually impaired user standing near ambulance emergency entrance with no guidance to accessible door."
      },
      memoNav: {
        voice: "You have arrived at City Hospital. MemoNav memory: The accessible pedestrian ramp entrance is 15 meters on your left side past the emergency ambulance bay.",
        display: "Arrived • Accessible Ramp 15m on Left",
        memoryAwareness: "Micro-Location Knowledge Active",
        safetyStatus: "Seamless Door-to-Door Arrival",
        statusColor: "text-emerald-400",
        memoryInsight: "Memory #412 recalled: Main entrance pedestrian ramp is on the left side."
      }
    }
  ];

  const current = demoSteps[currentStep];

  const handlePlayVoice = (text, type = 'memonav') => {
    speak(text, { cue: type === 'memonav' ? (current.isCritical ? 'memory_alert' : 'success') : null });
  };

  const handleNextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-slate-900 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Hackathon Innovation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Before vs After: The Power of Navigation Memory
            </h1>
            <p className="mt-2 text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
              Standard GPS navigation systems treat every walk as their first. <strong className="text-blue-300">MemoNav AI</strong> learns from past difficulties, remembers dangerous road crossings, and provides proactive guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onStartLiveNavigation('City General Hospital')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Live Route</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'simulation'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side Matrix</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulation' ? (
        <div className="space-y-6">
          {/* Stepper Progress Indicator */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {demoSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                  currentStep === idx
                    ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    currentStep === idx ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Stage {s.step}
                  </span>
                  {s.isCritical && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      Hazard Test
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1">{s.title.split(':')[1] || s.title}</p>
              </button>
            ))}
          </div>

          {/* Side by Side Interactive Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Standard GPS Navigation (BEFORE) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-800 text-slate-400 rounded-bl-2xl text-xs font-semibold">
                BEFORE (Standard GPS)
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 text-base">Generic Navigation</h3>
                    <p className="text-xs text-slate-500">Google Maps / Apple Maps paradigm</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 mb-4">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                    Screen Display
                  </span>
                  <p className="text-lg font-bold text-slate-300 font-mono">{current.standardApp.display}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Spoken Voice Instruction
                    </span>
                    <button
                      onClick={() => handlePlayVoice(current.standardApp.voice, 'standard')}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Voice</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-300 italic">"{current.standardApp.voice}"</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Memory Intelligence:</span>
                    <span className="text-slate-400 font-medium">{current.standardApp.memoryAwareness}</span>
                  </div>
                  <div className="flex items-start justify-between py-1.5 border-b border-slate-800 gap-2">
                    <span className="text-slate-400">Safety Outcome:</span>
                    <span className={`font-semibold text-right ${current.standardApp.statusColor}`}>
                      {current.standardApp.safetyStatus}
                    </span>
                  </div>
                  {current.standardApp.failureNote && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs mt-2 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{current.standardApp.failureNote}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MemoNav AI (AFTER) */}
            <div className="bg-gradient-to-b from-blue-950/40 via-slate-900 to-indigo-950/30 border-2 border-blue-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-2xl shadow-blue-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-bl-2xl text-xs font-bold shadow-md">
                AFTER (MemoNav AI)
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/40">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">MemoNav Episodic AI</h3>
                    <p className="text-xs text-blue-300">Episodic memory + Proactive Hazard Alerts</p>
                  </div>
                </div>

                <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-500/40 mb-4">
                  <span className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold block mb-1">
                    Adaptive Guidance Display
                  </span>
                  <p className="text-lg font-bold text-white font-mono">{current.memoNav.display}</p>
                </div>

                <div className="bg-blue-950/60 p-4 rounded-2xl border border-blue-500/40 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
                      Proactive Audio Guidance
                    </span>
                    <button
                      onClick={() => handlePlayVoice(current.memoNav.voice, 'memonav')}
                      className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-lg font-semibold shadow-md transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear AI Voice</span>
                    </button>
                  </div>
                  <p className="text-sm text-blue-100 font-medium leading-relaxed italic">
                    "{current.memoNav.voice}"
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-300">Memory Intelligence:</span>
                    <span className="text-emerald-400 font-semibold">{current.memoNav.memoryAwareness}</span>
                  </div>
                  <div className="flex items-start justify-between py-1.5 border-b border-slate-800 gap-2">
                    <span className="text-slate-300">Safety Outcome:</span>
                    <span className={`font-semibold text-right ${current.memoNav.statusColor}`}>
                      {current.memoNav.safetyStatus}
                    </span>
                  </div>
                  {current.memoNav.memoryInsight && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs mt-2 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{current.memoNav.memoryInsight}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 text-sm font-semibold transition-colors"
            >
              Previous Stage
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Stage {currentStep + 1} of {demoSteps.length}
            </span>

            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>{currentStep === demoSteps.length - 1 ? 'Finish & Celebrate' : 'Next Stage'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Comparison Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Detailed Capability Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Feature / Scenario</th>
                  <th className="py-3 px-4 bg-slate-950/50">Standard Navigation (Google / Apple)</th>
                  <th className="py-3 px-4 bg-blue-950/30 text-blue-300">MemoNav AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Episodic User Memory</td>
                  <td className="py-4 px-4 bg-slate-950/50 text-red-400">❌ None (Zero recall across journeys)</td>
                  <td className="py-4 px-4 bg-blue-950/30 text-emerald-400 font-semibold">
                    ✅ Recalls user obstacles, pace & past difficulties
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Hazard Warnings</td>
                  <td className="py-4 px-4 bg-slate-950/50 text-slate-400">⚠️ Only heavy car traffic; blind to pedestrian danger</td>
                  <td className="py-4 px-4 bg-blue-950/30 text-emerald-400 font-semibold">
                    ✅ Proactive audio alert 80m before difficult crossings
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Voice Interaction</td>
                  <td className="py-4 px-4 bg-slate-950/50 text-slate-400">Rigid commands ("Navigate to X")</td>
                  <td className="py-4 px-4 bg-blue-950/30 text-emerald-400 font-semibold">
                    ✅ Natural speech: "Remember this crossing", "Where am I"
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Door-to-Door Precision</td>
                  <td className="py-4 px-4 bg-slate-950/50 text-slate-400">Stops at street curb / car entrance</td>
                  <td className="py-4 px-4 bg-blue-950/30 text-emerald-400 font-semibold">
                    ✅ Remembers exact ramps, tactile paving & doors
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Computer Vision & OCR</td>
                  <td className="py-4 px-4 bg-slate-950/50 text-slate-400">❌ Requires switching to separate apps</td>
                  <td className="py-4 px-4 bg-blue-950/30 text-emerald-400 font-semibold">
                    ✅ Built-in obstacle detection & text signboard reader
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Emergency Safety SOS</td>
                  <td className="py-4 px-4 bg-slate-950/50 text-slate-400">None built into active navigation</td>
                  <td className="py-4 px-4 bg-blue-950/30 text-emerald-400 font-semibold">
                    ✅ Instant 1-tap SOS + SMS dispatch with live GPS
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
