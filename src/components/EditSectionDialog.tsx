import { useState, useEffect } from 'react';
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
import { useAppStore, useUIStore } from '@/stores';
import {
  validateRequired,
  validateBPM,
  validateMeasures,
} from '@/lib/validation';

export function EditSectionDialog() {
  const isOpen = useUIStore((state) => state.isEditSectionDialogOpen);
  const editSectionId = useUIStore((state) => state.editSectionId);
  const closeDialog = useUIStore((state) => state.closeEditSectionDialog);
  const selectedSongId = useUIStore((state) => state.selectedSongId);
  const songs = useAppStore((state) => state.songs);
  const updateSection = useAppStore((state) => state.updateSection);

  // Get current section data
  const song = songs.find((s) => s.id === selectedSongId);
  const section = song?.sections.find((s) => s.id === editSectionId);

  // Form state - use single state object to avoid cascading renders
  const [formData, setFormData] = useState({
    name: '',
    bpm: '120',
    beats: '4',
    noteValue: '4',
    measures: '8',
  });

  // Reset form when dialog opens or section changes (single setState call)
  // Using section?.id instead of section to avoid resetting on every property change
  useEffect(() => {
    if (isOpen && section) {
      setFormData({
        name: section.name,
        bpm: section.bpm.toString(),
        beats: section.timeSignature.beats.toString(),
        noteValue: section.timeSignature.noteValue.toString(),
        measures: section.measures.toString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, section?.id]); // Only trigger on dialog open or section ID change

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequired(formData.name, 'Section name')) {
      return;
    }

    const bpmValue = Number(formData.bpm);
    if (!validateBPM(bpmValue)) {
      return;
    }

    const measuresValue = Number(formData.measures);
    if (!validateMeasures(measuresValue)) {
      return;
    }

    if (!selectedSongId || !editSectionId) {
      toast.error('Error', { description: 'Invalid section data.' });
      return;
    }

    updateSection(selectedSongId, editSectionId, {
      name: formData.name.trim(),
      bpm: bpmValue,
      timeSignature: {
        beats: Number(formData.beats),
        noteValue: Number(formData.noteValue),
      },
      measures: measuresValue,
    });
    toast.success('Section updated', {
      description: `"${formData.name.trim()}" has been updated.`,
    });
    closeDialog();
  };

  const handleCancel = () => {
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the section's tempo, time signature, and duration.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Section Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Intro, Verse, Chorus"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-bpm">BPM (35-250)</Label>
              <Input
                id="edit-bpm"
                type="number"
                value={formData.bpm}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bpm: e.target.value }))
                }
                min="35"
                max="250"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-beats">Beats per Measure</Label>
                <Input
                  id="edit-beats"
                  type="number"
                  value={formData.beats}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, beats: e.target.value }))
                  }
                  min="1"
                  max="16"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-noteValue">Note Value</Label>
                <Input
                  id="edit-noteValue"
                  type="number"
                  value={formData.noteValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      noteValue: e.target.value,
                    }))
                  }
                  min="1"
                  max="16"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-measures">Number of Measures</Label>
              <Input
                id="edit-measures"
                type="number"
                value={formData.measures}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, measures: e.target.value }))
                }
                min="1"
                max="999"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
