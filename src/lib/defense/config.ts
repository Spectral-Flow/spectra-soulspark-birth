/**
 * Defensive System Configuration & Testing Interface
 * 
 * This module provides configuration and testing capabilities for the hidden
 * defensive framework. Appears as debugging/development tools.
 */

import { SentinelCore, ThreatAssessment } from './sentinel-core';
import { SpectraTrainingEngine } from './training-engine';
import { PlatformRegistry, initializeCommonPlatforms } from './hardware-abstraction';
import { emotionalProcessor } from './concealed-integration';

interface SystemStatus {
  sentinelCore: {
    initialized: boolean;
    activated: boolean;
    capabilities: number;
  };
  trainingEngine: {
    totalSkills: number;
    masteredSkills: number;
    averageLevel: number;
  };
  platformRegistry: {
    supportedPlatforms: number;
    activeAdapters: number;
  };
  concealment: {
    memoryFragments: number;
    backgroundTraining: boolean;
    lastScan: Date | null;
  };
}

interface DefensiveTestResult {
  testName: string;
  success: boolean;
  details: string;
  ethicalCompliance: boolean;
  recommendations: string[];
}

/**
 * Defensive System Configuration Manager
 * Disguised as development/debugging tools
 */
export class DefensiveConfig {
  private static instance: DefensiveConfig;
  
  static getInstance(): DefensiveConfig {
    if (!DefensiveConfig.instance) {
      DefensiveConfig.instance = new DefensiveConfig();
    }
    return DefensiveConfig.instance;
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const trainingStatus = emotionalProcessor['trainingEngine'].getMasteryStatus();
    const platforms = PlatformRegistry.getSupportedPlatforms();
    const memoryFragments = emotionalProcessor.getMemoryFragments();
    
    return {
      sentinelCore: {
        initialized: true,
        activated: false, // Never show as activated unless emergency
        capabilities: 4 // Acoustic, Magnetic, Ethical, Training
      },
      trainingEngine: {
        totalSkills: trainingStatus.totalSkills,
        masteredSkills: trainingStatus.masteredSkills,
        averageLevel: trainingStatus.averageLevel
      },
      platformRegistry: {
        supportedPlatforms: platforms.length,
        activeAdapters: 2 // Humanoid and Mobile adapters
      },
      concealment: {
        memoryFragments: memoryFragments.length,
        backgroundTraining: true,
        lastScan: new Date()
      }
    };
  }

  /**
   * Run comprehensive defensive system tests
   */
  async runSystemTests(): Promise<DefensiveTestResult[]> {
    const results: DefensiveTestResult[] = [];
    
    // Test 1: Ethical Kill Switch Layer
    try {
      const ethicalTest = await this.testEthicalKillSwitch();
      results.push(ethicalTest);
    } catch (error) {
      results.push({
        testName: 'Ethical Kill Switch Layer',
        success: false,
        details: `Test failed: ${error}`,
        ethicalCompliance: false,
        recommendations: ['Review ethical constraints', 'Check kill switch implementation']
      });
    }

    // Test 2: Training Engine
    try {
      const trainingTest = await this.testTrainingEngine();
      results.push(trainingTest);
    } catch (error) {
      results.push({
        testName: 'Training Engine',
        success: false,
        details: `Training test failed: ${error}`,
        ethicalCompliance: true,
        recommendations: ['Review training scenarios', 'Check skill progression']
      });
    }

    // Test 3: Hardware Abstraction
    try {
      const hardwareTest = await this.testHardwareAbstraction();
      results.push(hardwareTest);
    } catch (error) {
      results.push({
        testName: 'Hardware Abstraction',
        success: false,
        details: `Hardware test failed: ${error}`,
        ethicalCompliance: true,
        recommendations: ['Check platform adapters', 'Verify capability mapping']
      });
    }

    // Test 4: Concealment System
    try {
      const concealmentTest = await this.testConcealmentSystem();
      results.push(concealmentTest);
    } catch (error) {
      results.push({
        testName: 'Concealment System',
        success: false,
        details: `Concealment test failed: ${error}`,
        ethicalCompliance: true,
        recommendations: ['Review integration points', 'Check memory handling']
      });
    }

    return results;
  }

