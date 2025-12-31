import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore, useUIStore } from '@/stores';

export function CreateSongDialog() {
  const isOpen = useUIStore((state) => state.isCreateSongDialogOpen);
  const closeDialog = useUIStore((state) => state.closeCreateSongDialog);
  const createSong = useAppStore((state) => state.createSong);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    createSong({
      title: title.trim(),
      notes: notes.trim(),
      sections: [],
    });

    toast.success('Song created', {
      description: `\"${title.trim()}\" has been added to your songs.`,
    });

    setTitle('');
    setNotes('');
    closeDialog();
  };

  const handleCancel = () => {
    setTitle('');
    setNotes('');
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Song</DialogTitle>
            <DialogDescription>
              Add a new song to your repertoire. You can add sections after
              creating the song.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add rehearsal notes, key, tempo hints, etc."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Song
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
