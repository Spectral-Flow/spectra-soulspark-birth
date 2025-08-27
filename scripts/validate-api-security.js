#!/usr/bin/env node

/**
 * API Endpoints Configuration Validation
 * Verifies that all API endpoints properly use the getApiKey() function
 * and follow security best practices
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 SPECTRA - API Endpoints Configuration Validation\n');

/**
 * Scan API directory for endpoint files
 */
function scanApiDirectory() {
  const apiDir = join(__dirname, '..', 'api');
  const endpointFiles = [];

  function scanDirectory(dir, prefix = '') {
    const items = readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, `${prefix}${item}/`);
      } else if (item.endsWith('.ts') || item.endsWith('.js')) {
        endpointFiles.push({
          path: fullPath,
          relativePath: `${prefix}${item}`,
          name: item
        });
      }
    });
  }

  try {
    scanDirectory(apiDir);
    return endpointFiles;
  } catch (error) {
    console.error('❌ Failed to scan API directory:', error.message);
    return [];
  }
}

/**
 * Analyze endpoint file for security patterns
 */
function analyzeEndpointFile(filePath, relativePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    
    const analysis = {
      name: relativePath,
      usesGetApiKey: false,
      usesProcessEnv: false,
      hasHardcodedKeys: false,
      hasCommonEnvVars: false,
      securityIssues: [],
      goodPractices: []
    };

    // Check for getApiKey usage (recommended)
    if (content.includes('getApiKey(')) {
      analysis.usesGetApiKey = true;
      analysis.goodPractices.push('Uses getApiKey() helper function');
    }

    // Check for direct process.env usage (less secure but acceptable)
    if (content.includes('process.env.')) {
      analysis.usesProcessEnv = true;
      const envMatches = content.match(/process\.env\.([A-Z_]+)/g);
      if (envMatches) {
        analysis.goodPractices.push(`Reads from environment: ${envMatches.join(', ')}`);
      }
    }

    // Check for hardcoded API keys (security issue)
    const hardcodedKeyPatterns = [
      /sk-[a-zA-Z0-9]{20,}/g,    // OpenAI/ElevenLabs keys
      /pk-[a-zA-Z0-9]{20,}/g,    // Some service public keys
      /hf_[a-zA-Z0-9]{20,}/g,    // Hugging Face keys
      /'[a-zA-Z0-9]{30,}'/g,     // Long quoted strings (potential keys)
      /"[a-zA-Z0-9]{30,}"/g      // Long quoted strings (potential keys)
    ];

    hardcodedKeyPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.hasHardcodedKeys = true;
        analysis.securityIssues.push(`Potential hardcoded keys: ${matches.length} found`);
      }
    });

    // Check for common environment variables
    const commonEnvVars = [
      'ELEVENLABS_API_KEY',
      'OPENAI_API_KEY', 
      'HUGGINGFACE_API_KEY',
      'JWT_SECRET',
      'AZURE_OPENAI_API_KEY'
    ];

    commonEnvVars.forEach(envVar => {
      if (content.includes(envVar)) {
        analysis.hasCommonEnvVars = true;
      }
    });

    // Check for security best practices
    if (content.includes('setCorsHeaders')) {
      analysis.goodPractices.push('Sets CORS headers');
    }

    if (content.includes('handlePreflight')) {
      analysis.goodPractices.push('Handles CORS preflight');
    }

    if (content.includes('applyRateLimit')) {
      analysis.goodPractices.push('Applies rate limiting');
    }

    if (content.includes('validateRequired')) {
      analysis.goodPractices.push('Validates required fields');
    }

    if (content.includes('sendError') && content.includes('sendSuccess')) {
      analysis.goodPractices.push('Uses standardized response helpers');
    }

    // Check for logging
    if (content.includes('logger.')) {
      analysis.goodPractices.push('Uses logging');
    }

    return analysis;

  } catch (error) {
    console.error(`❌ Failed to analyze ${relativePath}:`, error.message);
    return null;
  }
}

/**
 * Generate security report
 */
