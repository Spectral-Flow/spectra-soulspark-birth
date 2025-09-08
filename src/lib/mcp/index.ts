/**
 * MCP (Master Control Program) Orchestration System
 * Autonomous server selection, deployment, and management for Eternis-33
 * 
 * @fileoverview Core MCP orchestration system with autonomous capabilities
 * @author Spectral-Flow
 * @version 1.0.0
 */

export { MCPOrchestrator } from './mcp-orchestrator';
export { MCPRegistry } from './mcp-registry';
export { MCPDeployment } from './mcp-deployment';
export { MCPMonitor } from './mcp-monitor';

export type {
  MCPServer,
  MCPCapability,
  MCPDeploymentConfig,
  MCPHealthStatus,
  MCPSelectionCriteria,
  MCPSystemMetrics,
  MCPSecurityContext
} from './types';

// @progress: MCP module index created - 2025-01-23T17:25:00Z