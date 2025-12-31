import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionList } from '@/components/SectionList';
import { PlaybackControls } from '@/components/PlaybackControls';
import { CreateSectionDialog } from '@/components/CreateSectionDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ModeToggle } from '@/components/mode-toggle';
import { useAppStore } from '@/stores/useAppStore';
import { useUIStore } from '@/stores/useUIStore';

export function SongPage() {
  const selectedSongId = useUIStore((state) => state.selectedSongId);
  const navigateTo = useUIStore((state) => state.navigateTo);
  const openCreateSectionDialog = useUIStore((state) => state.openCreateSectionDialog);
  
  const songs = useAppStore((state) => state.songs);
  const updateSong = useAppStore((state) => state.updateSong);

  const song = songs.find((s) => s.id === selectedSongId);

  const [title, setTitle] = useState(song?.title || '');
  const [notes, setNotes] = useState(song?.notes || '');

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Song not found</p>
          <Button onClick={() => navigateTo('home')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleTitleBlur = () => {
    if (title.trim() && title !== song.title) {
      updateSong(song.id, { title: title.trim() });
    } else if (!title.trim()) {
      setTitle(song.title);
    }
  };

  const handleNotesBlur = () => {
    if (notes !== song.notes) {
      updateSong(song.id, { notes });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('home')}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2 flex-1 truncate">{song.title}</h1>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Song Details */}
        <div className="space-y-4">
          <div>
            <label htmlFor="song-title" className="text-sm font-medium mb-2 block">
              Song Title
            </label>
            <Input
              id="song-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Enter song title"
              className="text-lg"
            />
          </div>
          
          <div>
            <label htmlFor="song-notes" className="text-sm font-medium mb-2 block">
              Notes
            </label>
            <Textarea
              id="song-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes about this song..."
              rows={3}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <PlaybackControls songId={song.id} />

        {/* Sections Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sections</h2>
          <Button
            onClick={openCreateSectionDialog}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {/* Sections List */}
        <SectionList songId={song.id} />
      </main>

      {/* Dialogs */}
      <CreateSectionDialog />
      <DeleteConfirmDialog />
    </div>
  );
}
