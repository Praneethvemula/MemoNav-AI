const assert = require('assert');
const { connectDB } = require('../config/db');
const authController = require('../controllers/authController');
const MemoryService = require('../services/MemoryService');
const AiOrchestratorService = require('../services/AiOrchestratorService');
const { UserPreferenceRepo, JourneyRepo } = require('../models');

async function runTests() {
  console.log('🧪 Starting MemoNav AI Backend Automated Tests...');
  await connectDB();

  // Test 1: Memory creation and retrieval
  const testUserId = 'test_user_' + Date.now();
  const memory = await MemoryService.createMemory(testUserId, {
    type: 'difficult_crossing',
    title: 'Hospital South Crosswalk',
    description: 'Heavy crowd during morning shift change.',
    latitude: 17.3855,
    longitude: 78.4870,
    importance: 5,
    tags: ['crossing', 'hospital']
  });

  assert(memory, 'Memory should be created');
  assert.strictEqual(memory.title, 'Hospital South Crosswalk');
  console.log('  ✅ Test 1 Passed: Memory created successfully');

  // Test 2: Spatial Memory Recall
  const nearby = await MemoryService.getNearbyMemories(testUserId, 17.3856, 78.4871, 100);
  assert(nearby.length > 0, 'Should locate nearby memory');
  assert.strictEqual(nearby[0].title, 'Hospital South Crosswalk');
  console.log('  ✅ Test 2 Passed: Nearby memory proximity lookup successful');

  // Test 3: Preference update
  const updatedPref = await UserPreferenceRepo.updateOrCreate(testUserId, {
    language: 'Telugu',
    voiceSpeed: 'fast',
    instructionStyle: 'short'
  });
  assert.strictEqual(updatedPref.language, 'Telugu');
  console.log('  ✅ Test 3 Passed: User preferences saved and retrieved');

  // Test 4: Journey Timeline creation
  const journey = await JourneyRepo.create({
    userId: testUserId,
    startLocation: { name: 'Home', latitude: 17.3850, longitude: 78.4867 },
    destination: { name: 'City Hospital', latitude: 17.3910, longitude: 78.4920 },
    distance: 750
  });
  assert(journey, 'Journey created');

  const withEvent = await JourneyRepo.addEvent(journey._id || journey.id, {
    type: 'crossing_warning',
    description: 'Approaching crowded crosswalk. Slow down.'
  });
  assert(withEvent.importantEvents.length > 0, 'Event added to journey');
  console.log('  ✅ Test 4 Passed: Journey timeline and event logging verified');

  // Test 5: AI Orchestrator Navigation Tool selection
  const navCommand = await AiOrchestratorService.processCommand(testUserId, {
    text: 'Navigate me to the hospital',
    location: { lat: 17.3850, lon: 78.4867 }
  });
  assert.strictEqual(navCommand.actionType, 'start_navigation');
  assert(navCommand.toolCalls.some(t => t.tool === 'getRoute'), 'Tool getRoute should be called');
  console.log('  ✅ Test 5 Passed: AI Orchestrator properly triggers navigation tools');

  // Test 6: AI Orchestrator Memory Storage Tool selection
  const memoryCommand = await AiOrchestratorService.processCommand(testUserId, {
    text: 'Crossing here is difficult because it is crowded',
    location: { lat: 17.3855, lon: 78.4870 }
  });
  assert.strictEqual(memoryCommand.actionType, 'memory_saved');
  assert(memoryCommand.toolCalls.some(t => t.tool === 'saveMemory'), 'Tool saveMemory should be called');
  console.log('  ✅ Test 6 Passed: AI Orchestrator autonomous memory extraction verified');

  // Test 7: AI Orchestrator Emergency protocol
  const emergencyCommand = await AiOrchestratorService.processCommand(testUserId, {
    text: 'Help me emergency',
    location: { lat: 17.3850, lon: 78.4867 }
  });
  assert.strictEqual(emergencyCommand.actionType, 'emergency');
  console.log('  ✅ Test 7 Passed: AI Orchestrator emergency handling verified');

  console.log('\n🎉 ALL 7 BACKEND TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
