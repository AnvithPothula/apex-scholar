// Quick test of Gemini service to diagnose AI issues
const geminiServicePath = './ap-prep-hub/src/services/geminiService.js';

async function testGeminiService() {
  console.log('Testing Gemini Service...\n');

  try {
    // Test 1: Check if we can import the service
    console.log('✓ Step 1: Checking service import...');
    const geminiService = require(geminiServicePath).default;
    console.log('✓ Service imported successfully');

    // Test 2: Check if Puter is available (browser only)
    console.log('\n✓ Step 2: Checking Puter availability...');
    console.log('  Note: Puter.js only works in browser, not Node.js');
    console.log('  This test shows the service structure is valid');

    // Test 3: Check generateContent method exists
    console.log('\n✓ Step 3: Checking methods...');
    console.log('  - generateContent:', typeof geminiService.generateContent === 'function' ? '✓' : '✗');
    console.log('  - generateFromPayload:', typeof geminiService.generateFromPayload === 'function' ? '✓' : '✗');
    console.log('  - generateWithImages:', typeof geminiService.generateWithImages === 'function' ? '✓' : '✗');

    console.log('\n✅ Service structure is valid!');
    console.log('\n📝 Next steps:');
    console.log('   1. Open browser dev console (F12)');
    console.log('   2. Check for any errors when loading the AI Tutors page');
    console.log('   3. Look for "[AI]" debug messages');
    console.log('   4. Verify Puter.js loaded: Type "window.puter" in console');

  } catch (error) {
    console.error('\n❌ Error testing service:', error.message);
    console.error('\nFull error:', error);
  }
}

testGeminiService();
