import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA Support
import { registerServiceWorker } from './lib/mobile-support'

// Initialize diagnostics system
import './lib/diagnostics'
import './lib/startup-diagnostics'

// Initialize PWA features
registerServiceWorker().catch(console.error);

// Initialize i18n system
import { i18n } from './lib/i18n'

// Set up global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Ensure loading screen disappears even on errors
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && loadingScreen.style.display !== 'none') {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 100);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Ensure loading screen disappears even on promise rejections
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen && loadingScreen.style.display !== 'none') {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 100);
  }
});

// Initialize app with error handling
try {
  createRoot(document.getElementById("root")!).render(<App />);
  console.log('✨ React app initialized successfully');
  
  // Hide loading screen immediately when React app is ready
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Show error message to user
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1 style="color: #8B5CF6; margin-bottom: 16px;">SPECTRA</h1>
          <p style="margin-bottom: 16px;">Unable to initialize the application.</p>
          <p style="font-size: 14px; opacity: 0.7;">Please refresh the page to try again.</p>
          <button onclick="window.location.reload()" style="
            background: #8B5CF6; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 6px; 
            margin-top: 16px;
            cursor: pointer;
          ">Refresh Page</button>
        </div>
      </div>
    `;
  }
  
  // Ensure loading screen disappears
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 100);
  }
}
