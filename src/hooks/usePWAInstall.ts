import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallOptions {
  onInstalled?: () => void;
}

/**
 * Extended Navigator interface with iOS standalone property
 */
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const MAX_DISMISSALS = 3;

/**
 * Checks if the app is currently running in standalone mode (installed)
 */
function checkIsInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorStandalone).standalone === true
  );
}

/**
 * Checks if the install prompt has been permanently dismissed
 */
function checkIsDismissed(): boolean {
  const dismissCount = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
  return dismissCount >= MAX_DISMISSALS;
}

export function usePWAInstall(options?: UsePWAInstallOptions) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  // Initialize state directly without useEffect to avoid cascading renders
  const [isInstalled, setIsInstalled] = useState(checkIsInstalled);
  const [isDismissed, setIsDismissed] = useState(checkIsDismissed);

  useEffect(() => {

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent the default browser install UI
      event.preventDefault();
      // Store the event for later use
      setInstallPrompt(event);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      // Clear dismissal count when installed
      localStorage.removeItem(DISMISS_KEY);
      // Notify completion
      if (options?.onInstalled) {
        options.onInstalled();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [options]);

  const install = async (): Promise<'accepted' | 'dismissed' | 'error'> => {
    if (!installPrompt) {
      return 'error';
    }

    try {
      // Show the install prompt
      await installPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
      }

      return outcome;
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return 'error';
    }
  };

  const dismiss = () => {
    // Increment dismissal count
    const currentCount = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(DISMISS_KEY, newCount.toString());

    // Hide for this session
    setIsInstallable(false);

    // If max dismissals reached, set permanent flag
    if (newCount >= MAX_DISMISSALS) {
      setIsDismissed(true);
    }
  };

  // Show install UI only if installable, not installed, and not permanently dismissed
  const canShowInstall = isInstallable && !isInstalled && !isDismissed;

  return {
    canShowInstall,
    isInstalled,
    install,
    dismiss,
  };
}
