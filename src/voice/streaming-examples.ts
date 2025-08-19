/**
 * ElevenLabs Streaming Examples
 * Demonstrates how to use the streaming functionality similar to Python/Node.js examples
 */

import { ElevenLabsVoiceService, stream } from './elevenlabs_integration';

/**
 * Example 1: Simple streaming playback (similar to Python/Node.js examples)
 */
export async function basicStreamingExample(): Promise<void> {
  const elevenlabs = new ElevenLabsVoiceService({
    apiKey: 'your_api_key_here', // Replace with actual API key
  });

  await elevenlabs.initialize();

  // Generate streaming audio
  const audioStream = await elevenlabs.generateStreamingSpeech(
    "This is a test of ElevenLabs streaming",
    {
      model: "eleven_multilingual_v2"
    }
  );

  // Option 1: Play the streamed audio locally using utility function
  await stream(audioStream);
}

/**
 * Example 2: Manual chunk processing (similar to Python/Node.js examples)
 */
export async function manualChunkProcessingExample(): Promise<void> {
  const elevenlabs = new ElevenLabsVoiceService({
    apiKey: 'your_api_key_here', // Replace with actual API key
  });

  await elevenlabs.initialize();

  // Option 2: Process the audio chunks manually
  const audioChunks = elevenlabs.streamAudioChunks(
    "This is a test of manual chunk processing",
    {
      model: "eleven_multilingual_v2"
    }
  );

  for await (const chunk of audioChunks) {
    if (chunk instanceof Uint8Array) {
      console.log('Received audio chunk:', chunk.length, 'bytes');
      // Process individual chunks here
      // You could save to file, send over network, etc.
    }
  }
}

/**
 * Example 3: Real-time streaming with the enhanced playStreamingAudio method
 */
export async function realTimeStreamingExample(): Promise<void> {
  const elevenlabs = new ElevenLabsVoiceService({
    apiKey: 'your_api_key_here', // Replace with actual API key
  });

  await elevenlabs.initialize();

  const audioStream = await elevenlabs.generateStreamingSpeech(
    "This demonstrates real-time streaming with lower latency",
    {
      model: "eleven_multilingual_v2"
    }
  );

  // Use the enhanced streaming playback with chunk-by-chunk processing
  await elevenlabs.playStreamingAudio(audioStream);
}

/**
 * Example 4: Streaming with emotion and voice settings
 */
export async function emotionalStreamingExample(): Promise<void> {
  const elevenlabs = new ElevenLabsVoiceService({
    apiKey: 'your_api_key_here', // Replace with actual API key
  });

  await elevenlabs.initialize();

  // Get emotion-specific voice settings
  const voiceSettings = elevenlabs.getSpectraVoiceSettings('excited');

  const audioStream = await elevenlabs.generateStreamingSpeech(
    "I'm so excited to demonstrate emotional streaming!",
    voiceSettings
  );

  // Stream with emotion
  await stream(audioStream);
}

/**
 * Example 5: Error handling and fallback for streaming
 */
export async function streamingWithFallbackExample(): Promise<void> {
  const elevenlabs = new ElevenLabsVoiceService({
    apiKey: 'your_api_key_here', // Replace with actual API key
  });

  try {
    await elevenlabs.initialize();

    // Try streaming first
    const text = "Testing streaming with automatic fallback";
    await elevenlabs.speak(text, 'calm', true); // useStreaming = true

  } catch (streamingError) {
    console.warn('Streaming failed, trying standard TTS:', streamingError);

    try {
      // Fallback to standard TTS
      const text = "Fallback to standard TTS";
      await elevenlabs.speak(text, 'calm', false); // useStreaming = false

    } catch (standardError) {
      console.error('Both streaming and standard TTS failed:', standardError);
      throw standardError;
    }
  }
}

/**
 * Example 6: Concurrent streaming (multiple streams)
 */
export async function concurrentStreamingExample(): Promise<void> {
  const elevenlabs = new ElevenLabsVoiceService({
    apiKey: 'your_api_key_here', // Replace with actual API key
  });

  await elevenlabs.initialize();

  // Start multiple streams concurrently
  const streams = await Promise.all([
    elevenlabs.generateStreamingSpeech("First stream", { model: "eleven_multilingual_v2" }),
    elevenlabs.generateStreamingSpeech("Second stream", { model: "eleven_multilingual_v2" }),
    elevenlabs.generateStreamingSpeech("Third stream", { model: "eleven_multilingual_v2" })
  ]);

  // Process all streams concurrently
  await Promise.all(streams.map(stream => elevenlabs.playStreamingAudio(stream)));
}

/**
 * Demo function that runs all examples
 */
export async function runStreamingExamples(): Promise<void> {
  console.log('🌊 Running ElevenLabs Streaming Examples...');

  try {
    console.log('1. Basic Streaming Example');
    await basicStreamingExample();

    console.log('2. Manual Chunk Processing Example');
    await manualChunkProcessingExample();

    console.log('3. Real-time Streaming Example');
    await realTimeStreamingExample();

    console.log('4. Emotional Streaming Example');
    await emotionalStreamingExample();

    console.log('5. Streaming with Fallback Example');
    await streamingWithFallbackExample();

    console.log('6. Concurrent Streaming Example');
    await concurrentStreamingExample();

    console.log('✅ All streaming examples completed successfully!');

  } catch (error) {
    console.error('❌ Streaming examples failed:', error);
    throw error;
  }
}