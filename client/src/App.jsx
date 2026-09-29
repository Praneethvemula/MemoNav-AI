import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { BeforeAfterDemo } from './components/BeforeAfterDemo';
import { LandingView } from './components/LandingView';
import { NavigationView } from './components/NavigationView';
import { VisionView } from './components/VisionView';
import { MemoriesView } from './components/MemoriesView';
import { JourneysView } from './components/JourneysView';
import { EmergencyView } from './components/EmergencyView';
import { SettingsView } from './components/SettingsView';
import {
  Navigation,
  Compass,
  Camera,
  BrainCircuit,
  History,
  ShieldAlert,
  Settings,
  Sparkles,
  Mic,
  Play,
  Home
} from 'lucide-react';

function MemoNavAppContent() {
  const { preferences, voiceStatus, setVoiceStatus } = useApp();
  const [currentView, setCurrentView] = useState('landing');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Navigation tabs configuration
  const navTabs = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'demo', label: 'Before vs After', icon: Play, highlight: true },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'vision', label: 'Vision & OCR', icon: Camera },
    { id: 'memories', label: 'Memories', icon: BrainCircuit },
    { id: 'journeys', label: 'Journeys', icon: History },
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert, danger: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors ${
        preferences.highContrast ? 'high-contrast' : ''
      } ${preferences.largeText ? 'large-text' : ''} ${
        preferences.reducedAnimation ? 'reduced-animation' : ''
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenVoice={() => setIsVoiceOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Desktop Sub-navigation Header Tabs */}
      <nav aria-label="Main Navigation Tabs" className="hidden md:block bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? tab.highlight
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : tab.danger
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : tab.highlight
                      ? 'text-amber-400 hover:bg-amber-500/10'
                      : tab.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 hidden xl:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Vision Accessibility Ready</span>
          </div>
        </div>
      </nav>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
        {currentView === 'landing' && (
          <LandingView
            onNavigateTab={setCurrentView}
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {currentView === 'demo' && (
          <BeforeAfterDemo
            onStartLiveNavigation={() => setCurrentView('navigation')}
          />
        )}

        {currentView === 'navigation' && (
          <NavigationView
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {currentView === 'vision' && (
          <VisionView
            onOpenVoice={() => setIsVoiceOpen(true)}
          />
        )}

        {currentView === 'memories' && (
          <MemoriesView
            onOpenVoice={() => setIsVoiceOpen(true)}
            onNavigateTab={setCurrentView}
          />
        )}

        {currentView === 'journeys' && (
          <JourneysView
            onNavigateTab={setCurrentView}
          />
        )}

        {currentView === 'emergency' && (
          <EmergencyView />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Accessible Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'landing', label: 'Home', icon: Home },
            { id: 'demo', label: 'Demo', icon: Play, highlight: true },
            { id: 'navigation', label: 'Navigate', icon: Navigation },
            { id: 'vision', label: 'Vision', icon: Camera },
            { id: 'memories', label: 'Memory', icon: BrainCircuit },
            { id: 'emergency', label: 'SOS', icon: ShieldAlert, danger: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-colors ${
                  isActive
                    ? tab.highlight
                      ? 'text-amber-400 font-bold'
                      : tab.danger
                      ? 'text-red-400 font-bold'
                      : 'text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label={tab.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Accessible Voice Trigger Button (Bottom Right) */}
      <div className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className={`flex items-center gap-2.5 p-3.5 sm:px-5 sm:py-3.5 rounded-full font-bold text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
            voiceStatus.isListening
              ? 'bg-red-600 animate-pulse shadow-red-600/50'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/40'
          }`}
          aria-label="Open Voice Assistant Modal"
        >
          <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline text-sm">Voice AI Assistant</span>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentView(tab);
          setIsVoiceOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MemoNavAppContent />
    </AppProvider>
  );
}
