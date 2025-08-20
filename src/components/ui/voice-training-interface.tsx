/**
 * Voice Training Interface Component
 * Allows users to create and train custom voice models for Spectra
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Mic, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Check, 
  X, 
  Brain,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  voiceTrainingManager, 
  type VoiceProfile, 
  type TrainingProgress,
  TRAINING_SCRIPTS
} from '@/lib/voice-training';
import { useTranslation } from '@/lib/i18n';

interface VoiceTrainingInterfaceProps {
  onProfileCreated?: (profile: VoiceProfile) => void;
  onProfileSelected?: (profile: VoiceProfile) => void;
  className?: string;
}

export const VoiceTrainingInterface = ({ 
  onProfileCreated,
  onProfileSelected,
  className 
}: VoiceTrainingInterfaceProps) => {
  const { t } = useTranslation();
  
  // State management
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentScript, setCurrentScript] = useState('');
  const [scriptIndex, setScriptIndex] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');
  
  // New profile form state
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [newProfileLanguage, setNewProfileLanguage] = useState('en-US');
  const [newProfileGender, setNewProfileGender] = useState<'male' | 'female' | 'neutral'>('female');
  const [newProfileAge, setNewProfileAge] = useState<'young' | 'adult' | 'mature'>('adult');
  const [newProfileStyle, setNewProfileStyle] = useState<'conversational' | 'narration' | 'expressive' | 'calm'>('conversational');
  const [newProfileAccent, setNewProfileAccent] = useState('standard');

  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  // Update recording duration
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Update training progress
  useEffect(() => {
    if (selectedProfile && selectedProfile.status === 'training') {
      const interval = setInterval(() => {
        const progress = voiceTrainingManager.getTrainingProgress(selectedProfile.id);
        setTrainingProgress(progress);
        
        if (progress?.stage === 'complete' || progress?.stage === 'error') {
          clearInterval(interval);
          loadProfiles(); // Refresh profiles to get updated status
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedProfile]);

  const loadProfiles = () => {
    const allProfiles = voiceTrainingManager.getProfiles();
    setProfiles(allProfiles);
    
    // Update selected profile if it exists
    if (selectedProfile) {
      const updated = allProfiles.find(p => p.id === selectedProfile.id);
      if (updated) {
        setSelectedProfile(updated);
      }
    }
  };

  const createNewProfile = () => {
    if (!newProfileName.trim()) return;

    const profile = voiceTrainingManager.createProfile(
      newProfileName,
      newProfileDescription,
      newProfileLanguage,
      {
        gender: newProfileGender,
        age: newProfileAge,
        accent: newProfileAccent,
        style: newProfileStyle
      }
    );

    setSelectedProfile(profile);
    loadProfiles();
    onProfileCreated?.(profile);
    
    // Reset form
    setNewProfileName('');
    setNewProfileDescription('');
    setActiveTab('training');
  };

  const deleteProfile = (profileId: string) => {
    voiceTrainingManager.deleteProfile(profileId);
    loadProfiles();
    
    if (selectedProfile?.id === profileId) {
      setSelectedProfile(null);
    }
  };

  const selectProfile = (profile: VoiceProfile) => {
    setSelectedProfile(profile);
    onProfileSelected?.(profile);
    setActiveTab('training');
  };

  const getTrainingScripts = () => {
    if (!selectedProfile) return [];
    return TRAINING_SCRIPTS[selectedProfile.metadata.voiceCharacteristics.style] || TRAINING_SCRIPTS.conversational;
  };

  const nextScript = () => {
    const scripts = getTrainingScripts();
    const nextIndex = (scriptIndex + 1) % scripts.length;
    setScriptIndex(nextIndex);
    setCurrentScript(scripts[nextIndex]);
  };

  const startRecording = async () => {
    const success = await voiceTrainingManager.startRecording();
    if (success) {
      setIsRecording(true);
      setRecordingDuration(0);
      setAudioBlob(null);
    }
  };

  const stopRecording = async () => {
    const blob = await voiceTrainingManager.stopRecording();
    setIsRecording(false);
    setAudioBlob(blob);
  };

  const playRecording = () => {
    if (!audioBlob || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = URL.createObjectURL(audioBlob);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const saveRecording = async () => {
    if (!audioBlob || !selectedProfile || !currentScript) return;

    const sample = await voiceTrainingManager.addSample(
      selectedProfile.id,
      currentScript,
      audioBlob
    );

    if (sample) {
      loadProfiles();
      setAudioBlob(null);
      setCurrentScript('');
      nextScript();
    }
  };

  const removeSample = (sampleId: string) => {
    if (!selectedProfile) return;
    
    voiceTrainingManager.removeSample(selectedProfile.id, sampleId);
    loadProfiles();
  };

  const trainVoiceModel = async () => {
    if (!selectedProfile) return;

    const success = await voiceTrainingManager.trainVoiceModel(selectedProfile.id);
    if (success) {
      loadProfiles();
    }
  };

  const activateCustomVoice = async () => {
    if (!selectedProfile) return;

    const success = await voiceTrainingManager.useCustomVoice(selectedProfile.id);
    if (success) {
      // Notify parent component or show success message
      console.log('Custom voice activated');
    }
  };

  // Initialize script
  useEffect(() => {
    if (selectedProfile && !currentScript) {
      const scripts = getTrainingScripts();
      setCurrentScript(scripts[0] || '');
    }
  }, [selectedProfile]);

  const ProfilesTab = () => (
    <div className="space-y-4">
      {/* Create New Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New Voice Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="My Custom Voice"
              />
            </div>
            <div>
              <Label htmlFor="profile-language">Language</Label>
              <Select value={newProfileLanguage} onValueChange={setNewProfileLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                  <SelectItem value="it-IT">Italian</SelectItem>
                  <SelectItem value="pt-BR">Portuguese (BR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="profile-description">Description</Label>
            <Textarea
              id="profile-description"
              value={newProfileDescription}
              onChange={(e) => setNewProfileDescription(e.target.value)}
              placeholder="Describe your voice characteristics..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Gender</Label>
              <Select value={newProfileGender} onValueChange={(value: string) => setNewProfileGender(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Age</Label>
              <Select value={newProfileAge} onValueChange={(value: string) => setNewProfileAge(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="young">Young</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="mature">Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Style</Label>
              <Select value={newProfileStyle} onValueChange={(value: string) => setNewProfileStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="expressive">Expressive</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="narration">Narration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Accent</Label>
              <Input
                value={newProfileAccent}
                onChange={(e) => setNewProfileAccent(e.target.value)}
                placeholder="Standard"
              />
            </div>
          </div>
          
          <Button onClick={createNewProfile} disabled={!newProfileName.trim()}>
            <User className="w-4 h-4 mr-2" />
            Create Profile
          </Button>
        </CardContent>
      </Card>

      {/* Existing Profiles */}
      <div className="space-y-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className={cn(
            "cursor-pointer transition-all",
            selectedProfile?.id === profile.id && "border-primary bg-primary/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1" onClick={() => selectProfile(profile)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={profile.status === 'ready' ? 'default' : 'secondary'}>
                          {profile.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {profile.metadata.sampleCount} samples
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {profile.metadata.quality}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {profile.status === 'ready' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => activateCustomVoice()}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Voice Profile</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{profile.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProfile(profile.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const TrainingTab = () => {
    if (!selectedProfile) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Profile Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select or create a voice profile to start training.
            </p>
            <Button onClick={() => setActiveTab('profiles')}>
              Select Profile
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Profile Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {selectedProfile.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {selectedProfile.metadata.sampleCount}
                </div>
                <div className="text-sm text-muted-foreground">Samples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {Math.round(selectedProfile.metadata.totalDuration)}s
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {selectedProfile.metadata.quality}
                </div>
                <div className="text-sm text-muted-foreground">Quality</div>
              </div>
            </div>
            
            <Progress 
              value={(selectedProfile.metadata.sampleCount / 25) * 100} 
              className="mb-2"
            />
            <p className="text-sm text-muted-foreground">
              {selectedProfile.metadata.sampleCount} of 25 recommended samples
            </p>
          </CardContent>
        </Card>

        {/* Recording Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Record Training Sample</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Script {scriptIndex + 1}:</p>
              <p className="text-sm leading-relaxed">{currentScript}</p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!currentScript}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop ({recordingDuration.toFixed(1)}s)
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={nextScript}>
                Next Script
              </Button>
            </div>
            
            {audioBlob && (
              <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Button variant="outline" onClick={playRecording}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <p className="text-sm">Recording ready</p>
                  <p className="text-xs text-muted-foreground">
                    Duration: {recordingDuration.toFixed(1)}s
                  </p>
                </div>
                
                <Button onClick={saveRecording}>
                  <Check className="w-4 h-4 mr-2" />
                  Save Sample
                </Button>
                
                <Button variant="ghost" onClick={() => setAudioBlob(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
          </CardContent>
        </Card>

        {/* Sample Management */}
        <Card>
          <CardHeader>
            <CardTitle>Recorded Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {selectedProfile.samples.map((sample, index) => (
                  <div key={sample.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sample {index + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {sample.duration.toFixed(1)}s • Quality: {(sample.quality * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sample.text.slice(0, 50)}...
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={sample.status === 'approved' ? 'default' : 'secondary'}>
                        {sample.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSample(sample.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Training Actions */}
        <Card>
          <CardContent className="p-6">
            {trainingProgress ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Training in Progress</span>
                </div>
                <Progress value={trainingProgress.progress} />
                <p className="text-sm text-muted-foreground">
                  {trainingProgress.currentStep}
                  {trainingProgress.estimatedTimeRemaining && (
                    <span> • {Math.round(trainingProgress.estimatedTimeRemaining)}s remaining</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ready to Train</h3>
                  <p className="text-sm text-muted-foreground">
                    {voiceTrainingManager.isProfileReady(selectedProfile.id)
                      ? 'Your voice profile is ready for training.'
                      : `Add ${5 - selectedProfile.metadata.sampleCount} more samples to start training.`
                    }
                  </p>
                </div>
                
                <Button
                  onClick={trainVoiceModel}
                  disabled={!voiceTrainingManager.isProfileReady(selectedProfile.id)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Train Voice Model
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          {t('voice.voiceTraining')}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profiles">Voice Profiles</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profiles" className="mt-4">
            <ProfilesTab />
          </TabsContent>
          
          <TabsContent value="training" className="mt-4">
            <TrainingTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};