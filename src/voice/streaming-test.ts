/**
 * Simple test to verify streaming functionality
 * This can be run in a browser environment with ElevenLabs API key
 */

import { ElevenLabsVoiceService, stream } from './elevenlabs_integration';

/**
 * Test the streaming functionality
 */
export async function testStreaming(): Promise<boolean> {
  try {
    console.log('🧪 Testing ElevenLabs streaming functionality...');

    // Create a mock ElevenLabs service for testing
    const testService = new ElevenLabsVoiceService({
      apiKey: 'test-key', // This would need to be a real key for actual testing
    });

    // Test 1: Check if streaming methods exist
    console.log('✅ Testing method existence...');
    
    if (typeof testService.generateStreamingSpeech !== 'function') {
      throw new Error('generateStreamingSpeech method missing');
    }
    
    if (typeof testService.playStreamingAudio !== 'function') {
      throw new Error('playStreamingAudio method missing');
    }
    
    if (typeof testService.streamAudioChunks !== 'function') {
      throw new Error('streamAudioChunks method missing');
    }

    // Test 2: Check if utility function exists
    if (typeof stream !== 'function') {
      throw new Error('stream utility function missing');
    }

    console.log('✅ All streaming methods and utilities are available');

    // Test 3: Test async iteration support
    console.log('✅ Testing async iteration...');
    
    // This would require a real API key to test fully
    // For now, we just verify the method returns an async iterable
    const mockAsyncIterable = testService.streamAudioChunks("test", {});
    
    if (typeof mockAsyncIterable[Symbol.asyncIterator] !== 'function') {
      throw new Error('streamAudioChunks does not return async iterable');
    }

    console.log('✅ Async iteration support verified');

    // Test 4: Test voice settings integration
    console.log('✅ Testing voice settings integration...');
    
    const emotionSettings = testService.getSpectraVoiceSettings('excited');
    
    if (!emotionSettings || typeof emotionSettings !== 'object') {
      throw new Error('Voice settings not working properly');
    }

    console.log('✅ Voice settings integration working');

    console.log('🎉 All streaming functionality tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Streaming test failed:', error);
    return false;
  }
}

/**
 * Test helper for browser environments
 */
export function testStreamingInBrowser(): void {
  // This can be called from browser console
  testStreaming().then(success => {
    if (success) {
      console.log('🎉 Streaming implementation is ready!');
    } else {
      console.log('❌ Streaming implementation has issues');
    }
  });
}

// Make it available globally for browser testing
if (typeof window !== 'undefined') {
  (window as unknown as { testElevenLabsStreaming: typeof testStreamingInBrowser }).testElevenLabsStreaming = testStreamingInBrowser;
}