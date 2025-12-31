import { ThemeProvider } from '@/components/theme-provider';
import { HomePage } from '@/pages/HomePage';
import { SongPage } from '@/pages/SongPage';
import { AboutPage } from '@/pages/AboutPage';
import { Toaster } from '@/components/ui/sonner';
import { useUIStore } from '@/stores/useUIStore';
import { usePlaybackManager } from '@/hooks/usePlaybackManager';

function App() {
  const currentPage = useUIStore((state) => state.currentPage);

  // Enable playback integration with Tone.js metronome
  usePlaybackManager();

  return (
    <ThemeProvider>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'song' && <SongPage />}
      {currentPage === 'about' && <AboutPage />}
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
