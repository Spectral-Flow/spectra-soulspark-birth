/**
 * Language Selector Component with Voice Integration
 * Provides multi-language support for Spectra
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, Globe, Volume2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation, type SupportedLanguage, type LanguageConfig } from '@/lib/i18n';

interface LanguageSelectorProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
  showVoicePreview?: boolean;
  className?: string;
}

export const LanguageSelector = ({ 
  onLanguageChange, 
  showVoicePreview = true,
  className 
}: LanguageSelectorProps) => {
  const { t, language, changeLanguage, supportedLanguages, isRTL } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const handleLanguageSelect = async (newLanguage: SupportedLanguage) => {
    if (newLanguage === language) return;

    setIsChanging(true);
    try {
      await changeLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const previewVoice = async (langConfig: LanguageConfig) => {
    if (!showVoicePreview || previewingVoice) return;

    setPreviewingVoice(langConfig.code);
    
    try {
      // Create a sample text in the selected language
      const sampleTexts: Record<string, string> = {
        'en': 'Hello, I am Spectra. How can I help you today?',
        'es': 'Hola, soy Spectra. ¿Cómo puedo ayudarte hoy?',
        'fr': 'Bonjour, je suis Spectra. Comment puis-je vous aider aujourd\'hui?',
        'de': 'Hallo, ich bin Spectra. Wie kann ich Ihnen heute helfen?',
        'it': 'Ciao, sono Spectra. Come posso aiutarti oggi?',
        'pt': 'Olá, eu sou Spectra. Como posso ajudá-lo hoje?',
        'ru': 'Привет, я Спектра. Как я могу помочь вам сегодня?',
        'ja': 'こんにちは、私はスペクトラです。今日はどのようにお手伝いできますか？',
        'ko': '안녕하세요, 저는 스펙트라입니다. 오늘 어떻게 도와드릴까요?',
        'zh': '你好，我是 Spectra。今天我可以如何帮助您？',
        'ar': 'مرحبا، أنا سبكترا. كيف يمكنني مساعدتك اليوم؟',
        'hi': 'नमस्ते, मैं स्पेक्ट्रा हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?'
      };

      const sampleText = sampleTexts[langConfig.code] || sampleTexts['en'];

      // Use Web Speech API for voice preview
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.lang = langConfig.voiceCode;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        utterance.onend = () => {
          setPreviewingVoice(null);
        };

        utterance.onerror = () => {
          setPreviewingVoice(null);
        };

        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error previewing voice:', error);
      setPreviewingVoice(null);
    }
  };

  const stopVoicePreview = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setPreviewingVoice(null);
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('settings.language')}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {supportedLanguages.map((langConfig) => {
              const isSelected = langConfig.code === language;
              const isPreviewing = previewingVoice === langConfig.code;
              
              return (
                <div
                  key={langConfig.code}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected && "border-primary bg-primary/10",
                    !isSelected && "hover:bg-muted/50"
                  )}
                  onClick={() => handleLanguageSelect(langConfig.code)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{langConfig.flag}</span>
                    <div>
                      <div className="font-medium">
                        {langConfig.nativeName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {langConfig.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* RTL indicator */}
                    {langConfig.direction === 'rtl' && (
                      <Badge variant="outline" className="text-xs">
                        RTL
                      </Badge>
                    )}
                    
                    {/* Voice preview button */}
                    {showVoicePreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPreviewing) {
                            stopVoicePreview();
                          } else {
                            previewVoice(langConfig);
                          }
                        }}
                        disabled={isChanging}
                      >
                        {isPreviewing ? (
                          <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <Separator className="my-4" />
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{t('settings.language')}</span>
            <Badge variant="outline">
              {supportedLanguages.find(l => l.code === language)?.nativeName}
            </Badge>
          </div>
          
          {isRTL && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Globe className="w-4 h-4" />
              <span>Right-to-left text direction active</span>
            </div>
          )}
          
          {isChanging && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Changing language...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};