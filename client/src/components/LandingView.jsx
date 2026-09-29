import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Navigation, 
  Camera, 
  BrainCircuit, 
  ShieldAlert, 
  Sparkles, 
  Volume2, 
  Mic, 
  Eye, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Sliders,
  ArrowRight
} from 'lucide-react';

export function LandingView({ onNavigateTab, onOpenVoice }) {
  const { preferences, memorySource, sendVoiceCommand } = useApp();

  const sampleVoicePrompts = [
    { text: "Navigate me to City Hospital", icon: Navigation, desc: "Recalls past hazards on route" },
    { text: "What hazards are nearby?", icon: AlertTriangle, desc: "Proximity memory scan" },
    { text: "Remember: sidewalk construction on Elmwood", icon: BrainCircuit, desc: "Stores spatial hazard" },
    { text: "Read the signboard in front of me", icon: Camera, desc: "Live OCR & scene detection" },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>AI-Powered Personal Navigation Agent for Vision Accessibility</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Remember the Journey.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Learn the User. Guide Better.
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Standard navigation apps treat every trip like the first time. <strong className="text-white">MemoNav AI</strong> continuously learns from your real-world walks—remembering broken curb ramps, dangerous crossings, and audio cues to proactively protect you.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('demo')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Launch Before vs After Demo comparison"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Before vs After Demo</span>
            </button>

            <button
              onClick={() => onNavigateTab('navigation')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Open Interactive Navigation"
            >
              <Navigation className="w-5 h-5" />
              <span>Interactive Navigation</span>
            </button>

            <button
              onClick={onOpenVoice}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base transition-all"
              aria-label="Open Voice Assistant dialog"
            >
              <Mic className="w-5 h-5 text-indigo-400" />
              <span>Talk to MemoNav AI</span>
            </button>
          </div>

          {/* Memory Source Pill */}
          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Memory Engine: <strong className="text-emerald-300">{memorySource}</strong></span>
            <span>•</span>
            <span>Blind & Low-Vision Accessible (WCAG AAA)</span>
          </div>
        </div>
      </section>

      {/* Voice Prompt Showcase */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <span>Try Saying or Clicking a Prompt</span>
          </h2>
          <span className="text-xs text-slate-400">Speech recognition active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sampleVoicePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onOpenVoice();
                sendVoiceCommand(prompt.text);
              }}
              className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 text-left transition-all flex flex-col justify-between gap-3 shadow-md"
              aria-label={`Ask MemoNav: ${prompt.text}`}
            >
              <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300">
                <prompt.icon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300">
                  {prompt.desc}
                </span>
              </div>
              <p className="text-sm font-medium text-white group-hover:text-blue-300">
                "{prompt.text}"
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-slate-300">
                <span>Run voice prompt</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span>Core Capabilities of MemoNav AI</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Persistent Spatial Memory */}
          <div 
            onClick={() => onNavigateTab('memories')}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300">
              Persistent Spatial Memory
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Records user-reported hazards, broken pedestrian crossings, steep curbs, and favorite safe routes, linking them to GPS coordinates forever.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 pt-1">
              <span>Explore Memory Brain</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: AI Vision & OCR */}
          <div 
            onClick={() => onNavigateTab('vision')}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300">
              Live Vision & Sign OCR
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Uses camera stream and on-device OCR to read bus boards, elevator out-of-order notices, store signs, and crosswalk countdown displays aloud.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 pt-1">
              <span>Launch OCR Scanner</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Adaptive Learning Journeys */}
          <div 
            onClick={() => onNavigateTab('journeys')}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300">
              Journey Timeline & Pace Learning
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Learns your personalized walking pace, adjusts ETA automatically, and keeps an audit log of hazards successfully averted across past trips.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 pt-1">
              <span>View Journey Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* The Core Concept Comparison (Hackathon highlight) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">The Problem & Solution</span>
            <h2 className="text-2xl font-bold text-white">Why MemoNav AI Changes Navigation</h2>
          </div>
          <button
            onClick={() => onNavigateTab('demo')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-colors"
          >
            <span>See Interactive Side-by-Side</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Navigation */}
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Traditional GPS (Google / Apple Maps)</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Zero memory of user's past walking difficulties or accidents.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Blindly routes pedestrians through dangerous unpaved crossings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Assumes generic sighted walking speeds and static directions.</span>
              </li>
            </ul>
          </div>

          {/* MemoNav AI */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>MemoNav AI (Memory-Powered Agent)</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Proactively warns before you reach known hazards: <em>"Caution: broken pavement ahead."</em></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Adapts route ETAs to your personal walking pace over time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Voice-first feedback, haptics, and instant emergency SOS dispatch.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
