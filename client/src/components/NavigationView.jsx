import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Api } from '../utils/api';
import L from 'leaflet';
import {
  Navigation,
  Compass,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  Sparkles,
  ShieldAlert,
  X,
  Save,
  Search
} from 'lucide-react';

export function NavigationView({ onOpenVoice }) {
  const { location, speak, stopSpeaking, preferences, requestLiveLocation } = useApp();

  const [destinationInput, setDestinationInput] = useState('City Hospital');
  const [route, setRoute] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isDarkMap, setIsDarkMap] = useState(false);
  const [memories, setMemories] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    type: 'difficult_crossing',
    severity: 'medium'
  });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const memoryMarkersLayerRef = useRef(null);

  // Pre-configured preset demo routes
  const presetRoutes = [
    { name: 'City Hospital (Hazard Demo)', dest: 'City Hospital', lat: 17.3910, lon: 78.4920 },
    { name: 'Central Metro Station', dest: 'Central Metro Station', lat: 17.3880, lon: 78.4830 },
    { name: 'Greenwood Park', dest: 'Greenwood Park', lat: 17.3820, lon: 78.4940 },
  ];

  // Fetch initial route and memories on mount
  useEffect(() => {
    loadRoute(destinationInput);
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const res = await Api.getMemories();
      if (res && res.memories) {
        setMemories(res.memories);
      }
    } catch (e) {
      console.warn('Could not load memories:', e);
    }
  };

  const handleToggleLiveGPS = async () => {
    setIsPlaying(false);
    if (!isLiveMode) {
      setIsLiveMode(true);
      if (requestLiveLocation) {
        await requestLiveLocation();
      }
      speak('Acquiring live GPS location. Tracking your real position.', { cue: 'step_ding' });
      // Center and recalculate route from real location
      if (location.lat && location.lon) {
        loadRoute(destinationInput, location.lat, location.lon);
      }
    } else {
      setIsLiveMode(false);
      speak('Switched back to simulated demo route.', { cue: 'step_ding' });
      loadRoute(destinationInput);
    }
  };

  const loadRoute = async (destName, customStartLat, customStartLon) => {
    setLoadingRoute(true);
    setIsPlaying(false);
    try {
      const preset = presetRoutes.find(p => p.dest.toLowerCase() === destName.toLowerCase());
      const payload = {
        destination: destName,
        currentLat: customStartLat || (isLiveMode ? location.lat : 17.3850),
        currentLon: customStartLon || (isLiveMode ? location.lon : 78.4867),
        destLat: preset ? preset.lat : 17.3910,
        destLon: preset ? preset.lon : 78.4920
      };

      const res = await Api.getRoute(payload);
      if (res && res.route) {
        setRoute(res.route);
        setCurrentStepIndex(0);
        speakRouteAnnouncement(res.route, 0);
      }
    } catch (err) {
      console.error('Failed to plan route:', err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const speakRouteAnnouncement = (routeData, stepIdx) => {
    if (!routeData || !routeData.steps || !routeData.steps[stepIdx]) return;
    const currentStep = routeData.steps[stepIdx];

    if (currentStep.memoryAlert) {
      // Memory warning gets top priority
      speak(
        `Memory Warning. ${currentStep.memoryAlert}. Instruction: ${currentStep.voiceInstruction}`,
        { cue: 'memory_alert', isMemoryAlert: true }
      );
    } else {
      speak(currentStep.voiceInstruction, { cue: 'step_ding' });
    }
  };

  // Step change trigger
  const handleStepChange = (newIndex) => {
    if (!route || !route.steps) return;
    if (newIndex < 0 || newIndex >= route.steps.length) return;
    setCurrentStepIndex(newIndex);
    speakRouteAnnouncement(route, newIndex);
  };

  // Auto-play simulation effect
  useEffect(() => {
    let interval = null;
    if (isPlaying && route && route.steps) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= route.steps.length - 1) {
            setIsPlaying(false);
            speak(`You have reached your destination: ${route.destination}`, { cue: 'destination_reached' });
            return prev;
          }
          const nextIdx = prev + 1;
          speakRouteAnnouncement(route, nextIdx);
          return nextIdx;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, route]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = route?.origin?.lat || location.lat || 17.3850;
      const initialLon = route?.origin?.lon || location.lon || 78.4867;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([initialLat, initialLon], 16);

      // 100% Free OpenStreetMap tile layer (No API key, watermarks, or subscription required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      memoryMarkersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Plot Route polyline
    if (route && route.steps) {
      const latlngs = [
        [route.origin.lat, route.origin.lon],
        ...route.steps.map(s => [s.lat, s.lon])
      ];

      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      routePolylineRef.current = L.polyline(latlngs, {
        color: '#3b82f6',
        weight: 6,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);

      // Add Start Marker
      L.circleMarker([route.origin.lat, route.origin.lon], {
        radius: 8,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).bindPopup("<b>Starting Point</b><br />Home").addTo(map);

      // Add Destination Marker
      L.circleMarker([route.destinationCoords.lat, route.destinationCoords.lon], {
        radius: 9,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }).bindPopup(`<b>Destination</b><br />${route.destination}`).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
    }

    // Render Memory pins on map
    if (memoryMarkersLayerRef.current && memories.length > 0) {
      memoryMarkersLayerRef.current.clearLayers();

      memories.forEach(mem => {
        if (!mem.latitude || !mem.longitude) return;

        const isHazard = mem.type === 'difficult_crossing' || mem.type === 'obstacle' || mem.severity === 'high';
        const color = isHazard ? '#f59e0b' : '#38bdf8';

        const marker = L.circleMarker([mem.latitude, mem.longitude], {
          radius: 10,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.9
        }).bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif;">
            <strong style="color: ${color};">⚠️ MemoNav Memory:</strong><br />
            <strong>${mem.title}</strong><br />
            <p style="margin: 4px 0; font-size: 12px;">${mem.description}</p>
            <span style="font-size: 10px; color: #64748b;">Severity: ${mem.severity || 'medium'}</span>
          </div>
        `);

        marker.addTo(memoryMarkersLayerRef.current);
      });
    }
  }, [route, memories]);

  // Update current user location pin as step advances or as live GPS changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const lat = isLiveMode ? location.lat : (route?.steps?.[currentStepIndex]?.lat || location.lat);
    const lon = isLiveMode ? location.lon : (route?.steps?.[currentStepIndex]?.lon || location.lon);

    if (!lat || !lon) return;

    const fillColor = isLiveMode ? '#10b981' : '#6366f1';
    const popupText = isLiveMode
      ? `<b>Live GPS Location</b><br />Lat: ${location.lat.toFixed(5)}<br />Lon: ${location.lon.toFixed(5)}<br />Accuracy: ±${location.accuracy}m`
      : `<b>Step ${currentStepIndex + 1} Position</b><br />Simulated Route`;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.circleMarker([lat, lon], {
        radius: 13,
        fillColor,
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1
      }).bindPopup(popupText).addTo(map);
    } else {
      userMarkerRef.current.setLatLng([lat, lon]);
      userMarkerRef.current.setStyle({ fillColor });
      userMarkerRef.current.setPopupContent(popupText);
    }

    map.panTo([lat, lon], { animate: true, duration: 0.8 });
  }, [currentStepIndex, route, isLiveMode, location.lat, location.lon]);

  // Handle reporting a problem / hazard memory at current location
  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.description) return;

    setReportSubmitting(true);
    try {
      const activeStep = route?.steps?.[currentStepIndex];
      const payload = {
        title: reportForm.title,
        description: reportForm.description,
        type: reportForm.type,
        severity: reportForm.severity,
        latitude: activeStep ? activeStep.lat : location.lat,
        longitude: activeStep ? activeStep.lon : location.lon,
        audioNote: reportForm.description
      };

      await Api.createMemory(payload);
      setReportSuccess(true);
      speak(`Memory recorded: ${reportForm.title}. MemoNav AI will remember this location and warn you in the future.`, { cue: 'memory_alert' });

      // Refresh memories
      await loadMemories();
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportForm({
          title: '',
          description: '',
          type: 'difficult_crossing',
          severity: 'medium'
        });
      }, 1500);
    } catch (err) {
      console.error('Failed to create memory:', err);
    } finally {
      setReportSubmitting(false);
    }
  };

  const currentStep = route?.steps?.[currentStepIndex];

  // Helper for step icons
  const getStepIcon = (action) => {
    switch (action) {
      case 'left': return <CornerUpLeft className="w-8 h-8 text-blue-400" />;
      case 'right': return <CornerUpRight className="w-8 h-8 text-blue-400" />;
      case 'crossing': return <AlertTriangle className="w-8 h-8 text-amber-400" />;
      case 'arrive': return <Flag className="w-8 h-8 text-emerald-400" />;
      default: return <ArrowUp className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Route Selector and Preset Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          {/* Live GPS Track Button */}
          <button
            onClick={handleToggleLiveGPS}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isLiveMode
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30'
            }`}
            title="Toggle between real GPS coordinates and simulated demo"
            aria-label="Track real live GPS location"
          >
            <MapPin className={`w-3.5 h-3.5 ${isLiveMode ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
            <span>{isLiveMode ? 'Live GPS Active' : 'Track My Real Location'}</span>
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mx-1">Presets:</span>
          {presetRoutes.map((p) => (
            <button
              key={p.dest}
              onClick={() => {
                setDestinationInput(p.dest);
                loadRoute(p.dest);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                destinationInput === p.dest
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Custom search form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadRoute(destinationInput);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Search destination..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loadingRoute}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <Search className="w-4 h-4" />
            <span>Plan</span>
          </button>
        </form>
      </div>

      {/* Main Navigation HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Step-by-Step Guidance & Proactive Memory Alert (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Proactive Memory Warning Callout (The Hackathon Showcase) */}
          {currentStep?.memoryAlert && (
            <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/80 shadow-xl shadow-amber-500/10 animate-pulse space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>PROACTIVE MEMORY ALERT</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  RECALLED FROM PAST TRIP
                </span>
              </div>
              <p className="text-white text-sm font-semibold leading-relaxed">
                "{currentStep.memoryAlert}"
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-amber-300/80">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>MemoNav AI saved this memory at this exact coordinate on your previous journey.</span>
              </div>
            </div>
          )}

          {/* Turn-by-Turn Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {route?.steps?.length || 4}
                </span>
                {route && (
                  <span className="text-xs text-slate-400 font-medium">
                    • {route.totalDistanceMeters}m total ({route.estimatedMinutes} min)
                  </span>
                )}
              </div>
              <button
                onClick={() => speakRouteAnnouncement(route, currentStepIndex)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Repeat voice instruction"
                aria-label="Repeat voice instruction"
              >
                <Volume2 className="w-4 h-4 text-blue-400" />
              </button>
            </div>

            {/* Huge Action Display for Blind/Low Vision Users */}
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                {getStepIcon(currentStep?.action)}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {currentStep?.instruction || 'Calculating route...'}
                </h2>
                <p className="text-sm text-slate-400">
                  Distance: <strong className="text-slate-200">{currentStep?.distanceMeters || 60} meters</strong>
                </p>
              </div>
            </div>

            {/* Stepper & Simulation Controls */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleStepChange(currentStepIndex - 1)}
                  disabled={currentStepIndex === 0}
                  className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm text-slate-200 transition-colors"
                  aria-label="Previous step"
                >
                  Previous
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                  }`}
                  aria-label={isPlaying ? 'Pause walking simulation' : 'Auto walk simulation'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause Auto' : 'Auto Walk'}</span>
                </button>

                <button
                  onClick={() => handleStepChange(currentStepIndex + 1)}
                  disabled={!route?.steps || currentStepIndex >= route.steps.length - 1}
                  className="flex-1 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm text-white shadow-md shadow-blue-600/25 transition-colors"
                  aria-label="Next step"
                >
                  Next Step
                </button>
              </div>

              {/* Reset simulation */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(0);
                    speakRouteAnnouncement(route, 0);
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Journey from Beginning</span>
                </button>

                <span>Speed: Normal Walk</span>
              </div>
            </div>

            {/* Quick Action: Report Problem at this coordinate */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs sm:text-sm transition-all"
                aria-label="Report hazard or log memory at current location"
              >
                <Plus className="w-4 h-4" />
                <span>Report Difficulty / Save Memory Here</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Leaflet Map (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[450px] sm:h-[520px]">
            {/* Map Element */}
            <div
              ref={mapContainerRef}
              className={`w-full h-full z-0 ${isDarkMap ? 'leaflet-dark-tiles' : ''}`}
            />

            {/* Floating Map Legend */}
            <div className="absolute top-4 left-4 z-10 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl space-y-1.5 text-[11px]">
              <div className="font-bold text-slate-200">Map Legend</div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-indigo-500 border border-white"></span>
                <span>Current Location</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
                <span>Learned Hazard Memory</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
                <span>Destination</span>
              </div>

              {/* Toggle Dark vs Street Map */}
              <button
                onClick={() => setIsDarkMap(!isDarkMap)}
                className="mt-2 w-full py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors block text-center"
              >
                {isDarkMap ? '☀️ Street View Map' : '🌙 High-Contrast Dark Map'}
              </button>
            </div>

            {/* Floating Voice Assistant Trigger */}
            <button
              onClick={onOpenVoice}
              className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:border-blue-500 text-white text-xs font-semibold shadow-xl transition-all"
              aria-label="Ask MemoNav AI by voice"
            >
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>Voice Guidance Active</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Report Memory / Hazard */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Save Location Memory</span>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Record a hazard, crowded crossing, or personal note. MemoNav AI will remember this exact spot and guide you safely next time.
            </p>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold">Memory Learned & Stored!</p>
                <p className="text-xs text-emerald-400">MemoNav AI will proactively alert you here.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveMemory} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Title / Brief Name</label>
                  <input
                    type="text"
                    required
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    placeholder="e.g., Broken curb ramp / Heavy crowd"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Memory Type</label>
                  <select
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="difficult_crossing">Difficult Crossing</option>
                    <option value="obstacle">Obstacle / Construction</option>
                    <option value="preference">Personal Preference</option>
                    <option value="landmark">Audio Landmark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setReportForm({ ...reportForm, severity: sev })}
                        className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                          reportForm.severity === sev
                            ? sev === 'high' ? 'bg-red-600 text-white' : sev === 'medium' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Voice / Spoken Warning Note</label>
                  <textarea
                    rows={2}
                    required
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    placeholder="e.g., Crossing here is difficult because cars do not yield and there is construction on the right."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>{reportSubmitting ? 'Saving Memory...' : 'Remember This Spot'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
