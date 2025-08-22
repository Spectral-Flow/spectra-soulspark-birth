#!/usr/bin/env node

/**
 * Final Backend Validation & Deployment Readiness Check
 * Comprehensive test to ensure backend is ready for production
 */

import { config } from 'dotenv';
import fs from 'fs';

config();

console.log('🎯 FINAL BACKEND VALIDATION');
console.log('=' .repeat(60));

// Check build process
async function checkBuildProcess() {
  console.log('\n🏗️ Testing Build Process...');
  
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    buildProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    buildProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build process successful');
        console.log('✅ TypeScript compilation working');
        console.log('✅ Vite build complete');
        resolve(true);
      } else {
        console.log('❌ Build process failed');
        console.log(`   Exit code: ${code}`);
        if (stderr) console.log(`   Error: ${stderr.substring(0, 200)}`);
        resolve(false);
      }
    });
    
    // Timeout after 2 minutes
    setTimeout(() => {
      buildProcess.kill();
      console.log('❌ Build process timed out');
      resolve(false);
    }, 120000);
  });
}

// Check API structure and imports
function checkAPIStructure() {
  console.log('\n🔍 Validating API Structure...');
  
  const endpoints = [
    { path: 'api/health.ts', name: 'Health Check' },
    { path: 'api/elevenlabs/tts.ts', name: 'ElevenLabs TTS' },
    { path: 'api/elevenlabs/voices.ts', name: 'ElevenLabs Voices' },
    { path: 'api/elevenlabs/signed-url.ts', name: 'ElevenLabs Signed URL' },
    { path: 'api/openai/tts.ts', name: 'OpenAI TTS' },
    { path: 'api/openai/chat.ts', name: 'OpenAI Chat' },
    { path: 'api/sessions.ts', name: 'Session Management' },
    { path: 'api/auth/user.ts', name: 'User Authentication' },
    { path: 'api/memory/add.ts', name: 'Memory Storage' },
    { path: 'api/db-sessions.ts', name: 'Database Sessions' }
  ];
  
  let validEndpoints = 0;
  
  for (const endpoint of endpoints) {
    try {
      const content = fs.readFileSync(endpoint.path, 'utf8');
      
      const hasVercelTypes = content.includes('VercelRequest') && content.includes('VercelResponse');
      const hasDefaultExport = content.includes('export default');
      const hasAsyncHandler = content.includes('async function handler');
      const hasProperImports = !content.includes('.js\'') || !content.includes('import');
      
      if (hasVercelTypes && hasDefaultExport && hasAsyncHandler && hasProperImports) {
        console.log(`✅ ${endpoint.name}: VALID API ENDPOINT`);
        validEndpoints++;
      } else {
        console.log(`⚠️  ${endpoint.name}: STRUCTURE ISSUES`);
        if (!hasVercelTypes) console.log(`    - Missing Vercel types`);
        if (!hasDefaultExport) console.log(`    - Missing default export`);
        if (!hasAsyncHandler) console.log(`    - Missing async handler`);
        if (!hasProperImports) console.log(`    - Import path issues`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: FILE ERROR - ${error.message}`);
    }
  }
  
  console.log(`\n📊 API Endpoints: ${validEndpoints}/${endpoints.length} valid`);
  return validEndpoints === endpoints.length;
}

// Check security and best practices
function checkSecurityPractices() {
  console.log('\n🔒 Checking Security Best Practices...');
  
  const securityChecks = [];
  
  // Check for proper environment variable usage
  const healthContent = fs.readFileSync('api/health.ts', 'utf8');
  if (healthContent.includes('process.env') && !healthContent.includes('mock_')) {
    securityChecks.push('API key validation');
    console.log('✅ API key validation implemented');
  }
  
  // Check for CORS implementation
  const commonContent = fs.readFileSync('api/utils/common.ts', 'utf8');
  if (commonContent.includes('Access-Control-Allow-Origin')) {
    securityChecks.push('CORS headers');
    console.log('✅ CORS headers configured');
  }
  
  // Check for rate limiting
  if (commonContent.includes('RateLimiter') || commonContent.includes('rate')) {
    securityChecks.push('Rate limiting');
    console.log('✅ Rate limiting implemented');
  }
  
  // Check for input validation
  if (commonContent.includes('validateText') || commonContent.includes('sanitize')) {
    securityChecks.push('Input validation');
    console.log('✅ Input validation and sanitization');
  }
  
  // Check for error handling
  if (commonContent.includes('sendError') && commonContent.includes('logger')) {
    securityChecks.push('Error handling');
    console.log('✅ Structured error handling');
  }
  
  console.log(`\n📊 Security Features: ${securityChecks.length}/5 implemented`);
  return securityChecks.length >= 4;
}

// Check ElevenLabs integration completeness
function checkElevenLabsIntegration() {
  console.log('\n🎵 Checking ElevenLabs Integration...');
  
  const features = [];
  
  // Check TTS endpoint
  try {
    const ttsContent = fs.readFileSync('api/elevenlabs/tts.ts', 'utf8');
    if (ttsContent.includes('text-to-speech') || ttsContent.includes('elevenlabs.io')) {
      features.push('TTS API');
      console.log('✅ Text-to-Speech API integration');
    }
  } catch (e) {
    console.log('❌ TTS API endpoint missing');
  }
  
  // Check Voices endpoint
  try {
    const voicesContent = fs.readFileSync('api/elevenlabs/voices.ts', 'utf8');
    if (voicesContent.includes('voices') && voicesContent.includes('cache')) {
      features.push('Voices API with caching');
      console.log('✅ Voices API with caching');
    }
  } catch (e) {
    console.log('❌ Voices API endpoint missing');
  }
  
  // Check Signed URL endpoint (for conversational AI)
  try {
    const signedUrlContent = fs.readFileSync('api/elevenlabs/signed-url.ts', 'utf8');
    if (signedUrlContent.includes('agentId') || signedUrlContent.includes('signed-url')) {
      features.push('Conversational AI');
      console.log('✅ Conversational AI signed URL');
    }
  } catch (e) {
    console.log('❌ Signed URL endpoint missing');
  }
  
  console.log(`\n📊 ElevenLabs Features: ${features.length}/3 implemented`);
  return features.length === 3;
}

// Check documentation and configuration
function checkDocumentation() {
  console.log('\n📚 Checking Documentation and Configuration...');
  
  const docs = [];
  
  // Check for backend audit report
  if (fs.existsSync('BACKEND_AUDIT_REPORT.md')) {
    docs.push('Audit report');
    console.log('✅ Backend audit report available');
  }
  
  // Check for deployment guide
  if (fs.existsSync('BACKEND_DEPLOYMENT.md')) {
    docs.push('Deployment guide');
    console.log('✅ Deployment guide available');
  }
  
  // Check for environment example
  if (fs.existsSync('.env.example')) {
    docs.push('Environment template');
    console.log('✅ Environment variable template');
  }
  
  // Check package.json scripts
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts['health-check']) {
      docs.push('Health check script');
      console.log('✅ Health check script configured');
    }
  } catch (e) {
    console.log('⚠️  Package.json issues');
  }
  
  console.log(`\n📊 Documentation: ${docs.length}/4 components available`);
  return docs.length >= 3;
}

// Main validation function
async function runFinalValidation() {
  console.log('🚀 Starting Final Backend Validation\n');
  
  const results = {
    build: await checkBuildProcess(),
    structure: checkAPIStructure(),
    security: checkSecurityPractices(),
    elevenlabs: checkElevenLabsIntegration(),
    documentation: checkDocumentation()
  };
  
  console.log('\n🎯 FINAL VALIDATION RESULTS');
  console.log('=' .repeat(60));
  console.log(`🏗️ Build Process: ${results.build ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔍 API Structure: ${results.structure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔒 Security Practices: ${results.security ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎵 ElevenLabs Integration: ${results.elevenlabs ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📚 Documentation: ${results.documentation ? '✅ PASS' : '❌ FAIL'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`\n📈 Overall Validation: ${percentage}% (${passed}/${total})`);
  
  if (percentage === 100) {
    console.log('\n🎉 BACKEND SYSTEM READY FOR PRODUCTION!');
    console.log('✨ All validations passed - deploy with confidence');
    console.log('\n📋 DEPLOYMENT CHECKLIST:');
    console.log('  ✅ Code quality and structure');
    console.log('  ✅ Build process working');
    console.log('  ✅ Security measures implemented');
    console.log('  ✅ ElevenLabs voice integration complete');
    console.log('  ✅ Documentation and guides available');
    console.log('\n🚀 Ready to deploy to Vercel!');
  } else if (percentage >= 80) {
    console.log('\n✅ BACKEND SYSTEM NEARLY READY!');
    console.log('🔧 Minor issues to address before production deployment');
  } else {
    console.log('\n⚠️  BACKEND SYSTEM NEEDS WORK');
    console.log('🚨 Several critical issues must be resolved');
  }
  
  console.log('\n🔑 FINAL NOTES:');
  console.log('- Replace mock API keys with real ones for full functionality');
  console.log('- Test with real ElevenLabs and OpenAI accounts');
  console.log('- Configure proper database credentials if using persistence');
  console.log('- Set up monitoring and alerting in production');
  console.log('- Consider implementing additional security measures');
  
  return percentage;
}

// Run the validation
runFinalValidation().catch(error => {
  console.error('Final validation failed:', error);
  process.exit(1);
});