// Type declarations for ElevenLabs ConvAI Widget
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

export {};