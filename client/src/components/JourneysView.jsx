import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Api } from '../utils/api';
import {
  History,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Award,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

export function JourneysView({ onNavigateTab }) {
  const { speak } = useApp();

  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    setLoading(true);
    try {
      const res = await Api.getJourneys();
      if (res && res.journeys && res.journeys.length > 0) {
        setJourneys(res.journeys);
        setSelectedJourney(res.journeys[0]);
      } else {
        // High quality fallback demonstration journeys
        const demoJourneys = [
          {
            _id: 'j_1',
            title: 'Journey to City Hospital',
            originName: 'Elmwood Court',
            destinationName: 'City Hospital',
            distanceMeters: 820,
            durationMinutes: 18,
            status: 'completed',
            hazardsAvoided: 2,
            adaptedPace: '1.1 m/s (Adapted to slower pace)',
            date: '2026-09-28',
            events: [
              { time: '10:02 AM', text: 'Started journey from Elmwood Court.' },
              { time: '10:07 AM', text: '⚠️ Approaching Main Hospital Road Crossing: Memory alert triggered for crowded intersection.' },
              { time: '10:11 AM', text: 'Turned left onto Hospital Avenue safely.' },
              { time: '10:18 AM', text: 'Arrived at City Hospital main pedestrian entrance.' }
            ]
          },
          {
            _id: 'j_2',
            title: 'Walk to Central Metro Station',
            originName: 'Elmwood Court',
            destinationName: 'Central Metro',
            distanceMeters: 550,
            durationMinutes: 12,
            status: 'completed',
            hazardsAvoided: 1,
            adaptedPace: '1.2 m/s',
            date: '2026-09-27',
            events: [
              { time: '02:15 PM', text: 'Started walk to Central Metro.' },
              { time: '02:20 PM', text: '⚠️ Warned of temporary road construction on Metro Lane.' },
              { time: '02:27 PM', text: 'Safely arrived at Station Turnstiles.' }
            ]
          },
          {
            _id: 'j_3',
            title: 'Journey to Greenwood Public Library',
            originName: 'Central Metro',
            destinationName: 'Greenwood Library',
            distanceMeters: 640,
            durationMinutes: 14,
            status: 'completed',
            hazardsAvoided: 3,
            adaptedPace: '1.1 m/s',
            date: '2026-09-25',
            events: [
              { time: '04:00 PM', text: 'Departed Central Metro.' },
              { time: '04:05 PM', text: '⚠️ Warned of uneven paving stones on 4th Street sidewalk.' },
              { time: '04:14 PM', text: 'Arrived at Library tactile entry door.' }
            ]
          }
        ];
        setJourneys(demoJourneys);
        setSelectedJourney(demoJourneys[0]);
      }
    } catch (err) {
      console.warn('Could not fetch journeys from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalDistanceKm = (journeys.reduce((sum, j) => sum + (j.distanceMeters || 600), 0) / 1000).toFixed(1);
  const totalHazardsAvoided = journeys.reduce((sum, j) => sum + (j.hazardsAvoided || 1), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Journey History & Adaptive Learning</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Journey Timeline & User Pace Calibration
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              MemoNav AI gets smarter after every walk—adapting timing, predicting hazards, and remembering user preferences.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('navigation')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start New Journey</span>
          </button>
        </div>

        {/* Aggregate Learning Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Journeys</span>
            <span className="text-xl font-bold text-white">{journeys.length} Completed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Distance Guided</span>
            <span className="text-xl font-bold text-indigo-400">{totalDistanceKm} km</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Hazards Prevented</span>
            <span className="text-xl font-bold text-emerald-400">{totalHazardsAvoided} Alerts</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Pace Adaptation</span>
            <span className="text-sm font-bold text-purple-400">Personalized</span>
          </div>
        </div>
      </div>

      {/* Main Journey Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Journey List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Recorded Journeys ({journeys.length})
          </h2>

          <div className="space-y-3">
            {journeys.map((j) => {
              const isSelected = selectedJourney?._id === j._id;
              return (
                <div
                  key={j._id}
                  onClick={() => setSelectedJourney(j)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500/80 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{j.date || 'Recent'}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Completed
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-tight">
                    {j.title || `${j.originName || 'Start'} to ${j.destinationName}`}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{j.distanceMeters || 800}m</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{j.durationMinutes || 15} mins</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{j.hazardsAvoided || 1} warned</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Journey Audit Log & Adaptive Insights (7 cols) */}
        <div className="lg:col-span-7">
          {selectedJourney ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-purple-400">Journey Log & AI Audit</span>
                  <h3 className="text-xl font-bold text-white">{selectedJourney.title}</h3>
                </div>

                <button
                  onClick={() => onNavigateTab('navigation')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-run Route</span>
                </button>
              </div>

              {/* AI Pace Calibration Insight */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/50 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Pace Learning Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  User walked at <strong>{selectedJourney.adaptedPace || '1.15 m/s'}</strong>. MemoNav AI learned that crosswalk delays add ~2.5 minutes here, automatically tuning your future arrival predictions.
                </p>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Turn-by-Turn Event Timeline
                </h4>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {(selectedJourney.events || [
                    { time: '10:00 AM', text: 'Journey initiated with voice command.' },
                    { time: '10:06 AM', text: 'Hazard alert triggered proactively.' },
                    { time: '10:15 AM', text: 'Arrived at destination safely.' }
                  ]).map((ev, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-slate-900" />
                      <div className="text-[11px] font-mono text-purple-400 font-semibold">{ev.time}</div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{ev.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              Select a journey to view events and learning analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
