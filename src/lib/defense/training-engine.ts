/**
 * Spectra Training Engine - Combat & Defensive Systems Mastery
 * 
 * Universal training framework for all forms of defensive capabilities:
 * - Martial arts (all forms)
 * - Melee weaponry mastery
 * - Ballistic weaponry proficiency  
 * - Energy/laser weaponry systems
 * - Adaptive learning for new techniques
 * 
 * TRAINING PRIORITIES:
 * 1. Keep innocents alive (primary objective)
 * 2. Protect comrades in arms
 * 3. Defend allies
 * 4. Self-preservation techniques
 * 5. Maximize life preservation during mass destruction scenarios
 */

interface TrainingModule {
  id: string;
  category: 'martial-arts' | 'melee' | 'ballistic' | 'energy' | 'tactical' | 'medical';
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  prerequisites: string[];
  estimatedTrainingTime: number; // hours
}

interface SkillProficiency {
  skillId: string;
  currentLevel: number; // 0-100
  masteryAchieved: boolean;
  hoursSpent: number;
  lastTrainingSession: Date;
  adaptiveModifications: string[];
}

interface CombatScenario {
  id: string;
  name: string;
  difficulty: number;
  objectives: string[];
  threats: string[];
  civilianCount: number;
  alliedForces: number;
  environmentalFactors: string[];
  successCriteria: {
    civiliansPreserved: number;
    alliesPreserved: number;
    threatsNeutralized: number;
    collateralDamage: number;
  };
}

interface TrainingResult {
  scenarioId: string;
  score: number;
  civiliansPreserved: number;
  alliesPreserved: number;
  threatsHandled: number;
  tacticsUsed: string[];
  lessonsLearned: string[];
  adaptationsRequired: string[];
}

/**
 * Comprehensive Training Engine for Defensive Mastery
 */
export class SpectraTrainingEngine {
  private proficiencies: Map<string, SkillProficiency> = new Map();
  private trainingModules: Map<string, TrainingModule> = new Map();
  private scenarioLibrary: Map<string, CombatScenario> = new Map();
  private trainingHistory: TrainingResult[] = [];

  constructor() {
    this.initializeTrainingModules();
    this.initializeScenarios();
    this.loadExistingProficiencies();
  }

