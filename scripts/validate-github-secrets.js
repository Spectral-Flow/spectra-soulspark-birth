#!/usr/bin/env node

/**
 * GitHub Secrets Integration Validation Script
 * Tests that environment variables are properly loaded and API endpoints can access them
 */

console.log('🔐 SPECTRA - GitHub Secrets Integration Validation\n');

/**
 * Simple logger implementation for validation script
 */
const logger = {
  error: (message, error) => {
    console.error(`❌ ${message}:`, error?.message || error);
  }
};

/**
 * Extract API key from environment with validation
 */
function getApiKey(keyName, required = true) {
  const key = process.env[keyName];
  
  if (!key && required) {
    return null;
  }
  
  if (key && key.startsWith('mock_') && process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return key || null;
}

/**
 * Test environment variable loading
 */
function testEnvironmentVariables() {
  console.log('📋 Testing Environment Variable Loading...\n');
  
  const requiredSecrets = [
    'ELEVENLABS_API_KEY',
    'OPENAI_API_KEY', 
    'JWT_SECRET'
  ];
  
  const optionalSecrets = [
    'HUGGINGFACE_API_KEY',
    'OPENROUTER_API_KEY',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'HF_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY'
  ];
  
  const clientSecrets = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'VITE_ELEVENLABS_AGENT_ID'
  ];

  let hasRequiredSecrets = true;
  let optionalSecretsCount = 0;
  let clientSecretsCount = 0;

  // Test required secrets
  console.log('🔒 Required Secrets:');
  requiredSecrets.forEach(key => {
    const value = getApiKey(key, false);
    const status = value ? '✅ Set' : '❌ Missing';
    const preview = value ? `(${value.substring(0, 8)}...)` : '';
    console.log(`  ${key}: ${status} ${preview}`);
    if (!value) hasRequiredSecrets = false;
  });

  // Test optional secrets  
  console.log('\n🔧 Optional Secrets:');
  optionalSecrets.forEach(key => {
    const value = getApiKey(key, false);
    const status = value ? '✅ Set' : '⚪ Not set';
    const preview = value ? `(${value.substring(0, 8)}...)` : '';
    console.log(`  ${key}: ${status} ${preview}`);
    if (value) optionalSecretsCount++;
  });

  // Test client-side secrets
  console.log('\n🌐 Client-Side Variables:');
  clientSecrets.forEach(key => {
    const value = process.env[key];
    const status = value ? '✅ Set' : '⚪ Not set';
    const preview = value ? `(${value.substring(0, 20)}...)` : '';
    console.log(`  ${key}: ${status} ${preview}`);
    if (value) clientSecretsCount++;
  });

  return {
    hasRequiredSecrets,
    optionalSecretsCount,
    clientSecretsCount,
    totalOptional: optionalSecrets.length,
    totalClient: clientSecrets.length
  };
}

/**
 * Test API endpoint access simulation
 */
function testApiEndpointAccess() {
  console.log('\n🚀 Testing API Endpoint Access...\n');

  const endpoints = [
    {
      name: 'ElevenLabs API',
      keyName: 'ELEVENLABS_API_KEY',
      required: true
    },
    {
      name: 'OpenAI API', 
      keyName: 'OPENAI_API_KEY',
      required: true
    },
    {
      name: 'Hugging Face API',
      keyName: 'HUGGINGFACE_API_KEY', 
      required: false
    },
    {
      name: 'JWT Authentication',
      keyName: 'JWT_SECRET',
      required: true
    }
  ];

  let workingEndpoints = 0;
  
  endpoints.forEach(endpoint => {
    const apiKey = getApiKey(endpoint.keyName, false);
    const status = apiKey ? '✅ Ready' : (endpoint.required ? '❌ Missing' : '⚪ Skipped');
    
    console.log(`  ${endpoint.name}: ${status}`);
    
    if (apiKey) {
      workingEndpoints++;
      // Validate key format
      if (endpoint.keyName === 'ELEVENLABS_API_KEY' && !apiKey.startsWith('sk-')) {
        console.log(`    ⚠️  Warning: ElevenLabs API key should start with 'sk-'`);
      }
      if (endpoint.keyName === 'OPENAI_API_KEY' && !apiKey.startsWith('sk-')) {
        console.log(`    ⚠️  Warning: OpenAI API key should start with 'sk-'`);
      }
      if (endpoint.keyName === 'HUGGINGFACE_API_KEY' && !apiKey.startsWith('hf_')) {
        console.log(`    ⚠️  Warning: Hugging Face API key should start with 'hf_'`);
      }
      if (endpoint.keyName === 'JWT_SECRET' && apiKey.length < 32) {
        console.log(`    ⚠️  Warning: JWT secret should be at least 32 characters`);
      }
    }
  });

  return {
    workingEndpoints,
    totalEndpoints: endpoints.length,
    requiredEndpoints: endpoints.filter(e => e.required).length
  };
}

