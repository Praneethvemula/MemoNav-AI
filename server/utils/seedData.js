const { MemoryRepo, JourneyRepo, SavedPlaceRepo, EmergencyContactRepo, UserPreferenceRepo } = require('../models');

async function seedUserData(userId) {
  // Check if memories exist
  const existingMemories = await MemoryRepo.find({ userId });
  if (existingMemories.length > 0) return;

  console.log(`[Seed] Initializing initial accessibility data & memories for user ${userId}`);

  // Base sample coordinates around Hyderabad / generic urban area (17.3850, 78.4867)
  const baseLat = 17.3850;
  const baseLon = 78.4867;

  // 1. Seed Memories
  const memoriesToSeed = [
    {
      userId,
      type: 'difficult_crossing',
      title: 'Crowded crossing near City Hospital',
      description: 'User experienced difficulty crossing because of heavy crowd and rapid traffic.',
      location: 'Main Hospital Road Crosswalk',
      latitude: baseLat + 0.0025,
      longitude: baseLon + 0.0020,
      importance: 5,
      tags: ['crossing', 'crowded', 'traffic', 'DEMO DATA'],
      source: 'local_mongo',
      confidence: 0.98
    },
    {
      userId,
      type: 'instruction',
      title: 'Hospital entrance is on the left',
      description: 'Main pedestrian ramp entrance is 15 meters on the left side past the emergency bay.',
      location: 'City Hospital West Gate',
      latitude: baseLat + 0.0050,
      longitude: baseLon + 0.0040,
      importance: 4,
      tags: ['hospital', 'entrance', 'ramp', 'DEMO DATA'],
      source: 'local_mongo',
      confidence: 0.95
    },
    {
      userId,
      type: 'obstacle',
      title: 'Broken tactile paving tile',
      description: 'Uneven paving tile right before metro entrance stairs.',
      location: 'Central Metro Exit B',
      latitude: baseLat - 0.0015,
      longitude: baseLon - 0.0010,
      importance: 4,
      tags: ['obstacle', 'tactile_paving', 'DEMO DATA'],
      source: 'local_mongo',
      confidence: 0.92
    },
    {
      userId,
      type: 'preference',
      title: 'Preferred short voice instructions',
      description: 'User prefers concise, essential verbal navigation cues without filler phrases.',
      location: 'General Profile',
      importance: 4,
      tags: ['preference', 'audio', 'DEMO DATA'],
      source: 'local_mongo',
      confidence: 1.0
    },
    {
      userId,
      type: 'safety',
      title: 'Well-lit pedestrian pathway',
      description: 'Safe, quiet, illuminated side street suitable for evening walking.',
      location: 'Park Lane East',
      latitude: baseLat - 0.0030,
      longitude: baseLon + 0.0020,
      importance: 3,
      tags: ['safety', 'lighting', 'DEMO DATA'],
      source: 'local_mongo',
      confidence: 0.90
    }
  ];

  for (const mem of memoriesToSeed) {
    await MemoryRepo.create(mem);
  }

  // 2. Seed Saved Places
  const places = [
    {
      userId,
      name: 'City General Hospital',
      address: '42 Health Boulevard',
      latitude: baseLat + 0.0055,
      longitude: baseLon + 0.0042,
      category: 'hospital',
      icon: 'Building2',
      notes: 'Accessible entrance has audible chime beacon.'
    },
    {
      userId,
      name: 'Central Metro Station',
      address: 'Station Plaza East',
      latitude: baseLat - 0.0018,
      longitude: baseLon - 0.0012,
      category: 'transit',
      icon: 'Train',
      notes: 'Elevator located at Exit C.'
    },
    {
      userId,
      name: 'Home',
      address: '14 Elmwood Court, Apt 3B',
      latitude: baseLat,
      longitude: baseLon,
      category: 'home',
      icon: 'Home',
      notes: 'Three steps to front porch.'
    }
  ];

  for (const pl of places) {
    await SavedPlaceRepo.create(pl);
  }

  // 3. Seed Emergency Contacts
  const emergencyContacts = [
    {
      userId,
      name: 'Sarah Chen (Sister)',
      relationship: 'Primary Caregiver',
      phoneNumber: '+1-555-019-2834',
      email: 'sarah.care@example.com',
      isPrimary: true
    },
    {
      userId,
      name: 'City Accessibility Response Unit',
      relationship: 'Support Service',
      phoneNumber: '+1-800-555-9110',
      email: 'dispatch@accessibility.org',
      isPrimary: false
    }
  ];

  for (const c of emergencyContacts) {
    await EmergencyContactRepo.create(c);
  }

  // 4. Seed Past Journeys
  const journey = await JourneyRepo.create({
    userId,
    startLocation: { name: 'Home', latitude: baseLat, longitude: baseLon },
    destination: { name: 'City Hospital', latitude: baseLat + 0.0055, longitude: baseLon + 0.0042 },
    distance: 820,
    startTime: new Date(Date.now() - 86400000), // yesterday
    endTime: new Date(Date.now() - 86400000 + 1200000), // 20 mins later
    status: 'completed',
    importantEvents: [
      {
        timeString: '10:30 AM',
        timestamp: new Date(Date.now() - 86400000),
        type: 'started',
        description: 'Started journey to City Hospital'
      },
      {
        timeString: '10:36 AM',
        timestamp: new Date(Date.now() - 86400000 + 360000),
        type: 'crossing_warning',
        description: 'Crowded crossing encountered on Main Hospital Road'
      },
      {
        timeString: '10:37 AM',
        timestamp: new Date(Date.now() - 86400000 + 420000),
        type: 'user_reported',
        description: 'User reported difficulty crossing due to crowd'
      },
      {
        timeString: '10:38 AM',
        timestamp: new Date(Date.now() - 86400000 + 480000),
        type: 'memory_created',
        description: 'Experience stored in persistent memory'
      },
      {
        timeString: '10:50 AM',
        timestamp: new Date(Date.now() - 86400000 + 1200000),
        type: 'completed',
        description: 'Arrived safely at City Hospital'
      }
    ]
  });

  // 5. User Preferences
  await UserPreferenceRepo.updateOrCreate(userId, {
    language: 'English',
    voiceSpeed: 'normal',
    instructionStyle: 'short',
    voiceVolume: 1.0,
    enableMemory: true,
    highContrast: false,
    largeText: false,
    reducedAnimation: false,
    vibrationFeedback: true,
    hindsightSync: true
  });
}

module.exports = { seedUserData };
