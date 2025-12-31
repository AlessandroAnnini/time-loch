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
import { useAppStore, useUIStore } from '@/stores';
import {
  validateRequired,
  validateBPM,
  validateMeasures,
} from '@/lib/validation';

export function CreateSectionDialog() {
  const isOpen = useUIStore((state) => state.isCreateSectionDialogOpen);
  const closeDialog = useUIStore((state) => state.closeCreateSectionDialog);
  const selectedSongId = useUIStore((state) => state.selectedSongId);
  const createSection = useAppStore((state) => state.createSection);

  const [name, setName] = useState('');
  const [bpm, setBpm] = useState('120');
  const [beats, setBeats] = useState('4');
  const [noteValue, setNoteValue] = useState('4');
  const [measures, setMeasures] = useState('8');

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

    if (!selectedSongId) {
      toast.error('Error', { description: 'No song selected.' });
      return;
    }

    createSection(selectedSongId, {
      name: name.trim(),
      bpm: bpmValue,
      timeSignature: { beats: Number(beats), noteValue: Number(noteValue) },
      measures: measuresValue,
    });
    toast.success('Section added', {
      description: `"${name.trim()}" has been added to the song.`,
    });
    // Reset form
    resetForm();
    closeDialog();
  };

  const resetForm = () => {
    setName('');
    setBpm('120');
    setBeats('4');
    setNoteValue('4');
    setMeasures('8');
  };

  const handleCancel = () => {
    resetForm();
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Define a new section with its tempo, time signature, and duration.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Intro, Verse, Chorus"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bpm">BPM (35-250)</Label>
              <Input
                id="bpm"
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
                <Label htmlFor="beats">Beats per Measure</Label>
                <Input
                  id="beats"
                  type="number"
                  value={beats}
                  onChange={(e) => setBeats(e.target.value)}
                  min="1"
                  max="16"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="noteValue">Note Value</Label>
                <Input
                  id="noteValue"
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
              <Label htmlFor="measures">Number of Measures</Label>
              <Input
                id="measures"
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
              Add Section
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
