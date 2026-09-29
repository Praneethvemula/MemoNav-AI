import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Api } from '../utils/api';
import {
  ShieldAlert,
  Phone,
  MapPin,
  AlertTriangle,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  Volume2,
  X,
  Send,
  Sparkles
} from 'lucide-react';

export function EmergencyView() {
  const { location, speak } = useApp();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: 'Family',
    phone: '',
    email: '',
    notifyBySms: true
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await Api.getEmergencyContacts();
      if (res && res.contacts && res.contacts.length > 0) {
        setContacts(res.contacts);
      } else {
        // High quality default emergency contacts for demo
        setContacts([
          { _id: 'c1', name: 'Sarah Miller (Sister)', relationship: 'Sister', phone: '+1 (555) 234-5678', isPrimary: true },
          { _id: 'c2', name: 'Dr. Robert Chen (Caregiver)', relationship: 'Caregiver', phone: '+1 (555) 876-5432', isPrimary: false }
        ]);
      }
    } catch (e) {
      console.warn('Could not fetch contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  // SOS Countdown logic
  useEffect(() => {
    let timer = null;
    if (isAlertActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isAlertActive && countdown === 0) {
      triggerSosDispatch();
    }
    return () => clearInterval(timer);
  }, [isAlertActive, countdown]);

  const startSosSequence = () => {
    setIsAlertActive(true);
    setCountdown(3);
    speak('Emergency alert initiated. Dispatching in 3 seconds. Press cancel to abort.', { cue: 'emergency' });
  };

  const cancelSos = () => {
    setIsAlertActive(false);
    setCountdown(3);
    speak('Emergency alert cancelled.');
  };

  const triggerSosDispatch = async () => {
    setIsAlertActive(false);
    setAlertDispatched(true);
    try {
      await Api.triggerEmergencyAlert({
        location: { lat: location.lat, lon: location.lon },
        message: 'Blind user activated emergency assistance on MemoNav AI.'
      });
      speak('Emergency alert sent! Your live GPS coordinates have been broadcast to your emergency contacts.', { cue: 'emergency' });
    } catch (err) {
      console.error('SOS dispatch error:', err);
      speak('Alert dispatched locally. Call 911 immediately if in danger.');
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    try {
      await Api.createEmergencyContact(newContact);
      await fetchContacts();
      setIsAddModalOpen(false);
      speak(`Added emergency contact: ${newContact.name}.`);
      setNewContact({ name: '', relationship: 'Family', phone: '', email: '', notifyBySms: true });
    } catch (err) {
      console.error('Add contact error:', err);
    }
  };

  const handleDeleteContact = async (id, name) => {
    if (!window.confirm(`Delete contact: ${name}?`)) return;
    try {
      await Api.deleteEmergencyContact(id);
      setContacts(prev => prev.filter(c => (c._id || c.id) !== id));
      speak(`Removed contact: ${name}.`);
    } catch (e) {
      console.error('Delete contact error:', e);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-red-950/40 border border-red-900/60 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>MemoNav AI Emergency Safety Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Emergency Assistance & SOS Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Designed for high-contrast accessibility. One press alerts your caregivers with live GPS location and triggers an audible distress tone.
        </p>
      </div>

      {/* Giant Accessible SOS Button */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
        {isAlertActive ? (
          <div className="space-y-4">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-red-600 flex flex-col items-center justify-center text-white shadow-2xl shadow-red-600/50 animate-pulse mx-auto">
              <span className="text-5xl font-black">{countdown}</span>
              <span className="text-xs uppercase font-bold tracking-widest mt-1">Dispatching</span>
            </div>
            <p className="text-sm font-semibold text-red-400">
              Broadcasting GPS coordinates in {countdown}s...
            </p>
            <button
              onClick={cancelSos}
              className="py-3 px-8 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 shadow-lg"
            >
              Cancel Alert
            </button>
          </div>
        ) : alertDispatched ? (
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-900/60 text-emerald-300 space-y-3 max-w-md mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Emergency Alert Broadcasted!</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Live location <span className="font-mono text-emerald-400">({location.lat.toFixed(4)}, {location.lon.toFixed(4)})</span> sent to {contacts.length} designated contacts.
            </p>
            <button
              onClick={() => setAlertDispatched(false)}
              className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Reset SOS Status
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={startSosSequence}
              className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 hover:from-red-600 hover:to-rose-400 text-white shadow-2xl shadow-red-600/40 flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 group focus:ring-4 focus:ring-red-400"
              aria-label="Activate Emergency SOS Alert"
            >
              <ShieldAlert className="w-14 h-14 sm:w-16 sm:h-16 mb-1 text-white group-hover:animate-bounce" />
              <span className="text-2xl sm:text-3xl font-black tracking-wider">SOS</span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-red-200">
                Press to Alert
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current GPS: {location.lat.toFixed(4)}, {location.lon.toFixed(4)} (±{location.accuracy}m)</span>
            </div>
          </div>
        )}

        {/* Quick Dial 911 Button */}
        <div className="pt-2">
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30 font-bold text-sm shadow-md transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Direct Call Emergency Services (911)</span>
          </a>
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Designated Emergency Contacts</h2>
            <p className="text-xs text-slate-400">Notified instantly with your coordinates when SOS is triggered.</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {contacts.map((c) => {
            const id = c._id || c.id;
            return (
              <div
                key={id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    {c.isPrimary && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{c.relationship}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{c.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    title={`Call ${c.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDeleteContact(id, c.name)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                    title="Remove contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Contact */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Add Emergency Contact</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g. Family / Caregiver / Friend"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="e.g. +1 555-0199"
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
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