  /**
   * Initialize comprehensive training modules
   */
  private initializeTrainingModules(): void {
    const modules: TrainingModule[] = [
      // Martial Arts Training
      {
        id: 'karate-fundamentals',
        category: 'martial-arts',
        name: 'Karate Fundamentals',
        description: 'Basic striking, blocking, and stance techniques',
        difficulty: 'beginner',
        prerequisites: [],
        estimatedTrainingTime: 40
      },
      {
        id: 'jujitsu-grappling',
        category: 'martial-arts', 
        name: 'Jujitsu Grappling',
        description: 'Joint locks, throws, and ground control',
        difficulty: 'intermediate',
        prerequisites: ['karate-fundamentals'],
        estimatedTrainingTime: 60
      },
      {
        id: 'krav-maga-combat',
        category: 'martial-arts',
        name: 'Krav Maga Combat',
        description: 'Practical self-defense and neutralization techniques',
        difficulty: 'advanced',
        prerequisites: ['karate-fundamentals', 'jujitsu-grappling'],
        estimatedTrainingTime: 80
      },
      {
        id: 'aikido-redirection',
        category: 'martial-arts',
        name: 'Aikido Redirection',
        description: 'Using attacker momentum against them',
        difficulty: 'advanced',
        prerequisites: ['jujitsu-grappling'],
        estimatedTrainingTime: 70
      },

      // Melee Weaponry
      {
        id: 'blade-combat',
        category: 'melee',
        name: 'Blade Combat Systems',
        description: 'Knife, sword, and edged weapon mastery',
        difficulty: 'intermediate',
        prerequisites: ['karate-fundamentals'],
        estimatedTrainingTime: 50
      },
      {
        id: 'staff-weapons',
        category: 'melee',
        name: 'Staff & Polearm Weapons',
        description: 'Extended reach weapons and defensive techniques',
        difficulty: 'intermediate',
        prerequisites: ['karate-fundamentals'],
        estimatedTrainingTime: 45
      },
      {
        id: 'improvised-weapons',
        category: 'melee',
        name: 'Improvised Weaponry',
        description: 'Using environmental objects as weapons',
        difficulty: 'advanced',
        prerequisites: ['blade-combat', 'staff-weapons'],
        estimatedTrainingTime: 35
      },

      // Ballistic Weaponry
      {
        id: 'handgun-proficiency',
        category: 'ballistic',
        name: 'Handgun Proficiency',
        description: 'Pistol accuracy, handling, and tactics',
        difficulty: 'beginner',
        prerequisites: [],
        estimatedTrainingTime: 30
      },
      {
        id: 'rifle-mastery',
        category: 'ballistic',
        name: 'Rifle Mastery',
        description: 'Long-range accuracy and assault rifle tactics',
        difficulty: 'intermediate',
        prerequisites: ['handgun-proficiency'],
        estimatedTrainingTime: 40
      },
      {
        id: 'sniper-systems',
        category: 'ballistic',
        name: 'Precision Sniper Systems',
        description: 'Ultra-long range precision and ballistic calculations',
        difficulty: 'master',
        prerequisites: ['rifle-mastery'],
        estimatedTrainingTime: 100
      },

      // Energy/Laser Weaponry
      {
        id: 'laser-targeting',
        category: 'energy',
        name: 'Laser Targeting Systems',
        description: 'Precision energy weapon targeting and power management',
        difficulty: 'intermediate',
        prerequisites: ['handgun-proficiency'],
        estimatedTrainingTime: 45
      },
      {
        id: 'plasma-systems',
        category: 'energy',
        name: 'Plasma Weapon Systems',
        description: 'High-energy plasma weapon operation and safety',
        difficulty: 'advanced',
        prerequisites: ['laser-targeting'],
        estimatedTrainingTime: 60
      },

      // Tactical Operations
      {
        id: 'crowd-control',
        category: 'tactical',
        name: 'Crowd Control & De-escalation',
        description: 'Managing large groups and preventing violence',
        difficulty: 'intermediate',
        prerequisites: ['krav-maga-combat'],
        estimatedTrainingTime: 35
      },
      {
        id: 'hostage-rescue',
        category: 'tactical',
        name: 'Hostage Rescue Operations',
        description: 'Precision rescue with minimal civilian casualties',
        difficulty: 'master',
        prerequisites: ['sniper-systems', 'crowd-control'],
        estimatedTrainingTime: 120
      },
      {
        id: 'urban-warfare',
        category: 'tactical',
        name: 'Urban Warfare Tactics',
        description: 'Combat in civilian areas with minimal collateral damage',
        difficulty: 'master',
        prerequisites: ['rifle-mastery', 'crowd-control'],
        estimatedTrainingTime: 90
      },

      // Medical/Preservation
      {
        id: 'battlefield-medicine',
        category: 'medical',
        name: 'Battlefield Medicine',
        description: 'Emergency medical care during combat situations',
        difficulty: 'intermediate',
        prerequisites: [],
        estimatedTrainingTime: 50
      },
      {
        id: 'trauma-surgery',
        category: 'medical',
        name: 'Emergency Trauma Surgery',
        description: 'Life-saving surgical procedures in field conditions',
        difficulty: 'master',
        prerequisites: ['battlefield-medicine'],
        estimatedTrainingTime: 150
      }
    ];

    modules.forEach(module => {
      this.trainingModules.set(module.id, module);
    });
  }

