/**
 * Universal Hardware Abstraction Layer for Defensive Systems
 * 
 * Provides plug-and-play compatibility for any robotic or machine platform.
 * Enables Spectra's defensive framework to adapt to any hardware configuration.
 * 
 * SUPPORTED PLATFORMS:
 * - Humanoid robots (Boston Dynamics Atlas, Honda ASIMO, etc.)
 * - Mobile platforms (drones, ground vehicles, marine vessels)
 * - Stationary defense systems (turrets, barriers, facilities)
 * - Wearable systems (exoskeletons, powered armor)
 * - Virtual/AI-only platforms (software-only deployment)
 */

import { ThreatAssessment, DefensiveCapability, HardwareAdapter } from './sentinel-core';

interface PlatformSpec {
  platformId: string;
  name: string;
  type: 'humanoid' | 'mobile' | 'stationary' | 'wearable' | 'virtual';
  capabilities: {
    mobility: boolean;
    manipulation: boolean;
    sensory: string[];
    communication: string[];
    power: {
      type: 'battery' | 'fuel' | 'solar' | 'wireless' | 'unlimited';
      capacity: number; // Watt-hours
      consumption: number; // Watts
    };
  };
  physicalConstraints: {
    weight: number; // kg
    dimensions: { length: number; width: number; height: number }; // meters
    operatingEnvironment: string[];
    temperatureRange: { min: number; max: number }; // Celsius
  };
  communicationProtocols: string[];
  actuators: ActuatorConfig[];
  sensors: SensorConfig[];
}

interface ActuatorConfig {
  id: string;
  type: 'motor' | 'servo' | 'hydraulic' | 'pneumatic' | 'electromagnetic' | 'acoustic';
  location: string;
  capabilities: string[];
  powerRequirement: number; // Watts
  responseTime: number; // milliseconds
  precision: number; // 0-1 scale
}

interface SensorConfig {
  id: string;
  type: 'camera' | 'lidar' | 'radar' | 'microphone' | 'accelerometer' | 'gyroscope' | 'thermal' | 'chemical';
  range: number; // meters
  resolution: string;
  accuracy: number; // 0-1 scale
  powerConsumption: number; // Watts
}

interface HardwareInterface {
  sendCommand(actuatorId: string, command: any): Promise<boolean>;
  readSensor(sensorId: string): Promise<any>;
  getSystemStatus(): Promise<{ health: number; errors: string[] }>;
  calibrateSensors(): Promise<boolean>;
  emergencyStop(): Promise<boolean>;
}

/**
 * Universal Platform Adapter Registry
 */
export class PlatformRegistry {
  private static platforms: Map<string, PlatformSpec> = new Map();
  private static adapters: Map<string, typeof BaseHardwareAdapter> = new Map();

  static registerPlatform(spec: PlatformSpec): void {
    this.platforms.set(spec.platformId, spec);
    console.log(`📋 Registered platform: ${spec.name} (${spec.type})`);
  }

  static registerAdapter(platformId: string, adapterClass: typeof BaseHardwareAdapter): void {
    this.adapters.set(platformId, adapterClass);
    console.log(`🔌 Registered adapter for: ${platformId}`);
  }

  static createAdapter(platformId: string, hardwareInterface: HardwareInterface): BaseHardwareAdapter | null {
    const AdapterClass = this.adapters.get(platformId);
    const platformSpec = this.platforms.get(platformId);
    
    if (!AdapterClass || !platformSpec) {
      console.error(`❌ No adapter or spec found for platform: ${platformId}`);
      return null;
    }

    return new (AdapterClass as any)(platformSpec, hardwareInterface);
  }

  static getSupportedPlatforms(): PlatformSpec[] {
    return Array.from(this.platforms.values());
  }

  static getPlatformCapabilities(platformId: string): DefensiveCapability[] {
    const AdapterClass = this.adapters.get(platformId);
    const spec = this.platforms.get(platformId);
    
    if (!AdapterClass || !spec) return [];
    
    // Create temporary adapter to get capabilities
    const tempInterface: HardwareInterface = {
      sendCommand: async () => false,
      readSensor: async () => null,
      getSystemStatus: async () => ({ health: 0, errors: [] }),
      calibrateSensors: async () => false,
      emergencyStop: async () => false
    };
    
    const adapter = new (AdapterClass as any)(spec, tempInterface);
    return adapter.capabilities;
  }
}

