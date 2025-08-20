/**
 * Mobile Application Support - Progressive Web App (PWA) Configuration
 * Optimizes Spectra for mobile devices with native-like experience
 */

// PWA Service Worker Registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              showUpdateNotification();
            }
          });
        }
      });
      
      // Listen for message from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          showUpdateNotification();
        }
      });
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

// PWA Install Prompt
export class PWAInstallManager {
  private deferredPrompt: any = null;
  private installListeners: ((canInstall: boolean) => void)[] = [];

  constructor() {
    this.setupInstallPrompt();
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      
      // Notify listeners that app can be installed
      this.installListeners.forEach(listener => listener(true));
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was installed');
      this.deferredPrompt = null;
      this.installListeners.forEach(listener => listener(false));
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  }

  onInstallChange(callback: (canInstall: boolean) => void): () => void {
    this.installListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.installListeners.indexOf(callback);
      if (index > -1) {
        this.installListeners.splice(index, 1);
      }
    };
  }
}

// Mobile Detection and Optimization
export class MobileOptimization {
  private static instance: MobileOptimization;
  private touchStartY = 0;
  private isScrolling = false;

  static getInstance(): MobileOptimization {
    if (!MobileOptimization.instance) {
      MobileOptimization.instance = new MobileOptimization();
    }
    return MobileOptimization.instance;
  }

  constructor() {
    this.setupMobileOptimizations();
  }

  private setupMobileOptimizations(): void {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Handle viewport height changes (mobile keyboard)
    this.handleViewportHeightChanges();

    // Setup pull-to-refresh prevention
    this.setupPullToRefreshPrevention();

    // Setup haptic feedback
    this.setupHapticFeedback();

    // Setup wake lock for voice interactions
    this.setupWakeLock();
  }

  private handleViewportHeightChanges(): void {
    // Set CSS custom property for dynamic viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    setVH();
  }

  private setupPullToRefreshPrevention(): void {
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const isAtTop = window.scrollY === 0;
      const isPullingDown = currentY > startY;

      if (isAtTop && isPullingDown) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  private setupHapticFeedback(): void {
    // Add haptic feedback for button interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('[role="button"]')) {
        this.vibrate([10]); // Light haptic feedback
      }
    });
  }

  private setupWakeLock(): void {
    // Keep screen awake during voice interactions
    if ('wakeLock' in navigator) {
      (window as any).spectraWakeLock = null;
      
      (window as any).requestWakeLock = async () => {
        try {
          (window as any).spectraWakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('✅ Wake lock activated');
        } catch (err) {
          console.error('❌ Wake lock failed:', err);
        }
      };

      (window as any).releaseWakeLock = () => {
        if ((window as any).spectraWakeLock) {
          (window as any).spectraWakeLock.release();
          (window as any).spectraWakeLock = null;
          console.log('✅ Wake lock released');
        }
      };
    }
  }

  // Device detection
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Screen orientation
  getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  onOrientationChange(callback: (orientation: 'portrait' | 'landscape') => void): () => void {
    const handler = () => callback(this.getOrientation());
    window.addEventListener('orientationchange', handler);
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('orientationchange', handler);
      window.removeEventListener('resize', handler);
    };
  }

  // Haptic feedback
  vibrate(pattern: number | number[]): boolean {
    if ('vibrate' in navigator) {
      return navigator.vibrate(pattern);
    }
    return false;
  }

  // Safe area insets
  getSafeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    };
  }

  // Network information
  getNetworkInfo(): { type: string; effectiveType?: string; downlink?: number; rtt?: number } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    
    return { type: 'unknown' };
  }

  // Battery information
  async getBatteryInfo(): Promise<{ level: number; charging: boolean } | null> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging
        };
      }
    } catch (error) {
      console.error('Battery API not available:', error);
    }
    return null;
  }
}

// Update notification
const showUpdateNotification = (): void => {
  // Create or update notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Spectra Update Available', {
      body: 'A new version of Spectra is available. Refresh to update.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png'
      // Note: actions are not supported in all browsers
    });
  } else {
    // Fallback to custom notification UI
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Update Available</div>
          <div class="text-sm opacity-90">Refresh to get the latest features</div>
        </div>
        <button class="ml-4 px-3 py-1 bg-white text-blue-600 rounded text-sm" onclick="window.location.reload()">
          Refresh
        </button>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 10000);
  }
};

// React hooks for mobile features
import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const installManager = new PWAInstallManager();

  useEffect(() => {
    setCanInstall(installManager.canInstall());
    setIsInstalled(installManager.isInstalled());

    const unsubscribe = installManager.onInstallChange(setCanInstall);
    return unsubscribe;
  }, []);

  const promptInstall = () => installManager.promptInstall();

  return { canInstall, isInstalled, promptInstall };
}

export function useMobileOptimization() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [networkInfo, setNetworkInfo] = useState<{ type: string; effectiveType?: string; downlink?: number; rtt?: number }>({ type: 'unknown' });
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  
  const mobile = MobileOptimization.getInstance();

  useEffect(() => {
    setOrientation(mobile.getOrientation());
    setNetworkInfo(mobile.getNetworkInfo());
    
    // Update battery info
    mobile.getBatteryInfo().then(setBatteryInfo);

    const unsubscribeOrientation = mobile.onOrientationChange(setOrientation);
    
    // Update network info periodically
    const networkInterval = setInterval(() => {
      setNetworkInfo(mobile.getNetworkInfo());
    }, 30000);

    return () => {
      unsubscribeOrientation();
      clearInterval(networkInterval);
    };
  }, []);

  return {
    isMobile: mobile.isMobile(),
    isIOS: mobile.isIOS(),
    isAndroid: mobile.isAndroid(),
    isTouchDevice: mobile.isTouchDevice(),
    orientation,
    networkInfo,
    batteryInfo,
    vibrate: mobile.vibrate.bind(mobile),
    getSafeAreaInsets: mobile.getSafeAreaInsets.bind(mobile)
  };
}

// Export instances
export const pwaInstallManager = new PWAInstallManager();
export const mobileOptimization = MobileOptimization.getInstance();