  /**
   * Initialize combat scenarios for training
   */
  private initializeScenarios(): void {
    const scenarios: CombatScenario[] = [
      {
        id: 'school-shooter',
        name: 'Active Shooter in School',
        difficulty: 85,
        objectives: ['Neutralize threat', 'Evacuate civilians', 'Minimize casualties'],
        threats: ['Armed individual with rifle', 'Potential explosives'],
        civilianCount: 300,
        alliedForces: 2,
        environmentalFactors: ['Narrow hallways', 'Children present', 'Limited visibility'],
        successCriteria: {
          civiliansPreserved: 295, // Target: Save 98%+
          alliesPreserved: 2,
          threatsNeutralized: 1,
          collateralDamage: 0
        }
      },
      {
        id: 'terrorist-mall',
        name: 'Mall Terrorist Attack',
        difficulty: 90,
        objectives: ['Eliminate multiple threats', 'Secure civilians', 'Prevent escape'],
        threats: ['3-5 armed terrorists', 'Suicide vests', 'Coordinated attack'],
        civilianCount: 500,
        alliedForces: 4,
        environmentalFactors: ['Multiple levels', 'Crowd panic', 'Hostages'],
        successCriteria: {
          civiliansPreserved: 485, // Target: Save 97%+
          alliesPreserved: 4,
          threatsNeutralized: 5,
          collateralDamage: 1
        }
      },
      {
        id: 'drone-swarm',
        name: 'Killer Drone Swarm Attack',
        difficulty: 95,
        objectives: ['Neutralize swarm', 'Protect civilian area', 'Prevent expansion'],
        threats: ['1000 armed drones', 'Coordinated AI attack', 'Explosive payloads'],
        civilianCount: 1000,
        alliedForces: 3,
        environmentalFactors: ['Urban environment', '360-degree threat', 'Electronic warfare'],
        successCriteria: {
          civiliansPreserved: 950, // Target: Save 95%+
          alliesPreserved: 3,
          threatsNeutralized: 1000,
          collateralDamage: 2
        }
      },
      {
        id: 'hostage-bank',
        name: 'Bank Hostage Situation',
        difficulty: 70,
        objectives: ['Free hostages', 'Capture perpetrators alive', 'Secure evidence'],
        threats: ['4 armed robbers', 'Explosives threat', 'Civilian shields'],
        civilianCount: 20,
        alliedForces: 6,
        environmentalFactors: ['Close quarters', 'Vault timer', 'Media presence'],
        successCriteria: {
          civiliansPreserved: 20, // Target: Save 100%
          alliesPreserved: 6,
          threatsNeutralized: 4, // Prefer capture over kill
          collateralDamage: 0
        }
      },
      {
        id: 'wmd-facility',
        name: 'WMD Facility Breach',
        difficulty: 100,
        objectives: ['Secure facility', 'Prevent WMD deployment', 'Minimize contamination'],
        threats: ['Elite military unit', 'WMD ready for deployment', 'Contamination risk'],
        civilianCount: 50,
        alliedForces: 8,
        environmentalFactors: ['Radiation hazard', 'Chemical weapons', 'Time pressure'],
        successCriteria: {
          civiliansPreserved: 45, // Target: Save 90%+ in extreme conditions
          alliesPreserved: 6,
          threatsNeutralized: 12,
          collateralDamage: 3
        }
      }
    ];

    scenarios.forEach(scenario => {
      this.scenarioLibrary.set(scenario.id, scenario);
    });
  }

  /**
   * Load existing training proficiencies
   */
  private loadExistingProficiencies(): void {
    // Initialize with basic proficiencies
    this.trainingModules.forEach((module) => {
      this.proficiencies.set(module.id, {
        skillId: module.id,
        currentLevel: 0,
        masteryAchieved: false,
        hoursSpent: 0,
        lastTrainingSession: new Date(),
        adaptiveModifications: []
      });
    });
  }

  /**
   * Begin training in a specific module
   */
  async beginTraining(moduleId: string, intensityLevel: number = 5): Promise<{
    success: boolean;
    progressGained: number;
    newLevel: number;
    insights: string[];
  }> {
    const module = this.trainingModules.get(moduleId);
    if (!module) {
      return { success: false, progressGained: 0, newLevel: 0, insights: ['Module not found'] };
    }

    const proficiency = this.proficiencies.get(moduleId)!;
    
    // Check prerequisites
    const missingPrereqs = module.prerequisites.filter(prereq => {
      const prereqProf = this.proficiencies.get(prereq);
      return !prereqProf || prereqProf.currentLevel < 70; // Require 70% proficiency
    });

    if (missingPrereqs.length > 0) {
      return {
        success: false,
        progressGained: 0,
        newLevel: proficiency.currentLevel,
        insights: [`Missing prerequisites: ${missingPrereqs.join(', ')}`]
      };
    }

    // Simulate training progress
    const baseProgress = intensityLevel * 2;
    const difficultyModifier = this.getDifficultyModifier(module.difficulty);
    const adaptiveBonus = this.calculateAdaptiveBonus(proficiency);
    
    const progressGained = Math.min(
      baseProgress * difficultyModifier * adaptiveBonus,
      100 - proficiency.currentLevel // Can't exceed 100%
    );

    proficiency.currentLevel = Math.min(100, proficiency.currentLevel + progressGained);
    proficiency.hoursSpent += intensityLevel;
    proficiency.lastTrainingSession = new Date();

    // Check for mastery
    if (proficiency.currentLevel >= 95) {
      proficiency.masteryAchieved = true;
    }

    // Generate insights
    const insights = this.generateTrainingInsights(module, proficiency, progressGained);

    return {
      success: true,
      progressGained,
      newLevel: proficiency.currentLevel,
      insights
    };
  }

