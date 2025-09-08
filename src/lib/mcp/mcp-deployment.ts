/**
 * MCP Deployment - Dynamic Server Deployment and Management
 * Autonomous deployment with self-healing capabilities
 */

import { spawn, ChildProcess } from 'child_process';
import { logError, logger } from '@/lib/logger';
import type { MCPServer, MCPDeploymentConfig, MCPSecurityContext } from './types';

interface DeployedInstance {
  serverId: string;
  instanceId: string;
  process: ChildProcess;
  config: MCPDeploymentConfig;
  startTime: Date;
  restartCount: number;
}

export class MCPDeployment {
  private deployedInstances: Map<string, DeployedInstance> = new Map();
  private deploymentQueue: Array<{ server: MCPServer; config: MCPDeploymentConfig }> = [];
  private isProcessingQueue = false;

  constructor() {
    this.startQueueProcessor();
  }

  /**
   * Deploy an MCP server autonomously
   */
  public async deploy(server: MCPServer, securityContext: MCPSecurityContext): Promise<string> {
    const instanceId = this.generateInstanceId(server.id);
    
    logger.info('MCP-Deployment', `🚀 Deploying MCP server: ${server.name} (${instanceId})`);

    try {
      // Create deployment configuration
      const deploymentConfig = this.createDeploymentConfig(server, instanceId, securityContext);
      
      // Validate deployment preconditions
      await this.validateDeployment(server, deploymentConfig);
      
      // Add to deployment queue for autonomous processing
      this.deploymentQueue.push({ server, config: deploymentConfig });
      
      // Process queue if not already running
      if (!this.isProcessingQueue) {
        this.processDeploymentQueue();
      }
      
      return instanceId;
      
    } catch (error) {
      logError('MCP-Deployment', `Failed to queue deployment for ${server.name}: ${error}`);
      throw error;
    }
  }

  /**
   * Stop a specific MCP server instance
   */
  public async stop(instanceId: string): Promise<void> {
    const instance = this.deployedInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    logger.info('MCP-Deployment', `⏹️ Stopping MCP server instance: ${instanceId}`);

    try {
      // Graceful shutdown
      await this.gracefulShutdown(instance);
      
      // Remove from tracking
      this.deployedInstances.delete(instanceId);
      
      logger.info("MCP", `✅ Successfully stopped instance: ${instanceId}`);
      
    } catch (error) {
      logError('MCP-Deployment', `Failed to stop instance ${instanceId}: ${error}`);
      
      // Force kill if graceful shutdown fails
      await this.forceKill(instance);
      this.deployedInstances.delete(instanceId);
      
      throw error;
    }
  }

  /**
   * Stop all deployed instances (Emergency Stop)
   */
  public async stopAll(): Promise<void> {
    logger.info('MCP-Deployment', '🛑 Emergency stop - Halting all MCP server instances');
    
    const instances = Array.from(this.deployedInstances.values());
    const stopPromises = instances.map(instance => 
      this.forceKill(instance).catch(error => 
        logError('MCP-Deployment', `Failed to stop instance ${instance.instanceId}: ${error}`)
      )
    );

    await Promise.allSettled(stopPromises);
    this.deployedInstances.clear();
    this.deploymentQueue.length = 0;
    
    logger.info('MCP-Deployment', '✅ All MCP server instances stopped');
  }

