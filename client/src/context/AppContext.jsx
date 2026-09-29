import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Api, getAuthToken, setAuthToken } from '../utils/api';
import { speakText, stopSpeaking, playAudioCue } from '../utils/speech';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Authentication & User State
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getAuthToken());
  const [authLoading, setAuthLoading] = useState(true);

  // User Preferences
  const [preferences, setPreferences] = useState({
    language: 'English',
    voiceSpeed: 'normal',
    instructionStyle: 'short',
    voiceVolume: 1.0,
    enableMemory: true,
    highContrast: false,
    largeText: false,
    reducedAnimation: false,
    vibrationFeedback: true
  });

  // Location State (Real GPS or Sim/Demo)
  const [location, setLocation] = useState({
    lat: 17.3850,
    lon: 78.4867,
    accuracy: 15,
    isLive: false,
    error: null
  });

  // Memory source indicator (Hindsight vs Local Memory)
  const [memorySource, setMemorySource] = useState('Local Memory');

  // Navigation State
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeJourney, setActiveJourney] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Voice Assistant State
  const [voiceStatus, setVoiceStatus] = useState({
    isListening: false,
    isSpeaking: false,
    lastSpokenText: '',
    transcriptHistory: [
      {
        sender: 'assistant',
        text: 'MemoNav AI initialized. Ready to remember your journeys and guide you.',
        timestamp: new Date()
      }
    ]
  });

  // Helper to trigger voice speech adhering to preferences
  const speak = useCallback((text, customOptions = {}) => {
    if (!preferences.enableMemory && customOptions.isMemoryAlert) {
      return; // Memory alerts muted if disabled
    }

    setVoiceStatus(prev => ({
      ...prev,
      isSpeaking: true,
      lastSpokenText: text
    }));

    if (customOptions.cue) {
      playAudioCue(customOptions.cue);
    }

    speakText(text, {
      speed: customOptions.speed || preferences.voiceSpeed,
      volume: customOptions.volume || preferences.voiceVolume,
      language: customOptions.language || preferences.language,
      onEnd: () => {
        setVoiceStatus(prev => ({ ...prev, isSpeaking: false }));
        if (customOptions.onEnd) customOptions.onEnd();
      },
      onError: () => {
        setVoiceStatus(prev => ({ ...prev, isSpeaking: false }));
      }
    });
  }, [preferences]);

  // Load user profile on mount
  useEffect(() => {
    async function initUser() {
      try {
        const res = await Api.getMe();
        if (res && res.user) {
          setUser(res.user);
          if (res.preferences) {
            setPreferences(prev => ({ ...prev, ...res.preferences }));
          }
        }
      } catch (err) {
        // Fallback to default demo user profile
        setUser({
          id: 'demo_user_123',
          name: 'Demo Vision User',
          email: 'demo@memonav.ai',
          preferredLanguage: 'English',
          accessibilityPreference: 'voice_first'
        });
      } finally {
        setAuthLoading(false);
      }
    }

    // Check memory source
    Api.getMemorySource()
      .then(res => {
        if (res && res.activeSource) setMemorySource(res.activeSource);
      })
      .catch(() => {});

    initUser();
  }, [token]);

  // Request and watch Real Browser Geolocation with IP fallback
  const requestLiveLocation = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            isLive: true,
            error: null
          };
          setLocation(newLoc);
          playAudioCue('success');
        },
        async (err) => {
          console.warn('[Geolocation] Browser GPS notice:', err.message, 'Trying IP geolocation fallback...');
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              setLocation({
                lat: ipData.latitude,
                lon: ipData.longitude,
                accuracy: 500,
                isLive: true,
                cityName: ipData.city || ipData.region,
                error: null
              });
              playAudioCue('success');
              return;
            }
          } catch (ipErr) {
            console.warn('[IP Location] Fallback error:', ipErr);
          }
          setLocation(prev => ({
            ...prev,
            isLive: false,
            error: err.message
          }));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }, []);

  // Initialize Real Browser Geolocation on load
  useEffect(() => {
    requestLiveLocation();

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            isLive: true,
            error: null
          });
        },
        (err) => {
          console.warn('[Geolocation Watch] Notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [requestLiveLocation]);

  // Update user preferences locally and on backend
  const updatePreferencesHandler = async (newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    try {
      await Api.updatePreferences(newPrefs);
      playAudioCue('success');
    } catch (e) {
      console.warn('Preferences backend sync notice:', e);
    }
  };

  // Login handler
  const login = async (email, password) => {
    const res = await Api.login({ email, password });
    if (res.token) {
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      speak(`Welcome back, ${res.user.name}. MemoNav AI is ready.`);
    }
    return res;
  };

  // Register handler
  const register = async (formData) => {
    const res = await Api.register(formData);
    if (res.token) {
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      speak(`Account created. Welcome to MemoNav AI, ${res.user.name}.`);
    }
    return res;
  };

  // Logout handler
  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    speak('Logged out. Goodbye.');
  };

  // Centralized AI Voice Command Processor
  const sendVoiceCommand = async (commandText) => {
    if (!commandText || !commandText.trim()) return null;

    // Add user question to transcript
    setVoiceStatus(prev => ({
      ...prev,
      transcriptHistory: [
        ...prev.transcriptHistory,
        { sender: 'user', text: commandText, timestamp: new Date() }
      ]
    }));

    try {
      const res = await Api.sendAiCommand({
        text: commandText,
        location: { lat: location.lat, lon: location.lon },
        activeJourneyId: activeJourney?._id || activeJourney?.id
      });

      // Add assistant response to transcript
      setVoiceStatus(prev => ({
        ...prev,
        transcriptHistory: [
          ...prev.transcriptHistory,
          {
            sender: 'assistant',
            text: res.spokenResponse,
            actionType: res.actionType,
            toolCalls: res.toolCalls,
            timestamp: new Date()
          }
        ]
      }));

      // Speak response aloud
      speak(res.spokenResponse, {
        cue: res.actionType === 'emergency' ? 'emergency' : (res.actionType === 'memory_saved' ? 'memory_alert' : 'success')
      });

      // Update state if navigation started
      if (res.actionType === 'start_navigation' && res.payload?.route) {
        setActiveRoute(res.payload.route);
        setCurrentStepIndex(0);
      } else if (res.actionType === 'stop_navigation') {
        setActiveRoute(null);
        setActiveJourney(null);
      }

      return res;
    } catch (err) {
      const errorMsg = 'Could not process voice command. Please try again.';
      speak(errorMsg);
      setVoiceStatus(prev => ({
        ...prev,
        transcriptHistory: [
          ...prev.transcriptHistory,
          { sender: 'assistant', text: errorMsg, isError: true, timestamp: new Date() }
        ]
      }));
      return null;
    }
  };

  const value = {
    user,
    token,
    authLoading,
    login,
    register,
    logout,
    preferences,
    updatePreferences: updatePreferencesHandler,
    location,
    setLocation,
    requestLiveLocation,
    memorySource,
    activeRoute,
    setActiveRoute,
    activeJourney,
    setActiveJourney,
    currentStepIndex,
    setCurrentStepIndex,
    voiceStatus,
    setVoiceStatus,
    speak,
    stopSpeaking,
    sendVoiceCommand
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
