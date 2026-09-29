import React from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Volume2, MapPin, ShieldAlert, Sparkles, Sun, Moon, Type, Play } from 'lucide-react';

export function Navbar({ onOpenVoice, currentView, setCurrentView }) {
  const { user, location, voiceStatus, preferences, updatePreferences, memorySource } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1"
            aria-label="MemoNav AI Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MemoNav</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Remember. Learn. Guide Better.</p>
            </div>
          </button>

          {/* Hackathon Demo Highlight Button */}
          <button
            onClick={() => setCurrentView('demo')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
            aria-label="Start Hackathon Before vs After Demo"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Before vs After Demo</span>
          </button>
        </div>

        {/* Status Indicators & Accessibility Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Memory Source Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
            title={`Memory Engine: ${memorySource}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-slate-400">Memory:</span>
            <span className="text-emerald-300 font-semibold">{memorySource}</span>
          </div>

          {/* GPS Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-800/80 border border-slate-700/80"
            title={location.isLive ? `Live GPS (±${location.accuracy}m)` : (location.error || 'Simulated Location')}
            aria-label={location.isLive ? 'GPS Active' : 'GPS Offline'}
          >
            <MapPin className={`w-3.5 h-3.5 ${location.isLive ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline text-slate-300 text-[11px]">
              {location.isLive ? 'GPS Live' : 'GPS Mode'}
            </span>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
            className={`p-2 rounded-lg border transition-colors ${
              preferences.highContrast
                ? 'bg-amber-400 text-black border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            aria-label={preferences.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            title="Toggle High Contrast"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Large Text Toggle */}
          <button
            onClick={() => updatePreferences({ largeText: !preferences.largeText })}
            className={`p-2 rounded-lg border transition-colors ${
              preferences.largeText
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            aria-label={preferences.largeText ? 'Disable large text' : 'Enable large text'}
            title="Toggle Large Typography"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Emergency Shortcut */}
          <button
            onClick={() => setCurrentView('emergency')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600 hover:text-white transition-all text-xs font-bold"
            aria-label="Activate Emergency Safety Protocol"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Large Voice Action Button */}
          <button
            onClick={onOpenVoice}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-lg transition-all ${
              voiceStatus.isListening
                ? 'bg-red-600 animate-pulse shadow-red-500/40'
                : voiceStatus.isSpeaking
                ? 'bg-indigo-600 shadow-indigo-500/40'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
            }`}
            aria-label="Start Voice Assistant"
          >
            {voiceStatus.isSpeaking ? (
              <Volume2 className="w-4 h-4 animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            <span className="hidden xs:inline">
              {voiceStatus.isListening ? 'Listening...' : voiceStatus.isSpeaking ? 'Speaking...' : 'Voice AI'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
