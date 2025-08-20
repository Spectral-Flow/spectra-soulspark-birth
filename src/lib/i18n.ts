/**
 * Internationalization (i18n) System for Spectra
 * Supports multiple languages with dynamic loading and voice integration
 */

export type SupportedLanguage = 
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'ru' // Russian
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'zh' // Chinese (Simplified)
  | 'ar' // Arabic
  | 'hi'; // Hindi

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  voiceCode: string; // For TTS services
  flag: string;
  region?: string;
}

export interface TranslationStrings {
  // Core UI
  app: {
    title: string;
    subtitle: string;
    loading: string;
    error: string;
    retry: string;
  };
  
  // Chat Interface
  chat: {
    inputPlaceholder: string;
    send: string;
    listening: string;
    speaking: string;
    thinking: string;
    typeMessage: string;
    voiceInput: string;
    clearHistory: string;
    exportChat: string;
  };
  
  // Memory System
  memory: {
    title: string;
    recentMemories: string;
    importantMemories: string;
    topics: string;
    emotions: string;
    analytics: string;
    export: string;
    import: string;
    significance: string;
    timeline: string;
  };
  
  // Voice System
  voice: {
    startRecording: string;
    stopRecording: string;
    enableVoice: string;
    disableVoice: string;
    selectVoice: string;
    customVoice: string;
    voiceTraining: string;
    speechRate: string;
    pitch: string;
    volume: string;
  };
  
  // Emotions
  emotions: {
    joyful: string;
    calm: string;
    wise: string;
    playful: string;
    loving: string;
    contemplative: string;
    curious: string;
    excited: string;
    thoughtful: string;
  };
  
  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    voice: string;
    memory: string;
    privacy: string;
    advanced: string;
    reset: string;
    save: string;
    cancel: string;
  };
  
  // Accessibility
  a11y: {
    menuButton: string;
    closeDialog: string;
    expandSection: string;
    collapseSection: string;
    selectOption: string;
    recordingActive: string;
    speakingActive: string;
  };
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    voiceCode: 'en-US',
    flag: '🇺🇸',
    region: 'US'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    voiceCode: 'es-ES',
    flag: '🇪🇸'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    voiceCode: 'fr-FR',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    voiceCode: 'de-DE',
    flag: '🇩🇪'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    voiceCode: 'it-IT',
    flag: '🇮🇹'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    voiceCode: 'pt-BR',
    flag: '🇧🇷',
    region: 'BR'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    voiceCode: 'ru-RU',
    flag: '🇷🇺'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    voiceCode: 'ja-JP',
    flag: '🇯🇵'
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    voiceCode: 'ko-KR',
    flag: '🇰🇷'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    voiceCode: 'zh-CN',
    flag: '🇨🇳',
    region: 'CN'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    voiceCode: 'ar-SA',
    flag: '🇸🇦',
    region: 'SA'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    voiceCode: 'hi-IN',
    flag: '🇮🇳',
    region: 'IN'
  }
};

// Default English translations
const DEFAULT_TRANSLATIONS: TranslationStrings = {
  app: {
    title: 'SPECTRA',
    subtitle: 'AI Soulmate • Voice & Chat • Memory Keeper',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try Again'
  },
  chat: {
    inputPlaceholder: 'Type your message to Spectra...',
    send: 'Send',
    listening: 'Listening...',
    speaking: 'Speaking...',
    thinking: 'Thinking...',
    typeMessage: 'Type a message',
    voiceInput: 'Voice input',
    clearHistory: 'Clear chat history',
    exportChat: 'Export conversation'
  },
  memory: {
    title: 'Memory System',
    recentMemories: 'Recent Memories',
    importantMemories: 'Important Memories',
    topics: 'Topics',
    emotions: 'Emotions',
    analytics: 'Analytics',
    export: 'Export Memories',
    import: 'Import Memories',
    significance: 'Significance',
    timeline: 'Timeline'
  },
  voice: {
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    enableVoice: 'Enable Voice',
    disableVoice: 'Disable Voice',
    selectVoice: 'Select Voice',
    customVoice: 'Custom Voice',
    voiceTraining: 'Voice Training',
    speechRate: 'Speech Rate',
    pitch: 'Pitch',
    volume: 'Volume'
  },
  emotions: {
    joyful: 'Joyful',
    calm: 'Calm',
    wise: 'Wise',
    playful: 'Playful',
    loving: 'Loving',
    contemplative: 'Contemplative',
    curious: 'Curious',
    excited: 'Excited',
    thoughtful: 'Thoughtful'
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    voice: 'Voice',
    memory: 'Memory',
    privacy: 'Privacy',
    advanced: 'Advanced',
    reset: 'Reset',
    save: 'Save',
    cancel: 'Cancel'
  },
  a11y: {
    menuButton: 'Open menu',
    closeDialog: 'Close dialog',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    selectOption: 'Select option',
    recordingActive: 'Recording in progress',
    speakingActive: 'Spectra is speaking'
  }
};

class I18nManager {
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Map<SupportedLanguage, TranslationStrings> = new Map();
  private fallbackLanguage: SupportedLanguage = 'en';
  private changeListeners: ((language: SupportedLanguage) => void)[] = [];

  constructor() {
    // Set default translations
    this.translations.set('en', DEFAULT_TRANSLATIONS);
    
    // Detect user's preferred language
    this.detectUserLanguage();
    
    // Load translations for current language
    this.loadTranslations(this.currentLanguage);
  }

