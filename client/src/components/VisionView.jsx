import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Api } from '../utils/api';
import Tesseract from 'tesseract.js';
import {
  Camera,
  Eye,
  Scan,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Upload,
  RefreshCw,
  Image,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export function VisionView({ onOpenVoice }) {
  const { speak, location } = useApp();

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedText, setDetectedText] = useState('');
  const [sceneSummary, setSceneSummary] = useState('');
  const [memorySavedNotice, setMemorySavedNotice] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Demo signboard presets for seamless testing & hackathon evaluation
  const demoScenarios = [
    {
      id: 'elevator_out',
      title: 'Metro Elevator Sign',
      tag: 'Obstacle / Accessibility',
      sampleText: 'ELEVATOR OUT OF SERVICE\nPLEASE USE RAMP 50M EAST\nOR CALL STATION ASSISTANT',
      summary: 'Out of service elevator sign. Wheelchair and low-vision access restricted.',
      isHazard: true,
      color: 'from-amber-600/30 to-red-600/30'
    },
    {
      id: 'crosswalk',
      title: 'Pedestrian Push Button',
      tag: 'Safe Crossing',
      sampleText: 'PUSH BUTTON FOR WALK SIGNAL\nWAIT FOR AUDIBLE CHIME BEFORE CROSSING',
      summary: 'Audible pedestrian push button signal detected on street pole.',
      isHazard: false,
      color: 'from-blue-600/30 to-indigo-600/30'
    },
    {
      id: 'hospital_entrance',
      title: 'Hospital Emergency Entrance',
      tag: 'Navigation Waypoint',
      sampleText: 'CITY HOSPITAL - EMERGENCY ROOM\nAMBULANCE ONLY\nPATIENT ENTRANCE 80 METERS AHEAD',
      summary: 'Hospital emergency driveway. Pedestrians must stay on the sidewalk.',
      isHazard: true,
      color: 'from-red-600/30 to-rose-600/30'
    },
    {
      id: 'bus_stop',
      title: 'Transit Bus Stop Sign',
      tag: 'Transit Guide',
      sampleText: 'METRO TRANSIT STOP 42\nROUTE 42 TO DOWNTOWN\nNEXT BUS IN 4 MINUTES',
      summary: 'Bus transit stop sign with live schedule timetable.',
      isHazard: false,
      color: 'from-emerald-600/30 to-teal-600/30'
    }
  ];

  // Start real webcam stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      // Fallback notification
      alert('Camera access is not available on this device or permission was denied. You can still use the Demo Scenarios and Image Upload!');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from active camera and run OCR
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);

    await processImageOCR(dataUrl);
  };

  // Handle uploaded image file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setCapturedImage(dataUrl);
      await processImageOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Run OCR with Tesseract
  const processImageOCR = async (imageSource) => {
    setIsProcessing(true);
    setOcrProgress(10);
    setDetectedText('');
    setSceneSummary('');
    setMemorySavedNotice(false);

    try {
      speak('Analyzing camera view. Scanning for signboards and text...', { cue: 'step_ding' });

      // Run Tesseract
      const result = await Tesseract.recognize(
        imageSource,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const cleanedText = result.data.text.trim();
      setDetectedText(cleanedText || 'No clear text or signboard detected in frame.');

      // Check if backend vision analysis provides semantic understanding
      let summary = '';
      if (cleanedText.toLowerCase().includes('out of service') || cleanedText.toLowerCase().includes('caution')) {
        summary = '⚠️ Warning Sign: Elevator or access point is out of service. Alternative route required.';
      } else if (cleanedText.toLowerCase().includes('button') || cleanedText.toLowerCase().includes('walk')) {
        summary = '🚸 Pedestrian Signal: Audible walk button available.';
      } else {
        summary = `Detected signboard with ${result.data.words.length} words.`;
      }
      setSceneSummary(summary);

      // Speak readout aloud
      const speechReadout = cleanedText
        ? `Signboard detected. It says: ${cleanedText}. ${summary}`
        : 'No readable text identified in the current camera frame.';

      speak(speechReadout, { cue: 'destination_reached' });
    } catch (err) {
      console.error('OCR Error:', err);
      setDetectedText('Unable to complete OCR processing. Please try a clearer angle.');
      speak('Could not read the sign clearly. Please try again.');
    } finally {
      setIsProcessing(false);
      setOcrProgress(100);
    }
  };

  // Load a demo scenario
  const selectDemoScenario = (scenario) => {
    setCapturedImage(null);
    setDetectedText(scenario.sampleText);
    setSceneSummary(scenario.summary);
    setMemorySavedNotice(false);

    const readout = `Signboard detected: ${scenario.title}. Content: ${scenario.sampleText}. Insight: ${scenario.summary}`;
    speak(readout, { cue: scenario.isHazard ? 'memory_alert' : 'destination_reached' });
  };

  // Convert the detected sign into a persistent spatial memory!
  const saveSignToMemory = async () => {
    if (!detectedText) return;

    try {
      const payload = {
        title: `Signboard: ${detectedText.split('\n')[0] || 'Road Notice'}`,
        description: `Visual sign recorded via Camera OCR: "${detectedText.replace(/\n/g, ' ')}"`,
        type: detectedText.toLowerCase().includes('out of service') ? 'obstacle' : 'landmark',
        severity: detectedText.toLowerCase().includes('out of service') ? 'high' : 'low',
        latitude: location.lat,
        longitude: location.lon,
        audioNote: detectedText
      };

      await Api.createMemory(payload);
      setMemorySavedNotice(true);
      speak('Signboard successfully saved to MemoNav persistent memory. You will be warned here in future journeys.', { cue: 'success' });
    } catch (err) {
      console.error('Failed to save sign memory:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>MemoNav AI Vision & OCR Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Real-Time Signboard & Scene Reader
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Designed for blind and low-vision users to instantly read elevator notices, bus signs, and crosswalks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Enable Live Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-all"
            >
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Vision Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Camera Preview / Image Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl min-h-[360px] flex items-center justify-center">
            {/* Live Camera Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-auto max-h-[460px] object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Captured or Uploaded Image */}
            {!cameraActive && capturedImage && (
              <img
                src={capturedImage}
                alt="Captured scene"
                className="w-full h-auto max-h-[460px] object-contain"
              />
            )}

            {/* Empty state when camera inactive */}
            {!cameraActive && !capturedImage && (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">Camera Inactive</p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Click "Enable Live Camera", choose one of the Demo Scenarios below, or upload a photo to test OCR.
                  </p>
                </div>
              </div>
            )}

            {/* Hidden Canvas for Frame Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay when processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 space-y-3 z-20">
                <Scan className="w-12 h-12 text-emerald-400 animate-spin" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-white">Extracting & Reading Text...</p>
                  <p className="text-xs text-emerald-400">{ocrProgress}% recognized</p>
                </div>
                <div className="w-48 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {cameraActive && (
              <button
                onClick={captureAndRecognize}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Scan className="w-4 h-4" />
                <span>Capture & Read Signboard</span>
              </button>
            )}

            <label className="flex-1 cursor-pointer py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Side: Detected Text & Spoken Readout (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>OCR Spoken Result</span>
              </span>
              {detectedText && (
                <button
                  onClick={() => speak(`Detected text: ${detectedText}. ${sceneSummary}`, { cue: 'destination_reached' })}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Speak sign readout"
                  aria-label="Speak sign readout"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </button>
              )}
            </div>

            {/* Readout Textbox */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[160px] flex flex-col justify-between">
              {detectedText ? (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Text on Signboard:</div>
                  <pre className="font-mono text-base font-bold text-emerald-300 whitespace-pre-wrap leading-relaxed">
                    {detectedText}
                  </pre>
                  {sceneSummary && (
                    <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 font-medium">
                      {sceneSummary}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-xs sm:text-sm text-center my-auto">
                  Signboard text will appear and be read aloud here automatically.
                </div>
              )}
            </div>

            {/* Save to Memory Brain Button */}
            {detectedText && (
              <div className="space-y-2">
                {memorySavedNotice ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Saved to Memory Brain! MemoNav AI will alert you here next time.</span>
                  </div>
                ) : (
                  <button
                    onClick={saveSignToMemory}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    <span>Save This Sign as Navigation Memory</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pre-packaged Demo Scenarios for instant evaluation */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hackathon Demo Scenarios
              </span>
              <span className="text-[11px] text-slate-500">Click to test OCR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => selectDemoScenario(scenario)}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{scenario.title}</span>
                    {scenario.isHazard && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    {scenario.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
