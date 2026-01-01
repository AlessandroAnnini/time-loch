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

  const [name, setName] = useState('');
  const [bpm, setBpm] = useState('120');
  const [beats, setBeats] = useState('4');
  const [noteValue, setNoteValue] = useState('4');
  const [measures, setMeasures] = useState('8');

  // Sync form state with section data when dialog opens
  useEffect(() => {
    if (isOpen && section) {
      setName(section.name);
      setBpm(section.bpm.toString());
      setBeats(section.timeSignature.beats.toString());
      setNoteValue(section.timeSignature.noteValue.toString());
      setMeasures(section.measures.toString());
    }
  }, [isOpen, section]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequired(name, 'Section name')) {
      return;
    }

    const bpmValue = Number(bpm);
    if (!validateBPM(bpmValue)) {
      return;
    }

    const measuresValue = Number(measures);
    if (!validateMeasures(measuresValue)) {
      return;
    }

    if (!selectedSongId || !editSectionId) {
      toast.error('Error', { description: 'Invalid section data.' });
      return;
    }

    updateSection(selectedSongId, editSectionId, {
      name: name.trim(),
      bpm: bpmValue,
      timeSignature: { beats: Number(beats), noteValue: Number(noteValue) },
      measures: measuresValue,
    });
    toast.success('Section updated', {
      description: `"${name.trim()}" has been updated.`,
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
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
                  value={beats}
                  onChange={(e) => setBeats(e.target.value)}
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
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
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
                value={measures}
                onChange={(e) => setMeasures(e.target.value)}
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
            <Button type="submit" disabled={!name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
