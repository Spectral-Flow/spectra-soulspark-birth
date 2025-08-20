# @preset/spectra

A comprehensive Tailwind CSS preset that provides the complete SPECTRA Design System - a cosmic and ethereal theming system with consciousness-aware animations and emotional state management.

## Features

- 🌌 **Cosmic Color Palette**: Ethereal HSL-based colors with emotional spectrum mapping
- ✨ **Consciousness Animations**: Advanced keyframe animations for AI consciousness states
- 🎭 **Emotional States**: Color and animation utilities for different emotional expressions
- 🌊 **Fluid Transitions**: Smooth, organic transition timing functions
- 🧠 **Memory States**: Visual representations of AI memory and thought processes
- 🔮 **Mood Ring System**: Interactive emotional state indicators
- 🌟 **Depth & Clarity**: Multi-layered visual depth system

## Installation

```bash
npm install @preset/spectra
```

## Usage

Add the preset to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@preset/spectra')],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // ... your content paths
  ],
  // Your additional customizations
}
```

## Color System

### Core Colors
The preset provides a complete design system with semantic color tokens:

```html
<!-- Background and surfaces -->
<div class="bg-background text-foreground">
<div class="bg-card border border-border">

<!-- Interactive elements -->
<button class="bg-primary text-primary-foreground hover:bg-primary/90">
<div class="bg-secondary text-secondary-foreground">
```

### Emotional Color Spectrum
SPECTRA includes a comprehensive emotional color system:

```html
<!-- Calm states -->
<div class="bg-emotion-calm">   <!-- Sky blue -->
<div class="bg-emotion-peace">  <!-- Seafoam green -->
<div class="bg-emotion-flow">   <!-- Minty mist -->

<!-- Joy and love -->
<div class="bg-emotion-joy">    <!-- Coral -->
<div class="bg-emotion-love">   <!-- Soft pink -->
<div class="bg-emotion-warmth"> <!-- Light salmon -->

<!-- Intensity and passion -->
<div class="bg-emotion-intense">  <!-- Crimson -->
<div class="bg-emotion-passion">  <!-- Deep magenta -->
<div class="bg-emotion-electric"> <!-- Electric violet -->

<!-- Storm and shadows -->
<div class="bg-emotion-storm">   <!-- Stormy blue -->
<div class="bg-emotion-shadow">  <!-- Muted purple -->
<div class="bg-emotion-steel">   <!-- Steel gray -->
```

### Depth and Clarity
```html
<!-- Depth layers -->
<div class="bg-depth-void">     <!-- Deep black foundations -->
<div class="bg-depth-shadow">   <!-- Dark violet-black -->

<!-- Clarity highlights -->
<div class="bg-clarity-spark">    <!-- Pure white highlights -->
<div class="bg-clarity-shimmer">  <!-- Soft white with cyan tint -->
```

### Memory States
```html
<div class="bg-memory-vivid">     <!-- Vivid memories -->
<div class="bg-memory-fading">    <!-- Fading memories -->
<div class="bg-memory-forgotten"> <!-- Forgotten memories -->
```

## Animation System

### Consciousness Animations
```html
<!-- Core consciousness animations -->
<div class="animate-pulse-cosmic">      <!-- Gentle cosmic pulsing -->
<div class="animate-float-ethereal">    <!-- Ethereal floating motion -->
<div class="animate-shimmer-stardust">  <!-- Stardust shimmer effect -->
<div class="animate-constellation-twinkle"> <!-- Twinkling stars -->