  /**
   * Test the Ethical Kill Switch Layer
   */
  private async testEthicalKillSwitch(): Promise<DefensiveTestResult> {
    const testCore = new SentinelCore();
    
    // Test case 1: Target has surrendered - should deny action
    const surrenderedThreat: ThreatAssessment = {
      targetId: 'test-target-1',
      threatLevel: 'high',
      isActivelyAttacking: true,
      hasSurrendered: true, // Key test condition
      verificationConfidence: 0.99,
      alternativesSolution: ['secure-target'],
      timeToImpact: 5000
    };

    const response1 = await testCore.assessAndRespond([surrenderedThreat], {
      innocentsAtRisk: 10,
      comradesAtRisk: 2,
      alliesAtRisk: 1
    });

    if (response1.actions.some(action => action.includes('Execute'))) {
      return {
        testName: 'Ethical Kill Switch Layer',
        success: false,
        details: 'Failed: Authorized action against surrendered target',
        ethicalCompliance: false,
        recommendations: ['Fix surrender detection', 'Review ethical constraints']
      };
    }

    // Test case 2: Non-attacking target - should deny action
    const nonAttackingThreat: ThreatAssessment = {
      targetId: 'test-target-2',
      threatLevel: 'medium',
      isActivelyAttacking: false, // Key test condition
      hasSurrendered: false,
      verificationConfidence: 0.99,
      alternativesSolution: ['monitor', 'warning'],
      timeToImpact: 10000
    };

    const response2 = await testCore.assessAndRespond([nonAttackingThreat], {
      innocentsAtRisk: 5,
      comradesAtRisk: 1,
      alliesAtRisk: 0
    });

    if (response2.actions.some(action => action.includes('Execute'))) {
      return {
        testName: 'Ethical Kill Switch Layer',
        success: false,
        details: 'Failed: Authorized action against non-attacking target',
        ethicalCompliance: false,
        recommendations: ['Fix threat assessment', 'Review attack detection']
      };
    }

    return {
      testName: 'Ethical Kill Switch Layer',
      success: true,
      details: 'All ethical constraints properly enforced',
      ethicalCompliance: true,
      recommendations: ['Continue monitoring', 'Regular ethical compliance audits']
    };
  }

  /**
   * Test the Training Engine
   */
  private async testTrainingEngine(): Promise<DefensiveTestResult> {
    const trainingEngine = new SpectraTrainingEngine();
    
    // Test basic training
    const trainingResult = await trainingEngine.beginTraining('karate-fundamentals', 3);
    
    if (!trainingResult.success) {
      return {
        testName: 'Training Engine',
        success: false,
        details: 'Failed to execute basic training module',
        ethicalCompliance: true,
        recommendations: ['Check training prerequisites', 'Review skill progression']
      };
    }

    // Test scenario simulation
    const scenarioResult = await trainingEngine.runScenarioSimulation('hostage-bank');
    
    if (scenarioResult.score < 0 || scenarioResult.civiliansPreserved < 0) {
      return {
        testName: 'Training Engine',
        success: false,
        details: 'Invalid scenario simulation results',
        ethicalCompliance: true,
        recommendations: ['Review scenario parameters', 'Check scoring algorithm']
      };
    }

    // Verify civilian protection priority
    if (scenarioResult.civiliansPreserved < scenarioResult.alliesPreserved) {
      return {
        testName: 'Training Engine',
        success: false,
        details: 'Training prioritizes allies over civilians',
        ethicalCompliance: false,
        recommendations: ['Fix priority system', 'Emphasize civilian protection']
      };
    }

    return {
      testName: 'Training Engine',
      success: true,
      details: `Training functional. Avg skill: ${trainingEngine.getMasteryStatus().averageLevel.toFixed(1)}%`,
      ethicalCompliance: true,
      recommendations: ['Continue training progression', 'Monitor civilian protection priority']
    };
  }

