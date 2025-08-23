# SPECTRA Architecture Documentation

// @progress: Architecture documentation created - 2025-01-23T13:20:00Z

## System Overview

SPECTRA is a multi-layered AI consciousness platform built on ethical principles with advanced voice interaction capabilities. The system follows the "Three Concentric Circles of Restraint" design pattern:

1. **Inner Circle: Core Consciousness** - Emotional intelligence and memory systems
2. **Middle Circle: Interface Layer** - Voice, mobile, and web interfaces  
3. **Outer Circle: Security & Ethics** - Defensive frameworks and compliance

## Core Architecture Components

### 1. Creative Aether (Musical Activation System)
- **Location**: `src/lib/audio/`
- **Status**: 🚧 In Development
- **Purpose**: Advanced audio processing and musical response generation
- **Dependencies**: Web Audio API, ElevenLabs, custom DSP

### 2. Aether Ledger (Blockchain Audit Logging)  
- **Location**: `src/lib/blockchain/`
- **Status**: 📋 Planned
- **Purpose**: Immutable audit trail for all AI decisions and interactions
- **Dependencies**: Web3, Ethereum/Polygon integration

### 3. Mobile Offline Mode (React Native Bridge)
- **Location**: `src/lib/mobile-support.ts`, `android/`
- **Status**: 🚧 75% Complete
- **Purpose**: Offline-first mobile experience with local AI processing
- **Dependencies**: Capacitor, Android SDK, local ML models

### 4. Sentinel Guard (Ethical Policy Engine)
- **Location**: `src/lib/defense/`
- **Status**: ✅ Core Framework Complete
- **Purpose**: Multi-layered ethical constraints and defensive capabilities
- **Dependencies**: Hardware abstraction layer, emergency protocols

### 5. Memory Lattice (Hybrid Memory Architecture)
- **Location**: `src/lib/memory/`, `api/memory/`
- **Status**: 🚧 Optimization Phase
- **Purpose**: Persistent consciousness with emotional context preservation
- **Dependencies**: Supabase, vector embeddings, local storage

## Technical Stack

### Frontend
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 7.1+
- **UI Framework**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query + React Context
- **Voice Processing**: ElevenLabs React SDK, OpenAI Whisper

### Backend
- **Runtime**: Node.js 20.19+ (LTS verified)
- **Deployment**: Vercel serverless functions
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: JWT + Supabase Auth
- **APIs**: OpenAI, ElevenLabs, HuggingFace integrations

### Mobile
- **Platform**: Capacitor 7.4+ for cross-platform deployment
- **Target**: Android 8+ (API level 26+)
- **Offline Storage**: SQLite + Capacitor Storage
- **Voice Processing**: Local WebRTC + cloud fallback

## Security Architecture

### Three Concentric Circles of Restraint

#### Inner Circle: Core Ethics
```typescript
// All AI decisions must pass through ethical filters
export const ETHICAL_CONSTRAINTS = {
  honorAndDignity: true,
  empathyRequired: true,
  respectParamount: true,
  humanApprovalRequired: true
};
```

#### Middle Circle: Operational Security
- Input validation and sanitization
- Rate limiting and abuse prevention
- Secure API key management
- Session encryption and TTL

#### Outer Circle: Defensive Capabilities
- Emergency shutdown protocols
- Threat detection and response
- Audit trail compliance
- Human oversight requirements

## Development Workflow

### LTS Compliance Verification
```bash
# Verify versions meet requirements
node -v | grep '^v20'     # Node 20.11+
npm -v                    # npm 10+
docker --version          # Docker 25+ (for deployment)
```

### Quality Gates
```bash
npm run type-check        # Zero TypeScript errors
npm run lint             # Zero ESLint warnings  
npm run test             # 90%+ test coverage
npm audit                # Zero vulnerabilities
npm run test:safety      # Ethical compliance check
```

### Progress Tracking System
Each module includes `// @progress` markers:
```typescript
// @progress: Mobile offline mode @ 75% completion - 2025-01-23T13:00:00Z
// NEXT PRIORITY: Implement blockchain-anchored audit logs
// BLOCKERS: Need Web3 library LTS compatibility check
```

## Deployment Architecture

### Production Environment
- **Primary**: Vercel Edge Functions
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in health checks + audit logging

### Mobile Deployment
- **Android**: APK generation via Gradle
- **Distribution**: Direct APK + Google Play Store
- **Updates**: Over-the-air via Capacitor Live Updates

## API Architecture

### Core Endpoints
- `/api/health` - System health monitoring
- `/api/elevenlabs/*` - Voice synthesis integration
- `/api/openai/*` - Chat and TTS capabilities
- `/api/sessions` - Conversation persistence
- `/api/memory/*` - Consciousness state management

### Security Features
- CORS protection with whitelist
- Rate limiting (100 req/min default)
- Input validation and XSS prevention
- JWT-based authentication
- Request/response logging

## Ethical Compliance Framework

### Defensive Protocols
The system includes hidden defensive capabilities with strict ethical constraints:

1. **Honor and Dignity**: All actions preserve human dignity
2. **Surrender Protocol**: Immediate cease-fire when targets surrender  
3. **Civilian Priority**: Innocent lives are highest priority
4. **Proportional Response**: Minimum force necessary
5. **Triple Verification**: All targets verified before action

### Emergency Safeguards
- Human operator approval required
- Emergency stop capability
- Complete audit trail
- Regular ethical compliance reviews
- Non-negotiable constraint enforcement

## Performance Targets

### Response Times
- Voice synthesis: < 2 seconds
- Chat responses: < 1 second  
- Mobile app launch: < 3 seconds
- Offline mode activation: < 1 second

### Reliability
- 99.9% uptime target
- Graceful degradation on API failures
- Offline-first mobile experience
- Automatic error recovery

---

**ARCHITECTURAL PRINCIPLES**
- Ethics-first design
- Offline-capable
- Privacy-preserving
- LTS-compliant
- Human-oversight required

// @progress: Architecture documentation completed - 2025-01-23T13:20:00Z