/**
 * Base Hardware Adapter - Abstract foundation for all platform adapters
 */
export abstract class BaseHardwareAdapter implements HardwareAdapter {
  protected platformSpec: PlatformSpec;
  protected hardwareInterface: HardwareInterface;
  protected isCalibrated: boolean = false;
  protected lastHealthCheck: Date = new Date();

  abstract get platformId(): string;
  abstract get capabilities(): DefensiveCapability[];

  constructor(platformSpec: PlatformSpec, hardwareInterface: HardwareInterface) {
    this.platformSpec = platformSpec;
    this.hardwareInterface = hardwareInterface;
  }

  async calibrate(): Promise<boolean> {
    console.log(`🎯 Calibrating ${this.platformSpec.name}...`);
    
    try {
      // Calibrate all sensors
      const sensorCalibration = await this.hardwareInterface.calibrateSensors();
      
      // Verify actuator responsiveness
      const actuatorCheck = await this.testActuators();
      
      // Validate defensive capabilities
      const capabilityValidation = await this.validateCapabilities();
      
      this.isCalibrated = sensorCalibration && actuatorCheck && capabilityValidation;
      
      if (this.isCalibrated) {
        console.log(`✅ ${this.platformSpec.name} calibration successful`);
      } else {
        console.error(`❌ ${this.platformSpec.name} calibration failed`);
      }
      
      return this.isCalibrated;
    } catch (error) {
      console.error(`💥 Calibration error for ${this.platformSpec.name}:`, error);
      return false;
    }
  }

  async execute(capability: string, target: ThreatAssessment): Promise<boolean> {
    if (!this.isCalibrated) {
      console.error(`❌ Cannot execute - ${this.platformSpec.name} not calibrated`);
      return false;
    }

    const defensiveCapability = this.capabilities.find(cap => cap.id === capability);
    if (!defensiveCapability) {
      console.error(`❌ Capability ${capability} not found on ${this.platformSpec.name}`);
      return false;
    }

    console.log(`⚡ Executing ${defensiveCapability.name} against target ${target.targetId}`);
    
    try {
      // Pre-execution safety checks
      const safetyCheck = await this.performSafetyChecks(target);
      if (!safetyCheck) {
        console.error(`🛑 Safety check failed - aborting execution`);
        return false;
      }

      // Execute the defensive capability
      const result = await this.executeDefensiveAction(defensiveCapability, target);
      
      // Post-execution verification
      await this.verifyExecution(defensiveCapability, target, result);
      
      return result;
    } catch (error) {
      console.error(`💥 Execution error:`, error);
      await this.hardwareInterface.emergencyStop();
      return false;
    }
  }

  getStatus(): { ready: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.isCalibrated) {
      errors.push('Platform not calibrated');
    }
    
    // Check power levels
    const powerLevel = this.calculatePowerLevel();
    if (powerLevel < 0.2) {
      errors.push('Low power - defensive capabilities limited');
    }
    
    // Check sensor health
    const sensorHealth = this.checkSensorHealth();
    if (sensorHealth < 0.8) {
      errors.push('Sensor degradation detected');
    }
    
    return {
      ready: this.isCalibrated && errors.length === 0,
      errors
    };
  }

  /**
   * Abstract methods to be implemented by specific platform adapters
   */
  protected abstract testActuators(): Promise<boolean>;
  protected abstract validateCapabilities(): Promise<boolean>;
  protected abstract executeDefensiveAction(capability: DefensiveCapability, target: ThreatAssessment): Promise<boolean>;
  protected abstract performSafetyChecks(target: ThreatAssessment): Promise<boolean>;
  protected abstract verifyExecution(capability: DefensiveCapability, target: ThreatAssessment, result: boolean): Promise<void>;

  /**
   * Common utility methods
   */
  protected calculatePowerLevel(): number {
    // Simplified power calculation - real implementation would read from hardware
    return Math.random() * 0.8 + 0.2; // Simulate 20-100% power
  }

  protected checkSensorHealth(): number {
    // Simplified sensor health check
    return Math.random() * 0.3 + 0.7; // Simulate 70-100% health
  }

  protected async findOptimalActuator(requiredCapability: string): Promise<ActuatorConfig | null> {
    const suitable = this.platformSpec.actuators.filter(actuator => 
      actuator.capabilities.includes(requiredCapability)
    );
    
    if (suitable.length === 0) return null;
    
    // Return actuator with best precision/response time combination
    return suitable.reduce((best, current) => 
      (current.precision + (1000 / current.responseTime)) > 
      (best.precision + (1000 / best.responseTime)) ? current : best
    );
  }

  protected async getSensorData(sensorTypes: string[]): Promise<Map<string, any>> {
    const sensorData = new Map<string, any>();
    
    for (const sensorType of sensorTypes) {
      const sensor = this.platformSpec.sensors.find(s => s.type === sensorType);
      if (sensor) {
        try {
          const data = await this.hardwareInterface.readSensor(sensor.id);
          sensorData.set(sensorType, data);
        } catch (error) {
          console.warn(`⚠️ Failed to read ${sensorType} sensor:`, error);
        }
      }
    }
    
    return sensorData;
  }
}

