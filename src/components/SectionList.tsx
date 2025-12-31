import { useRef } from 'react';
import { Music, Play } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useUIStore } from '@/stores/useUIStore';

interface SectionListProps {
  songId: string;
}

export function SectionList({ songId }: SectionListProps) {
  const longPressTimer = useRef<number | null>(null);
  const isLongPress = useRef(false);

  const songs = useAppStore((state) => state.songs);
  const isPlaying = useUIStore((state) => state.isPlaying);
  const openDeleteDialog = useUIStore((state) => state.openDeleteDialog);
  const startSectionPlayback = useUIStore((state) => state.startSectionPlayback);

  const song = songs.find((s) => s.id === songId);
  const sections = song?.sections || [];

  const handleTouchStart = (sectionId: string) => {
    isLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      isLongPress.current = true;
      openDeleteDialog('section', sectionId, songId);
    }, 500);
  };

  const handleTouchEnd = (sectionIndex: number) => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Ignore tap if it was a long press or during playback
    if (!isLongPress.current && !isPlaying) {
      // Play from this section to end of song
      startSectionPlayback(songId, sectionIndex);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPress.current = false;
  };

  const handlePlay = (e: React.MouseEvent, sectionIndex: number) => {
    e.stopPropagation();
    if (!isPlaying) {
      startSectionPlayback(songId, sectionIndex);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Music className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No sections yet. Tap the + button to add sections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className={`flex items-center gap-3 p-4 bg-card border rounded-lg select-none ${
            isPlaying ? 'opacity-50' : 'active:bg-accent'
          }`}
          onTouchStart={() => handleTouchStart(section.id)}
          onTouchEnd={() => handleTouchEnd(index)}
          onTouchCancel={handleTouchCancel}
        >
          <button
            onClick={(e) => handlePlay(e, index)}
            disabled={isPlaying}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label={`Play ${section.name}`}
          >
            <Play className="h-5 w-5 fill-current" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{section.name}</div>
            <div className="text-sm text-muted-foreground">
              {section.bpm} BPM • {section.timeSignature.beats}/
              {section.timeSignature.noteValue} • {section.measures}{' '}
              {section.measures === 1 ? 'measure' : 'measures'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
