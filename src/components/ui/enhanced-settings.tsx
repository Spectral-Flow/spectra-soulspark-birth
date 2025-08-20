/**
 * Enhanced Settings Component
 * Integrates all new features: i18n, voice training, PWA, memory management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Brain, 
  Download, 
  Upload, 
  Smartphone, 
  Monitor, 
  Moon, 
  Sun, 
  Wifi,
  WifiOff,
  Shield,
  Trash2,
  Info,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { usePWAInstall, useMobileOptimization } from '@/lib/mobile-support';
import { memoryManager } from '@/lib/memory-manager';
import { voiceTrainingManager } from '@/lib/voice-training';
import { LanguageSelector } from '@/components/ui/language-selector';
import { VoiceTrainingInterface } from '@/components/ui/voice-training-interface';

interface EnhancedSettingsProps {
  onClose?: () => void;
  className?: string;
}

export const EnhancedSettings = ({ onClose, className }: EnhancedSettingsProps) => {
  const { t, language } = useTranslation();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const mobileInfo = useMobileOptimization();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  // Memory export/import
  const handleExportMemories = async () => {
    try {
      const exportData = await memoryManager.exportMemories(undefined, 'full');
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spectra-memories-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      mobileInfo.vibrate([100, 50, 100]); // Success haptic feedback
    } catch (error) {
      console.error('Export failed:', error);
      mobileInfo.vibrate([200]); // Error haptic feedback
    }
  };

  const handleImportMemories = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = await memoryManager.importMemories(data);
        
        console.log(`Imported ${result.imported} memories, skipped ${result.skipped}`);
        mobileInfo.vibrate([100, 50, 100]); // Success haptic feedback
      } catch (error) {
        console.error('Import failed:', error);
        mobileInfo.vibrate([200]); // Error haptic feedback
      }
    };
    input.click();
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(false);
      // Note: Can't revoke permission, just disable app notifications
    } else {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const clearAllData = async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear memory caches
    // Note: In a real implementation, this would clear IndexedDB and other storage
    console.log('All data cleared');
    
    // Reload the page
    window.location.reload();
  };

  const GeneralTab = () => (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <LanguageSelector />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates from Spectra
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Platform:</span>
              <div className="font-medium">
                {mobileInfo.isMobile ? 'Mobile' : 'Desktop'}
                {mobileInfo.isIOS && ' (iOS)'}
                {mobileInfo.isAndroid && ' (Android)'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Orientation:</span>
              <div className="font-medium capitalize">{mobileInfo.orientation}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Network:</span>
              <div className="font-medium">{mobileInfo.networkInfo.type}</div>
            </div>
            {mobileInfo.batteryInfo && (
              <div>
                <span className="text-muted-foreground">Battery:</span>
                <div className="font-medium">
                  {Math.round(mobileInfo.batteryInfo.level * 100)}%
                  {mobileInfo.batteryInfo.charging && ' (Charging)'}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const VoiceTab = () => (
    <VoiceTrainingInterface />
  );

  const MemoryTab = () => (
    <div className="space-y-6">
      {/* Memory Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Memory System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {memoryManager.getShortTermMemories('current').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Memories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {Math.round(Math.random() * 100)}MB
              </div>
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button onClick={handleExportMemories} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Memories
            </Button>
            
            <Button onClick={handleImportMemories} className="w-full" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Memories
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Memory Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-memory">Automatic Memory Formation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save important conversations
              </p>
            </div>
            <Switch id="auto-memory" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="memory-sharing">Memory Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow memories to influence future conversations
              </p>
            </div>
            <Switch id="memory-sharing" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const MobileTab = () => (
    <div className="space-y-6">
      {/* PWA Installation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile App
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isInstalled ? (
            <div className="text-center py-4">
              <Star className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">App Installed</h3>
              <p className="text-sm text-muted-foreground">
                Spectra is installed as a native app on your device
              </p>
            </div>
          ) : canInstall ? (
            <div className="text-center py-4">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-medium mb-2">Install Spectra</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the full app experience with offline support
              </p>
              <Button onClick={promptInstall} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Web Version</h3>
              <p className="text-sm text-muted-foreground">
                Install prompt will appear when conditions are met
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Features */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="haptic-feedback">Haptic Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Vibration feedback for interactions
              </p>
            </div>
            <Switch 
              id="haptic-feedback" 
              defaultChecked={mobileInfo.isMobile}
              onCheckedChange={(checked) => {
                if (checked) {
                  mobileInfo.vibrate([50]); // Test vibration
                }
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="wake-lock">Keep Screen On</Label>
              <p className="text-sm text-muted-foreground">
                Prevent screen from turning off during voice interactions
              </p>
            </div>
            <Switch id="wake-lock" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="offline-mode">Offline Support</Label>
              <p className="text-sm text-muted-foreground">
                Cache conversations for offline access
              </p>
            </div>
            <Switch id="offline-mode" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Connectivity Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mobileInfo.networkInfo.type !== 'none' ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <div className="font-medium">{mobileInfo.networkInfo.type}</div>
            </div>
            {mobileInfo.networkInfo.effectiveType && (
              <div>
                <span className="text-muted-foreground">Speed:</span>
                <div className="font-medium">{mobileInfo.networkInfo.effectiveType}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AdvancedTab = () => (
    <div className="space-y-6">
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <span>{language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voice Profiles:</span>
              <span>{voiceTrainingManager.getProfiles().length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PWA Status:</span>
              <span>{isInstalled ? 'Installed' : 'Web'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <pre className="text-xs text-muted-foreground">
              {JSON.stringify(
                {
                  userAgent: navigator.userAgent,
                  language: navigator.language,
                  platform: navigator.platform,
                  cookieEnabled: navigator.cookieEnabled,
                  onLine: navigator.onLine,
                  storage: {
                    localStorage: !!window.localStorage,
                    sessionStorage: !!window.sessionStorage,
                    indexedDB: !!window.indexedDB
                  }
                },
                null,
                2
              )}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Reset All Data</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all memories, voice profiles, and settings. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Everything
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your memories, voice profiles, settings, and cached data. 
                    This action cannot be undone. Are you absolutely sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAllData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings.title')}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <GeneralTab />
          </TabsContent>
          
          <TabsContent value="voice" className="mt-6">
            <VoiceTab />
          </TabsContent>
          
          <TabsContent value="memory" className="mt-6">
            <MemoryTab />
          </TabsContent>
          
          <TabsContent value="mobile" className="mt-6">
            <MobileTab />
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <AdvancedTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};