/**
 * MCP System Type Definitions
 * Core types for autonomous MCP server orchestration
 */

export interface MCPServer {
  id: string;
  name: string;
  type: 'github' | 'playwright' | 'huggingface' | 'custom';
  version: string;
  port: number;
  status: 'online' | 'offline' | 'deploying' | 'error';
  capabilities: MCPCapability[];
  resources: MCPResourceUsage;
  config: MCPServerConfig;
  lastHealthCheck: Date;
  deployedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface MCPCapability {
  name: string;
  category: 'automation' | 'testing' | 'ai' | 'integration' | 'security';
  complexity: 'low' | 'medium' | 'high';
  resourceRequirements: {
    cpu: number; // 0-1 scale
    memory: number; // MB
    network: boolean;
    storage: number; // MB
  };
  dependencies: string[];
  ethical_constraints: string[];
}

export interface MCPResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  connections: number;
  uptime: number;
}

export interface MCPServerConfig {
  autoStart: boolean;
  maxInstances: number;
  healthCheckInterval: number;
  timeoutMs: number;
  retryAttempts: number;
  securityLevel: 'standard' | 'enhanced' | 'military-grade';
  ethicalConstraints: string[];
  environment: Record<string, string>;
}

export interface MCPDeploymentConfig {
  serverId: string;
  instanceId: string;
  port: number;
  environment: 'development' | 'staging' | 'production';
  resources: {
    maxCpu: number;
    maxMemory: number;
    maxConnections: number;
  };
  security: MCPSecurityContext;
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      cpu: number;
      memory: number;
      errorRate: number;
    };
  };
}

export interface MCPHealthStatus {
  serverId: string;
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  issues: string[];
  metrics: MCPSystemMetrics;
}

export interface MCPSelectionCriteria {
  taskType: string;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resourceConstraints?: {
    maxCpu?: number;
    maxMemory?: number;
    maxLatency?: number;
  };
  ethicalRequirements: string[];
  securityLevel: 'standard' | 'enhanced' | 'military-grade';
  preferredServers?: string[];
}

export interface MCPSystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
    temperature?: number;
  };
  memory: {
    used: number;
    available: number;
    utilization: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
    latency: number;
  };
  storage: {
    used: number;
    available: number;
    iops: number;
  };
  performance: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    successRate: number;
  };
}

export interface MCPSecurityContext {
  level: 'standard' | 'enhanced' | 'military-grade';
  operatorId?: string;
  clearanceLevel: number;
  ethicalConstraints: string[];
  auditRequired: boolean;
  encryptionRequired: boolean;
  accessControls: {
    allowedOperations: string[];
    restrictedOperations: string[];
    emergencyStopEnabled: boolean;
  };
}

export interface MCPEvent {
  id: string;
  timestamp: Date;
  type: 'deployment' | 'scaling' | 'health' | 'security' | 'ethical';
  severity: 'info' | 'warning' | 'error' | 'critical';
  serverId?: string;
  message: string;
  metadata: Record<string, unknown>;
  resolved: boolean;
}

export interface MCPSelectionResult {
  selectedServers: MCPServer[];
  reasoning: string;
  confidence: number;
  alternatives: MCPServer[];
  estimatedPerformance: {
    responseTime: number;
    resourceUsage: MCPResourceUsage;
    reliability: number;
  };
}

// @progress: MCP type definitions completed - 2025-01-23T17:30:00Z