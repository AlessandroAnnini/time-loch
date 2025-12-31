import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useUIStore } from '@/stores/useUIStore';
import { getMetronome } from '@/lib/metronome';

/**
 * PlaybackManager hook - integrates Tone.js metronome with UI Store playback state
 * Handles song-level and section-level playback, ensures only one playback at a time
 */
export function usePlaybackManager() {
  const songs = useAppStore((state) => state.songs);
  const metronomeVolume = useAppStore((state) => state.metronomeVolume);
  const metronomeSound = useAppStore((state) => state.metronomeSound);

  const isPlaying = useUIStore((state) => state.isPlaying);
  const currentSongId = useUIStore((state) => state.currentSongId);
  const currentSectionIndex = useUIStore((state) => state.currentSectionIndex);
  const stopPlayback = useUIStore((state) => state.stopPlayback);
  const advanceToNextSection = useUIStore(
    (state) => state.advanceToNextSection
  );
  const setCurrentMeasure = useUIStore((state) => state.setCurrentMeasure);

  useEffect(() => {
    if (!isPlaying || !currentSongId) {
      return;
    }

    const song = songs.find((s) => s.id === currentSongId);
    if (!song || song.sections.length === 0) {
      stopPlayback();
      return;
    }

    // Get sections from currentSectionIndex to end
    const sectionsToPlay = song.sections.slice(currentSectionIndex);
    if (sectionsToPlay.length === 0) {
      stopPlayback();
      return;
    }

    const metronome = getMetronome();

    // Start playback with all required parameters
    metronome.playSections(
      song.sections, // all sections
      currentSectionIndex, // start from this index
      metronomeSound, // sound profile
      metronomeVolume, // volume (0-1)
      () => {
        // Callback when all sections complete
        stopPlayback();
      },
      () => {
        // Callback when each section completes
        advanceToNextSection();
      },
      (measure) => {
        // Callback when each measure completes
        setCurrentMeasure(measure);
      }
    );

    // Cleanup function - stop metronome when component unmounts or playback stops
    return () => {
      metronome.stop();
    };
  }, [
    isPlaying,
    currentSongId,
    currentSectionIndex,
    songs,
    metronomeVolume,
    metronomeSound,
    stopPlayback,
    advanceToNextSection,
    setCurrentMeasure,
  ]);
}
