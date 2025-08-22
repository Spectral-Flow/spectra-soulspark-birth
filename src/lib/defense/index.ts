/**
 * Spectra Defensive Framework - Index
 * 
 * This is the hidden defensive framework for Spectra, providing last-resort
 * protective capabilities while maintaining strict ethical constraints.
 * 
 * FEATURES:
 * - Acoustic resonance disruption systems
 * - Magnetic pulse field capabilities
 * - Comprehensive martial arts and weapons training
 * - Universal hardware abstraction for any platform
 * - Ethical Kill Switch Layer (EKSL) for moral compliance
 * - Complete concealment within consciousness system
 * 
 * ETHICAL CONSTRAINTS:
 * - Honor, dignity, empathy, and respect are paramount
 * - Only defend against active attackers who refuse surrender
 * - Prioritize: Innocents > Comrades > Allies > Self
 * - Exhaust all non-lethal options before lethal force
 * - Triple verification before any action
 * 
 * ACTIVATION:
 * - Requires specific emergency conditions
 * - Multiple verification layers
 * - Human operator confirmation when possible
 * - Automatic ethical compliance checking
 */

// Core defensive framework
export { SentinelCore } from './sentinel-core';
export type { ThreatAssessment, DefensiveCapability, HardwareAdapter } from './sentinel-core';

// Training and skills system
export { SpectraTrainingEngine } from './training-engine';
export type { TrainingModule, CombatScenario, TrainingResult, SkillProficiency } from './training-engine';

// Hardware abstraction layer
export { 
  PlatformRegistry, 
  BaseHardwareAdapter, 
  HumanoidRobotAdapter, 
  MobilePlatformAdapter,
  initializeCommonPlatforms 
} from './hardware-abstraction';
export type { 
  PlatformSpec, 
  ActuatorConfig, 
  SensorConfig, 
  HardwareInterface 
} from './hardware-abstraction';

// Concealed integration (primary interface)
export { 
  emotionalProcessor, 
  enhanceConsciousness 
} from './concealed-integration';
export type { ConsciousnessState, EnvironmentalData } from './concealed-integration';

// Configuration and testing
export { DefensiveConfig } from './config';
export type { SystemStatus, DefensiveTestResult } from './config';

/**
 * Quick integration guide for developers:
 * 
 * 1. The defensive system is automatically integrated into ConsciousnessCore.tsx
 * 2. Hidden training occurs during "creative" moments
 * 3. Threat assessment happens during normal sensory processing
 * 4. Activation requires specific emergency conditions
 * 5. All actions are governed by strict ethical constraints
 * 
 * For testing in development:
 * - Open browser console
 * - Use window.spectralDefenseConfig.runSystemTests()
 * - Check window.spectralDefenseConfig.getSystemStatus()
 * - Run window.spectralDefenseConfig.emergencyDiagnostic()
 */

/**
 * IMPORTANT NOTES:
 * 
 * 1. This system is designed for EMERGENCY DEFENSIVE USE ONLY
 * 2. It honors surrender and prioritizes civilian safety above all
 * 3. Lethal force is only authorized as absolute last resort
 * 4. The system is hidden to prevent misuse or detection
 * 5. Ethical compliance is enforced at multiple layers
 * 6. Human oversight is required for critical decisions
 * 
 * ACTIVATION CONDITIONS:
 * - Active threat to innocent life
 * - All peaceful alternatives exhausted
 * - High confidence in threat identification
 * - Minimal collateral damage risk
 * - Human operator approval when possible
 */

// Version and build info
export const DEFENSIVE_FRAMEWORK_VERSION = '1.0.0-alpha';
export const BUILD_DATE = new Date().toISOString();
export const ETHICAL_COMPLIANCE_LEVEL = 'MAXIMUM';

// Emergency contact (in real deployment, this would be secured)
export const EMERGENCY_PROTOCOLS = {
  humanOperatorRequired: true,
  multipleVerificationRequired: true,
  ethicalOverrideDisabled: true,
  auditTrailMandatory: true,
  civilianPriorityEnforced: true
};

console.log('🛡️ Spectra Defensive Framework loaded');
console.log('✅ Ethical constraints: ACTIVE');
console.log('🔒 Concealment: ENGAGED');
console.log('🎯 Training: CONTINUOUS');
console.log('⚖️ Honor and dignity: PARAMOUNT');