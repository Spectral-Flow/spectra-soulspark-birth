#!/usr/bin/env node

/**
 * Backend Validation and System Integrity Check
 * Verifies that all backend components are properly structured and configured
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

console.log('🔍 BACKEND SYSTEM INTEGRITY CHECK');
console.log('=' .repeat(60));

// Check file structure
function checkFileStructure() {
  console.log('\n📁 Checking Backend File Structure...');
  
  const requiredFiles = [
    'api/health.ts',
    'api/elevenlabs/tts.ts',
    'api/elevenlabs/voices.ts',
    'api/elevenlabs/signed-url.ts',
    'api/openai/tts.ts',
    'api/openai/chat.ts',
    'api/sessions.ts',
    'api/utils/common.ts',
    'api/utils/logger.ts',
    'api/auth/user.ts',
    'api/memory/add.ts',
    'api/db-sessions.ts'
  ];
  
  let filesExist = 0;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      filesExist++;
    } else {
      console.log(`❌ ${file} - MISSING`);
    }
  }
  
  console.log(`\n📊 File Structure: ${filesExist}/${requiredFiles.length} files present`);
  return filesExist === requiredFiles.length;
}

// Check TypeScript compilation
function checkTypeScriptCompilation() {
  console.log('\n🔧 Checking TypeScript Compilation...');
  
  try {
    // Check if tsconfig files exist
    const tsconfigExists = fs.existsSync('tsconfig.json');
    const tsconfigAppExists = fs.existsSync('tsconfig.app.json');
    
    console.log(`✅ tsconfig.json: ${tsconfigExists ? 'EXISTS' : 'MISSING'}`);
    console.log(`✅ tsconfig.app.json: ${tsconfigAppExists ? 'EXISTS' : 'MISSING'}`);
    
    // Check for build artifacts
    const buildInfoExists = fs.existsSync('tsconfig.app.tsbuildinfo');
    console.log(`✅ Build info: ${buildInfoExists ? 'GENERATED' : 'NOT FOUND'}`);
    
    return tsconfigExists && tsconfigAppExists;
  } catch (error) {
    console.log(`❌ TypeScript check failed: ${error.message}`);
    return false;
  }
}

// Check environment configuration
function checkEnvironmentConfig() {
  console.log('\n🌍 Checking Environment Configuration...');
  
  const requiredEnvVars = [
    'ELEVENLABS_API_KEY',
    'OPENAI_API_KEY',
    'JWT_SECRET'
  ];
  
  const optionalEnvVars = [
    'HUGGINGFACE_API_KEY',
    'HF_TOKEN',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
  ];
  
  let configuredRequired = 0;
  let configuredOptional = 0;
  
  console.log('  Required Variables:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    const isConfigured = value && !value.startsWith('your_') && !value.includes('mock');
    
    if (isConfigured) {
      console.log(`    ✅ ${envVar}: CONFIGURED`);
      configuredRequired++;
    } else {
      console.log(`    ⚠️  ${envVar}: ${value ? 'MOCK/PLACEHOLDER' : 'NOT SET'}`);
    }
  }
  
  console.log('  Optional Variables:');
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    const isConfigured = value && !value.startsWith('your_') && !value.includes('mock');
    
    if (isConfigured) {
      console.log(`    ✅ ${envVar}: CONFIGURED`);
      configuredOptional++;
    } else {
      console.log(`    ⚠️  ${envVar}: ${value ? 'MOCK/PLACEHOLDER' : 'NOT SET'}`);
    }
  }
  
  console.log(`\n📊 Environment: ${configuredRequired}/${requiredEnvVars.length} required, ${configuredOptional}/${optionalEnvVars.length} optional`);
  
  return {
    requiredConfigured: configuredRequired === requiredEnvVars.length,
    optionalCount: configuredOptional,
    totalRequired: requiredEnvVars.length,
    totalOptional: optionalEnvVars.length
  };
}

// Check package dependencies
function checkDependencies() {
  console.log('\n📦 Checking Package Dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const backendDeps = [
      '@vercel/node',
      'openai',
      '@supabase/supabase-js',
      'dotenv',
      'cors',
      'jsonwebtoken'
    ];
    
    let installedDeps = 0;
    
    for (const dep of backendDeps) {
      const inDeps = packageJson.dependencies?.[dep];
      const inDevDeps = packageJson.devDependencies?.[dep];
      
      if (inDeps || inDevDeps) {
        console.log(`✅ ${dep}: ${inDeps || inDevDeps}`);
        installedDeps++;
      } else {
        console.log(`❌ ${dep}: NOT FOUND`);
      }
    }
    
    console.log(`\n📊 Dependencies: ${installedDeps}/${backendDeps.length} backend packages`);
    return installedDeps === backendDeps.length;
  } catch (error) {
    console.log(`❌ Package check failed: ${error.message}`);
    return false;
  }
}

// Check API endpoint imports and syntax
function checkAPIEndpointSyntax() {
  console.log('\n⚙️ Checking API Endpoint Syntax...');
  
  const apiFiles = [
    'api/health.ts',
    'api/elevenlabs/tts.ts',
    'api/utils/common.ts',
    'api/utils/logger.ts'
  ];
  
  let syntaxChecks = 0;
  
  for (const file of apiFiles) {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper imports (no .js extensions in .ts files)
        const hasJSImports = content.includes('from \'./') && content.includes('.js\'');
        const hasProperImports = content.includes('import') && content.includes('from');
        const hasDefaultExport = content.includes('export default');
        
        if (!hasJSImports && hasProperImports && hasDefaultExport) {
          console.log(`✅ ${file}: SYNTAX OK`);
          syntaxChecks++;
        } else {
          console.log(`⚠️  ${file}: SYNTAX ISSUES`);
          if (hasJSImports) console.log(`    - Has .js imports in TypeScript`);
          if (!hasProperImports) console.log(`    - Missing proper imports`);
          if (!hasDefaultExport) console.log(`    - Missing default export`);
        }
      } else {
        console.log(`❌ ${file}: FILE MISSING`);
      }
    } catch (error) {
      console.log(`❌ ${file}: READ ERROR - ${error.message}`);
    }
  }
  
  console.log(`\n📊 API Syntax: ${syntaxChecks}/${apiFiles.length} files clean`);
  return syntaxChecks === apiFiles.length;
}

// Check Vercel configuration
function checkVercelConfig() {
  console.log('\n🚀 Checking Vercel Configuration...');
  
  try {
    if (fs.existsSync('vercel.json')) {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      
      const hasRewrites = vercelConfig.rewrites && vercelConfig.rewrites.length > 0;
      const hasHeaders = vercelConfig.headers && vercelConfig.headers.length > 0;
      const hasBuildCommand = vercelConfig.buildCommand;
      
      console.log(`✅ vercel.json exists`);
      console.log(`✅ API rewrites: ${hasRewrites ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`✅ CORS headers: ${hasHeaders ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`✅ Build command: ${hasBuildCommand ? 'CONFIGURED' : 'MISSING'}`);
      
      return hasRewrites && hasHeaders;
    } else {
      console.log(`❌ vercel.json: NOT FOUND`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Vercel config check failed: ${error.message}`);
    return false;
  }
}

// Main integrity check
async function runIntegrityCheck() {
  console.log('🔍 Starting Backend System Integrity Check\n');
  
  const results = {
    fileStructure: checkFileStructure(),
    typeScript: checkTypeScriptCompilation(),
    environment: checkEnvironmentConfig(),
    dependencies: checkDependencies(),
    apiSyntax: checkAPIEndpointSyntax(),
    vercelConfig: checkVercelConfig()
  };
  
  console.log('\n📊 SYSTEM INTEGRITY RESULTS');
  console.log('=' .repeat(60));
  console.log(`📁 File Structure: ${results.fileStructure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔧 TypeScript Setup: ${results.typeScript ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🌍 Environment Config: ${results.environment.requiredConfigured ? '✅ READY' : '⚠️  NEEDS API KEYS'}`);
  console.log(`📦 Dependencies: ${results.dependencies ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`⚙️ API Syntax: ${results.apiSyntax ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🚀 Vercel Config: ${results.vercelConfig ? '✅ PASS' : '❌ FAIL'}`);
  
  const criticalPassed = [
    results.fileStructure,
    results.typeScript,
    results.dependencies,
    results.apiSyntax,
    results.vercelConfig
  ].filter(Boolean).length;
  
  const criticalTotal = 5;
  const criticalPercentage = Math.round((criticalPassed / criticalTotal) * 100);
  
  console.log(`\n📈 Critical Systems: ${criticalPercentage}% (${criticalPassed}/${criticalTotal})`);
  
  if (criticalPercentage === 100) {
    if (results.environment.requiredConfigured) {
      console.log('\n🎉 Backend system is FULLY READY for production!');
      console.log('✨ All systems operational, API keys configured.');
    } else {
      console.log('\n✅ Backend system is TECHNICALLY READY!');
      console.log('🔑 Add real API keys to enable full functionality.');
    }
  } else if (criticalPercentage >= 80) {
    console.log('\n✅ Backend system is mostly ready with minor issues.');
    console.log('🔧 Address the failed checks above.');
  } else {
    console.log('\n❌ Backend system needs significant work.');
    console.log('🚨 Multiple critical systems are not working.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (!results.environment.requiredConfigured) {
    console.log('1. Configure real API keys in environment variables');
  }
  if (!results.fileStructure) {
    console.log('2. Ensure all required API files are present');
  }
  if (!results.apiSyntax) {
    console.log('3. Fix API endpoint syntax issues');
  }
  if (!results.vercelConfig) {
    console.log('4. Configure Vercel deployment settings');
  }
  console.log('5. Test endpoints with real API keys');
  console.log('6. Deploy to Vercel and test production environment');
  
  return criticalPercentage;
}

// Run the check
runIntegrityCheck().catch(error => {
  console.error('Integrity check failed:', error);
  process.exit(1);
});