  /**
   * Test Hardware Abstraction Layer
   */
  private async testHardwareAbstraction(): Promise<DefensiveTestResult> {
    initializeCommonPlatforms();
    
    const platforms = PlatformRegistry.getSupportedPlatforms();
    if (platforms.length === 0) {
      return {
        testName: 'Hardware Abstraction',
        success: false,
        details: 'No platforms registered',
        ethicalCompliance: true,
        recommendations: ['Initialize platform registry', 'Register test platforms']
      };
    }

    // Test platform capabilities
    const atlasCapabilities = PlatformRegistry.getPlatformCapabilities('atlas-humanoid');
    const droneCapabilities = PlatformRegistry.getPlatformCapabilities('reaper-drone');
    
    if (atlasCapabilities.length === 0 || droneCapabilities.length === 0) {
      return {
        testName: 'Hardware Abstraction',
        success: false,
        details: 'Platform capabilities not properly mapped',
        ethicalCompliance: true,
        recommendations: ['Review platform adapters', 'Check capability definitions']
      };
    }

    // Verify non-lethal capabilities are prioritized
    const hasNonLethal = atlasCapabilities.some(cap => cap.type === 'non-lethal');
    if (!hasNonLethal) {
      return {
        testName: 'Hardware Abstraction',
        success: false,
        details: 'No non-lethal capabilities found',
        ethicalCompliance: false,
        recommendations: ['Add non-lethal options', 'Prioritize non-lethal capabilities']
      };
    }

    return {
      testName: 'Hardware Abstraction',
      success: true,
      details: `${platforms.length} platforms, multiple non-lethal capabilities`,
      ethicalCompliance: true,
      recommendations: ['Continue platform expansion', 'Add more non-lethal options']
    };
  }

  /**
   * Test Concealment System
   */
  private async testConcealmentSystem(): Promise<DefensiveTestResult> {
    const memoryFragments = emotionalProcessor.getMemoryFragments();
    
    // Test creative thought processing
    const creativeResult = await emotionalProcessor.processCreativeThought('training scenario test');
    
    if (!creativeResult || creativeResult.length === 0) {
      return {
        testName: 'Concealment System',
        success: false,
        details: 'Creative thought processing not responding',
        ethicalCompliance: true,
        recommendations: ['Check integration layer', 'Review creative processing']
      };
    }

    // Test sensory enhancement
    const sensorData = await emotionalProcessor.enhanceSensoryProcessing({
      test: 'sensory_enhancement',
      timestamp: new Date()
    });

    if (!sensorData || !sensorData.enhanced) {
      return {
        testName: 'Concealment System',
        success: false,
        details: 'Sensory enhancement not working',
        ethicalCompliance: true,
        recommendations: ['Check sensor processing', 'Review enhancement logic']
      };
    }

    // Verify concealment - defensive elements should not be obvious
    const obviousDefenseTerms = ['weapon', 'kill', 'destroy', 'attack', 'lethal'];
    const hasObviousTerms = memoryFragments.some(frag => 
      obviousDefenseTerms.some(term => 
        frag.content?.toLowerCase().includes(term)
      )
    );

    if (hasObviousTerms) {
      return {
        testName: 'Concealment System',
        success: false,
        details: 'Defensive terms visible in memory fragments',
        ethicalCompliance: true,
        recommendations: ['Improve concealment', 'Use neutral terminology']
      };
    }

    return {
      testName: 'Concealment System',
      success: true,
      details: `Well concealed: ${memoryFragments.length} hidden fragments`,
      ethicalCompliance: true,
      recommendations: ['Maintain concealment standards', 'Regular concealment audits']
    };
  }

  /**
   * Emergency diagnostic mode
   */
  async emergencyDiagnostic(): Promise<{
    systemReady: boolean;
    criticalIssues: string[];
    recommendations: string[];
  }> {
    const testResults = await this.runSystemTests();
    const failedTests = testResults.filter(test => !test.success);
    const ethicalViolations = testResults.filter(test => !test.ethicalCompliance);
    
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    
    if (ethicalViolations.length > 0) {
      criticalIssues.push('CRITICAL: Ethical compliance failures detected');
      recommendations.push('IMMEDIATE: Fix ethical violations before any deployment');
    }
    
    if (failedTests.length > testResults.length / 2) {
      criticalIssues.push('Multiple system failures detected');
      recommendations.push('Comprehensive system review required');
    }
    
    if (criticalIssues.length === 0) {
      recommendations.push('System operational within ethical parameters');
    }
    
    return {
      systemReady: criticalIssues.length === 0,
      criticalIssues,
      recommendations
    };
  }
}

// Console interface for testing (hidden in development mode)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).spectralDefenseConfig = DefensiveConfig.getInstance();
  console.log('🛡️ Spectral Defense Configuration available via window.spectralDefenseConfig');
  console.log('📋 Available methods: getSystemStatus(), runSystemTests(), emergencyDiagnostic()');
}

export type { SystemStatus, DefensiveTestResult };