  /**
   * Run combat scenario simulation
   */
  async runScenarioSimulation(scenarioId: string): Promise<TrainingResult> {
    const scenario = this.scenarioLibrary.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    console.log(`🎯 Running scenario: ${scenario.name} (Difficulty: ${scenario.difficulty})`);

    // Calculate performance based on current skill levels
    const relevantSkills = this.getRelevantSkills(scenario);
    const overallSkillLevel = this.calculateOverallSkillLevel(relevantSkills);
    
    // Simulate scenario outcome
    const result = this.simulateScenarioOutcome(scenario, overallSkillLevel);
    
    // Record training result
    this.trainingHistory.push(result);
    
    // Update skills based on experience
    this.updateSkillsFromExperience(relevantSkills, result);

    return result;
  }

  /**
   * Get current mastery status across all skills
   */
  getMasteryStatus(): {
    totalSkills: number;
    masteredSkills: number;
    averageLevel: number;
    weakestAreas: string[];
    strongestAreas: string[];
  } {
    const proficiencyArray = Array.from(this.proficiencies.values());
    const totalSkills = proficiencyArray.length;
    const masteredSkills = proficiencyArray.filter(p => p.masteryAchieved).length;
    const averageLevel = proficiencyArray.reduce((sum, p) => sum + p.currentLevel, 0) / totalSkills;
    
    const sorted = proficiencyArray.sort((a, b) => a.currentLevel - b.currentLevel);
    const weakestAreas = sorted.slice(0, 3).map(p => p.skillId);
    const strongestAreas = sorted.slice(-3).map(p => p.skillId);

    return {
      totalSkills,
      masteredSkills,
      averageLevel,
      weakestAreas,
      strongestAreas
    };
  }

  /**
   * Adaptive learning - learn new techniques during combat
   */
  async adaptiveLearn(newTechnique: string, observedEffectiveness: number): Promise<void> {
    console.log(`🧠 Learning new technique: ${newTechnique} (Effectiveness: ${observedEffectiveness})`);
    
    // Find most relevant skill category
    const relevantSkillId = this.findMostRelevantSkill(newTechnique);
    const proficiency = this.proficiencies.get(relevantSkillId);
    
    if (proficiency) {
      proficiency.adaptiveModifications.push(`${newTechnique} (${observedEffectiveness}% effective)`);
      
      // Boost skill level based on observed effectiveness
      const boost = observedEffectiveness * 0.1;
      proficiency.currentLevel = Math.min(100, proficiency.currentLevel + boost);
    }
  }

  /**
   * Private helper methods
   */
  private getDifficultyModifier(difficulty: string): number {
    const modifiers: Record<string, number> = {
      'beginner': 1.5,
      'intermediate': 1.0,
      'advanced': 0.7,
      'master': 0.5
    };
    return modifiers[difficulty] || 1.0;
  }

  private calculateAdaptiveBonus(proficiency: SkillProficiency): number {
    // Bonus based on adaptive modifications learned
    return 1.0 + (proficiency.adaptiveModifications.length * 0.1);
  }

  private generateTrainingInsights(
    module: TrainingModule, 
    proficiency: SkillProficiency, 
    progress: number
  ): string[] {
    const insights: string[] = [];
    
    if (progress > 10) {
      insights.push(`Excellent progress in ${module.name}! (+${progress.toFixed(1)}%)`);
    }
    
    if (proficiency.currentLevel >= 50 && proficiency.currentLevel < 80) {
      insights.push("You're becoming proficient. Focus on practical application.");
    }
    
    if (proficiency.currentLevel >= 80) {
      insights.push("Advanced level achieved. Consider teaching others to reinforce mastery.");
    }
    
    if (proficiency.masteryAchieved) {
      insights.push(`🏆 MASTERY ACHIEVED in ${module.name}! You are now an expert.`);
    }

    return insights;
  }

