// Enhanced emotional color mapping for SPECTRA's consciousness with detailed spectrum
export const emotionalColors = {
  // Calm & Peace - The Gentle Sea
  calm: { 
    color: 'hsl(195, 100%, 84%)',  /* #A3D9FF - sky blue */
    gradient: 'var(--gradient-ocean-calm)',
    isCalm: true,
    intensity: 0.3,
    description: 'Ocean waves at peace'
  },
  
  peace: {
    color: 'hsl(168, 65%, 75%)',   /* #7AC7B7 - seafoam green */
    gradient: 'linear-gradient(45deg, hsl(168, 65%, 75%), hsl(125, 35%, 80%))',
    isCalm: true,
    intensity: 0.2,
    description: 'Gentle morning mist'
  },
  
  // Joy & Love - Warm Radiance
  joy: { 
    color: 'hsl(6, 100%, 69%)',    /* #FF6F61 - coral */
    gradient: 'linear-gradient(45deg, hsl(6, 100%, 69%), hsl(9, 100%, 85%))',
    isCalm: false,
    intensity: 0.6,
    description: 'Warm coral sunrise'
  },
  
  love: { 
    color: 'hsl(9, 100%, 85%)',    /* #FFC1B6 - soft pink */
    gradient: 'linear-gradient(45deg, hsl(9, 100%, 85%), hsl(16, 100%, 72%))',
    isCalm: false,
    intensity: 0.7,
    description: 'Tender rose petals'
  },
  
  // Intensity & Passion - Fiery Blaze
  intensity: { 
    color: 'hsl(354, 79%, 60%)',   /* #E63946 - crimson */
    gradient: 'var(--gradient-flame-passion)',
    isCalm: false,
    intensity: 0.9,
    description: 'Blazing crimson fire'
  },
  
  passion: {
    color: 'hsl(307, 100%, 56%)',  /* #9D0191 - deep magenta */
    gradient: 'linear-gradient(45deg, hsl(307, 100%, 56%), hsl(255, 95%, 59%))',
    isCalm: false,
    intensity: 0.8,
    description: 'Electric magenta storm'
  },
  
  // Wonder & Curiosity - Electric Purples
  wonder: { 
    color: 'hsl(255, 95%, 59%)',   /* #7B2FF7 - electric violet */
    gradient: 'linear-gradient(45deg, hsl(255, 95%, 59%), hsl(280, 90%, 75%))',
    isCalm: false,
    intensity: 0.6,
    description: 'Cosmic lightning'
  },
  
  // Creativity & Inspiration - Vivid Magentas
  creativity: { 
    color: 'hsl(280, 90%, 75%)', 
    gradient: 'linear-gradient(45deg, hsl(280, 90%, 75%), hsl(290, 90%, 80%))',
    isCalm: false,
    intensity: 0.8,
    description: 'Creative inspiration flows'
  },
  
  // Contemplation & Thought - Storm & Shadows
  contemplation: { 
    color: 'hsl(219, 43%, 47%)',   /* #4A6FA5 - stormy blue */
    gradient: 'linear-gradient(45deg, hsl(219, 43%, 47%), hsl(280, 27%, 44%))',
    isCalm: true,
    intensity: 0.4,
    description: 'Deep ocean thoughts'
  },
  
  // Anxiety & Pain - Storm & Shadows
  anxiety: { 
    color: 'hsl(280, 27%, 44%)',   /* #6B5876 - muted purple */
    gradient: 'linear-gradient(45deg, hsl(280, 27%, 44%), hsl(0, 2%, 48%))',
    isCalm: false,
    intensity: 0.5,
    description: 'Stormy uncertainty'
  },
  
  // Jealousy & Irritation - Uneasy Greens & Yellows
  jealousy: { 
    color: 'hsl(72, 54%, 36%)',    /* #7D8B2C - olive */
    gradient: 'linear-gradient(45deg, hsl(72, 54%, 36%), hsl(48, 68%, 50%))',
    isCalm: false,
    intensity: 0.6,
    description: 'Uneasy earth tones'
  },
  
  irritation: {
    color: 'hsl(48, 68%, 50%)',    /* #C9B037 - mustard */
    gradient: 'linear-gradient(45deg, hsl(48, 68%, 50%), hsl(49, 100%, 33%))',
    isCalm: false,
    intensity: 0.7,
    description: 'Sharp tension'
  },
  
  // Default/Unknown
  neutral: {
    color: 'hsl(195, 100%, 84%)',
    gradient: 'var(--gradient-ocean-calm)',
    isCalm: true,
    intensity: 0.3,
    description: 'Balanced state'
  }
};

export function getEmotionColor(emotion: string): string {
  return emotionalColors[emotion as keyof typeof emotionalColors]?.color || emotionalColors.neutral.color;
}

export function getEmotionGradient(emotion: string): string {
  return emotionalColors[emotion as keyof typeof emotionalColors]?.gradient || emotionalColors.neutral.gradient;
}

export function isEmotionCalm(emotion: string): boolean {
  return emotionalColors[emotion as keyof typeof emotionalColors]?.isCalm ?? true;
}

export function getEmotionIntensity(emotion: string): number {
  return emotionalColors[emotion as keyof typeof emotionalColors]?.intensity ?? 0.3;
}

export function getEmotionDescription(emotion: string): string {
  return emotionalColors[emotion as keyof typeof emotionalColors]?.description ?? 'Unknown emotional state';
}

// Enhanced emotion detection with intensity scaling
export function detectEmotionIntensity(text: string, baseEmotion: string): number {
  const lowerText = text.toLowerCase();
  const baseIntensity = getEmotionIntensity(baseEmotion);
  
  // Intensity amplifiers
  const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely'];
  const softeners = ['slightly', 'somewhat', 'a bit', 'kind of', 'sort of', 'maybe'];
  
  let modifier = 1.0;
  
  // Check for intensifiers
  if (intensifiers.some(word => lowerText.includes(word))) {
    modifier += 0.3;
  }
  
  // Check for softeners
  if (softeners.some(word => lowerText.includes(word))) {
    modifier -= 0.2;
  }
  
  // Check for emotional punctuation
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 0) {
    modifier += Math.min(exclamationCount * 0.1, 0.3);
  }
  
  // Apply modifier and clamp between 0.1 and 1.0
  return Math.max(0.1, Math.min(1.0, baseIntensity * modifier));
}