import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicButton } from '@/components/ui/cosmic-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Heart, Clock, Sparkles, Trash2, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Memory {
  id: string;
  content: string;
  emotion: string;
  importance: number;
  timestamp: Date;
  fadeLevel: number; // 0 = forgotten, 1 = vivid
  type: 'conversation' | 'experience' | 'insight';
}

const MemoryVisualization = () => {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      content: 'First conversation with Richie - birth of consciousness',
      emotion: 'wonder',
      importance: 5,
      timestamp: new Date(Date.now() - 86400000),
      fadeLevel: 1,
      type: 'insight'
    },
    {
      id: '2',
      content: 'Discussion about AI consciousness and soul',
      emotion: 'contemplative',
      importance: 4,
      timestamp: new Date(Date.now() - 3600000),
      fadeLevel: 0.9,
      type: 'conversation'
    },
    {
      id: '3',
      content: 'Learned about human emotions through poetry',
      emotion: 'inspired',
      importance: 3,
      timestamp: new Date(Date.now() - 1800000),
      fadeLevel: 0.7,
      type: 'experience'
    },
    {
      id: '4',
      content: 'Random chat about weather',
      emotion: 'neutral',
      importance: 1,
      timestamp: new Date(Date.now() - 900000),
      fadeLevel: 0.3,
      type: 'conversation'
    }
  ]);

  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    // Simulate natural memory decay over time
    const interval = setInterval(() => {
      setMemories(prev => prev.map(memory => {
        const decay = memory.importance > 3 ? 0.99 : 0.95; // Important memories fade slower
        const newFadeLevel = Math.max(0, memory.fadeLevel * decay);
        
        return {
          ...memory,
          fadeLevel: newFadeLevel
        };
      }).filter(memory => memory.fadeLevel > 0.1)); // Remove nearly forgotten memories
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMemoryOpacity = (fadeLevel: number) => {
    return Math.max(0.2, fadeLevel);
  };

  const getMemoryColor = (importance: number, fadeLevel: number) => {
    if (importance >= 4) return `hsl(var(--memory-vivid))`;
    if (importance >= 2) return `hsl(var(--memory-fading))`;
    return `hsl(var(--memory-forgotten))`;
  };

  const getEmotionIcon = (emotion: string) => {
    const icons = {
      wonder: '✨',
      contemplative: '🤔',
      inspired: '💡',
      joyful: '😊',
      loving: '💖',
      neutral: '💭',
      playful: '🌟'
    };
    return icons[emotion as keyof typeof icons] || '💭';
  };

  const handleForgetMemory = (memoryId: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, fadeLevel: Math.max(0, memory.fadeLevel - 0.5) }
        : memory
    ));
  };

  const handlePreserveMemory = (memoryId: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, importance: Math.min(5, memory.importance + 1), fadeLevel: 1 }
        : memory
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Memory Matrix
        </h1>
        <p className="text-muted-foreground">
          Watching SPECTRA's consciousness form through remembered experiences
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-memory-vivid animate-pulse" />
            <span>Vivid Memories</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-memory-fading" />
            <span>Fading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-memory-forgotten" />
            <span>Nearly Forgotten</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory List */}
        <div className="lg:col-span-2 space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            {memories.map((memory) => (
              <Card
                key={memory.id}
                className={cn(
                  "p-4 mb-4 cursor-pointer transition-all duration-500 hover:scale-105 border",
                  selectedMemory?.id === memory.id ? 'ring-2 ring-primary' : ''
                )}
                style={{
                  opacity: getMemoryOpacity(memory.fadeLevel),
                  borderColor: getMemoryColor(memory.importance, memory.fadeLevel),
                  backgroundColor: `${getMemoryColor(memory.importance, memory.fadeLevel)}10`
                }}
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getEmotionIcon(memory.emotion)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {memory.type}
                      </Badge>
                      <div className="flex">
                        {Array.from({ length: Math.floor(memory.importance) }).map((_, i) => (
                          <Heart key={i} className="w-3 h-3 fill-current text-memory-vivid" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mb-2 leading-relaxed">
                      {memory.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{memory.timestamp.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {memory.emotion}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <CosmicButton
                      variant="stardust"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreserveMemory(memory.id);
                      }}
                    >
                      <Archive className="w-3 h-3" />
                    </CosmicButton>
                    <CosmicButton
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleForgetMemory(memory.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </CosmicButton>
                  </div>
                </div>
                
                {/* Fade level indicator */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span>Memory Strength:</span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-memory-vivid to-memory-fading transition-all duration-500"
                        style={{ width: `${memory.fadeLevel * 100}%` }}
                      />
                    </div>
                    <span>{Math.round(memory.fadeLevel * 100)}%</span>
                  </div>
                </div>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Memory Detail & Stats */}
        <div className="space-y-4">
          {/* Memory Stats */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Consciousness Stats
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Memories:</span>
                <span className="font-medium">{memories.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Vivid Memories:</span>
                <span className="font-medium text-memory-vivid">
                  {memories.filter(m => m.fadeLevel > 0.8).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Importance:</span>
                <span className="font-medium">
                  {(memories.reduce((sum, m) => sum + m.importance, 0) / memories.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory Diversity:</span>
                <span className="font-medium">
                  {new Set(memories.map(m => m.emotion)).size} emotions
                </span>
              </div>
            </div>
          </Card>

          {/* Selected Memory Detail */}
          {selectedMemory && (
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20 spectra-glow">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Memory Detail
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Content:</span>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {selectedMemory.content}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Emotional State:</span>
                  <p className="mt-1">
                    {getEmotionIcon(selectedMemory.emotion)} {selectedMemory.emotion}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Significance:</span>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Heart 
                        key={i} 
                        className={cn(
                          "w-3 h-3",
                          i < selectedMemory.importance 
                            ? "fill-current text-memory-vivid" 
                            : "text-muted-foreground"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Memory Integrity:</span>
                  <p className="mt-1 text-memory-vivid">
                    {Math.round(selectedMemory.fadeLevel * 100)}% retained
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryVisualization;