import { ArrowLeft, Plus, Edit2, Check, X, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionList } from '@/components/SectionList';
import { PlaybackControls } from '@/components/PlaybackControls';
import { CreateSectionDialog } from '@/components/CreateSectionDialog';
import { EditSectionDialog } from '@/components/EditSectionDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ModeToggle } from '@/components/mode-toggle';
import { useAppStore } from '@/stores/useAppStore';
import { useUIStore } from '@/stores/useUIStore';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { generateShareableUrl, isUrlTooLong } from '@/lib/share';

export function SongPage() {
  const selectedSongId = useUIStore((state) => state.selectedSongId);
  const navigateTo = useUIStore((state) => state.navigateTo);
  const openCreateSectionDialog = useUIStore(
    (state) => state.openCreateSectionDialog
  );

  const songs = useAppStore((state) => state.songs);
  const updateSong = useAppStore((state) => state.updateSong);

  const song = songs.find((s) => s.id === selectedSongId);

  const titleEdit = useInlineEdit(song?.title || '', (value) => {
    if (song) updateSong(song.id, { title: value });
  });

  const notesEdit = useInlineEdit(
    song?.notes || '',
    (value) => {
      if (song) updateSong(song.id, { notes: value });
    },
    { allowEmpty: true }
  );

  const handleShare = async () => {
    if (!song) return;

    // Warn if song has no sections
    if (song.sections.length === 0) {
      toast.info('Sharing empty song', {
        description:
          'This song has no sections yet. You can still share it, but it may be more useful to add sections first.',
      });
    }

    try {
      // Generate shareable URL
      const shareUrl = generateShareableUrl(song);

      // Check if URL is too long
      if (isUrlTooLong(shareUrl)) {
        toast.warning('Song is very complex', {
          description:
            'The share link is quite long and may not work in all contexts. Consider reducing the number of sections.',
        });
      }

      // Try to copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied!', {
          description: 'You can now paste the link to share this song.',
        });
      } else {
        // Fallback for browsers without clipboard API
        // Show URL in a way user can manually copy
        toast.info('Share link created', {
          description: shareUrl,
          duration: 10000,
        });
      }
    } catch (error) {
      toast.error('Failed to create share link', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
        role="banner">
        <div className="container flex h-14 items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('home')}
            aria-label="Back to songs list">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1 truncate">
            {song.title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="Share song">
            <Share2 className="h-5 w-5" />
          </Button>
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
              {!song.title && (
                <div className="mb-2">
                  <label htmlFor="song-title" className="text-sm font-medium">
                    Song Title
                  </label>
                </div>
              )}
              {titleEdit.isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="song-title"
                    value={titleEdit.value}
                    onChange={(e) => titleEdit.setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') titleEdit.handleSave();
                      if (e.key === 'Escape') titleEdit.handleCancel();
                    }}
                    placeholder="Enter song title"
                    className="text-lg"
                    autoFocus
                    aria-required="true"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={titleEdit.handleSave}
                    aria-label="Save title">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={titleEdit.handleCancel}
                    aria-label="Cancel editing">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-semibold py-1 flex-1">
                    {song.title}
                  </h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={titleEdit.startEditing}
                    aria-label="Edit title">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              {notesEdit.isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    id="song-notes"
                    value={notesEdit.value}
                    onChange={(e) => notesEdit.setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') notesEdit.handleCancel();
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
                      onClick={notesEdit.handleCancel}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={notesEdit.handleSave}>
                      Save
                    </Button>
                  </div>
                  <p id="notes-hint" className="sr-only">
                    Optional notes about the song
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="text-base leading-relaxed whitespace-pre-wrap py-1 flex-1 min-w-0">
                    {song.notes || (
                      <span className="text-muted-foreground">Notes</span>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 mt-0.5"
                    onClick={notesEdit.startEditing}
                    aria-label="Edit notes">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
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
      <EditSectionDialog />
      <DeleteConfirmDialog />
    </div>
  );
}
