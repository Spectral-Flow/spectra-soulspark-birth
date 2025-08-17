/// <reference types="vite/client" />

// Minimal SpeechRecognition typings for the Web Speech API used in this project
declare global {
		interface SpeechRecognitionEvent extends Event {
			readonly resultIndex: number;
			readonly results: unknown;
		}

	interface SpeechRecognition extends EventTarget {
		continuous: boolean;
		interimResults: boolean;
		lang: string;
		onresult: ((event: SpeechRecognitionEvent) => void) | null;
		onerror: ((event: Event) => void) | null;
		onend: ((event: Event) => void) | null;
		start(): void;
		stop(): void;
	}

	interface Window {
		webkitSpeechRecognition?: new () => SpeechRecognition;
		SpeechRecognition?: new () => SpeechRecognition;
	}

	export {}
}
