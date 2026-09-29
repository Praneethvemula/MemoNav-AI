import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { createSpeechRecognizer, playAudioCue } from '../utils/speech';
import { Mic, MicOff, Volume2, X, Send, Sparkles, AlertCircle, ArrowRight, CornerDownLeft, Shield, Compass, Eye, BookOpen } from 'lucide-react';

export function VoiceAssistantModal({ isOpen, onClose, onNavigateTab }) {
  const { voiceStatus, setVoiceStatus, sendVoiceCommand, speak, preferences } = useApp();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognizerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll transcript to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [voiceStatus.transcriptHistory]);

  // Setup Web Speech recognition
  useEffect(() => {
    if (!isOpen) return;

    recognizerRef.current = createSpeechRecognizer({
      onResult: (transcript) => {
        setVoiceStatus(prev => ({ ...prev, isListening: false }));
        handleProcessCommand(transcript);
      },
      onError: (err) => {
        setVoiceStatus(prev => ({ ...prev, isListening: false }));
      },
      onEnd: () => {
        setVoiceStatus(prev => ({ ...prev, isListening: false }));
      }
    });

    return () => {
      if (recognizerRef.current) {
        try { recognizerRef.current.abort(); } catch (e) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (voiceStatus.isListening) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
      setVoiceStatus(prev => ({ ...prev, isListening: false }));
    } else {
      playAudioCue('start_listening');
      setVoiceStatus(prev => ({ ...prev, isListening: true }));
      try {
        if (recognizerRef.current) {
          recognizerRef.current.start();
        } else {
          // If browser speech recognition is not supported
          speak("Voice recognition not supported in this browser. Please type your command.");
          setVoiceStatus(prev => ({ ...prev, isListening: false }));
        }
      } catch (err) {
        console.warn('Recognition start notice:', err);
        setVoiceStatus(prev => ({ ...prev, isListening: false }));
      }
    }
  };

  const handleProcessCommand = async (text) => {
    if (!text || !text.trim()) return;
    setIsProcessing(true);
    setInputText('');
    
    const res = await sendVoiceCommand(text);
    setIsProcessing(false);

    // If navigation action was triggered, optionally jump to navigation view
    if (res?.actionType === 'start_navigation' && onNavigateTab) {
      setTimeout(() => {
        onNavigateTab('navigation');
        onClose();
      }, 1500);
    } else if (res?.actionType === 'emergency' && onNavigateTab) {
      setTimeout(() => {
        onNavigateTab('emergency');
        onClose();
      }, 1200);
    } else if (res?.actionType === 'open_camera' && onNavigateTab) {
      setTimeout(() => {
        onNavigateTab('vision');
        onClose();
      }, 1200);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleProcessCommand(inputText);
  };

  // Quick suggestions for fast demo interaction
  const suggestedQueries = [
    { label: 'Navigate to City Hospital', icon: Compass, text: 'Navigate to City Hospital' },
    { label: 'Remember this crossing is crowded', icon: BookOpen, text: 'Remember this crossing is crowded and difficult' },
    { label: 'What did I experience here?', icon: Sparkles, text: 'What did I experience here?' },
    { label: 'Where am I?', icon: Compass, text: 'Where am I?' },
    { label: 'Read this sign', icon: Eye, text: 'Read this sign' },
    { label: 'Emergency Help', icon: Shield, text: 'Emergency help me' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="font-bold text-slate-100 text-lg">MemoNav Voice Assistant</h2>
              <p className="text-xs text-slate-400">Conversational AI with episodic journey memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Close voice assistant dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Voice Visualizer / Mic Pulsar */}
        <div className="py-6 px-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center border-b border-slate-800/80">
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings when listening */}
            {voiceStatus.isListening && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-red-500/20 animate-ping"></div>
                <div className="absolute w-28 h-28 rounded-full bg-red-500/30 animate-pulse"></div>
              </>
            )}
            {/* Glowing rings when speaking */}
            {voiceStatus.isSpeaking && (
              <div className="absolute w-32 h-32 rounded-full bg-indigo-500/25 animate-pulse"></div>
            )}

            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 focus-visible:ring-4 focus-visible:ring-blue-400 ${
                voiceStatus.isListening
                  ? 'bg-red-600 shadow-red-500/50 scale-105'
                  : voiceStatus.isSpeaking
                  ? 'bg-indigo-600 shadow-indigo-500/50'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 hover:scale-105 shadow-blue-500/30'
              }`}
              aria-label={voiceStatus.isListening ? 'Stop listening' : 'Start speaking to MemoNav AI'}
            >
              {voiceStatus.isListening ? (
                <Mic className="w-9 h-9 animate-pulse" />
              ) : voiceStatus.isSpeaking ? (
                <Volume2 className="w-9 h-9 animate-bounce" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-200 text-center">
            {voiceStatus.isListening
              ? 'Listening to your voice... Speak now'
              : voiceStatus.isSpeaking
              ? 'Speaking response...'
              : isProcessing
              ? 'Thinking & recalling memory...'
              : 'Tap microphone or choose a voice command below'}
          </p>

          <span className="text-[11px] text-slate-400 mt-1">
            Language: <span className="text-blue-400 font-semibold">{preferences.language}</span> • Speed:{' '}
            <span className="text-blue-400 font-semibold">{preferences.voiceSpeed}</span>
          </span>
        </div>

        {/* Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[260px] bg-slate-950/60">
          {voiceStatus.transcriptHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                item.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  item.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                    : item.isError
                    ? 'bg-red-950/80 text-red-200 border border-red-800 rounded-bl-none'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="leading-relaxed">{item.text}</p>
                {item.actionType && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-blue-300 font-mono">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Action: {item.actionType}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {item.sender === 'user' ? 'You' : 'MemoNav AI'} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Suggested Voice Inquiries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQueries.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleProcessCommand(q.text)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-blue-500/50 transition-all text-left"
                >
                  <Icon className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type a voice command..."
            disabled={isProcessing}
            className="flex-1 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/30"
            aria-label="Send text command"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
