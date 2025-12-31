import { useAppStore, useUIStore } from '@/stores';
import { Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SongList() {
  const songs = useAppStore((state) => state.songs);
  const navigateTo = useUIStore((state) => state.navigateTo);
  const openDeleteConfirm = useUIStore((state) => state.openDeleteConfirm);
  const isPlaying = useUIStore((state) => state.isPlaying);

  const handleDelete = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    openDeleteConfirm({ type: 'song', id: songId });
  };

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Music className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first song to start structuring your rehearsals with
          tempo-accurate sections.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {songs.map((song) => (
        <div
          key={song.id}
          className={`
            border rounded-lg p-4 transition-all
            ${
              isPlaying
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-accent'
            }
          `}
          onClick={() => !isPlaying && navigateTo('song', song.id)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{song.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{song.sections.length} sections</span>
                {song.notes && (
                  <span className="truncate flex-1">{song.notes}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Music className="h-5 w-5 text-muted-foreground" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDelete(e, song.id)}
                disabled={isPlaying}
                aria-label="Delete song">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