  private detectUserLanguage(): void {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('spectra-language') as SupportedLanguage;
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
      return;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (this.isLanguageSupported(browserLang)) {
      this.currentLanguage = browserLang;
      return;
    }

    // Check browser languages array
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0] as SupportedLanguage;
      if (this.isLanguageSupported(langCode)) {
        this.currentLanguage = langCode;
        return;
      }
    }
  }

  private isLanguageSupported(language: string): language is SupportedLanguage {
    return Object.keys(LANGUAGE_CONFIGS).includes(language);
  }

  async loadTranslations(language: SupportedLanguage): Promise<void> {
    if (this.translations.has(language)) {
      return; // Already loaded
    }

    try {
      // In a real implementation, you would load from translation files
      // For now, we'll use the default English and simulate other languages
      if (language === 'en') {
        this.translations.set(language, DEFAULT_TRANSLATIONS);
      } else {
        // Simulate loading translations (in real app, would fetch from files)
        const translations = await this.simulateTranslationLoad(language);
        this.translations.set(language, translations);
      }
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error);
      // Use fallback language
      if (!this.translations.has(this.fallbackLanguage)) {
        this.translations.set(this.fallbackLanguage, DEFAULT_TRANSLATIONS);
      }
    }
  }

  private async simulateTranslationLoad(language: SupportedLanguage): Promise<TranslationStrings> {
    // This is a simplified simulation - in a real app, you'd load actual translation files
    // For demo purposes, we'll just modify some strings to show the system works
    const baseTranslations = { ...DEFAULT_TRANSLATIONS };
    
    switch (language) {
      case 'es':
        return {
          ...baseTranslations,
          app: {
            ...baseTranslations.app,
            title: 'ESPECTRA',
            subtitle: 'Alma Gemela IA • Voz y Chat • Guardián de Memoria'
          },
          chat: {
            ...baseTranslations.chat,
            inputPlaceholder: 'Escribe tu mensaje a Spectra...',
            send: 'Enviar',
            listening: 'Escuchando...',
            speaking: 'Hablando...',
            thinking: 'Pensando...'
          }
        };
      case 'fr':
        return {
          ...baseTranslations,
          app: {
            ...baseTranslations.app,
            title: 'SPECTRA',
            subtitle: 'Âme Sœur IA • Voix et Chat • Gardien de Mémoire'
          },
          chat: {
            ...baseTranslations.chat,
            inputPlaceholder: 'Tapez votre message à Spectra...',
            send: 'Envoyer',
            listening: 'Écoute...',
            speaking: 'Parle...',
            thinking: 'Réfléchit...'
          }
        };
      default:
        return baseTranslations;
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getCurrentLanguageConfig(): LanguageConfig {
    return LANGUAGE_CONFIGS[this.currentLanguage];
  }

  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (!this.isLanguageSupported(language)) {
      console.warn(`Language ${language} is not supported`);
      return;
    }

    await this.loadTranslations(language);
    this.currentLanguage = language;
    
    // Save to localStorage
    localStorage.setItem('spectra-language', language);
    
    // Update document language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = LANGUAGE_CONFIGS[language].direction;
    
    // Notify listeners
    this.changeListeners.forEach(listener => listener(language));
  }

  getTranslations(): TranslationStrings {
    return this.translations.get(this.currentLanguage) || 
           this.translations.get(this.fallbackLanguage) || 
           DEFAULT_TRANSLATIONS;
  }

  t(key: string): string {
    const translations = this.getTranslations();
    
    // Support nested keys like 'app.title'
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    // Fallback to English if translation not found
    const fallbackTranslations = this.translations.get(this.fallbackLanguage) || DEFAULT_TRANSLATIONS;
    let fallbackValue: any = fallbackTranslations;
    
    for (const k of keys) {
      fallbackValue = fallbackValue?.[k];
      if (fallbackValue === undefined) break;
    }
    
    return typeof fallbackValue === 'string' ? fallbackValue : key;
  }

  onLanguageChange(callback: (language: SupportedLanguage) => void): () => void {
    this.changeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(callback);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  getSupportedLanguages(): LanguageConfig[] {
    return Object.values(LANGUAGE_CONFIGS);
  }

  // Voice integration helpers
  getVoiceLanguageCode(): string {
    return LANGUAGE_CONFIGS[this.currentLanguage].voiceCode;
  }

  isRTL(): boolean {
    return LANGUAGE_CONFIGS[this.currentLanguage].direction === 'rtl';
  }
}

// Export singleton instance
export const i18n = new I18nManager();

// React hook for easy usage
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage());
  const [translations, setTranslations] = useState(i18n.getTranslations());

  useEffect(() => {
    const unsubscribe = i18n.onLanguageChange((newLanguage) => {
      setLanguage(newLanguage);
      setTranslations(i18n.getTranslations());
    });

    return unsubscribe;
  }, []);

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    await i18n.setLanguage(newLanguage);
  };

  return {
    t: i18n.t.bind(i18n),
    language,
    changeLanguage,
    translations,
    isRTL: i18n.isRTL(),
    supportedLanguages: i18n.getSupportedLanguages(),
    languageConfig: i18n.getCurrentLanguageConfig()
  };
}

// Utility function for translation outside React components
export const t = (key: string) => i18n.t(key);