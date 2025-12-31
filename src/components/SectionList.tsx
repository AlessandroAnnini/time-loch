import { Music, Play, Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';

interface SectionListProps {
  songId: string;
}

export function SectionList({ songId }: SectionListProps) {
  const songs = useAppStore((state) => state.songs);
  const isPlaying = useUIStore((state) => state.isPlaying);
  const openDeleteDialog = useUIStore((state) => state.openDeleteDialog);
  const startSectionPlayback = useUIStore(
    (state) => state.startSectionPlayback
  );

  const song = songs.find((s) => s.id === songId);
  const sections = song?.sections || [];

  const handlePlay = (e: React.MouseEvent, sectionIndex: number) => {
    e.stopPropagation();
    if (!isPlaying) {
      startSectionPlayback(songId, sectionIndex);
    }
  };

  const handleDelete = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    openDeleteDialog('section', sectionId, songId);
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
          className={`flex items-center gap-3 p-4 bg-card border rounded-lg ${
            isPlaying ? 'opacity-50' : ''
          }`}>
          <button
            onClick={(e) => handlePlay(e, index)}
            disabled={isPlaying}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0 hover:bg-primary/90 transition-colors"
            aria-label={`Play ${section.name}`}>
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => handleDelete(e, section.id)}
            disabled={isPlaying}
            aria-label="Delete section">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
