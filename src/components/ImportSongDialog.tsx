import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore, useUIStore } from '@/stores';
import { generateUniqueTitle } from '@/lib/share';
import { generateId } from '@/lib/utils';
import type { Section } from '@/types';
import { Music } from 'lucide-react';

/**
 * Dialog component for importing shared songs
 * Displays song preview and allows user to import to their library
 *
 * @example
 * // Add to App.tsx alongside other dialogs
 * <ImportSongDialog />
 */
export function ImportSongDialog() {
  const isOpen = useUIStore((state) => state.isImportSongDialogOpen);
  const pendingSong = useUIStore((state) => state.pendingImportSong);
  const closeDialog = useUIStore((state) => state.closeImportSongDialog);

  const songs = useAppStore((state) => state.songs);
  const createSong = useAppStore((state) => state.createSong);
  const navigateTo = useUIStore((state) => state.navigateTo);

  const handleImport = () => {
    if (!pendingSong) return;

    // Check for duplicate titles and generate unique name if needed
    const existingTitles = songs.map((s) => s.title);
    const uniqueTitle = generateUniqueTitle(pendingSong.title, existingTitles);

    // Add IDs to sections (required by createSong)
    const sectionsWithIds: Section[] = pendingSong.sections.map((section) => ({
      ...section,
      id: generateId(),
    }));

    // Create song data with unique title and sections with IDs
    const finalSongData = {
      title: uniqueTitle,
      notes: pendingSong.notes,
      sections: sectionsWithIds,
    };

    createSong(finalSongData);

    // Show success message
    const wasRenamed = uniqueTitle !== pendingSong.title;
    toast.success('Song imported', {
      description: wasRenamed
        ? `"${uniqueTitle}" has been added to your songs (renamed to avoid duplicate).`
        : `"${uniqueTitle}" has been added to your songs.`,
    });

    closeDialog();

    // Navigate to home to see the new song
    navigateTo('home');
  };

  const handleCancel = () => {
    closeDialog();
  };

  if (!pendingSong) {
    return null;
  }

  // Calculate total duration estimate
  const totalMeasures = pendingSong.sections.reduce(
    (sum, section) => sum + section.measures,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Shared Song</DialogTitle>
          <DialogDescription>
            Review the song details below. A copy will be added to your library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Song Title */}
          <div>
            <h3 className="text-lg font-semibold mb-1">{pendingSong.title}</h3>
            {pendingSong.notes && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {pendingSong.notes}
              </p>
            )}
          </div>

          {/* Song Statistics */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>
                {pendingSong.sections.length}{' '}
                {pendingSong.sections.length === 1 ? 'section' : 'sections'}
              </span>
            </div>
            <div>
              <span>
                {totalMeasures} total{' '}
                {totalMeasures === 1 ? 'measure' : 'measures'}
              </span>
            </div>
          </div>

          {/* Sections Preview */}
          {pendingSong.sections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Sections:</h4>
              <div className="space-y-2">
                {pendingSong.sections.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{section.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{section.bpm} BPM</span>
                      <span>
                        {section.timeSignature.beats}/
                        {section.timeSignature.noteValue}
                      </span>
                      <span>
                        {section.measures}{' '}
                        {section.measures === 1 ? 'measure' : 'measures'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingSong.sections.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              This song has no sections yet.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport}>
            Add to My Songs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
