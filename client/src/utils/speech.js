/**
 * Web Speech API and Web Audio Utilities for MemoNav AI
 */

let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let audioCtx = null;

// Audio Chime generator for accessibility cues
export function playAudioCue(type = 'success') {
  try {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'start_listening') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'memory_alert') {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'emergency') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.setValueAtTime(950, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // standard confirmation
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    console.warn('[AudioCue] WebAudio notice:', e);
  }
}

// Text-to-Speech
export function speakText(text, options = {}) {
  if (!synth) return;
  synth.cancel(); // Stop prior utterance

  if (!text || text.trim().length === 0) return;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Speed
  const rateMap = { slow: 0.85, normal: 1.0, fast: 1.25 };
  utterance.rate = options.speed && rateMap[options.speed] ? rateMap[options.speed] : 1.0;
  
  // Volume
  utterance.volume = options.volume !== undefined ? options.volume : 1.0;
  
  // Language
  if (options.language === 'Hindi') {
    utterance.lang = 'hi-IN';
  } else if (options.language === 'Telugu') {
    utterance.lang = 'te-IN';
  } else {
    utterance.lang = 'en-US';
  }

  // Pick matching voice if available
  const voices = synth.getVoices();
  const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.substring(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  synth.speak(utterance);
}

export function stopSpeaking() {
  if (synth) synth.cancel();
}

// Speech Recognition helper
export function createSpeechRecognizer({ onResult, onError, onEnd }) {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('[Speech] Browser does not support Web Speech API SpeechRecognition.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.warn('[Speech] Recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
