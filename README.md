# MemoNav AI
> *"Remember the Journey. Learn the User. Guide Better."*

An AI-powered personal navigation assistant designed specifically for blind and low-vision users. Traditional navigation systems treat every trip like the first time; **MemoNav AI** bridges this gap with persistent spatial memory, autonomous multi-tool agent orchestration, real-time computer vision OCR, and proactive hazard prevention.

---

## 🌟 The Core Differentiator: "Before Memory vs After Memory"

| Feature | Traditional GPS (Google / Apple Maps) | MemoNav AI (Memory-Powered Agent) |
| :--- | :--- | :--- |
| **Past Difficulty Awareness** | ❌ **None.** Blindly routes user into dangerous spots | ✅ **Remembers.** Recalls user-reported crowded crossings and broken curb ramps |
| **Proactive Hazard Alerting** | ❌ **No.** Only reports static turn instructions | ✅ **Yes.** Warns *before* approaching known hazards (*"Caution: You had difficulty here before."*) |
| **Walking Pace Adaptation** | ❌ Assumes average sighted pedestrian walking speed | ✅ Learns user's unique stride and adapts arrival estimates |
| **Multimodal Vision & OCR** | ❌ None | ✅ Live camera OCR to read transit boards & elevator notices |
| **Autonomous Orchestration** | ❌ Rigid input menus | ✅ Natural language voice agent triggering location, memory, & routing tools |
| **Emergency SOS Dispatch** | ❌ None | ✅ Instant accessible 1-tap SOS broadcasting live GPS to caregivers |

---

## 🚀 Live Demo & Quick Start

The system includes both an Express API backend (Port 5000) and a React + Vite + Tailwind CSS frontend (Port 5173).

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- *(Optional)* MongoDB running locally at `mongodb://127.0.0.1:27017/memonav_ai`. If MongoDB is not present, **MemoNav AI automatically switches to resilient local JSON/Memory storage** without failing.

### Installation
Run from the repository root:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### Running Both Client & Server Concurrently
```bash
npm run dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Running Automated Test Suite
To verify all backend memory retrieval, AI tool calling, and emergency workflows:
```bash
npm --prefix server test
```

---

## 🧭 Application Modules & Feature Walkthrough

### 1. 🎭 "Before vs After" Interactive Hackathon Demo (`/demo`)
- Step-by-step interactive simulation highlighting the contrast between standard navigation failure modes and MemoNav AI proactive guidance.
- Side-by-side comparison tables, simulated voice narration, and memory trigger indicators.

### 2. 🗺️ Interactive Navigation (`/navigation`)
- Leaflet map visualization with live route polylines and memory hazard pins.
- Big, accessible turn-by-turn guidance cards with direction indicators and voice readout.
- **Proactive Memory Alerts**: As the user approaches known danger spots, prominent warnings pop up with voice cues.
- **"Report Problem Here"**: Instant 1-tap modal to log hazards at current GPS coordinates.
- Simulation controls: Step forward, auto-walk simulation, and GPS sync.

### 3. 📷 Live Vision & Signboard OCR (`/vision`)
- Real-time device camera stream or test photo upload.
- On-device **Tesseract OCR** recognizing text on signboards, elevator out-of-order notices, transit schedules, and crosswalk buttons.
- Audibly speaks recognized text and provides a **"Save as Navigation Memory"** button.
- 4 pre-packaged demo scenarios for instant evaluation without requiring outdoor filming.

### 4. 🧠 Memory Brain Dashboard (`/memories`)
- Central repository of all learned spatial memories.
- Filter by: *Difficult Crossings*, *Obstacles*, *Landmarks*, *Personal Preferences*.
- **"Test Voice Warning"** button on each card to hear how MemoNav alerts the user at that spot.
- "Reseed Demo Data" button to restore canonical hackathon demo scenarios.

### 5. 📜 Journeys & Pace Learning (`/journeys`)
- Audit log of past walks with timeline events.
- Pace calibration analytics (*"User walked at 1.1 m/s, adding 2.5 min for intersection delay"*).
- Safety metrics: Total distance guided and hazards averted.

### 6. 🚨 Emergency Safety Protocol (`/emergency`)
- High-visibility accessible SOS button with 3-second abort countdown.
- Live GPS coordinate broadcast to registered emergency contacts.
- Quick-call buttons for caregivers and 911 emergency services.

### 7. 🗣️ AI Voice Assistant Modal
- Available anywhere via the floating mic button or keyboard shortcut.
- Full speech-to-text recognition and text-to-speech audio feedback.
- Autonomous AI agent intent classifier that executes tool calls:
  - `"Navigate me to City Hospital"` ➔ Plans route & loads memories.
  - `"Crossing here is difficult because it is crowded"` ➔ Saves spatial hazard memory.
  - `"What hazards are nearby?"` ➔ Scans proximity within 300 meters.
  - `"Emergency help"` ➔ Activates SOS protocol.

### 8. ♿ Accessibility Controls (WCAG AAA)
- **High Contrast Mode**: Bold yellow/black high-contrast theme.
- **Large Typography Mode**: Scaled typography for low-vision reading.
- **Audio Cues**: Distinct auditory tones for listening, success, memory warnings, and emergency dispatch.
- **Screen Reader Friendly**: Semantic HTML5 landmark structure and ARIA labels throughout.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4, Lucide React icons, Glassmorphism, CSS Custom Properties
- **Mapping**: Leaflet with CartoDB Dark Matter accessible tiles
- **Vision/OCR**: Tesseract.js
- **Audio/Voice**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + synthesized sound effects

### Backend
- **Runtime**: Node.js + Express
- **Resilience**: Dual-engine database adapter (MongoDB with automatic fallback to JSON store)
- **AI Agent Orchestrator**: Multi-tool agent pipeline executing `getCurrentLocation`, `getRoute`, `saveMemory`, `getRelevantMemories`, and `triggerEmergencyAlert`
- **Security**: Helmet, CORS, Rate limiting, JWT authentication

---

## 📋 Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/memonav_ai
JWT_SECRET=memonav_secret_super_key_2026
GEMINI_API_KEY=
USE_HINDSIGHT_MEMORY=false
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=/api
```
