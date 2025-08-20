import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Support
import { registerServiceWorker } from './lib/mobile-support'

// Initialize PWA features
registerServiceWorker().catch(console.error);

// Initialize i18n system
import { i18n } from './lib/i18n'

// Set up global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize app
createRoot(document.getElementById("root")!).render(<App />);
