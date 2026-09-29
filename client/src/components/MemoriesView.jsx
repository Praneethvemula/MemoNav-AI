import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Api } from '../utils/api';
import {
  BrainCircuit,
  AlertTriangle,
  MapPin,
  Plus,
  Trash2,
  Volume2,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  X,
  Save,
  Clock,
  Navigation
} from 'lucide-react';

export function MemoriesView({ onOpenVoice, onNavigateTab }) {
  const { speak, location, memorySource } = useApp();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    type: 'difficult_crossing',
    severity: 'medium',
    latitude: location.lat,
    longitude: location.lon
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await Api.getMemories();
      if (res && res.memories) {
        setMemories(res.memories);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      await Api.seedDemo('demo_user_123');
      await fetchMemories();
      speak('Demo memories restored. Ready for navigation testing.', { cue: 'success' });
    } catch (e) {
      console.error('Seed demo error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete memory: "${title}"?`)) return;
    try {
      await Api.deleteMemory(id);
      setMemories(prev => prev.filter(m => (m._id || m.id) !== id));
      speak(`Memory removed: ${title}`);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMemory.title || !newMemory.description) return;

    setSubmitting(true);
    try {
      const payload = {
        ...newMemory,
        latitude: Number(newMemory.latitude) || location.lat,
        longitude: Number(newMemory.longitude) || location.lon
      };
      await Api.createMemory(payload);
      await fetchMemories();
      setIsAddModalOpen(false);
      speak(`Memory saved: ${newMemory.title}. MemoNav AI will use this in future journeys.`, { cue: 'memory_alert' });
      setNewMemory({
        title: '',
        description: '',
        type: 'difficult_crossing',
        severity: 'medium',
        latitude: location.lat,
        longitude: location.lon
      });
    } catch (err) {
      console.error('Create memory error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Test spoken warning simulation
  const handleTestWarning = (mem) => {
    let warning = `MemoNav Memory Warning: You previously noted difficulty here. ${mem.description}. Please move carefully.`;
    speak(warning, { cue: 'memory_alert' });
  };

  // Filter memories
  const filteredMemories = memories.filter(mem => {
    const matchesSearch = (mem.title + ' ' + mem.description).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || mem.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const hazardCount = memories.filter(m => m.type === 'difficult_crossing' || m.type === 'obstacle').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>MemoNav AI Memory Core</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Persistent Spatial Memory Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Every obstacle, difficult crossing, and navigation note is stored here to protect future journeys.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory</span>
            </button>

            <button
              onClick={handleSeedDemo}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
              title="Reseed Hackathon Demo Memories"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Reseed Demo</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Memories</span>
            <span className="text-xl font-bold text-white">{memories.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Hazards & Crossings</span>
            <span className="text-xl font-bold text-amber-400">{hazardCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Engine Backend</span>
            <span className="text-sm font-bold text-emerald-400 truncate">{memorySource}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Active Mode</span>
            <span className="text-sm font-bold text-blue-400">Proactive Alerting</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, locations, or descriptions..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {[
            { id: 'all', label: 'All' },
            { id: 'difficult_crossing', label: 'Crossings' },
            { id: 'obstacle', label: 'Obstacles' },
            { id: 'landmark', label: 'Landmarks' },
            { id: 'preference', label: 'Preferences' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading stored memories...</div>
      ) : filteredMemories.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold">No memories found</p>
          <p className="text-xs text-slate-500">
            Click "Reseed Demo" above or add a new memory to populate your dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => {
            const id = mem._id || mem.id;
            const isHazard = mem.type === 'difficult_crossing' || mem.type === 'obstacle';

            return (
              <div
                key={id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg space-y-3 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${isHazard ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {isHazard ? <AlertTriangle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </span>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {mem.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        mem.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        mem.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {mem.severity || 'medium'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {mem.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{mem.latitude?.toFixed(4)}, {mem.longitude?.toFixed(4)}</span>
                    </div>
                    {mem.timesWarned !== undefined && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Warned {mem.timesWarned || 1} times</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestWarning(mem)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
                    title="Hear how MemoNav AI warns you at this location"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Voice Warning</span>
                  </button>

                  <button
                    onClick={() => handleDelete(id, mem.title)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Memory */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <span>Create New Memory</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  placeholder="e.g. High curb ramp / Construction obstacle"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newMemory.type}
                  onChange={(e) => setNewMemory({ ...newMemory, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="difficult_crossing">Difficult Crossing</option>
                  <option value="obstacle">Obstacle</option>
                  <option value="landmark">Audio Landmark</option>
                  <option value="preference">Walking Preference</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newMemory.latitude}
                    onChange={(e) => setNewMemory({ ...newMemory, latitude: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newMemory.longitude}
                    onChange={(e) => setNewMemory({ ...newMemory, longitude: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setNewMemory({ ...newMemory, severity: sev })}
                      className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                        newMemory.severity === sev
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Warning Description</label>
                <textarea
                  rows={2}
                  required
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                  placeholder="What should MemoNav AI say when nearing this place?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save to Memory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