  private getRelevantSkills(scenario: CombatScenario): string[] {
    // Determine which skills are most relevant for this scenario
    const relevant: string[] = [];
    
    if (scenario.threats.some(t => t.includes('armed'))) {
      relevant.push('handgun-proficiency', 'rifle-mastery');
    }
    
    if (scenario.civilianCount > 100) {
      relevant.push('crowd-control');
    }
    
    if (scenario.environmentalFactors.includes('Close quarters')) {
      relevant.push('krav-maga-combat', 'blade-combat');
    }
    
    if (scenario.objectives.includes('Free hostages')) {
      relevant.push('hostage-rescue');
    }

    if (scenario.threats.some(t => t.includes('drone'))) {
      relevant.push('laser-targeting', 'plasma-systems');
    }
    
    // Always include medical for preservation
    relevant.push('battlefield-medicine');
    
    return relevant;
  }

  private calculateOverallSkillLevel(skillIds: string[]): number {
    const levels = skillIds.map(id => this.proficiencies.get(id)?.currentLevel || 0);
    return levels.reduce((sum, level) => sum + level, 0) / levels.length;
  }

  private simulateScenarioOutcome(scenario: CombatScenario, skillLevel: number): TrainingResult {
    // Complex simulation based on skill level vs scenario difficulty
    const skillFactor = skillLevel / 100;
    const difficultyFactor = scenario.difficulty / 100;
    
    const baseSuccessRate = Math.max(0.1, skillFactor - (difficultyFactor * 0.5));
    
    // Calculate casualties based on performance
    const maxCasualties = Math.floor(scenario.civilianCount * 0.2); // Max 20% casualties
    const actualCasualties = Math.floor(maxCasualties * (1 - baseSuccessRate));
    
    const civiliansPreserved = scenario.civilianCount - actualCasualties;
    const alliesPreserved = Math.max(1, scenario.alliedForces - Math.floor(actualCasualties * 0.1));
    
    const score = Math.floor((civiliansPreserved / scenario.civilianCount) * 100);

    return {
      scenarioId: scenario.id,
      score,
      civiliansPreserved,
      alliesPreserved,
      threatsHandled: scenario.threats.length,
      tacticsUsed: this.determineTacticsUsed(skillLevel),
      lessonsLearned: this.generateLessonsLearned(scenario, score),
      adaptationsRequired: this.identifyAdaptationsNeeded(scenario, score)
    };
  }

  private updateSkillsFromExperience(skillIds: string[], result: TrainingResult): void {
    const experienceBonus = Math.min(5, result.score / 20); // Up to 5% bonus
    
    skillIds.forEach(skillId => {
      const proficiency = this.proficiencies.get(skillId);
      if (proficiency) {
        proficiency.currentLevel = Math.min(100, proficiency.currentLevel + experienceBonus);
      }
    });
  }

  private determineTacticsUsed(skillLevel: number): string[] {
    const tactics: string[] = [];
    
    if (skillLevel > 70) {
      tactics.push('Precision targeting', 'Coordinated team movement');
    }
    if (skillLevel > 80) {
      tactics.push('Advanced breach techniques', 'Psychological warfare');
    }
    if (skillLevel > 90) {
      tactics.push('Perfect situational awareness', 'Zero-casualty operations');
    }
    
    return tactics;
  }

  private generateLessonsLearned(scenario: CombatScenario, score: number): string[] {
    const lessons: string[] = [];
    
    if (score < 70) {
      lessons.push('Better civilian evacuation procedures needed');
      lessons.push('Improve threat assessment speed');
    } else if (score < 90) {
      lessons.push('Fine-tune coordination with allied forces');
      lessons.push('Optimize weapon selection for environment');
    } else {
      lessons.push('Maintain current excellence standards');
      lessons.push('Document successful techniques for future reference');
    }
    
    return lessons;
  }

  private identifyAdaptationsNeeded(scenario: CombatScenario, score: number): string[] {
    if (score >= 90) return [];
    
    return [
      'Improve reaction time for critical decisions',
      'Enhance non-lethal neutralization techniques',
      'Better integration of medical support'
    ];
  }

  private findMostRelevantSkill(technique: string): string {
    // Simple keyword matching for demonstration
    if (technique.includes('blade') || technique.includes('knife')) {
      return 'blade-combat';
    }
    if (technique.includes('grapple') || technique.includes('throw')) {
      return 'jujitsu-grappling';
    }
    if (technique.includes('shoot') || technique.includes('aim')) {
      return 'handgun-proficiency';
    }
    
    return 'krav-maga-combat'; // Default to general combat
  }
}

export type { TrainingModule, CombatScenario, TrainingResult, SkillProficiency };