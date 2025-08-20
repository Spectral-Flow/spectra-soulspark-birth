# Publishing @preset/spectra

This guide explains how to publish the SPECTRA design system preset to npm.

## Prerequisites

1. npm account with publishing permissions
2. Node.js and npm installed

## Publishing Steps

### 1. Prepare the Package

```bash
cd presets/
npm pack --dry-run  # Preview what will be published
```

### 2. Publish to npm

```bash
# For first-time publishing
npm publish --access public

# For updates
npm version patch  # or minor/major
npm publish
```

### 3. Verify Publication

```bash
npm view @preset/spectra
```

## Installation for Users

Once published, users can install the preset:

```bash
npm install @preset/spectra
```

And use it in their `tailwind.config.js`:

```js
module.exports = {
  presets: [require('@preset/spectra')],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // Additional customizations
}
```

## Local Development

For local development and testing:

```bash
# In the presets directory
npm link

# In a test project
npm link @preset/spectra
```

## Version Management

Follow semantic versioning:
- **Patch** (1.0.x): Bug fixes, small improvements
- **Minor** (1.x.0): New features, new utilities
- **Major** (x.0.0): Breaking changes, major restructuring

## Distribution

The package includes:
- `spectra.js` - Main preset file
- `spectra.d.ts` - TypeScript definitions  
- `README.md` - Usage documentation
- `package.json` - Package metadata