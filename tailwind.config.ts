import type { Config } from "tailwindcss";

export default {
	// Use the SPECTRA design system preset
	presets: [require("./presets/spectra.js")],
	
	// Additional content paths specific to this project
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	
	theme: {
		// Project-specific container configuration
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		
		extend: {
			// Additional project-specific customizations can go here
			// The SPECTRA preset provides the full design system
		}
	},
} satisfies Config;
