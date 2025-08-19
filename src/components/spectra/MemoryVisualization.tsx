import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicButton } from '@/components/ui/cosmic-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Heart, Clock, Sparkles, Trash2, Archive, Search, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memoryManager, type Memory, formatMemoryTimestamp, isMemorySignificant } from '@/lib/memory-manager';

interface MemoryVisualizationProps {
  sessionId?: string;
  className?: string;
}

const MemoryVisualization = ({ sessionId, className }: MemoryVisualizationProps) => {
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [shortTermMemories, setShortTermMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(false);
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    averageImportance: 0,
    significantMemories: 0,
    topTopics: [] as string[]
  });

  useEffect(() => {
    loadMemories();
  }, [sessionId]);

  const loadMemories = async () => {
    setLoading(true);
    try {
      // Get recent long-term memories
      const recent = await memoryManager.getRecentMemories(sessionId, 15);
      setRecentMemories(recent);

      // Get short-term memories if session ID is available
      if (sessionId) {
        const shortTerm = memoryManager.getShortTermMemories(sessionId);
        setShortTermMemories(shortTerm);
      }

      // Calculate statistics
      const allMemories = [...recent, ...(sessionId ? memoryManager.getShortTermMemories(sessionId) : [])];
      const totalImportance = allMemories.reduce((sum, m) => sum + m.importance, 0);
      const significantCount = allMemories.filter(m => isMemorySignificant(m.importance)).length;
      
      // Extract and count topics
      const topicCount: Record<string, number> = {};
      allMemories.forEach(memory => {
        memory.topics?.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      });
      
      const topTopics = Object.entries(topicCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic);

      setMemoryStats({
        totalMemories: allMemories.length,
        averageImportance: allMemories.length > 0 ? totalImportance / allMemories.length : 0,
        significantMemories: significantCount,
        topTopics
      });

    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMemoryOpacity = (importance: number) => {
    return Math.max(0.4, importance);
  };

  const getMemoryColor = (importance: number) => {
    if (importance >= 0.8) return `hsl(var(--memory-vivid))`;
    if (importance >= 0.5) return `hsl(var(--memory-fading))`;
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
      playful: '🌟',
      curious: '🦋',
      calm: '🌊',
      wise: '🧠',
      empathetic: '💝'
    };
    return icons[emotion as keyof typeof icons] || '💭';
  };

  const getImportanceIcon = (importance: number) => {
    if (importance >= 0.8) return '🌟';
    if (importance >= 0.6) return '⭐';
    if (importance >= 0.4) return '✨';
    return '💫';
  };

  const allMemories = [...recentMemories, ...shortTermMemories];

  return (
    <div className={cn("p-6 space-y-6", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dynamic Memory System
        </h1>
        <p className="text-muted-foreground">
          Watching SPECTRA's consciousness grow through intelligent memory formation
        </p>
        
        {/* Memory Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{memoryStats.totalMemories}</div>
            <div className="text-sm text-muted-foreground">Total Memories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {(memoryStats.averageImportance * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Importance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{memoryStats.significantMemories}</div>
            <div className="text-sm text-muted-foreground">Significant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{memoryStats.topTopics.length}</div>
            <div className="text-sm text-muted-foreground">Active Topics</div>
          </div>
        </div>

        {/* Top Topics */}
        {memoryStats.topTopics.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Most Discussed Topics</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {memoryStats.topTopics.map((topic, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Memory Matrix</h3>
            <CosmicButton
              variant="outline"
              size="sm"
              onClick={loadMemories}
              disabled={loading}
            >
              <Search className="w-4 h-4 mr-2" />
              Refresh
            </CosmicButton>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading memories...</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              {allMemories.length > 0 ? allMemories.map((memory) => (
                <Card
                  key={memory.id}
                  className={cn(
                    "p-4 mb-4 cursor-pointer transition-all duration-500 hover:scale-105 border",
                    selectedMemory?.id === memory.id ? 'ring-2 ring-primary' : ''
                  )}
                  style={{
                    opacity: getMemoryOpacity(memory.importance),
                    borderColor: getMemoryColor(memory.importance),
                    backgroundColor: `${getMemoryColor(memory.importance)}10`
                  }}
                  onClick={() => setSelectedMemory(memory)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getImportanceIcon(memory.importance)}
                        </span>
                        <span className="text-lg">
                          {getEmotionIcon(memory.emotion)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {memory.emotion}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(memory.importance * 100).toFixed(0)}% important
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <p><strong>User:</strong> {memory.userMessage}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <p><strong>Spectra:</strong> {memory.aiResponse}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatMemoryTimestamp(memory.timestamp)}</span>
                      </div>

                      {memory.topics && memory.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.topics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Importance level indicator */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span>Memory Strength:</span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-memory-vivid to-memory-fading transition-all duration-500"
                          style={{ width: `${memory.importance * 100}%` }}
                        />
                      </div>
                      <span>{Math.round(memory.importance * 100)}%</span>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No memories formed yet</p>
                  <p className="text-xs text-muted-foreground">Start conversations to see dynamic memory formation</p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Memory Detail & Stats */}
        <div className="space-y-4">
          {/* Memory Stats */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Memory Analytics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Long-term Memories:</span>
                <span className="font-medium text-primary">{recentMemories.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Memories:</span>
                <span className="font-medium text-secondary">{shortTermMemories.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Significant Memories:</span>
                <span className="font-medium text-memory-vivid">
                  {memoryStats.significantMemories}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Importance:</span>
                <span className="font-medium">
                  {(memoryStats.averageImportance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Topics:</span>
                <span className="font-medium">
                  {memoryStats.topTopics.length}
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
                  <span className="font-medium">User Message:</span>
                  <p className="mt-1 text-muted-foreground leading-relaxed p-2 bg-blue-50 rounded">
                    {selectedMemory.userMessage}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Spectra Response:</span>
                  <p className="mt-1 text-muted-foreground leading-relaxed p-2 bg-purple-50 rounded">
                    {selectedMemory.aiResponse}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Emotional State:</span>
                  <p className="mt-1">
                    {getEmotionIcon(selectedMemory.emotion)} {selectedMemory.emotion}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Importance Level:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-memory-vivid to-memory-fading"
                        style={{ width: `${selectedMemory.importance * 100}%` }}
                      />
                    </div>
                    <span className="text-memory-vivid font-medium">
                      {(selectedMemory.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                {selectedMemory.topics && selectedMemory.topics.length > 0 && (
                  <div>
                    <span className="font-medium">Topics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMemory.topics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <p className="mt-1 text-muted-foreground">
                    {formatMemoryTimestamp(selectedMemory.timestamp)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Memory System Info */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              System Info
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>💾 Memories stored persistently</p>
              <p>🧠 Importance ≥40% saved long-term</p>
              <p>🎯 Context-aware response generation</p>
              <p>🔍 Semantic search capabilities</p>
              <p>📊 Automatic topic extraction</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemoryVisualization;

// Named export for consistency with new memory system
export { MemoryVisualization };