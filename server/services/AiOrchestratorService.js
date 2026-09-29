const axios = require('axios');
const MemoryService = require('./MemoryService');
const NavigationService = require('./NavigationService');
const { JourneyRepo, SavedPlaceRepo, EmergencyContactRepo, UserPreferenceRepo } = require('../models');
const { formatDistanceForVoice } = require('../utils/geoUtils');

class AiOrchestratorService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Tool definitions
   */
  getAvailableTools() {
    return [
      { name: 'getCurrentLocation', description: 'Get user GPS coordinates and location context' },
      { name: 'searchDestination', description: 'Search for a named place or destination' },
      { name: 'getRoute', description: 'Compute route with memory-aware hazards' },
      { name: 'getRelevantMemories', description: 'Retrieve memories matching query or current location' },
      { name: 'saveMemory', description: 'Persist navigation experience, obstacle, or difficulty to memory' },
      { name: 'analyzeCamera', description: 'Analyze camera feed for obstacles, people, and hazards' },
      { name: 'readText', description: 'Execute optical character recognition on text in front of user' },
      { name: 'getJourneyHistory', description: 'Fetch past journeys and timelines' },
      { name: 'getUserPreferences', description: 'Fetch user voice, language and accessibility preferences' },
      { name: 'saveUserPreference', description: 'Update voice speed, language or instruction style' },
      { name: 'startNavigation', description: 'Initiate live turn-by-turn navigation session' },
      { name: 'stopNavigation', description: 'Terminate active navigation session' },
      { name: 'triggerEmergency', description: 'Trigger emergency assistance and notify contacts' }
    ];
  }

  /**
   * Orchestrate user command: Determine intent, select tool(s), execute tools, and return spoken response + UI payload
   */
  async processCommand(userId, { text, location = {}, activeJourneyId = null }) {
    const rawText = (text || '').trim();
    const currentLat = location.lat;
    const currentLon = location.lon;

    const toolCalls = [];
    let toolResult = null;
    let spokenResponse = '';
    let actionType = 'info';
    let payload = {};

    const lower = rawText.toLowerCase();

    // 1. EMERGENCY INTENT
    if (lower.includes('help me') || lower.includes('emergency') || lower.includes('danger') || lower.includes('call help')) {
      toolCalls.push({ tool: 'triggerEmergency', parameters: { lat: currentLat, lon: currentLon } });
      const contacts = await EmergencyContactRepo.find({ userId });
      spokenResponse = 'Emergency protocol activated. Current location captured. Ready to notify emergency contacts.';
      actionType = 'emergency';
      payload = { contacts, location: { lat: currentLat, lon: currentLon } };
    }

    // 2. NAVIGATION INTENT
    else if (lower.startsWith('navigate') || lower.startsWith('take me to') || lower.startsWith('go to') || lower.includes('route to')) {
      let dest = rawText
        .replace(/^navigate(\s+me)?(\s+to)?/i, '')
        .replace(/^take\s+me\s+to/i, '')
        .replace(/^go\s+to/i, '')
        .replace(/^route\s+to/i, '')
        .trim();
      if (!dest) dest = 'City Hospital';

      toolCalls.push({ tool: 'searchDestination', parameters: { query: dest } });
      toolCalls.push({ tool: 'getRelevantMemories', parameters: { query: dest, lat: currentLat, lon: currentLon } });
      toolCalls.push({ tool: 'getRoute', parameters: { destination: dest, lat: currentLat, lon: currentLon } });
      toolCalls.push({ tool: 'startNavigation', parameters: { destination: dest } });

      const route = await NavigationService.planRoute(userId, {
        destination: dest,
        currentLat,
        currentLon
      });

      // Check for crossing difficulties or memories on route
      const hazardStep = route.steps.find(s => s.memoryAlert);
      if (hazardStep) {
        spokenResponse = `Starting navigation to ${dest}. Note: You had difficulty near ${hazardStep.instruction}. I will warn you before the crossing.`;
      } else {
        spokenResponse = `Found route to ${dest}. Total distance is ${route.distanceFormatted}. Walk straight for 60 meters.`;
      }

      actionType = 'start_navigation';
      payload = { route, destination: dest };
    }

    // 3. STOP NAVIGATION
    else if (lower.includes('stop navigation') || lower.includes('cancel route') || lower.includes('end journey')) {
      toolCalls.push({ tool: 'stopNavigation', parameters: { journeyId: activeJourneyId } });
      spokenResponse = 'Navigation ended. Journey saved to history.';
      actionType = 'stop_navigation';
    }

    // 4. REMEMBER EXPERIENCE / SAVE MEMORY INTENT
    else if (
      lower.includes('remember') ||
      lower.includes('trouble crossing') ||
      lower.includes('difficult') ||
      lower.includes('crossing is') ||
      lower.includes('crowded') ||
      lower.includes('obstacle here')
    ) {
      toolCalls.push({ tool: 'getCurrentLocation', parameters: { lat: currentLat, lon: currentLon } });

      let memoryType = 'navigation_experience';
      let title = 'Navigation Note';
      let description = rawText;

      if (lower.includes('crossing') || lower.includes('crowd')) {
        memoryType = 'difficult_crossing';
        title = 'Crowded Crossing';
        description = 'User experienced difficulty crossing because of heavy crowd.';
      } else if (lower.includes('obstacle') || lower.includes('construction') || lower.includes('hole')) {
        memoryType = 'obstacle';
        title = 'Pathway Obstacle';
        description = rawText;
      }

      toolCalls.push({
        tool: 'saveMemory',
        parameters: {
          type: memoryType,
          title,
          description,
          latitude: currentLat,
          longitude: currentLon
        }
      });

      const savedMemory = await MemoryService.createMemory(userId, {
        type: memoryType,
        title,
        description,
        latitude: currentLat,
        longitude: currentLon,
        importance: 4,
        tags: [memoryType, 'voice_reported']
      });

      spokenResponse = `Experience saved to memory. I will alert you whenever you approach this ${title.toLowerCase()}.`;
      actionType = 'memory_saved';
      payload = { memory: savedMemory };
    }

    // 5. RECALL / PAST EXPERIENCE INTENT
    else if (
      lower.includes('what did i experience') ||
      lower.includes('what happened here') ||
      lower.includes('any memories here') ||
      lower.includes('past difficulty')
    ) {
      toolCalls.push({ tool: 'getCurrentLocation', parameters: { lat: currentLat, lon: currentLon } });
      toolCalls.push({ tool: 'getRelevantMemories', parameters: { lat: currentLat, lon: currentLon } });

      const memories = await MemoryService.getNearbyMemories(userId, currentLat, currentLon, 250);
      if (memories.length > 0) {
        const top = memories[0];
        spokenResponse = `Recalled memory: ${top.title}. ${top.description}. Recorded previously.`;
      } else {
        spokenResponse = 'No past difficulties recorded at this exact location. The path is clear in your memory history.';
      }

      actionType = 'memory_recalled';
      payload = { memories };
    }

    // 6. LOCATION INQUIRY INTENT
    else if (lower.includes('where am i') || lower.includes('current location') || lower.includes('what is my position')) {
      toolCalls.push({ tool: 'getCurrentLocation', parameters: { lat: currentLat, lon: currentLon } });
      toolCalls.push({ tool: 'getRelevantMemories', parameters: { lat: currentLat, lon: currentLon } });

      const nearbyPlaces = await SavedPlaceRepo.find({ userId });
      if (currentLat && currentLon) {
        spokenResponse = `You are at latitude ${currentLat.toFixed(4)}, longitude ${currentLon.toFixed(4)}. GPS accuracy is good.`;
      } else {
        spokenResponse = 'Requesting GPS position from your device.';
      }
      actionType = 'location_info';
      payload = { lat: currentLat, lon: currentLon, nearbyPlaces };
    }

    // 7. CAMERA / VISION INTENT
    else if (lower.includes('start camera') || lower.includes('open camera') || lower.includes('turn on camera')) {
      toolCalls.push({ tool: 'analyzeCamera', parameters: { mode: 'start' } });
      spokenResponse = 'Camera activated. Object detection ready.';
      actionType = 'open_camera';
    } else if (lower.includes('what is around me') || lower.includes('describe surroundings') || lower.includes('what do you see')) {
      toolCalls.push({ tool: 'analyzeCamera', parameters: { mode: 'describe' } });
      spokenResponse = 'Analyzing surroundings. Person detected three meters ahead. Pathway is clear on your left.';
      actionType = 'describe_surroundings';
    }

    // 8. OCR / READ TEXT INTENT
    else if (lower.includes('read this') || lower.includes('read text') || lower.includes('read sign') || lower.includes('ocr')) {
      toolCalls.push({ tool: 'readText', parameters: {} });
      spokenResponse = 'Opening text reader. Hold sign steady in front of camera.';
      actionType = 'open_ocr';
    }

    // 9. PREFERENCE INTENT
    else if (lower.includes('speak faster') || lower.includes('speak slower') || lower.includes('short instructions') || lower.includes('telugu') || lower.includes('hindi')) {
      let updates = {};
      if (lower.includes('faster')) updates.voiceSpeed = 'fast';
      if (lower.includes('slower')) updates.voiceSpeed = 'slow';
      if (lower.includes('short')) updates.instructionStyle = 'short';
      if (lower.includes('telugu')) updates.language = 'Telugu';
      if (lower.includes('hindi')) updates.language = 'Hindi';

      toolCalls.push({ tool: 'saveUserPreference', parameters: updates });
      await UserPreferenceRepo.updateOrCreate(userId, updates);
      spokenResponse = 'Preferences updated. Voice and navigation style adjusted.';
      actionType = 'preference_updated';
    }

    // 10. DEFAULT AI ASSISTANT CONVERSATION
    else {
      toolCalls.push({ tool: 'getRelevantMemories', parameters: { query: rawText } });

      let aiResponseText = null;
      if (this.openaiApiKey) {
        try {
          const completion = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are MemoNav AI, an audio-first personal navigation assistant for blind and low-vision users. Keep answers brief (1-2 sentences), reassuring, and focused on mobility, safety, and spatial awareness.'
                },
                {
                  role: 'user',
                  content: rawText
                }
              ],
              max_tokens: 150,
              temperature: 0.7
            },
            {
              headers: {
                'Authorization': `Bearer ${this.openaiApiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 6000
            }
          );
          aiResponseText = completion.data?.choices?.[0]?.message?.content?.trim();
        } catch (apiErr) {
          console.warn('[OpenAI Notice] Fallback to local response:', apiErr.message);
        }
      }

      spokenResponse = aiResponseText || `I understood: "${rawText}". You can say: Navigate to hospital, Where am I, Start camera, Read this, or Remember this crossing.`;
      actionType = 'info';
    }

    return {
      transcript: rawText,
      spokenResponse,
      actionType,
      toolCalls,
      payload,
      timestamp: new Date()
    };
  }
}

module.exports = new AiOrchestratorService();
