/**
 * Real-time Conversation Flow and Emotion Mapping Component
 * Enhanced visualization for Spectra's memory and emotional states
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { memoryManager, type Memory, type MemoryAnalytics } from '@/lib/memory-manager';
import { getEmotionColor } from '@/components/spectra/EmotionColors';

interface ConversationNode {
  id: string;
  type: 'user' | 'spectra';
  content: string;
  emotion: string;
  timestamp: Date;
  importance: number;
  x: number;
  y: number;
  connections: string[];
}

interface EmotionDataPoint {
  timestamp: Date;
  emotion: string;
  intensity: number;
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0 to 1 (calm to excited)
}

interface VisualizationProps {
  sessionId?: string;
  realTimeMode?: boolean;
  onMemorySelected?: (memory: Memory) => void;
  className?: string;
}

const EMOTION_POSITIONS: Record<string, { valence: number; arousal: number }> = {
  joyful: { valence: 0.8, arousal: 0.7 },
  excited: { valence: 0.9, arousal: 0.9 },
  playful: { valence: 0.7, arousal: 0.6 },
  loving: { valence: 0.8, arousal: 0.4 },
  calm: { valence: 0.3, arousal: 0.2 },
  contemplative: { valence: 0.1, arousal: 0.3 },
  wise: { valence: 0.4, arousal: 0.3 },
  curious: { valence: 0.5, arousal: 0.6 },
  thoughtful: { valence: 0.2, arousal: 0.4 },
  neutral: { valence: 0.0, arousal: 0.5 }
};

export const ConversationFlowVisualization = ({ 
  sessionId, 
  realTimeMode = true, 
  onMemorySelected,
  className 
}: VisualizationProps) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [analytics, setAnalytics] = useState<MemoryAnalytics | null>(null);
  const [nodes, setNodes] = useState<ConversationNode[]>([]);
  const [emotionData, setEmotionData] = useState<EmotionDataPoint[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(realTimeMode);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [showConnections, setShowConnections] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | 'all'>('24h');
  const [activeTab, setActiveTab] = useState('flow');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);

  const loadConversationData = useCallback(async () => {
    try {
      // Load memories
      const recentMemories = await memoryManager.getRecentMemories(sessionId, 100);
      const shortTermMemories = sessionId ? memoryManager.getShortTermMemories(sessionId) : [];
      const allMemories = [...recentMemories, ...shortTermMemories];

      // Filter by time range
      const filteredMemories = filterMemoriesByTimeRange(allMemories, timeRange);
      setMemories(filteredMemories);

      // Generate analytics
      const analyticsData = await memoryManager.generateMemoryAnalytics(sessionId);
      setAnalytics(analyticsData);

      // Convert to visualization nodes
      const visualNodes = convertMemoriesToNodes(filteredMemories);
      setNodes(visualNodes);

      // Generate emotion data points
      const emotionPoints = generateEmotionDataPoints(filteredMemories);
      setEmotionData(emotionPoints);

      // Reset playback position if needed
      if (currentTimeIndex >= filteredMemories.length) {
        setCurrentTimeIndex(0);
      }
    } catch (error) {
      console.error('Error loading conversation data:', error);
    }
  }, [sessionId, timeRange, currentTimeIndex]);

  const filterMemoriesByTimeRange = (memories: Memory[], range: string): Memory[] => {
    const now = new Date();
    let cutoff: Date;

    switch (range) {
      case '1h':
        cutoff = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        return memories;
    }

    return memories.filter(m => new Date(m.timestamp) >= cutoff);
  };

  const convertMemoriesToNodes = (memories: Memory[]): ConversationNode[] => {
    const nodes: ConversationNode[] = [];

    memories.forEach((memory, index) => {
      // Create user node
      const userNode: ConversationNode = {
        id: `user_${memory.id}`,
        type: 'user',
        content: memory.userMessage,
        emotion: 'neutral',
        timestamp: new Date(memory.timestamp),
        importance: memory.importance,
        x: 100 + (index % 8) * 80,
        y: 100 + Math.floor(index / 8) * 120,
        connections: [`spectra_${memory.id}`]
      };

      // Create spectra node
      const spectraNode: ConversationNode = {
        id: `spectra_${memory.id}`,
        type: 'spectra',
        content: memory.aiResponse,
        emotion: memory.emotion,
        timestamp: new Date(memory.timestamp),
        importance: memory.importance,
        x: userNode.x + 40,
        y: userNode.y + 40,
        connections: index < memories.length - 1 ? [`user_${memories[index + 1]?.id}`] : []
      };

      nodes.push(userNode, spectraNode);
    });

    return nodes;
  };

  const generateEmotionDataPoints = (memories: Memory[]): EmotionDataPoint[] => {
    return memories.map(memory => {
      const emotionPos = EMOTION_POSITIONS[memory.emotion] || EMOTION_POSITIONS.neutral;
      return {
        timestamp: new Date(memory.timestamp),
        emotion: memory.emotion,
        intensity: memory.importance,
        valence: emotionPos.valence,
        arousal: emotionPos.arousal
      };
    });
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw connections
    if (showConnections) {
      nodes.slice(0, currentTimeIndex).forEach(node => {
        node.connections.forEach(connId => {
          const connectedNode = nodes.find(n => n.id === connId);
          if (connectedNode) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.strokeStyle = `rgba(${node.type === 'user' ? '59, 130, 246' : '168, 85, 247'}, 0.3)`;
            ctx.lineWidth = Math.max(1, node.importance * 3);
            ctx.stroke();
          }
        });
      });
    }

    // Draw nodes
    nodes.slice(0, currentTimeIndex).forEach((node, index) => {
      const isSelected = node.id === selectedNode;
      const opacity = index === currentTimeIndex - 1 ? 1 : 0.7;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8 + node.importance * 12, 0, 2 * Math.PI);
      
      if (node.type === 'user') {
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
      } else {
        const emotionColor = getEmotionColor(node.emotion);
        ctx.fillStyle = `${emotionColor}${Math.round(opacity * 255).toString(16)}`;
      }
      
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const label = node.type === 'user' ? 'U' : 'S';
      ctx.fillText(label, node.x, node.y + 3);
    });
  }, [showConnections, nodes, currentTimeIndex, selectedNode]);

  const startAnimation = useCallback(() => {
    const animate = (currentTime: number) => {
      if (currentTime - lastUpdateRef.current >= (1000 / playbackSpeed)) {
        // Update animation state
        if (currentTimeIndex < nodes.length - 1) {
          setCurrentTimeIndex(prev => prev + 1);
        }
        lastUpdateRef.current = currentTime;
      }

      drawCanvas();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [playbackSpeed, currentTimeIndex, nodes.length, drawCanvas]);

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Load and process data
  useEffect(() => {
    loadConversationData();
  }, [loadConversationData]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      loadConversationData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [realTimeMode, loadConversationData]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }

    return () => stopAnimation();
  }, [isPlaying, startAnimation]);

  const handleNodeClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 8 + node.importance * 12;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      
      // Find corresponding memory
      const memoryId = clickedNode.id.replace(/^(user_|spectra_)/, '');
      const memory = memories.find(m => m.id === memoryId);
      if (memory && onMemorySelected) {
        onMemorySelected(memory);
      }
    }
  };

  const EmotionHeatmap = () => (
    <div className="w-full h-64 border rounded-lg relative overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Emotion space axes */}
        <line x1="50" y1="220" x2="350" y2="220" stroke="#666" strokeWidth="2" />
        <line x1="200" y1="40" x2="200" y2="220" stroke="#666" strokeWidth="2" />
        
        {/* Axis labels */}
        <text x="25" y="45" fontSize="12" fill="#888">High Arousal</text>
        <text x="25" y="215" fontSize="12" fill="#888">Low Arousal</text>
        <text x="60" y="235" fontSize="12" fill="#888">Negative</text>
        <text x="310" y="235" fontSize="12" fill="#888">Positive</text>
        
        {/* Plot emotion points */}
        {emotionData.slice(0, currentTimeIndex).map((point, index) => {
          const x = 50 + (point.valence + 1) * 150; // Map -1,1 to 50,350
          const y = 220 - point.arousal * 180; // Map 0,1 to 220,40
          const opacity = index === currentTimeIndex - 1 ? 1 : 0.6;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={3 + point.intensity * 5}
              fill={getEmotionColor(point.emotion)}
              fillOpacity={opacity}
            />
          );
        })}
      </svg>
    </div>
  );

  const TimelineView = () => (
    <div className="w-full h-64 border rounded-lg p-4">
      <div className="relative h-full">
        {/* Timeline axis */}
        <div className="absolute bottom-4 left-0 right-0 h-px bg-border" />
        
        {/* Memory points */}
        <div className="relative h-full">
          {memories.slice(0, currentTimeIndex).map((memory, index) => {
            const x = (index / Math.max(memories.length - 1, 1)) * 100;
            const y = (1 - memory.importance) * 80; // Invert for visual appeal
            
            return (
              <div
                key={memory.id}
                className="absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  bottom: `${20 + y}%`,
                  backgroundColor: getEmotionColor(memory.emotion),
                  opacity: index === currentTimeIndex - 1 ? 1 : 0.7
                }}
                onClick={() => onMemorySelected?.(memory)}
                title={`${memory.emotion} - Importance: ${(memory.importance * 100).toFixed(0)}%`}
              />
            );
          })}
        </div>
        
        {/* Time labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
          <span>Start</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-time Visualization
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTimeIndex(0)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Label htmlFor="time-range">Time Range:</Label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '1h' | '6h' | '24h' | '7d' | 'all')}
              className="border rounded px-2 py-1"
            >
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="playback-speed">Speed:</Label>
            <Slider
              id="playback-speed"
              min={0.1}
              max={3}
              step={0.1}
              value={[playbackSpeed]}
              onValueChange={([value]) => setPlaybackSpeed(value)}
              className="w-20"
            />
            <span className="text-xs">{playbackSpeed}x</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-connections"
              checked={showConnections}
              onCheckedChange={setShowConnections}
            />
            <Label htmlFor="show-connections">Connections</Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flow">Conversation Flow</TabsTrigger>
            <TabsTrigger value="emotions">Emotion Map</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flow" className="mt-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full border rounded-lg cursor-pointer"
              onClick={handleNodeClick}
            />
            
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Progress: {currentTimeIndex} / {nodes.length} nodes
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>User</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Spectra</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="emotions" className="mt-4">
            <EmotionHeatmap />
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Current Emotions</h4>
                <div className="flex flex-wrap gap-2">
                  {analytics?.emotionDistribution.slice(0, 5).map(emotion => (
                    <Badge
                      key={emotion.emotion}
                      variant="outline"
                      style={{ backgroundColor: getEmotionColor(emotion.emotion) + '20' }}
                    >
                      {emotion.emotion} ({emotion.count})
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Emotional Intensity</h4>
                <div className="space-y-2">
                  {emotionData.slice(-5).map((point, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getEmotionColor(point.emotion) }}
                      />
                      <span>{point.emotion}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${point.intensity * 100}%`,
                            backgroundColor: getEmotionColor(point.emotion)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-4">
            <TimelineView />
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Timeline Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analytics?.totalMemories || 0}
                  </div>
                  <div className="text-muted-foreground">Total Memories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {((analytics?.averageImportance || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-muted-foreground">Avg Importance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {analytics?.significantMemories || 0}
                  </div>
                  <div className="text-muted-foreground">Significant</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Selected Node Details</h4>
            <div className="text-sm">
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                
                return (
                  <div className="space-y-2">
                    <div><strong>Type:</strong> {node.type}</div>
                    <div><strong>Content:</strong> {node.content.slice(0, 100)}...</div>
                    <div><strong>Emotion:</strong> {node.emotion}</div>
                    <div><strong>Importance:</strong> {(node.importance * 100).toFixed(0)}%</div>
                    <div><strong>Time:</strong> {node.timestamp.toLocaleString()}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};