import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const MAX_DISMISSALS = 3;

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(checkInstalled);

    // Check dismissal count
    const dismissCount = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
    if (dismissCount >= MAX_DISMISSALS) {
      setIsDismissed(true);
    }

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
  }, []);

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
