#!/usr/bin/env node

/**
 * Test script for @preset/spectra
 * Validates that the preset can be loaded and contains expected configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing @preset/spectra...\n');

try {
  // Test 1: Check if preset file exists and can be loaded
  console.log('📦 Loading preset...');
  const presetPath = path.join(__dirname, 'spectra.js');
  const preset = require(presetPath);
  console.log('✅ Preset loaded successfully');

  // Test 2: Validate preset structure
  console.log('\n🔍 Validating preset structure...');
  const requiredKeys = ['darkMode', 'content', 'theme', 'plugins'];
  for (const key of requiredKeys) {
    if (preset[key] === undefined) {
      throw new Error(`Missing required key: ${key}`);
    }
  }
  console.log('✅ Preset structure is valid');

  // Test 3: Check for SPECTRA-specific colors
  console.log('\n🎨 Checking emotional color system...');
  const emotions = ['calm', 'joy', 'intense', 'peace', 'storm', 'electric'];
  const emotionColors = preset.theme.extend.colors.emotion;
  
  if (!emotionColors) {
    throw new Error('Emotional color system not found');
  }
  
  for (const emotion of emotions) {
    if (!emotionColors[emotion]) {
      throw new Error(`Missing emotion color: ${emotion}`);
    }
  }
  console.log('✅ Emotional color system complete');

  // Test 4: Check for SPECTRA animations
  console.log('\n🎭 Checking consciousness animations...');
  const animations = ['pulse-cosmic', 'ocean-calm', 'flame-surge', 'joyful-dance'];
  const keyframes = preset.theme.extend.keyframes;
  const animationList = preset.theme.extend.animation;
  
  for (const anim of animations) {
    if (!keyframes[anim]) {
      throw new Error(`Missing keyframe: ${anim}`);
    }
    if (!animationList[anim]) {
      throw new Error(`Missing animation utility: ${anim}`);
    }
  }
  console.log('✅ Consciousness animations complete');

  // Test 5: Check for plugins
  console.log('\n🔌 Checking plugins...');
  if (!Array.isArray(preset.plugins) || preset.plugins.length === 0) {
    throw new Error('Plugins not found or empty');
  }
  console.log(`✅ Found ${preset.plugins.length} plugin(s)`);

  // Test 6: Validate package.json
  console.log('\n📋 Validating package.json...');
  const packagePath = path.join(__dirname, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (packageData.name !== '@preset/spectra') {
    throw new Error('Package name should be @preset/spectra');
  }
  
  if (!packageData.peerDependencies?.tailwindcss) {
    throw new Error('Missing tailwindcss peer dependency');
  }
  console.log('✅ Package configuration valid');

  // Test 7: Check TypeScript definitions
  console.log('\n📝 Checking TypeScript definitions...');
  const typesPath = path.join(__dirname, 'spectra.d.ts');
  if (!fs.existsSync(typesPath)) {
    throw new Error('TypeScript definitions not found');
  }
  console.log('✅ TypeScript definitions present');

  console.log('\n🎉 All tests passed! @preset/spectra is ready to use.\n');
  
  console.log('📚 Quick start:');
  console.log('1. Add to tailwind.config.js: presets: [require("@preset/spectra")]');
  console.log('2. Use emotional colors: bg-emotion-calm, bg-emotion-joy, etc.');
  console.log('3. Add consciousness animations: animate-pulse-cosmic, animate-ocean-calm');
  console.log('4. Apply utility classes: mood-ring, spectra-glow, etc.\n');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}