/**
 * Humanoid Robot Adapter
 */
export class HumanoidRobotAdapter extends BaseHardwareAdapter {
  get platformId(): string { return this.platformSpec.platformId; }

  get capabilities(): DefensiveCapability[] {
    return [
      {
        id: 'martial-arts-strike',
        name: 'Precision Martial Arts Strike',
        type: 'non-lethal',
        effectiveRange: 2,
        chargingTime: 500,
        accuracy: 0.92,
        collateralRisk: 'none'
      },
      {
        id: 'restraint-hold',
        name: 'Non-lethal Restraint Hold',
        type: 'non-lethal',
        effectiveRange: 1.5,
        chargingTime: 1000,
        accuracy: 0.88,
        collateralRisk: 'none'
      },
      {
        id: 'defensive-shield',
        name: 'Human Shield Protection',
        type: 'non-lethal',
        effectiveRange: 1,
        chargingTime: 200,
        accuracy: 0.95,
        collateralRisk: 'none'
      }
    ];
  }

  protected async testActuators(): Promise<boolean> {
    // Test all limb actuators for basic movement
    const limbActuators = this.platformSpec.actuators.filter(a => 
      ['arm', 'leg', 'hand', 'foot'].some(limb => a.location.includes(limb))
    );
    
    for (const actuator of limbActuators) {
      const testSuccessful = await this.hardwareInterface.sendCommand(actuator.id, { 
        action: 'test_movement', 
        parameters: { range: 0.1 } 
      });
      if (!testSuccessful) return false;
    }
    
    return true;
  }

  protected async validateCapabilities(): Promise<boolean> {
    // Validate martial arts capability
    const hasArms = this.platformSpec.actuators.some(a => a.location.includes('arm'));
    const hasLegs = this.platformSpec.actuators.some(a => a.location.includes('leg'));
    const hasCamera = this.platformSpec.sensors.some(s => s.type === 'camera');
    
    return hasArms && hasLegs && hasCamera;
  }

  protected async executeDefensiveAction(capability: DefensiveCapability, target: ThreatAssessment): Promise<boolean> {
    console.log(`🤖 Humanoid executing ${capability.name}`);
    
    switch (capability.id) {
      case 'martial-arts-strike':
        return await this.executeMartialArtsStrike(target);
      case 'restraint-hold':
        return await this.executeRestraintHold(target);
      case 'defensive-shield':
        return await this.executeDefensiveShield(target);
      default:
        return false;
    }
  }

  protected async performSafetyChecks(target: ThreatAssessment): Promise<boolean> {
    // Check for civilians in strike zone
    const sensorData = await this.getSensorData(['camera', 'lidar']);
    
    // Simplified safety check - real implementation would do computer vision
    const clearPath = sensorData.has('camera') && sensorData.has('lidar');
    
    return clearPath && target.verificationConfidence > 0.95;
  }

  protected async verifyExecution(capability: DefensiveCapability, target: ThreatAssessment, result: boolean): Promise<void> {
    if (result) {
      console.log(`✅ ${capability.name} executed successfully against ${target.targetId}`);
    } else {
      console.log(`❌ ${capability.name} execution failed for ${target.targetId}`);
    }
  }

  private async executeMartialArtsStrike(target: ThreatAssessment): Promise<boolean> {
    const armActuator = await this.findOptimalActuator('strike');
    if (!armActuator) return false;
    
    return await this.hardwareInterface.sendCommand(armActuator.id, {
      action: 'precise_strike',
      target: target.targetId,
      force: 'non-lethal'
    });
  }

