import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CosmicButton } from '@/components/ui/cosmic-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Users, Scroll, Zap, Moon, TreePine, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdventureLog {
  id: string;
  timestamp: Date;
  action: string;
  result: string;
  location: string;
  companions: string[];
  memory: boolean;
}

interface Companion {
  name: string;
  type: string;
  personality: string;
  icon: string;
  present: boolean;
  mood: string;
}

const EmberRealm = () => {
  const [currentLocation, setCurrentLocation] = useState('Misty Chapel Ruins');
  const [companions, setCompanions] = useState<Companion[]>([
    {
      name: 'Ember',
      type: 'Cross Fox',
      personality: 'Mysterious guide with ember-red fur and ancient wisdom',
      icon: '🦊',
      present: true,
      mood: 'watchful'
    },
    {
      name: 'Yoda',
      type: 'Wise Raccoon',
      personality: 'Clever trickster who speaks in riddles and steals shiny things',
      icon: '🦝',
      present: false,
      mood: 'mischievous'
    },
    {
      name: 'Vat',
      type: 'Dramatic Bat',
      personality: 'Aerial scout with flair for the theatrical',
      icon: '🦇',
      present: false,
      mood: 'theatrical'
    }
  ]);

  const [adventureLog, setAdventureLog] = useState<AdventureLog[]>([
    {
      id: '1',
      timestamp: new Date(),
      action: 'Entered the misty chapel ruins',
      result: 'Ember appears from the shadows, his cross markings glowing softly in the moonlight',
      location: 'Misty Chapel Ruins',
      companions: ['Ember'],
      memory: true
    }
  ]);

  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [currentNarration, setCurrentNarration] = useState(
    "You stand among ancient stone ruins where moonlight filters through broken arches. The air hums with spectral energy. Ember, the cross fox, watches you with intelligent amber eyes that seem to hold centuries of secrets. His ember-red fur catches the light as he tilts his head, waiting for your next move."
  );

  const locations = [
    'Misty Chapel Ruins',
    'Whispering Forest Grove',
    'Crystal Stream Crossing',
    'Ancient Oak Circle',
    'Moonlit Meadow',
    'Shadow Cave Entrance'
  ];

  const actions = [
    'Approach Ember slowly',
    'Call out to the spirits',
    'Search the ancient stones',
    'Listen to the wind',
    'Follow the fox tracks',
    'Rest and meditate'
  ];

  const generateAdventureResult = (action: string) => {
    const emberResponses = [
      'Ember tilts his head and makes a soft four-note call. He seems to understand your intention.',
      'The cross fox approaches with graceful steps, his tail swishing in what might be approval.',
      'Ember vanishes into the mist, only to reappear on a fallen stone, watching you intently.',
      'The fox makes a chittering sound that almost sounds like laughter, then bounds away playfully.',
      'Ember sits perfectly still, his amber eyes reflecting ancient wisdom and patience.'
    ];

    const mysticalEvents = [
      'The air shimmers with ethereal energy as if the realm itself is responding to your presence.',
      'Distant sounds of otherworldly music drift through the mist.',
      'Sparks of light dance around you like fireflies made of pure starlight.',
      'The stones beneath your feet pulse with a gentle warmth.',
      'A gentle breeze carries whispers in a language you almost understand.'
    ];

    const companionEvents = [
      'You hear Yoda the raccoon chattering in the distance, followed by Vat\'s dramatic wing beats.',
      'A small shiny object falls from above - Vat has dropped one of Yoda\'s "treasures".',
      'Rustling in the bushes suggests Yoda is investigating something interesting.',
      'Vat swoops overhead with a theatrical flourish, scouting the path ahead.'
    ];

    // Randomly select response type
    const responseType = Math.random();
    if (responseType < 0.5) {
      return emberResponses[Math.floor(Math.random() * emberResponses.length)];
    } else if (responseType < 0.8) {
      return mysticalEvents[Math.floor(Math.random() * mysticalEvents.length)];
    } else {
      return companionEvents[Math.floor(Math.random() * companionEvents.length)];
    }
  };

  const handleAction = async (action: string) => {
    setIsActionInProgress(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = generateAdventureResult(action);
    const newLogEntry: AdventureLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      result,
      location: currentLocation,
      companions: companions.filter(c => c.present).map(c => c.name),
      memory: Math.random() > 0.3 // 70% chance of being memorable
    };

    setAdventureLog(prev => [newLogEntry, ...prev]);
    setCurrentNarration(result);
    
    // Randomly change companion presence
    if (Math.random() > 0.7) {
      setCompanions(prev => prev.map(companion => ({
        ...companion,
        present: companion.name === 'Ember' ? true : Math.random() > 0.5
      })));
    }

    setIsActionInProgress(false);
  };

  const handleLocationChange = (newLocation: string) => {
    setCurrentLocation(newLocation);
    const locationNarrations = {
      'Misty Chapel Ruins': 'Ancient stones whisper of forgotten prayers. Ember materializes from the shadows.',
      'Whispering Forest Grove': 'Trees lean in as if sharing secrets. The canopy filters ethereal light.',
      'Crystal Stream Crossing': 'Water sings with crystalline voices. Reflections show more than just your image.',
      'Ancient Oak Circle': 'Massive oaks form a natural cathedral. The air thrums with primal energy.',
      'Moonlit Meadow': 'Silver grass waves in supernatural breezes. Stars seem closer here.',
      'Shadow Cave Entrance': 'Darkness beckons with promises of hidden knowledge.'
    };
    
    setCurrentNarration(
      locationNarrations[newLocation as keyof typeof locationNarrations] || 
      'You find yourself in a place between worlds.'
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Ember's Realm
        </h1>
        <p className="text-muted-foreground">
          A mystical text adventure where SPECTRA guides you through encounters with spirit animals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Adventure Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Scene */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 spectra-glow">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">{currentLocation}</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-foreground leading-relaxed text-base">
                {currentNarration}
              </p>
            </div>

            {/* Present Companions */}
            <div className="flex gap-2 mb-4">
              {companions.filter(c => c.present).map(companion => (
                <Badge key={companion.name} variant="outline" className="bg-primary/10">
                  {companion.icon} {companion.name} ({companion.mood})
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              {actions.map(action => (
                <CosmicButton
                  key={action}
                  variant="ethereal"
                  onClick={() => handleAction(action)}
                  disabled={isActionInProgress}
                  className="text-left justify-start"
                >
                  {action}
                </CosmicButton>
              ))}
            </div>

            {isActionInProgress && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span>The realm responds to your actions...</span>
              </div>
            )}
          </Card>

          {/* Location Selector */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Travel to Sacred Locations
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {locations.map(location => (
                <CosmicButton
                  key={location}
                  variant={location === currentLocation ? "cosmic" : "stardust"}
                  size="sm"
                  onClick={() => handleLocationChange(location)}
                  className="text-xs"
                >
                  {location}
                </CosmicButton>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Companions Panel */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Spirit Companions
            </h3>
            <div className="space-y-3">
              {companions.map(companion => (
                <div 
                  key={companion.name}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    companion.present 
                      ? "border-primary/40 bg-primary/5" 
                      : "border-muted-foreground/20 bg-muted/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{companion.icon}</span>
                    <span className="font-medium">{companion.name}</span>
                    {companion.present && (
                      <Badge variant="outline" className="text-xs bg-primary/10">
                        Present
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {companion.type}
                  </p>
                  <p className="text-xs leading-relaxed">
                    {companion.personality}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Adventure Log */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-primary" />
              Adventure Chronicle
            </h3>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {adventureLog.map(log => (
                  <div 
                    key={log.id}
                    className="p-2 rounded border border-border/50 text-xs"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      {log.memory && (
                        <Sparkles className="w-3 h-3 text-memory-vivid" />
                      )}
                    </div>
                    <p className="font-medium mb-1">{log.action}</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {log.result}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmberRealm;