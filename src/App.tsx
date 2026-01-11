import { ThemeProvider } from '@/components/theme-provider';
import { HomePage } from '@/pages/HomePage';
import { SongPage } from '@/pages/SongPage';
import { AboutPage } from '@/pages/AboutPage';
import { ImportSongDialog } from '@/components/ImportSongDialog';
import { Toaster } from '@/components/ui/sonner';
import { useUIStore } from '@/stores/useUIStore';
import { usePlaybackManager } from '@/hooks/usePlaybackManager';
import { useShareUrlHandler } from '@/hooks/useShareUrlHandler';

function App() {
  const currentPage = useUIStore((state) => state.currentPage);

  // Enable playback integration with Tone.js metronome
  usePlaybackManager();

  // Handle shared song URLs
  useShareUrlHandler();

  return (
    <ThemeProvider>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'song' && <SongPage />}
      {currentPage === 'about' && <AboutPage />}
      <ImportSongDialog />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