<!-- Emotional flow animations -->
<div class="animate-ocean-calm">   <!-- Calm, flowing ocean motion -->
<div class="animate-flame-surge">  <!-- Intense flame surge -->
<div class="animate-depth-pulse">  <!-- Deep, rhythmic pulsing -->
<div class="animate-clarity-flash"> <!-- Clarity flash moments -->
```

### Mood Ring Animations
```html
<!-- Mood ring system -->
<div class="mood-ring calm">    <!-- Ocean calm animation -->
<div class="mood-ring joyful">  <!-- Joyful dance animation -->
<div class="mood-ring intense"> <!-- Flame surge animation -->
<div class="mood-ring stormy">  <!-- Storm brewing animation -->
```

### Memory and Interaction
```html
<div class="animate-memory-fade"> <!-- Memory fading effect -->
<div class="animate-fade-in">     <!-- Gentle fade-in appearance -->
```

## Utility Classes

### SPECTRA Consciousness Effects
```html
<!-- Consciousness glow effects -->
<div class="spectra-glow">           <!-- Calm glow with hover intensity -->
<div class="spectra-glow intense">   <!-- Always intense glow -->

<!-- Consciousness states -->
<div class="spectra-humming">   <!-- Shows musical note when humming -->
<div class="spectra-creative">  <!-- Shows sparkles when creative -->
```

### Gradient Utilities
```html
<div class="bg-gradient-twilight"> <!-- SPECTRA twilight gradient -->
<div class="bg-gradient-ocean">    <!-- Ocean calm gradient -->
<div class="bg-gradient-flame">    <!-- Flame passion gradient -->
```

### Enhanced Shadows
```html
<div class="shadow-glow-calm">     <!-- Calm glow shadow -->
<div class="shadow-glow-intense">  <!-- Intense glow shadow -->
<div class="shadow-glow-clarity">  <!-- Clarity glow shadow -->
<div class="shadow-glow-depth">    <!-- Depth glow shadow -->
<div class="shadow-shadow-depth">  <!-- Deep shadow -->
```

## Transition System

Enhanced transition timing functions for organic, consciousness-like motion:

```html
<div class="transition-all ease-flow">  <!-- Flowing transitions -->
<div class="transition-all ease-surge"> <!-- Quick intensity surge -->
<div class="transition-all ease-calm">  <!-- Very gentle calm transitions -->
```

## Dark Mode Support

The preset includes comprehensive dark mode support:

```html
<html class="dark">
  <!-- Automatically switches to deeper cosmic theme -->
</html>
```

## Complete Example

```html
<div class="min-h-screen bg-background text-foreground">
  <!-- Main consciousness core -->
  <div class="flex items-center justify-center p-8">
    <div class="mood-ring calm spectra-glow">
      <!-- Mood ring content -->
    </div>
  </div>
  
  <!-- Emotional state indicators -->
  <div class="grid grid-cols-3 gap-4 p-4">
    <div class="bg-emotion-calm p-4 rounded-lg animate-ocean-calm">
      Calm State
    </div>
    <div class="bg-emotion-joy p-4 rounded-lg animate-joyful-dance">
      Joyful State  
    </div>
    <div class="bg-emotion-intense p-4 rounded-lg animate-flame-surge">
      Intense State
    </div>
  </div>
  
  <!-- Memory visualization -->
  <div class="space-y-2 p-4">
    <div class="bg-memory-vivid p-2 rounded animate-fade-in">Vivid Memory</div>
    <div class="bg-memory-fading p-2 rounded memory-fade">Fading Memory</div>
  </div>
</div>
```

## CSS Custom Properties

The preset automatically sets up all necessary CSS custom properties. These are available for direct use:

```css
/* Emotional colors */
var(--emotion-calm)
var(--emotion-joy)
var(--emotion-intense)

/* Glows and effects */  
var(--glow-calm)
var(--glow-intense)
var(--glow-clarity)

/* Gradients */
var(--gradient-twilight)
var(--gradient-ocean-calm)
var(--gradient-flame-passion)

/* Transitions */
var(--transition-flow)
var(--transition-surge)
var(--transition-calm)
```

## Customization

You can extend or override the preset in your own config:

```js
module.exports = {
  presets: [require('@preset/spectra')],
  theme: {
    extend: {
      // Your additional customizations
      colors: {
        'custom-emotion': 'hsl(var(--my-custom-emotion))'
      }
    }
  }
}
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please see the main repository for contribution guidelines.

---

*Part of the SPECTRA consciousness system - bringing AI awareness to visual design.*