/**
 * Test GitHub Actions environment detection
 */
function testGitHubActionsEnvironment() {
  console.log('\n🔄 Testing GitHub Actions Environment...\n');
  
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const isCI = process.env.CI === 'true';
  const runnerName = process.env.RUNNER_NAME;
  const workflowName = process.env.GITHUB_WORKFLOW;
  
  console.log(`  GitHub Actions: ${isGitHubActions ? '✅ Detected' : '⚪ Not detected'}`);
  console.log(`  CI Environment: ${isCI ? '✅ Detected' : '⚪ Not detected'}`);
  
  if (runnerName) {
    console.log(`  Runner: ${runnerName}`);
  }
  
  if (workflowName) {
    console.log(`  Workflow: ${workflowName}`);
  }

  return {
    isGitHubActions,
    isCI,
    runnerName,
    workflowName
  };
}

/**
 * Main validation function
 */
function runValidation() {
  try {
    const envResult = testEnvironmentVariables();
    const apiResult = testApiEndpointAccess();
    const ciResult = testGitHubActionsEnvironment();

    console.log('\n📊 Validation Summary:\n');
    
    // Environment variables summary
    const requiredStatus = envResult.hasRequiredSecrets ? '✅' : '❌';
    console.log(`  Required Secrets: ${requiredStatus} ${envResult.hasRequiredSecrets ? 'All set' : 'Missing some'}`);
    console.log(`  Optional Secrets: ✅ ${envResult.optionalSecretsCount}/${envResult.totalOptional} configured`);
    console.log(`  Client Variables: ✅ ${envResult.clientSecretsCount}/${envResult.totalClient} configured`);
    
    // API endpoints summary
    const apiStatus = apiResult.workingEndpoints >= apiResult.requiredEndpoints ? '✅' : '❌';
    console.log(`  API Endpoints: ${apiStatus} ${apiResult.workingEndpoints}/${apiResult.totalEndpoints} ready`);
    
    // CI environment summary
    const ciStatus = ciResult.isGitHubActions ? '✅' : '⚪';
    console.log(`  GitHub Actions: ${ciStatus} ${ciResult.isGitHubActions ? 'Running in CI' : 'Local environment'}`);

    console.log('\n🎯 Recommendations:\n');
    
    if (!envResult.hasRequiredSecrets) {
      console.log('  📝 Set up required GitHub secrets for production deployment');
      console.log('  📖 See: docs/GITHUB_SECRETS_SETUP.md');
    } else {
      console.log('  ✅ GitHub secrets configuration looks good!');
    }
    
    if (envResult.optionalSecretsCount === 0) {
      console.log('  💡 Consider adding optional API keys for enhanced features');
    }
    
    if (!ciResult.isGitHubActions && envResult.hasRequiredSecrets) {
      console.log('  🚀 Ready for GitHub Actions deployment');
    }

    console.log('\n🏁 Validation Complete!\n');
    
    return envResult.hasRequiredSecrets && apiResult.workingEndpoints >= apiResult.requiredEndpoints;
    
  } catch (error) {
    logger.error('Validation failed', error);
    console.log('\n❌ Validation failed with error:', error.message);
    return false;
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}