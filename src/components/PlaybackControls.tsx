import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';

interface PlaybackControlsProps {
  songId: string;
}

export function PlaybackControls({ songId }: PlaybackControlsProps) {
  const isPlaying = useUIStore((state) => state.isPlaying);
  const currentSongId = useUIStore((state) => state.currentSongId);
  const startSongPlayback = useUIStore((state) => state.startSongPlayback);
  const stopPlayback = useUIStore((state) => state.stopPlayback);

  const isPlayingThisSong = isPlaying && currentSongId === songId;

  const handlePlay = () => {
    if (!isPlaying) {
      startSongPlayback(songId);
    }
  };

  const handleStop = () => {
    stopPlayback();
  };

  return (
    <div className="flex items-center gap-2">
      {!isPlayingThisSong ? (
        <Button
          onClick={handlePlay}
          disabled={isPlaying}
          size="lg"
          className="flex-1"
        >
          <Play className="h-5 w-5 mr-2 fill-current" />
          Play Song
        </Button>
      ) : (
        <Button
          onClick={handleStop}
          size="lg"
          variant="destructive"
          className="flex-1"
        >
          <Square className="h-5 w-5 mr-2 fill-current" />
          Stop
        </Button>
      )}
    </div>
  );
}
