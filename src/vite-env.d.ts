/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ELEVENLABS_AGENT_ID: string
  readonly VITE_DEBUG: string
  // Add other env variables you need...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