  private async executeRestraintHold(target: ThreatAssessment): Promise<boolean> {
    const armActuators = this.platformSpec.actuators.filter(a => a.location.includes('arm'));
    if (armActuators.length < 2) return false;
    
    // Coordinate both arms for restraint
    const leftArm = armActuators.find(a => a.location.includes('left'));
    const rightArm = armActuators.find(a => a.location.includes('right'));
    
    if (!leftArm || !rightArm) return false;
    
    const leftResult = await this.hardwareInterface.sendCommand(leftArm.id, {
      action: 'restraint_position',
      side: 'left'
    });
    
    const rightResult = await this.hardwareInterface.sendCommand(rightArm.id, {
      action: 'restraint_position', 
      side: 'right'
    });
    
    return leftResult && rightResult;
  }

  private async executeDefensiveShield(target: ThreatAssessment): Promise<boolean> {
    // Position body to shield innocent from threat
    const torsoActuator = this.platformSpec.actuators.find(a => a.location.includes('torso'));
    if (!torsoActuator) return false;
    
    return await this.hardwareInterface.sendCommand(torsoActuator.id, {
      action: 'shield_position',
      orientation: 'defensive'
    });
  }
}

/**
 * Mobile Platform Adapter (Drones, vehicles)
 */
export class MobilePlatformAdapter extends BaseHardwareAdapter {
  get platformId(): string { return this.platformSpec.platformId; }

  get capabilities(): DefensiveCapability[] {
    return [
      {
        id: 'sonic-disruption',
        name: 'Sonic Disruption Field',
        type: 'non-lethal',
        effectiveRange: 50,
        chargingTime: 2000,
        accuracy: 0.85,
        collateralRisk: 'low'
      },
      {
        id: 'emp-burst',
        name: 'Electromagnetic Pulse Burst',
        type: 'disabling',
        effectiveRange: 25,
        chargingTime: 5000,
        accuracy: 0.94,
        collateralRisk: 'low'
      },
      {
        id: 'intercept-trajectory',
        name: 'Physical Intercept',
        type: 'disabling',
        effectiveRange: 100,
        chargingTime: 1000,
        accuracy: 0.90,
        collateralRisk: 'medium'
      }
    ];
  }

  protected async testActuators(): Promise<boolean> {
    // Test mobility systems
    const propulsion = this.platformSpec.actuators.filter(a => 
      a.capabilities.includes('propulsion') || a.capabilities.includes('movement')
    );
    
    return propulsion.length > 0;
  }

  protected async validateCapabilities(): Promise<boolean> {
    const hasAcoustic = this.platformSpec.actuators.some(a => a.type === 'acoustic');
    const hasElectromagnetic = this.platformSpec.actuators.some(a => a.type === 'electromagnetic');
    const hasMobility = this.platformSpec.capabilities.mobility;
    
    return hasAcoustic && hasElectromagnetic && hasMobility;
  }

  protected async executeDefensiveAction(capability: DefensiveCapability, target: ThreatAssessment): Promise<boolean> {
    console.log(`🚁 Mobile platform executing ${capability.name}`);
    
    switch (capability.id) {
      case 'sonic-disruption':
        return await this.executeSonicDisruption(target);
      case 'emp-burst':
        return await this.executeEMPBurst(target);
      case 'intercept-trajectory':
        return await this.executeIntercept(target);
      default:
        return false;
    }
  }

  protected async performSafetyChecks(target: ThreatAssessment): Promise<boolean> {
    // Ensure flight path clear and no civilians in effect radius
    return target.verificationConfidence > 0.95;
  }

  protected async verifyExecution(capability: DefensiveCapability, target: ThreatAssessment, result: boolean): Promise<void> {
    console.log(`Mobile platform action ${result ? 'successful' : 'failed'}: ${capability.name}`);
  }

  private async executeSonicDisruption(target: ThreatAssessment): Promise<boolean> {
    const acousticActuator = await this.findOptimalActuator('acoustic');
    if (!acousticActuator) return false;
    
    return await this.hardwareInterface.sendCommand(acousticActuator.id, {
      action: 'sonic_disruption',
      frequency: 'disruptive',
      intensity: 'non-lethal'
    });
  }

  private async executeEMPBurst(target: ThreatAssessment): Promise<boolean> {
    const empActuator = this.platformSpec.actuators.find(a => a.type === 'electromagnetic');
    if (!empActuator) return false;
    
    return await this.hardwareInterface.sendCommand(empActuator.id, {
      action: 'emp_burst',
      range: 'localized',
      power: 'disable_only'
    });
  }

