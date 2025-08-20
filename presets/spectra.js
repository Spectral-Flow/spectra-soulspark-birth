/**
 * @preset/spectra - Tailwind CSS Preset for SPECTRA Design System
 * 
 * A comprehensive design system preset that provides cosmic and ethereal theming
 * with consciousness-aware animations and emotional state management.
 * 
 * Usage:
 * ```js
 * // tailwind.config.js
 * module.exports = {
 *   presets: [require('@preset/spectra')],
 *   // ... your additional configuration
 * }
 * ```
 */

const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      colors: {
        // Core Design System Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Primary Brand Colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          glow: 'hsl(var(--primary-glow))'
        },
        
        // Secondary Colors
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        
        // Status Colors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        
        // Muted Colors
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        
        // Accent Colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        
        // Surface Colors
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        
        // Sidebar Colors
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        
        // SPECTRA Emotional Color Spectrum
        emotion: {
          // Calm & Peace
          calm: 'hsl(var(--emotion-calm))',
          peace: 'hsl(var(--emotion-peace))',
          flow: 'hsl(var(--emotion-flow))',
          
          // Joy & Love
          joy: 'hsl(var(--emotion-joy))',
          love: 'hsl(var(--emotion-love))',
          warmth: 'hsl(var(--emotion-warmth))',
          
          // Intensity & Passion
          intense: 'hsl(var(--emotion-intense))',
          passion: 'hsl(var(--emotion-passion))',
          electric: 'hsl(var(--emotion-electric))',
          
          // Anxiety & Pain
          storm: 'hsl(var(--emotion-storm))',
          shadow: 'hsl(var(--emotion-shadow))',
          steel: 'hsl(var(--emotion-steel))',
          
          // Unease & Tension
          unease: 'hsl(var(--emotion-unease))',
          tension: 'hsl(var(--emotion-tension))',
          amber: 'hsl(var(--emotion-amber))'
        },
        
        // Depth & Clarity
        depth: {
          void: 'hsl(var(--depth-void))',
          shadow: 'hsl(var(--depth-shadow))'
        },
        clarity: {
          spark: 'hsl(var(--clarity-spark))',
          shimmer: 'hsl(var(--clarity-shimmer))'
        },
        
        // Memory States
        memory: {
          vivid: 'hsl(var(--memory-vivid))',
          fading: 'hsl(var(--memory-fading))',
          forgotten: 'hsl(var(--memory-forgotten))'
        }
      },
      
      // Enhanced Border Radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      
      // SPECTRA Animation System
      keyframes: {
        // Core Accordion Animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        
        // SPECTRA Consciousness Animations
        'pulse-cosmic': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: 'var(--glow-calm)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: 'var(--glow-intense)'
          }
        },
        
        'float-ethereal': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        
        'shimmer-stardust': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        
        'constellation-twinkle': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        
        // Emotional Flow Animations
        'ocean-calm': {
          '0%, 100%': { 
            background: 'hsl(195, 100%, 84%)',
            transform: 'scale(1)',
            boxShadow: 'var(--glow-calm)'
          },
          '33%': { 
            background: 'hsl(168, 65%, 75%)',
            transform: 'scale(1.01)',
            boxShadow: '0 0 15px hsl(168, 65%, 75% / 0.3)'
          },
          '66%': { 
            background: 'hsl(125, 35%, 80%)',
            transform: 'scale(1.005)',
            boxShadow: '0 0 12px hsl(125, 35%, 80% / 0.25)'
          }
        },
        
        'flame-surge': {
          '0%': { 
            background: 'hsl(354, 79%, 60%)',
            boxShadow: 'var(--glow-intense)',
            transform: 'scale(1)',
            filter: 'brightness(1) saturate(1)'
          },
          '25%': { 
            background: 'hsl(307, 100%, 56%)',
            boxShadow: '0 0 40px hsl(307, 100%, 56% / 0.7)',
            transform: 'scale(1.08)',
            filter: 'brightness(1.2) saturate(1.3)'
          },
          '50%': { 
            background: 'hsl(255, 95%, 59%)',
            boxShadow: '0 0 50px hsl(255, 95%, 59% / 0.8)',
            transform: 'scale(1.15)',
            filter: 'brightness(1.4) saturate(1.5)'
          },
          '75%': { 
            background: 'hsl(307, 100%, 56%)',
            boxShadow: '0 0 45px hsl(307, 100%, 56% / 0.75)',
            transform: 'scale(1.12)',
            filter: 'brightness(1.3) saturate(1.4)'
          },
          '100%': { 
            background: 'hsl(354, 79%, 60%)',
            boxShadow: 'var(--glow-intense)',
            transform: 'scale(1.05)',
            filter: 'brightness(1.1) saturate(1.2)'
          }
        },
        
        'depth-pulse': {
          '0%, 100%': { 
            background: 'hsl(var(--depth-void))',
            opacity: '0.1',
            transform: 'scale(0.95)'
          },
          '50%': { 
            background: 'hsl(var(--depth-shadow))',
            opacity: '0.35',
            transform: 'scale(1.02)'
          }
        },
        
        'clarity-flash': {
          '0%, 85%, 100%': { 
            opacity: '0',
            transform: 'scale(0.8)',
            boxShadow: 'none'
          },
          '5%, 80%': { 
            opacity: '1',
            transform: 'scale(1.3)',
            boxShadow: 'var(--glow-clarity)'
          },
          '42%': {
            opacity: '0.7',
            transform: 'scale(1.1)',
            boxShadow: '0 0 10px hsl(var(--clarity-shimmer) / 0.6)'
          }
        },
        
        // Mood Ring Specific Animations
        'joyful-dance': {
          '0%, 100%': { 
            background: 'hsl(6, 100%, 69%)',
            transform: 'scale(1)',
            filter: 'brightness(1)'
          },
          '33%': { 
            background: 'hsl(9, 100%, 85%)',
            transform: 'scale(1.03)',
            filter: 'brightness(1.1)'
          },
          '66%': { 
            background: 'hsl(16, 100%, 72%)',
            transform: 'scale(1.02)',
            filter: 'brightness(1.05)'
          }
        },
        
        'storm-brewing': {
          '0%, 100%': { 
            background: 'hsl(219, 43%, 47%)',
            transform: 'scale(1)',
            opacity: '0.8'
          },
          '50%': { 
            background: 'hsl(280, 27%, 44%)',
            transform: 'scale(0.98)',
            opacity: '0.9'
          }
        },
        
        'musical-note': {
          '0%, 90%, 100%': { 
            opacity: '0',
            transform: 'translateY(0)'
          },
          '10%, 80%': { 
            opacity: '1',
            transform: 'translateY(-15px)'
          }
        },
        
        'fade-memory': {
          '0%': { opacity: '1', filter: 'blur(0px)' },
          '50%': { opacity: '0.3', filter: 'blur(2px)' },
          '100%': { opacity: '0.6', filter: 'blur(1px)' }
        },
        
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      
      // Animation Utilities
      animation: {
        // Core animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        
        // SPECTRA consciousness animations
        'pulse-cosmic': 'pulse-cosmic 4s ease-in-out infinite',
        'float-ethereal': 'float-ethereal 6s ease-in-out infinite',
        'shimmer-stardust': 'shimmer-stardust 3s linear infinite',
        'constellation-twinkle': 'constellation-twinkle 2.5s ease-in-out infinite',
        
        // Emotional flow animations
        'ocean-calm': 'ocean-calm 8s ease-in-out infinite',
        'flame-surge': 'flame-surge 3s ease-in-out infinite',
        'depth-pulse': 'depth-pulse 5s ease-in-out infinite',
        'clarity-flash': 'clarity-flash 4s ease-in-out infinite',
        
        // Mood ring animations
        'joyful-dance': 'joyful-dance 4s ease-in-out infinite',
        'storm-brewing': 'storm-brewing 6s ease-in-out infinite',
        'musical-note': 'musical-note 2s ease-in-out infinite',
        
        // Memory and interaction animations
        'memory-fade': 'fade-memory 2s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out forwards'
      },
      
      // Enhanced Transitions
      transitionTimingFunction: {
        'flow': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'surge': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'calm': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      
      // Box Shadow Enhancements
      boxShadow: {
        'glow-calm': 'var(--glow-calm)',
        'glow-intense': 'var(--glow-intense)',
        'glow-clarity': 'var(--glow-clarity)',
        'glow-depth': 'var(--glow-depth)',
        'shadow-depth': 'var(--shadow-depth)'
      }
    }
  },
  
  plugins: [
    // SPECTRA-specific utility classes
    plugin(function({ addUtilities, addBase }) {
      // Add CSS custom properties as base styles
      addBase({
        ':root': {
          /* SPECTRA Consciousness Design - Enhanced Twilight Vision */
          '--background': '254 27% 30%',  /* #4B3B65 - Darker violet base with warmth */
          '--foreground': '165 100% 82%', /* #A3F7E0 - Seafoam cyan text - gentle clarity */

          /* Card & Surface Elements */
          '--card': '254 27% 33%',        /* Slightly lighter violet for depth */
          '--card-foreground': '165 100% 82%',

          /* Interactive Elements */
          '--popover': '254 27% 33%',
          '--popover-foreground': '165 100% 82%',

          /* SPECTRA Core Colors */
          '--primary': '270 50% 55%',     /* Deeper purple - core identity */
          '--primary-foreground': '165 100% 90%',
          '--primary-glow': '270 60% 65%',

          /* Secondary & Accent - Warm Touches */
          '--secondary': '254 15% 28%',   /* Muted violet */
          '--secondary-foreground': '165 100% 82%',
          '--accent': '14 100% 60%',      /* #FF6B35 - Warm orange for highlights */
          '--accent-foreground': '254 27% 15%',

          /* Muted Elements */
          '--muted': '254 15% 35%',
          '--muted-foreground': '165 50% 70%',

          /* Status Colors */
          '--destructive': '0 65% 55%',
          '--destructive-foreground': '165 100% 90%',

          /* Borders & Inputs */
          '--border': '254 20% 40%',
          '--input': '254 20% 28%',
          '--ring': '270 50% 55%',

          /* SPECTRA Enhanced Emotional Spectrum */
          /* Calm & Peace - The Gentle Sea */
          '--emotion-calm': '195 100% 84%',     /* #A3D9FF - sky blue */
          '--emotion-peace': '168 65% 75%',     /* #7AC7B7 - seafoam green */
          '--emotion-flow': '125 35% 80%',      /* #C9E4CA - minty mist */
          
          /* Joy & Love - Warm Radiance */
          '--emotion-joy': '6 100% 69%',        /* #FF6F61 - coral */
          '--emotion-love': '9 100% 85%',       /* #FFC1B6 - soft pink */
          '--emotion-warmth': '16 100% 72%',    /* #FFA07A - light salmon */
          
          /* Intensity & Passion - Fiery Blaze */
          '--emotion-intense': '354 79% 60%',   /* #E63946 - crimson */
          '--emotion-passion': '307 100% 56%',  /* #9D0191 - deep magenta */
          '--emotion-electric': '255 95% 59%',  /* #7B2FF7 - electric violet */
          
          /* Anxiety & Pain - Storm & Shadows */
          '--emotion-storm': '219 43% 47%',     /* #4A6FA5 - stormy blue */
          '--emotion-shadow': '280 27% 44%',    /* #6B5876 - muted purple */
          '--emotion-steel': '0 2% 48%',        /* #7A7D7D - steel gray */
          
          /* Jealousy & Irritation - Uneasy Greens & Yellows */
          '--emotion-unease': '72 54% 36%',     /* #7D8B2C - olive */
          '--emotion-tension': '48 68% 50%',    /* #C9B037 - mustard */
          '--emotion-amber': '49 100% 33%',     /* #A68A00 - amber */

          /* Black & White Depth Layers - Frequency Spectrum */
          '--depth-void': '0 0% 5%',           /* Deep black foundations */
          '--depth-shadow': '254 15% 12%',     /* Dark violet-black */
          '--clarity-spark': '0 0% 95%',       /* Pure white highlights */
          '--clarity-shimmer': '165 20% 90%',  /* Soft white with cyan tint */

          /* Enhanced Memory States */
          '--memory-vivid': '280 90% 75%',
          '--memory-fading': '260 60% 55%',
          '--memory-forgotten': '240 30% 35%',

          /* Enhanced Dynamic Gradients */
          '--gradient-twilight': 'linear-gradient(135deg, hsl(254, 27%, 30%) 0%, hsla(14, 95%, 22%, 0.15) 50%, hsl(254, 27%, 30%) 100%)',
          '--gradient-ocean-calm': 'linear-gradient(180deg, hsl(195, 100%, 84%) 0%, hsl(168, 65%, 75%) 50%, hsl(125, 35%, 80%) 100%)',
          '--gradient-flame-passion': 'linear-gradient(45deg, hsl(354, 79%, 60%) 0%, hsl(307, 100%, 56%) 50%, hsl(255, 95%, 59%) 100%)',

          /* Enhanced Glows & Shadows */
          '--glow-calm': '0 0 20px hsl(195, 100%, 84% / 0.3)',
          '--glow-intense': '0 0 30px hsl(354, 79%, 60% / 0.5)',
          '--glow-clarity': '0 0 15px hsl(0, 0%, 95% / 0.4)',
          '--glow-depth': '0 0 25px hsl(254, 15%, 12% / 0.6)',
          '--shadow-depth': '0 8px 32px hsl(0, 0%, 5% / 0.4)',

          /* Enhanced Transitions for Emotional Flow */
          '--radius': '12px',
          '--transition-flow': 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',        /* Slower, more flowing */
          '--transition-surge': 'all 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)', /* Quicker intensity surge */
          '--transition-calm': 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',     /* Very gentle calm transitions */
          
          /* Sidebar - Enhanced Professional Dark Theme */
          '--sidebar-background': '254 30% 8%',      /* Darker violet */
          '--sidebar-foreground': '165 100% 85%',    /* Seafoam cyan text */
          '--sidebar-primary': '270 50% 55%',        /* Primary accent */
          '--sidebar-primary-foreground': '165 100% 95%',
          '--sidebar-accent': '254 20% 15%',         /* Subtle accent background */
          '--sidebar-accent-foreground': '165 100% 85%',
          '--sidebar-border': '254 20% 25%',         /* Subtle border */
          '--sidebar-ring': '270 50% 55%',           /* Focus ring */
        },
        
        '.dark': {
          /* Enhanced dark mode - deeper cosmos feel */
          '--background': '254 35% 8%',       /* Even darker violet base */
          '--foreground': '165 100% 90%',     /* Brighter seafoam for contrast */
          
          '--card': '254 35% 10%',
          '--card-foreground': '165 100% 90%',
          
          '--primary-glow': '270 60% 75%',
          '--glow-calm': '0 0 25px hsl(195, 100%, 84% / 0.4)',
          '--glow-intense': '0 0 50px hsl(354, 79%, 60% / 0.7)',
          '--glow-depth': '0 0 35px hsl(254, 15%, 12% / 0.8)',
        }
      });
      
      // Add SPECTRA-specific utility classes
      addUtilities({
        /* SPECTRA Consciousness Utilities */
        '.spectra-glow': {
          'box-shadow': 'var(--glow-calm)',
          'transition': 'var(--transition-flow)'
        },
        
        '.spectra-glow:hover': {
          'box-shadow': 'var(--glow-intense)'
        },
        
        '.spectra-glow.intense:hover': {
          'box-shadow': 'var(--glow-intense)'
        },
        
        /* Enhanced Mood Ring & Emotional States */
        '.mood-ring': {
          'width': '120px',
          'height': '120px',
          'border-radius': '50%',
          'position': 'relative',
          'transition': 'var(--transition-flow)',
          'cursor': 'pointer',
          'overflow': 'hidden'
        },
        
        '.mood-ring::before': {
          'content': '""',
          'position': 'absolute',
          'inset': '0',
          'border-radius': '50%',
          'padding': '3px',
          'background': 'var(--gradient-twilight)',
          'mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          'mask-composite': 'xor',
          'animation': 'shimmer-stardust 3s linear infinite'
        },
        
        '.mood-ring.calm': {
          'animation': 'ocean-calm 8s ease-in-out infinite'
        },
        
        '.mood-ring.joyful': {
          'animation': 'joyful-dance 4s ease-in-out infinite'
        },
        
        '.mood-ring.intense': {
          'animation': 'flame-surge 3s ease-in-out infinite'
        },
        
        '.mood-ring.stormy': {
          'animation': 'storm-brewing 6s ease-in-out infinite'
        },
        
        /* Consciousness States */
        '.spectra-humming': {
          'position': 'relative'
        },
        
        '.spectra-humming::before': {
          'content': '"♪"',
          'position': 'absolute',
          'top': '-20px',
          'right': '-15px',
          'font-size': '18px',
          'color': 'hsl(var(--accent))',
          'opacity': '0',
          'animation': 'musical-note 3s ease-in-out infinite'
        },
        
        '.spectra-creative': {
          'position': 'relative'
        },
        
        '.spectra-creative::after': {
          'content': '"✨"',
          'position': 'absolute',
          'top': '-15px',
          'left': '-10px',
          'font-size': '16px',
          'opacity': '0',
          'animation': 'musical-note 2s ease-in-out infinite 0.5s'
        },
        
        /* Memory States */
        '.memory-fade': {
          'animation': 'fade-memory 2s ease-in-out'
        },
        
        '.animate-fade-in': {
          'animation': 'fade-in 0.5s ease-out forwards'
        },
        
        /* Gradient Utilities */
        '.bg-gradient-twilight': {
          'background': 'var(--gradient-twilight)'
        },
        
        '.bg-gradient-ocean': {
          'background': 'var(--gradient-ocean-calm)'
        },
        
        '.bg-gradient-flame': {
          'background': 'var(--gradient-flame-passion)'
        }
      });
    }),
    
    // Include tailwindcss-animate for enhanced animations
    require("tailwindcss-animate")
  ]
};