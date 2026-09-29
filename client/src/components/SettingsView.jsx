import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Api } from '../utils/api';
import {
  Settings,
  User,
  Volume2,
  Sun,
  Type,
  BrainCircuit,
  Sliders,
  ShieldCheck,
  LogOut,
  LogIn,
  RefreshCw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function SettingsView() {
  const { user, preferences, updatePreferences, speak, memorySource, logout, login, register } = useApp();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleTestVoice = () => {
    speak(
      `Hello! This is your MemoNav AI personal navigation assistant. Current speed is ${preferences.voiceSpeed}, and instruction style is ${preferences.instructionStyle}.`,
      { cue: 'success' }
    );
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
        setAuthSuccess('Successfully logged in!');
      } else {
        await register({ name: authName, email: authEmail, password: authPassword });
        setAuthSuccess('Account registered successfully!');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>MemoNav AI Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Preferences & Accessibility Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tailor voice guidance, high contrast visuals, and persistent memory learning to your exact accessibility needs.
        </p>
      </div>

      {/* Accessibility & Visual Settings */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          <span>Vision & Accessibility Accommodations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* High Contrast Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <span className="font-bold text-sm text-white block">High Contrast Mode</span>
              <p className="text-xs text-slate-400">Maximized contrast borders and high-visibility yellow highlights.</p>
            </div>
            <button
              onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
              className={`w-12 h-6 rounded-full transition-colors relative ${preferences.highContrast ? 'bg-amber-500' : 'bg-slate-700'}`}
              aria-label="Toggle high contrast mode"
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.highContrast ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Large Text Mode */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <span className="font-bold text-sm text-white block">Large Typography</span>
              <p className="text-xs text-slate-400">Scales font sizes and buttons for easy readability.</p>
            </div>
            <button
              onClick={() => updatePreferences({ largeText: !preferences.largeText })}
              className={`w-12 h-6 rounded-full transition-colors relative ${preferences.largeText ? 'bg-blue-600' : 'bg-slate-700'}`}
              aria-label="Toggle large text mode"
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.largeText ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Reduced Animation Mode */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <span className="font-bold text-sm text-white block">Reduced Motion</span>
              <p className="text-xs text-slate-400">Disables pulsing and sliding transitions for comfort.</p>
            </div>
            <button
              onClick={() => updatePreferences({ reducedAnimation: !preferences.reducedAnimation })}
              className={`w-12 h-6 rounded-full transition-colors relative ${preferences.reducedAnimation ? 'bg-blue-600' : 'bg-slate-700'}`}
              aria-label="Toggle reduced animation mode"
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.reducedAnimation ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {/* Haptic Vibration Feedback */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1 pr-2">
              <span className="font-bold text-sm text-white block">Vibration Cues</span>
              <p className="text-xs text-slate-400">Triggers device haptic pulse when near hazard memories.</p>
            </div>
            <button
              onClick={() => updatePreferences({ vibrationFeedback: !preferences.vibrationFeedback })}
              className={`w-12 h-6 rounded-full transition-colors relative ${preferences.vibrationFeedback ? 'bg-blue-600' : 'bg-slate-700'}`}
              aria-label="Toggle vibration feedback"
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.vibrationFeedback ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Assistant & Speech Settings */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <span>Voice & Audio Guidance</span>
          </h2>

          <button
            onClick={handleTestVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Voice</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Speech Speed */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Speaking Rate</label>
            <select
              value={preferences.voiceSpeed}
              onChange={(e) => updatePreferences({ voiceSpeed: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="slow">Slow & Clear (0.8x)</option>
              <option value="normal">Normal (1.0x)</option>
              <option value="fast">Fast (1.3x)</option>
            </select>
          </div>

          {/* Instruction Style */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Instruction Style</label>
            <select
              value={preferences.instructionStyle}
              onChange={(e) => updatePreferences({ instructionStyle: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="short">Short & Direct ("Turn Left")</option>
              <option value="detailed">Descriptive with Landmarks</option>
            </select>
          </div>

          {/* Voice Volume */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Volume</span>
              <span>{Math.round(preferences.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.1"
              value={preferences.voiceVolume}
              onChange={(e) => updatePreferences({ voiceVolume: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Memory Engine & Learning Controls */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Spatial Memory Engine</h2>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{memorySource}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          When enabled, MemoNav AI autonomously extracts navigation memories from user complaints (e.g. <em>"crossing here is dangerous"</em>) and alerts you before reaching that coordinate in future trips.
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-white block">Active Memory Learning</span>
            <span className="text-xs text-slate-400">Recall past hazards & adapt walking pace</span>
          </div>
          <button
            onClick={() => updatePreferences({ enableMemory: !preferences.enableMemory })}
            className={`w-12 h-6 rounded-full transition-colors relative ${preferences.enableMemory ? 'bg-emerald-600' : 'bg-slate-700'}`}
            aria-label="Toggle persistent memory engine"
          >
            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.enableMemory ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* User Profile & Demo Mode */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          <span>User Profile & Demo Account</span>
        </h2>

        {user && user.email ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-white text-base">{user.name}</span>
              <p className="text-xs text-slate-400">{user.email}</p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Logged In Profile
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-semibold transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                {authMode === 'login' ? 'Sign In to Sync Memories' : 'Create Blind Accessible Account'}
              </span>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-xs text-blue-400 hover:underline"
              >
                {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Sign In'}
              </button>
            </div>

            {authError && <div className="text-xs text-red-400 font-semibold">{authError}</div>}
            {authSuccess && <div className="text-xs text-emerald-400 font-semibold">{authSuccess}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Alex Taylor"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="demo@memonav.ai"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
