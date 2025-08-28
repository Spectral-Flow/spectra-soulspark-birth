/// <reference types="vite/client" />
/// <reference types="react" />

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

// ElevenLabs ConvAI Widget type declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id'?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
