import { useEffect } from 'react';
import { toast } from 'sonner';
import { decodeSongFromUrl } from '@/lib/share';
import { useUIStore } from '@/stores/useUIStore';

/**
 * Hook to handle shared song URLs on app load
 * Monitors URL hash for #share/[encoded-data] pattern
 * Decodes song data and opens import dialog if valid
 *
 * @example
 * // In App.tsx
 * function App() {
 *   useShareUrlHandler();
 *   // ... rest of app
 * }
 */
export function useShareUrlHandler() {
  const openImportDialog = useUIStore((state) => state.openImportSongDialog);

  useEffect(() => {
    /**
     * Processes the URL hash and attempts to extract shared song data
     */
    const handleShareUrl = () => {
      const hash = window.location.hash;

      // Check if this is a share URL
      if (!hash.startsWith('#share/')) {
        return;
      }

      // Extract encoded data after '#share/'
      const encodedData = hash.slice(7); // Remove '#share/'

      if (!encodedData) {
        toast.error('Invalid share link');
        // Clear invalid hash
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      // Attempt to decode song data
      const song = decodeSongFromUrl(encodedData);

      if (!song) {
        toast.error('Unable to load shared song. The link may be corrupted.');
        // Clear invalid hash
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      // Successfully decoded - open import dialog
      openImportDialog(song);

      // Clear hash from URL (keeps browser history clean)
      window.history.replaceState(null, '', window.location.pathname);
    };

    // Run on mount
    handleShareUrl();

    // Also listen for hash changes (if user pastes a share URL while app is running)
    window.addEventListener('hashchange', handleShareUrl);

    return () => {
      window.removeEventListener('hashchange', handleShareUrl);
    };
  }, [openImportDialog]);
}
