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
  const deleteSong = useAppStore((state) => state.deleteSong);
  const deleteSection = useAppStore((state) => state.deleteSection);
  const getSong = useAppStore((state) => state.getSong);

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'song') {
      deleteSong(deleteTarget.id);
    } else if (deleteTarget.type === 'section' && deleteTarget.songId) {
      deleteSection(deleteTarget.songId, deleteTarget.id);
    }

    closeDialog();
  };

  const getItemName = () => {
    if (!deleteTarget) return '';

    if (deleteTarget.type === 'song') {
      const song = getSong(deleteTarget.id);
      return song ? `"${song.title}"` : 'this song';
    }

    if (deleteTarget.type === 'section' && deleteTarget.songId) {
      const song = getSong(deleteTarget.songId);
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
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
