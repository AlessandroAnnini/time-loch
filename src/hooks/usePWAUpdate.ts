import { useEffect } from 'react';
import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';

/**
 * Hook to handle PWA service worker updates
 *
 * Registers the service worker and shows toast notifications when:
 * - A new version is available (with reload action)
 * - App is ready to work offline
 *
 * @example
 * function App() {
 *   usePWAUpdate();
 *   return <div>My App</div>;
 * }
 */
export function usePWAUpdate() {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        toast.info('Update available!', {
          description: 'A new version of Time Loch is ready.',
          duration: Infinity, // Keep toast visible until user acts
          action: {
            label: 'Reload',
            onClick: () => {
              updateSW(true); // Force update and reload
            },
          },
          cancel: {
            label: 'Later',
            onClick: () => {
              toast.dismiss();
            },
          },
        });
      },
      onOfflineReady() {
        toast.success('App ready!', {
          description: 'Time Loch is ready to work offline.',
        });
      },
      onRegisterError(error: Error) {
        console.error('Service worker registration failed:', error);
      },
    });
  }, []);
}