function generateSecurityReport(analyses) {
  console.log('📊 Security Analysis Results:\n');

  let totalEndpoints = 0;
  let secureEndpoints = 0;
  let endpointsWithIssues = 0;

  analyses.forEach(analysis => {
    if (!analysis) return;
    
    totalEndpoints++;
    
    const isSecure = (analysis.usesGetApiKey || analysis.usesProcessEnv) && 
                     !analysis.hasHardcodedKeys &&
                     analysis.hasCommonEnvVars;
    
    if (isSecure) secureEndpoints++;
    if (analysis.securityIssues.length > 0) endpointsWithIssues++;

    // Print endpoint summary
    const securityStatus = isSecure ? '✅' : 
                          (analysis.securityIssues.length > 0 ? '❌' : '⚠️');
    
    console.log(`${securityStatus} ${analysis.name}`);
    
    // Show good practices
    if (analysis.goodPractices.length > 0) {
      analysis.goodPractices.forEach(practice => {
        console.log(`    ✅ ${practice}`);
      });
    }
    
    // Show security issues
    if (analysis.securityIssues.length > 0) {
      analysis.securityIssues.forEach(issue => {
        console.log(`    ❌ ${issue}`);
      });
    }
    
    // Show recommendations
    if (!analysis.usesGetApiKey && !analysis.usesProcessEnv && analysis.hasCommonEnvVars) {
      console.log(`    💡 Consider using getApiKey() helper for better error handling`);
    }
    
    if (!analysis.hasCommonEnvVars && (analysis.usesGetApiKey || analysis.usesProcessEnv)) {
      console.log(`    💡 No standard environment variables detected`);
    }
    
    console.log('');
  });

  console.log('📈 Summary:\n');
  console.log(`  Total API Endpoints: ${totalEndpoints}`);
  console.log(`  Secure Endpoints: ✅ ${secureEndpoints}/${totalEndpoints}`);
  console.log(`  Endpoints with Issues: ❌ ${endpointsWithIssues}/${totalEndpoints}`);
  console.log(`  Security Score: ${Math.round((secureEndpoints / totalEndpoints) * 100)}%`);

  console.log('\n🎯 Recommendations:\n');

  if (secureEndpoints === totalEndpoints) {
    console.log('  ✅ All API endpoints follow security best practices!');
    console.log('  ✅ GitHub secrets integration should work seamlessly');
  } else {
    console.log('  📝 Some endpoints could be improved:');
    console.log('    - Use getApiKey() helper function for consistent error handling');
    console.log('    - Ensure all sensitive data comes from environment variables');
    console.log('    - Never hardcode API keys or secrets in source code');
  }

  if (endpointsWithIssues === 0) {
    console.log('  ✅ No security issues detected');
  } else {
    console.log('  ⚠️  Address security issues before production deployment');
  }

  return {
    totalEndpoints,
    secureEndpoints, 
    endpointsWithIssues,
    securityScore: Math.round((secureEndpoints / totalEndpoints) * 100)
  };
}

/**
 * Main validation function
 */
function runValidation() {
  try {
    console.log('🔍 Scanning API endpoints for security configuration...\n');
    
    const endpointFiles = scanApiDirectory();
    
    if (endpointFiles.length === 0) {
      console.log('❌ No API endpoint files found');
      return false;
    }

    console.log(`📁 Found ${endpointFiles.length} API endpoint files\n`);

    const analyses = endpointFiles.map(file => 
      analyzeEndpointFile(file.path, file.relativePath)
    ).filter(Boolean);

    const report = generateSecurityReport(analyses);

    console.log('\n🚀 GitHub Secrets Compatibility:\n');
    
    if (report.securityScore >= 80) {
      console.log('  ✅ API endpoints are well-configured for GitHub secrets');
      console.log('  ✅ Environment variables will be properly loaded from secrets');
      console.log('  ✅ Ready for secure CI/CD deployment');
    } else {
      console.log('  ⚠️  Some endpoints need attention for optimal security');
      console.log('  📝 Review API key handling before production deployment');
    }

    console.log('\n🏁 API Configuration Validation Complete!\n');

    return report.endpointsWithIssues === 0 && report.securityScore >= 80;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runValidation();
  process.exit(success ? 0 : 1);
}