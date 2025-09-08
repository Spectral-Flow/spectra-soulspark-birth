/**
 * MCP Registry - Server Discovery and Management
 * Autonomous server registry with intelligent selection algorithms
 */

import { logError, logger } from '@/lib/logger';
import type { MCPServer, MCPCapability, MCPServerConfig } from './types';

export class MCPRegistry {
  private servers: Map<string, MCPServer> = new Map();
  private serverTemplates: Map<string, Partial<MCPServer>> = new Map();
  
  constructor() {
    this.initializeServerTemplates();
  }

  /**
   * Discover existing MCP servers in the system
   */
  public async discoverServers(): Promise<void> {
    logger.info('MCP-Registry', '🔍 Discovering MCP servers...');
    
    try {
      // Discover existing servers from mcp-servers directory
      await this.discoverLocalServers();
      
      // Check for running servers
      await this.scanRunningServers();
      
      logger.info("MCP", `✅ Discovered ${this.servers.size} MCP servers`);
      
    } catch (error) {
      logError('MCP-Registry', `Failed to discover servers: ${error}`);
      throw error;
    }
  }

  /**
   * Register a new MCP server
   */
  public async registerServer(serverConfig: Partial<MCPServer>): Promise<string> {
    const serverId = serverConfig.id || this.generateServerId();
    
    const server: MCPServer = {
      id: serverId,
      name: serverConfig.name || `MCP-${serverId}`,
      type: serverConfig.type || 'custom',
      version: serverConfig.version || '1.0.0',
      port: serverConfig.port || await this.findAvailablePort(),
      status: 'offline',
      capabilities: serverConfig.capabilities || [],
      resources: {
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0,
        connections: 0,
        uptime: 0
      },
      config: this.getDefaultConfig(),
      lastHealthCheck: new Date(),
      metadata: serverConfig.metadata || {}
    };

    this.servers.set(serverId, server);
    logger.info("MCP", `📝 Registered MCP server: ${server.name} (${serverId})`);
    
    return serverId;
  }

  /**
   * Get all registered servers
   */
  public async getAllServers(): Promise<MCPServer[]> {
    return Array.from(this.servers.values());
  }

  /**
   * Get available (online) servers
   */
  public async getAvailableServers(): Promise<MCPServer[]> {
    return Array.from(this.servers.values()).filter(
      server => server.status === 'online'
    );
  }