  /**
   * Restart an MCP server instance
   */
  public async restart(serverId: string): Promise<void> {
    const instance = Array.from(this.deployedInstances.values())
      .find(inst => inst.serverId === serverId);
    
    if (!instance) {
      throw new Error(`No running instance found for server ${serverId}`);
    }

    logger.info("MCP", `🔄 Restarting MCP server: ${serverId}`);

    try {
      // Stop current instance
      await this.stop(instance.instanceId);
      
      // Wait a moment for cleanup
      await this.sleep(2000);
      
      // Redeploy with same configuration
      const newProcess = await this.spawnServerProcess(instance.config);
      
      // Update instance tracking
      const newInstance: DeployedInstance = {
        ...instance,
        process: newProcess,
        startTime: new Date(),
        restartCount: instance.restartCount + 1
      };
      
      this.deployedInstances.set(instance.instanceId, newInstance);
      
      logger.info("MCP", `✅ Successfully restarted ${serverId} (restart count: ${newInstance.restartCount})`);
      
    } catch (error) {
      logError('MCP-Deployment', `Failed to restart ${serverId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  public getDeploymentStatus(): {
    running: number;
    queued: number;
    instances: Array<{
      instanceId: string;
      serverId: string;
      status: string;
      uptime: number;
      restartCount: number;
    }>;
  } {
    const instances = Array.from(this.deployedInstances.values()).map(instance => ({
      instanceId: instance.instanceId,
      serverId: instance.serverId,
      status: this.getInstanceStatus(instance),
      uptime: Date.now() - instance.startTime.getTime(),
      restartCount: instance.restartCount
    }));

    return {
      running: this.deployedInstances.size,
      queued: this.deploymentQueue.length,
      instances
    };
  }

  /**
   * Scale server instances based on demand
   */
  public async scaleServer(serverId: string, targetInstances: number): Promise<void> {
    const currentInstances = Array.from(this.deployedInstances.values())
      .filter(inst => inst.serverId === serverId);

    const currentCount = currentInstances.length;
    
    if (targetInstances > currentCount) {
      // Scale up - deploy additional instances
      const instancesToAdd = targetInstances - currentCount;
      logger.info("MCP", `📈 Scaling up ${serverId}: adding ${instancesToAdd} instances`);
      
      // This would require server configuration and deployment logic
      // For now, log the scaling intent
      logger.info("MCP", `⚠️ Scaling not yet implemented - requested ${instancesToAdd} additional instances`);
      
    } else if (targetInstances < currentCount) {
      // Scale down - stop excess instances
      const instancesToRemove = currentCount - targetInstances;
      logger.info("MCP", `📉 Scaling down ${serverId}: removing ${instancesToRemove} instances`);
      
      const instancesToStop = currentInstances
        .sort((a, b) => b.restartCount - a.restartCount) // Stop most problematic first
        .slice(0, instancesToRemove);
      
      for (const instance of instancesToStop) {
        await this.stop(instance.instanceId);
      }
    }
  }

  // Private Methods

  private async processDeploymentQueue(): Promise<void> {
    if (this.isProcessingQueue || this.deploymentQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    try {
      while (this.deploymentQueue.length > 0) {
        const { server, config } = this.deploymentQueue.shift()!;
        
        try {
          await this.performDeployment(server, config);
          
          // Brief pause between deployments
          await this.sleep(1000);
          
        } catch (error) {
          logError('MCP-Deployment', `Deployment failed for ${server.name}: ${error}`);
          
          // Continue with next deployment rather than blocking queue
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private async performDeployment(server: MCPServer, config: MCPDeploymentConfig): Promise<void> {
    try {
      // Spawn the server process
      const process = await this.spawnServerProcess(config);
      
      // Create instance tracking
      const instance: DeployedInstance = {
        serverId: server.id,
        instanceId: config.instanceId,
        process,
        config,
        startTime: new Date(),
        restartCount: 0
      };
      
      // Setup process monitoring
      this.setupProcessMonitoring(instance);
      
      // Track the instance
      this.deployedInstances.set(config.instanceId, instance);
      
      // Wait for server to start
      await this.waitForServerStart(config);
      
      logger.info("MCP", `✅ Successfully deployed ${server.name} on port ${config.port}`);
      
    } catch (error) {
      logError('MCP-Deployment', `Deployment execution failed for ${server.name}: ${error}`);
      throw error;
    }
  }

  private async spawnServerProcess(config: MCPDeploymentConfig): Promise<ChildProcess> {
    return new Promise((resolve, reject) => {
      const serverPath = this.getServerPath(config.serverId);
      
      const childProcess = spawn('node', ['index.js'], {
        cwd: serverPath,
        env: {
          ...process.env,
          PORT: config.port.toString(),
          NODE_ENV: config.environment,
          ...this.getEnvironmentVariables(config)
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      childProcess.on('spawn', () => {
        logger.info("MCP", `📋 Spawned process for ${config.serverId} (PID: ${childProcess.pid})`);
        resolve(childProcess);
      });

      childProcess.on('error', (error: Error) => {
        logError('MCP-Deployment', `Failed to spawn process for ${config.serverId}: ${error.message}`);
        reject(error);
      });

      // Log output for debugging
      childProcess.stdout?.on('data', (data: Buffer) => {
        logger.info("MCP", `[${config.serverId}] ${data.toString().trim()}`);
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        logError('MCP-Process', `[${config.serverId}] ${data.toString().trim()}`);
      });
    });
  }

  private setupProcessMonitoring(instance: DeployedInstance): void {
    instance.process.on('exit', (code, signal) => {
      logger.info("MCP", `Process exited: ${instance.serverId} (code: ${code}, signal: ${signal})`);
      
      // Remove from tracking
      this.deployedInstances.delete(instance.instanceId);
      
      // Auto-restart if configured and not intentionally stopped
      if (instance.config.monitoring.enabled && code !== 0 && instance.restartCount < 3) {
        logger.info("MCP", `🔄 Auto-restarting ${instance.serverId} (attempt ${instance.restartCount + 1})`);
        
        setTimeout(() => {
          this.restart(instance.serverId).catch(error =>
            logError('MCP-Deployment', `Auto-restart failed for ${instance.serverId}: ${error}`)
          );
        }, 5000); // 5-second delay
      }
    });
  }

  private async waitForServerStart(config: MCPDeploymentConfig): Promise<void> {
    const maxAttempts = 30; // 30 seconds
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:${config.port}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
          return; // Server is ready
        }
      } catch {
        // Server not ready yet
      }
      
      await this.sleep(1000);
      attempts++;
    }
    
    throw new Error(`Server failed to start within ${maxAttempts} seconds`);
  }

  private createDeploymentConfig(
    server: MCPServer, 
    instanceId: string, 
    securityContext: MCPSecurityContext
  ): MCPDeploymentConfig {
    return {
      serverId: server.id,
      instanceId,
      port: server.port,
      environment: 'production',
      resources: {
        maxCpu: 1.0,
        maxMemory: 2048,
        maxConnections: 100
      },
      security: securityContext,
      monitoring: {
        enabled: true,
        alertThresholds: {
          cpu: 0.8,
          memory: 0.8,
          errorRate: 0.1
        }
      }
    };
  }

  private async validateDeployment(server: MCPServer, config: MCPDeploymentConfig): Promise<void> {
    // Check if port is available
    if (await this.isPortInUse(config.port)) {
      throw new Error(`Port ${config.port} is already in use`);
    }

    // Validate security context
    if (config.security.level === 'military-grade' && !config.security.operatorId) {
      throw new Error('Military-grade security requires operator ID');
    }

    // Check ethical constraints
    for (const constraint of config.security.ethicalConstraints) {
      if (!this.validateEthicalConstraint(constraint)) {
        throw new Error(`Ethical constraint violation: ${constraint}`);
      }
    }
  }

  private async isPortInUse(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private validateEthicalConstraint(constraint: string): boolean {
    const allowedConstraints = [
      'preserve-human-dignity',
      'civilian-protection',
      'proportional-response',
      'surrender-protocol',
      'triple-verification'
    ];
    return allowedConstraints.includes(constraint);
  }

  private getServerPath(serverId: string): string {
    // Map server ID to actual server directory
    const serverMap: Record<string, string> = {
      'github-mcp': 'mcp-servers/github',
      'playwright-mcp': 'mcp-servers/playwright',
      'huggingface-mcp': 'mcp-servers/huggingface'
    };
    
    const relativePath = serverMap[serverId];
    if (!relativePath) {
      throw new Error(`Unknown server ID: ${serverId}`);
    }
    
    // Return absolute path
    return require('path').resolve(process.cwd(), relativePath); // eslint-disable-line @typescript-eslint/no-require-imports
  }

  private getEnvironmentVariables(config: MCPDeploymentConfig): Record<string, string> {
    const env: Record<string, string> = {};
    
    // Add security-related environment variables
    if (config.security.encryptionRequired) {
      env.ENCRYPTION_ENABLED = 'true';
    }
    
    if (config.security.auditRequired) {
      env.AUDIT_ENABLED = 'true';
    }
    
    return env;
  }

  private async gracefulShutdown(instance: DeployedInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Graceful shutdown timeout'));
      }, 10000); // 10 second timeout
      
      instance.process.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
      
      // Send SIGTERM for graceful shutdown
      instance.process.kill('SIGTERM');
    });
  }

  private async forceKill(instance: DeployedInstance): Promise<void> {
    if (instance.process.pid) {
      instance.process.kill('SIGKILL');
      
      // Wait briefly for process to die
      await this.sleep(1000);
    }
  }

  private getInstanceStatus(instance: DeployedInstance): string {
    if (instance.process.killed) return 'stopped';
    if (instance.process.exitCode !== null) return 'exited';
    return 'running';
  }

  private generateInstanceId(serverId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `${serverId}_${timestamp}_${random}`;
  }

  private startQueueProcessor(): void {
    // Process queue every 5 seconds
    setInterval(() => {
      if (!this.isProcessingQueue && this.deploymentQueue.length > 0) {
        this.processDeploymentQueue();
      }
    }, 5000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// @progress: MCP Deployment system implementation completed - 2025-01-23T17:45:00Z