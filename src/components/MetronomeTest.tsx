import { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getMetronome } from '@/lib/metronome';
import type { Section } from '@/types';

/**
 * Test component for validating metronome accuracy
 * Tests:
 * - BPM extremes (35, 250)
 * - Various time signatures (4/4, 3/4, 6/8, 5/4, 7/8)
 * - Section transitions
 * - Accent patterns
 */
export function MetronomeTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState('120');
  const [beats, setBeats] = useState('4');
  const [noteValue, setNoteValue] = useState('4');
  const [measures, setMeasures] = useState('4');

  const testSection: Section = {
    id: 'test',
    name: 'Test Section',
    bpm: Number(bpm),
    timeSignature: {
      beats: Number(beats),
      noteValue: Number(noteValue),
    },
    measures: Number(measures),
  };

  const handlePlay = async () => {
    const metronome = getMetronome();
    setIsPlaying(true);

    await metronome.playSections([testSection], 0, 'classic', 0.8, () => {
      setIsPlaying(false);
    });
  };

  const handleStop = () => {
    const metronome = getMetronome();
    metronome.stop();
    setIsPlaying(false);
  };

  const testPresets = [
    {
      name: '35 BPM (slow)',
      bpm: '35',
      beats: '4',
      noteValue: '4',
      measures: '2',
    },
    {
      name: '120 BPM (standard)',
      bpm: '120',
      beats: '4',
      noteValue: '4',
      measures: '4',
    },
    {
      name: '250 BPM (fast)',
      bpm: '250',
      beats: '4',
      noteValue: '4',
      measures: '2',
    },
    { name: '3/4 Waltz', bpm: '90', beats: '3', noteValue: '4', measures: '4' },
    {
      name: '6/8 Compound',
      bpm: '80',
      beats: '6',
      noteValue: '8',
      measures: '4',
    },
    {
      name: '5/4 Prog Rock',
      bpm: '140',
      beats: '5',
      noteValue: '4',
      measures: '4',
    },
    {
      name: '7/8 Odd Meter',
      bpm: '160',
      beats: '7',
      noteValue: '8',
      measures: '4',
    },
  ];

  const applyPreset = (preset: (typeof testPresets)[0]) => {
    setBpm(preset.bpm);
    setBeats(preset.beats);
    setNoteValue(preset.noteValue);
    setMeasures(preset.measures);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Metronome Test</h2>
        <p className="text-muted-foreground">
          Test metronome accuracy and timing across various BPM and time
          signatures
        </p>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <Label>Quick Test Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          {testPresets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              onClick={() => applyPreset(preset)}
              disabled={isPlaying}>
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="test-bpm">BPM (35-250)</Label>
          <Input
            id="test-bpm"
            type="number"
            min="35"
            max="250"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            disabled={isPlaying}
          />
        </div>
        <div>
          <Label htmlFor="test-measures">Measures</Label>
          <Input
            id="test-measures"
            type="number"
            min="1"
            max="16"
            value={measures}
            onChange={(e) => setMeasures(e.target.value)}
            disabled={isPlaying}
          />
        </div>
        <div>
          <Label htmlFor="test-beats">Beats per Measure</Label>
          <Input
            id="test-beats"
            type="number"
            min="1"
            max="16"
            value={beats}
            onChange={(e) => setBeats(e.target.value)}
            disabled={isPlaying}
          />
        </div>
        <div>
          <Label htmlFor="test-notevalue">Note Value</Label>
          <Input
            id="test-notevalue"
            type="number"
            min="1"
            max="16"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            disabled={isPlaying}
          />
        </div>
      </div>

      {/* Play/Stop */}
      <div className="flex gap-2">
        {!isPlaying ? (
          <Button onClick={handlePlay} className="flex-1">
            <Play className="h-5 w-5 mr-2 fill-current" />
            Test Metronome
          </Button>
        ) : (
          <Button onClick={handleStop} variant="destructive" className="flex-1">
            <Square className="h-5 w-5 mr-2 fill-current" />
            Stop
          </Button>
        )}
      </div>

      {/* Current Settings Display */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm space-y-1">
          <div>
            <strong>Current Test:</strong> {bpm} BPM at {beats}/{noteValue}
          </div>
          <div>
            <strong>Duration:</strong> {measures} measures
          </div>
          <div>
            <strong>Expected Duration:</strong>{' '}
            {((Number(measures) * Number(beats) * 60) / Number(bpm)).toFixed(2)}{' '}
            seconds
          </div>
        </div>
      </div>
    </div>
  );
}
