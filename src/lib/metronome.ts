import * as Tone from 'tone';
import type { Section, MetronomeSound } from '@/types';

export class MetronomeEngine {
  private synth: Tone.Synth | Tone.MembraneSynth | null = null;
  private loop: Tone.Loop | null = null;
  private currentSound: MetronomeSound = 'classic';
  private currentBeat = 0;
  private currentMeasure = 0;
  private accentPattern: number[] = [];
  private onComplete: (() => void) | null = null;

  constructor() {
    // Initialize Tone.js context
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    // Ensure audio context is created
    await Tone.start();
  }

  private createSynth(sound: MetronomeSound): Tone.Synth | Tone.MembraneSynth {
    if (sound === 'percussive') {
      return new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: {
          attack: 0.0006,
          decay: 0.5,
          sustain: 0,
        },
      }).toDestination();
    }

    // Classic click sound
    return new Tone.Synth({
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();
  }

  private playClick(time: number, isAccent: boolean): void {
    if (!this.synth) return;

    const velocity = isAccent ? 1.0 : 0.6;

    if (this.currentSound === 'percussive') {
      (this.synth as Tone.MembraneSynth).triggerAttackRelease(
        isAccent ? 'C2' : 'C3',
        '16n',
        time,
        velocity
      );
    } else {
      (this.synth as Tone.Synth).triggerAttackRelease(
        isAccent ? 'C6' : 'C5',
        '32n',
        time,
        velocity
      );
    }
  }

  private isAccentedBeat(beat: number): boolean {
    if (this.accentPattern.length > 0) {
      return this.accentPattern.includes(beat + 1);
    }
    // Default: accent first beat of measure
    return beat === 0;
  }

  private scheduleSection(section: Section, startTime: number): number {
    const { bpm, timeSignature, measures, accentPattern } = section;
    const { beats } = timeSignature;

    // Calculate beat duration in seconds
    const beatDuration = 60 / bpm;

    // Set transport BPM
    Tone.Transport.bpm.value = bpm;

    // Store section info for beat callback
    this.accentPattern = accentPattern || [];
    this.currentBeat = 0;
    this.currentMeasure = 0;

    // Schedule all beats in this section
    let currentTime = startTime;
    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < beats; beat++) {
        const isAccent = this.isAccentedBeat(beat);
        Tone.Transport.schedule((time) => {
          this.playClick(time, isAccent);
          this.currentBeat = (this.currentBeat + 1) % beats;
          if (this.currentBeat === 0) {
            this.currentMeasure++;
          }
        }, currentTime);
        currentTime += beatDuration;
      }
    }

    // Return the time AFTER the section completes
    // This ensures the next section starts after the last beat finishes
    return currentTime;
  }

  public async playSections(
    sections: Section[],
    startIndex: number,
    sound: MetronomeSound,
    volume: number,
    onComplete?: () => void
  ): Promise<void> {
    await this.initializeAudio();
    this.stop();

    this.currentSound = sound;
    this.onComplete = onComplete || null;

    // Create synth with current sound profile
    this.synth = this.createSynth(sound);
    this.synth.volume.value = Tone.gainToDb(volume);

    // Schedule all sections from startIndex
    let currentTime = Tone.now() + 0.1; // Small delay to ensure audio is ready
    for (let i = startIndex; i < sections.length; i++) {
      currentTime = this.scheduleSection(sections[i], currentTime);
    }

    // Schedule completion callback
    if (this.onComplete) {
      Tone.Transport.schedule(() => {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }, currentTime);
    }

    // Start transport
    Tone.Transport.start();
  }

  public stop(): void {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }

    if (this.loop) {
      this.loop.dispose();
      this.loop = null;
    }

    this.currentBeat = 0;
    this.currentMeasure = 0;
  }

  public async updateVolume(volume: number): Promise<void> {
    if (this.synth) {
      this.synth.volume.value = Tone.gainToDb(volume);
    }
  }

  public dispose(): void {
    this.stop();
    Tone.Transport.dispose();
  }
}

// Singleton instance
let metronomeInstance: MetronomeEngine | null = null;

export const getMetronome = (): MetronomeEngine => {
  if (!metronomeInstance) {
    metronomeInstance = new MetronomeEngine();
  }
  return metronomeInstance;
};
