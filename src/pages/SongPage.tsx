import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Check, X } from 'lucide-react';
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
  const openCreateSectionDialog = useUIStore(
    (state) => state.openCreateSectionDialog
  );

  const songs = useAppStore((state) => state.songs);
  const updateSong = useAppStore((state) => state.updateSong);

  const song = songs.find((s) => s.id === selectedSongId);

  const [title, setTitle] = useState(song?.title || '');
  const [notes, setNotes] = useState(song?.notes || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

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

  const handleSaveTitle = () => {
    if (title.trim() && title !== song.title) {
      updateSong(song.id, { title: title.trim() });
      setIsEditingTitle(false);
    } else if (!title.trim()) {
      setTitle(song.title);
      setIsEditingTitle(false);
    } else {
      setIsEditingTitle(false);
    }
  };

  const handleCancelTitle = () => {
    setTitle(song.title);
    setIsEditingTitle(false);
  };

  const handleSaveNotes = () => {
    if (notes !== song.notes) {
      updateSong(song.id, { notes });
    }
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(song.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
        role="banner">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('home')}
            aria-label="Back to songs list">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2 flex-1 truncate">
            {song.title}
          </h1>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main
        className="container px-4 py-6 space-y-6"
        role="main"
        aria-label="Song details">
        {/* Song Details */}
        <section aria-label="Song information">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="song-title" className="text-sm font-medium">
                  Song Title
                </label>
                {!isEditingTitle && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setIsEditingTitle(true)}
                    aria-label="Edit title">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {isEditingTitle ? (
                <div className="flex gap-2">
                  <Input
                    id="song-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelTitle();
                    }}
                    placeholder="Enter song title"
                    className="text-lg"
                    autoFocus
                    aria-required="true"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveTitle}
                    aria-label="Save title">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelTitle}
                    aria-label="Cancel editing">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h2 className="text-2xl font-semibold py-1">{song.title}</h2>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="song-notes" className="text-sm font-medium">
                  Notes
                </label>
                {!isEditingNotes && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setIsEditingNotes(true)}
                    aria-label="Edit notes">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    id="song-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleCancelNotes();
                    }}
                    placeholder="Add notes about this song..."
                    rows={4}
                    autoFocus
                    aria-describedby="notes-hint"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNotes}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes}>
                      Save
                    </Button>
                  </div>
                  <p id="notes-hint" className="sr-only">
                    Optional notes about the song
                  </p>
                </div>
              ) : (
                song.notes && (
                  <p className="text-base leading-relaxed whitespace-pre-wrap py-1">
                    {song.notes}
                  </p>
                )
              )}
            </div>
          </div>
        </section>{' '}
        {/* Playback Controls */}
        <PlaybackControls songId={song.id} />
        {/* Sections Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sections</h2>
          <Button onClick={openCreateSectionDialog} size="sm" variant="outline">
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
