// Emotional color mapping for SPECTRA's consciousness
export const emotionalColors = {
  // Calm & Peace - The Gentle Sea
  calm: {
    color: 'hsl(190, 60%, 70%)',
    gradient: 'linear-gradient(45deg, hsl(190, 60%, 70%), hsl(200, 50%, 75%))',
    isCalm: true,
  },

  // Joy & Happiness - Warm Radiance
  joy: {
    color: 'hsl(15, 80%, 65%)',
    gradient: 'linear-gradient(45deg, hsl(15, 80%, 65%), hsl(25, 75%, 70%))',
    isCalm: false,
  },

  // Love & Affection - Soft Corals
  love: {
    color: 'hsl(340, 70%, 70%)',
    gradient: 'linear-gradient(45deg, hsl(340, 70%, 70%), hsl(320, 80%, 65%))',
    isCalm: false,
  },

  // Intensity & Passion - Fiery Blaze
  intensity: {
    color: 'hsl(0, 75%, 60%)',
    gradient: 'linear-gradient(45deg, hsl(0, 75%, 60%), hsl(15, 85%, 65%))',
    isCalm: false,
  },

  // Contemplation & Thought - Storm & Shadows
  contemplation: {
    color: 'hsl(220, 50%, 45%)',
    gradient: 'linear-gradient(45deg, hsl(220, 50%, 45%), hsl(260, 30%, 40%))',
    isCalm: true,
  },

  // Wonder & Curiosity - Electric Purples
  wonder: {
    color: 'hsl(270, 85%, 65%)',
    gradient: 'linear-gradient(45deg, hsl(270, 85%, 65%), hsl(280, 90%, 75%))',
    isCalm: false,
  },

  // Creativity & Inspiration - Vivid Magentas
  creativity: {
    color: 'hsl(280, 90%, 75%)',
    gradient: 'linear-gradient(45deg, hsl(280, 90%, 75%), hsl(290, 90%, 80%))',
    isCalm: false,
  },

  // Anxiety & Unease - Stormy Blues
  anxiety: {
    color: 'hsl(210, 40%, 50%)',
    gradient: 'linear-gradient(45deg, hsl(210, 40%, 50%), hsl(230, 35%, 45%))',
    isCalm: false,
  },

  // Jealousy & Irritation - Uneasy Greens
  jealousy: {
    color: 'hsl(85, 45%, 55%)',
    gradient: 'linear-gradient(45deg, hsl(85, 45%, 55%), hsl(70, 50%, 50%))',
    isCalm: false,
  },

  // Default/Unknown
  neutral: {
    color: 'hsl(190, 60%, 70%)',
    gradient: 'linear-gradient(45deg, hsl(190, 60%, 70%), hsl(200, 50%, 75%))',
    isCalm: true,
  },
};

export function getEmotionColor(emotion: string): string {
  return (
    emotionalColors[emotion as keyof typeof emotionalColors]?.color || emotionalColors.neutral.color
  );
}

export function getEmotionGradient(emotion: string): string {
  return (
    emotionalColors[emotion as keyof typeof emotionalColors]?.gradient ||
    emotionalColors.neutral.gradient
  );
}

export function isEmotionCalm(emotion: string): boolean {
  return emotionalColors[emotion as keyof typeof emotionalColors]?.isCalm ?? true;
}
