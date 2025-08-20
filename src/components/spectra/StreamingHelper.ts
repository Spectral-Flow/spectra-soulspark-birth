import { spectraAI } from './AIEngine';

// Function to stream AI response with dynamic mood updates
export async function streamAIResponse(
  userMessage: string,
  setMood: (mood: string) => void
): Promise<string> {
  return new Promise((resolve) => {
    let fullResponse = '';
    
    spectraAI.generateStreamingResponse(
      userMessage,
      undefined, // context - can be expanded later
      (chunk: string) => {
        // This would update the UI incrementally in a real streaming implementation
        fullResponse = chunk;
      },
      (emotion) => {
        // Update mood dynamically based on AI's emotional analysis
        setMood(emotion.primary);
      }
    ).then((result) => {
      resolve(result.text);
    }).catch((error) => {
      console.error('Streaming AI response failed:', error);
      resolve("I'm sorry, I encountered an issue. Could you try again?");
    });
  });
}

// Simple utility to map emotion to mood colors
export function getMoodColor(mood: string): string {
  const moodColors: Record<string, string> = {
    neutral: 'blue',
    happy: 'yellow',
    sad: 'blue',
    excited: 'purple',
    calm: 'green',
    curious: 'teal',
    love: 'pink',
    joy: 'orange',
    wonder: 'indigo',
    contemplation: 'gray',
    intensity: 'red'
  };
  
  return moodColors[mood] || 'blue';
}