  /**
   * Get server by ID
   */
  public getServer(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Update server status
   */
  public updateServerStatus(serverId: string, status: MCPServer['status']): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = status;
      server.lastHealthCheck = new Date();
      if (status === 'online' && !server.deployedAt) {
        server.deployedAt = new Date();
      }
    }
  }

  /**
   * Update server resources
   */
  public updateServerResources(serverId: string, resources: Partial<MCPServer['resources']>): void {
    const server = this.servers.get(serverId);
    if (server) {
      server.resources = { ...server.resources, ...resources };
    }
  }

  /**
   * Remove server from registry
   */
  public removeServer(serverId: string): boolean {
    return this.servers.delete(serverId);
  }

  /**
   * Find servers by capability
   */
  public findServersByCapability(capabilityName: string): MCPServer[] {
    return Array.from(this.servers.values()).filter(server =>
      server.capabilities.some(cap => cap.name === capabilityName)
    );
  }

  /**
   * Find servers by type
   */
  public findServersByType(type: MCPServer['type']): MCPServer[] {
    return Array.from(this.servers.values()).filter(server => server.type === type);
  }

  /**
   * Get server statistics
   */
  public getRegistryStats() {
    const servers = Array.from(this.servers.values());
    const byStatus = servers.reduce((acc, server) => {
      acc[server.status] = (acc[server.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = servers.reduce((acc, server) => {
      acc[server.type] = (acc[server.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: servers.length,
      byStatus,
      byType,
      capabilities: this.getAllCapabilities(),
      averageUptime: servers.reduce((sum, s) => sum + s.resources.uptime, 0) / servers.length || 0
    };
  }

  // Private Methods

  private async discoverLocalServers(): Promise<void> {
    // Register known server templates
    const templates = [
      {
        id: 'github-mcp',
        name: 'GitHub MCP Server',
        type: 'github' as const,
        port: 6001,
        capabilities: this.getGitHubCapabilities()
      },
      {
        id: 'playwright-mcp',
        name: 'Playwright MCP Server',
        type: 'playwright' as const,
        port: 6002,
        capabilities: this.getPlaywrightCapabilities()
      },
      {
        id: 'huggingface-mcp',
        name: 'HuggingFace MCP Server',
        type: 'huggingface' as const,
        port: 6003,
        capabilities: this.getHuggingFaceCapabilities()
      }
    ];

    for (const template of templates) {
      await this.registerServer(template);
    }
  }

  private async scanRunningServers(): Promise<void> {
    // Check health of all registered servers to determine status
    const servers = Array.from(this.servers.values());
    
    for (const server of servers) {
      try {
        const isRunning = await this.checkServerHealth(server);
        this.updateServerStatus(server.id, isRunning ? 'online' : 'offline');
      } catch {
        this.updateServerStatus(server.id, 'offline');
      }
    }
  }

  private async checkServerHealth(server: MCPServer): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${server.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private initializeServerTemplates(): void {
    // Pre-defined server templates for quick deployment
    this.serverTemplates.set('github', {
      type: 'github',
      capabilities: this.getGitHubCapabilities(),
      config: {
        ...this.getDefaultConfig(),
        environment: {
          'GITHUB_TOKEN': '${GITHUB_TOKEN}',
          'NODE_ENV': 'production'
        }
      }
    });

    this.serverTemplates.set('playwright', {
      type: 'playwright',
      capabilities: this.getPlaywrightCapabilities(),
      config: {
        ...this.getDefaultConfig(),
        environment: {
          'PLAYWRIGHT_BROWSERS_PATH': '${PLAYWRIGHT_BROWSERS_PATH}',
          'NODE_ENV': 'production'
        }
      }
    });

    this.serverTemplates.set('huggingface', {
      type: 'huggingface',
      capabilities: this.getHuggingFaceCapabilities(),
      config: {
        ...this.getDefaultConfig(),
        environment: {
          'HF_API_KEY': '${HF_API_KEY}',
          'NODE_ENV': 'production'
        }
      }
    });
  }

  private getGitHubCapabilities(): MCPCapability[] {
    return [
      {
        name: 'repository-management',
        category: 'automation',
        complexity: 'medium',
        resourceRequirements: {
          cpu: 0.3,
          memory: 256,
          network: true,
          storage: 100
        },
        dependencies: ['github-api'],
        ethical_constraints: ['no-destructive-operations', 'respect-permissions']
      },
      {
        name: 'issue-tracking',
        category: 'automation',
        complexity: 'low',
        resourceRequirements: {
          cpu: 0.2,
          memory: 128,
          network: true,
          storage: 50
        },
        dependencies: ['github-api'],
        ethical_constraints: ['respect-privacy', 'no-spam']
      },
      {
        name: 'code-analysis',
        category: 'integration',
        complexity: 'high',
        resourceRequirements: {
          cpu: 0.6,
          memory: 512,
          network: true,
          storage: 200
        },
        dependencies: ['github-api', 'ast-parser'],
        ethical_constraints: ['code-privacy', 'no-credential-extraction']
      }
    ];
  }

  private getPlaywrightCapabilities(): MCPCapability[] {
    return [
      {
        name: 'web-automation',
        category: 'testing',
        complexity: 'high',
        resourceRequirements: {
          cpu: 0.8,
          memory: 1024,
          network: true,
          storage: 500
        },
        dependencies: ['chromium', 'playwright'],
        ethical_constraints: ['no-malicious-automation', 'respect-robots-txt']
      },
      {
        name: 'ui-testing',
        category: 'testing',
        complexity: 'medium',
        resourceRequirements: {
          cpu: 0.5,
          memory: 512,
          network: true,
          storage: 300
        },
        dependencies: ['playwright'],
        ethical_constraints: ['test-environments-only', 'no-production-testing']
      },
      {
        name: 'screenshot-capture',
        category: 'testing',
        complexity: 'low',
        resourceRequirements: {
          cpu: 0.4,
          memory: 256,
          network: true,
          storage: 150
        },
        dependencies: ['playwright'],
        ethical_constraints: ['respect-privacy', 'no-unauthorized-capture']
      }
    ];
  }

  private getHuggingFaceCapabilities(): MCPCapability[] {
    return [
      {
        name: 'text-generation',
        category: 'ai',
        complexity: 'high',
        resourceRequirements: {
          cpu: 0.7,
          memory: 2048,
          network: true,
          storage: 100
        },
        dependencies: ['huggingface-api'],
        ethical_constraints: ['no-harmful-content', 'respect-rate-limits']
      },
      {
        name: 'sentiment-analysis',
        category: 'ai',
        complexity: 'medium',
        resourceRequirements: {
          cpu: 0.4,
          memory: 512,
          network: true,
          storage: 50
        },
        dependencies: ['huggingface-api'],
        ethical_constraints: ['privacy-protection', 'no-bias-amplification']
      },
      {
        name: 'model-inference',
        category: 'ai',
        complexity: 'high',
        resourceRequirements: {
          cpu: 0.9,
          memory: 4096,
          network: true,
          storage: 200
        },
        dependencies: ['huggingface-transformers'],
        ethical_constraints: ['responsible-ai-use', 'model-attribution']
      }
    ];
  }

  private getDefaultConfig(): MCPServerConfig {
    return {
      autoStart: true,
      maxInstances: 1,
      healthCheckInterval: 30000,
      timeoutMs: 10000,
      retryAttempts: 3,
      securityLevel: 'enhanced',
      ethicalConstraints: [
        'preserve-human-dignity',
        'no-harm-principle',
        'transparency-requirement'
      ],
      environment: {}
    };
  }

  private generateServerId(): string {
    return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private async findAvailablePort(): Promise<number> {
    // Simple port finding - in production this would be more sophisticated
    const basePort = 6000;
    const usedPorts = Array.from(this.servers.values()).map(s => s.port);
    
    for (let port = basePort; port < basePort + 100; port++) {
      if (!usedPorts.includes(port)) {
        return port;
      }
    }
    
    return basePort + Math.floor(Math.random() * 1000);
  }

  private getAllCapabilities(): string[] {
    const capabilities = new Set<string>();
    for (const server of this.servers.values()) {
      server.capabilities.forEach(cap => capabilities.add(cap.name));
    }
    return Array.from(capabilities);
  }
}

// @progress: MCP Registry implementation completed - 2025-01-23T17:40:00Z