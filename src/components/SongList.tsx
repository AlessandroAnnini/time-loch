import { useRef, useState } from 'react';
import { useAppStore, useUIStore } from '@/stores';
import { Music } from 'lucide-react';

export function SongList() {
  const songs = useAppStore((state) => state.songs);
  const navigateTo = useUIStore((state) => state.navigateTo);
  const openDeleteConfirm = useUIStore((state) => state.openDeleteConfirm);
  const isPlaying = useUIStore((state) => state.isPlaying);

  const [longPressId, setLongPressId] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);

  const handleTouchStart = (songId: string) => {
    if (isPlaying) return;

    longPressTimer.current = setTimeout(() => {
      setLongPressId(songId);
      openDeleteConfirm({ type: 'song', id: songId });
    }, 500);
  };

  const handleTouchEnd = (songId: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (longPressId === songId) {
      setLongPressId(null);
      return;
    }

    if (!isPlaying) {
      navigateTo('song', songId);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressId(null);
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
            ${longPressId === song.id ? 'scale-95' : ''}
          `}
          onTouchStart={() => handleTouchStart(song.id)}
          onTouchEnd={() => handleTouchEnd(song.id)}
          onTouchCancel={handleTouchCancel}
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
            <Music className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