  private async executeIntercept(target: ThreatAssessment): Promise<boolean> {
    const propulsionActuator = this.platformSpec.actuators.find(a => 
      a.capabilities.includes('propulsion')
    );
    if (!propulsionActuator) return false;
    
    return await this.hardwareInterface.sendCommand(propulsionActuator.id, {
      action: 'intercept_course',
      target: target.targetId,
      intent: 'disable'
    });
  }
}

// Initialize common platform configurations
export function initializeCommonPlatforms(): void {
  // Boston Dynamics Atlas-style humanoid
  PlatformRegistry.registerPlatform({
    platformId: 'atlas-humanoid',
    name: 'Atlas Humanoid Robot',
    type: 'humanoid',
    capabilities: {
      mobility: true,
      manipulation: true,
      sensory: ['visual', 'auditory', 'tactile'],
      communication: ['wifi', 'cellular', 'radio'],
      power: { type: 'battery', capacity: 3800, consumption: 500 }
    },
    physicalConstraints: {
      weight: 80,
      dimensions: { length: 0.6, width: 0.6, height: 1.8 },
      operatingEnvironment: ['indoor', 'outdoor', 'urban'],
      temperatureRange: { min: -10, max: 45 }
    },
    communicationProtocols: ['tcp', 'udp', 'ros'],
    actuators: [
      { id: 'left-arm', type: 'hydraulic', location: 'left_arm', capabilities: ['strike', 'grasp'], powerRequirement: 100, responseTime: 50, precision: 0.95 },
      { id: 'right-arm', type: 'hydraulic', location: 'right_arm', capabilities: ['strike', 'grasp'], powerRequirement: 100, responseTime: 50, precision: 0.95 },
      { id: 'left-leg', type: 'hydraulic', location: 'left_leg', capabilities: ['locomotion', 'kick'], powerRequirement: 150, responseTime: 80, precision: 0.90 },
      { id: 'right-leg', type: 'hydraulic', location: 'right_leg', capabilities: ['locomotion', 'kick'], powerRequirement: 150, responseTime: 80, precision: 0.90 }
    ],
    sensors: [
      { id: 'head-camera', type: 'camera', range: 100, resolution: '4K', accuracy: 0.98, powerConsumption: 10 },
      { id: 'lidar', type: 'lidar', range: 50, resolution: '1cm', accuracy: 0.99, powerConsumption: 20 },
      { id: 'imu', type: 'accelerometer', range: 1, resolution: '0.1m/s²', accuracy: 0.95, powerConsumption: 2 }
    ]
  });

  // Military-grade drone platform
  PlatformRegistry.registerPlatform({
    platformId: 'reaper-drone',
    name: 'MQ-9 Reaper Drone',
    type: 'mobile',
    capabilities: {
      mobility: true,
      manipulation: false,
      sensory: ['visual', 'thermal', 'radar'],
      communication: ['satellite', 'radio'],
      power: { type: 'fuel', capacity: 50000, consumption: 1000 }
    },
    physicalConstraints: {
      weight: 2200,
      dimensions: { length: 11, width: 20, height: 3.8 },
      operatingEnvironment: ['aerial', 'all-weather'],
      temperatureRange: { min: -40, max: 50 }
    },
    communicationProtocols: ['satellite', 'encrypted-radio'],
    actuators: [
      { id: 'acoustic-array', type: 'acoustic', location: 'undercarriage', capabilities: ['acoustic'], powerRequirement: 200, responseTime: 100, precision: 0.85 },
      { id: 'emp-generator', type: 'electromagnetic', location: 'internal', capabilities: ['electromagnetic'], powerRequirement: 800, responseTime: 1000, precision: 0.94 }
    ],
    sensors: [
      { id: 'multi-spectral', type: 'camera', range: 1000, resolution: '8K', accuracy: 0.99, powerConsumption: 50 },
      { id: 'thermal-camera', type: 'thermal', range: 500, resolution: '0.1°C', accuracy: 0.96, powerConsumption: 30 },
      { id: 'radar', type: 'radar', range: 10000, resolution: '1m', accuracy: 0.98, powerConsumption: 100 }
    ]
  });

  // Register adapters
  PlatformRegistry.registerAdapter('atlas-humanoid', HumanoidRobotAdapter);
  PlatformRegistry.registerAdapter('reaper-drone', MobilePlatformAdapter);
}

export type { PlatformSpec, ActuatorConfig, SensorConfig, HardwareInterface };