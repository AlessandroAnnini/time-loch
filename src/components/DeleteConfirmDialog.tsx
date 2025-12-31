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

export function DeleteConfirmDialog() {
  const isOpen = useUIStore((state) => state.isDeleteConfirmOpen);
  const deleteTarget = useUIStore((state) => state.deleteTarget);
  const closeDialog = useUIStore((state) => state.closeDeleteConfirm);
  const currentPage = useUIStore((state) => state.currentPage);
  const navigateTo = useUIStore((state) => state.navigateTo);
  
  const songs = useAppStore((state) => state.songs);
  const deleteSong = useAppStore((state) => state.deleteSong);
  const deleteSection = useAppStore((state) => state.deleteSection);

  const handleConfirm = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'song') {
      const song = songs.find((s) => s.id === deleteTarget.id);
      deleteSong(deleteTarget.id);
      toast.success('Song deleted', {
        description: song
          ? `"${song.title}" has been removed.`
          : 'Song has been removed.',
      });
      // If we're on the song page, navigate back to home
      if (currentPage === 'song') {
        navigateTo('home');
      }
    } else if (deleteTarget.type === 'section' && deleteTarget.songId) {
      const song = songs.find((s) => s.id === deleteTarget.songId);
      const section = song?.sections.find((sec) => sec.id === deleteTarget.id);
      deleteSection(deleteTarget.songId, deleteTarget.id);
      toast.success('Section deleted', {
        description: section
          ? `"${section.name}" has been removed.`
          : 'Section has been removed.',
      });
    }

    closeDialog();
  };

  const getItemName = () => {
    if (!deleteTarget) return '';

    if (deleteTarget.type === 'song') {
      const song = songs.find((s) => s.id === deleteTarget.id);
      return song ? `"${song.title}"` : 'this song';
    }

    if (deleteTarget.type === 'section' && deleteTarget.songId) {
      const song = songs.find((s) => s.id === deleteTarget.songId);
      const section = song?.sections.find((s) => s.id === deleteTarget.id);
      return section ? `"${section.name}"` : 'this section';
    }

    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {getItemName()}? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
