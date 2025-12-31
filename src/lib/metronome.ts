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
  private onSectionComplete: (() => void) | null = null;
  private isDebugMode = false; // Enable for logging

  constructor() {
    // Initialize Tone.js context
    this.initializeAudio();
  }

  private log(...args: unknown[]): void {
    if (this.isDebugMode) {
      console.log('[Metronome]', ...args);
    }
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
    this.log(
      `Click at ${time.toFixed(3)}s - Beat ${this.currentBeat + 1} - ${
        isAccent ? 'ACCENT' : 'normal'
      }`
    );

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

    // Calculate beat duration in seconds (independent of Transport BPM)
    const beatDuration = 60 / bpm;

    // Schedule BPM change at section start
    // Use schedule instead of setting directly to avoid affecting previous sections
    Tone.Transport.schedule(() => {
      Tone.Transport.bpm.value = bpm;
    }, startTime);

    // Store section info for beat callback
    this.accentPattern = accentPattern || [];
    this.currentBeat = 0;
    this.currentMeasure = 0;

    // Schedule all beats in this section using Transport time
    let currentTime = startTime;
    for (let measure = 0; measure < measures; measure++) {
      for (let beat = 0; beat < beats; beat++) {
        const isAccent = this.isAccentedBeat(beat);
        const scheduledTime = currentTime;
        Tone.Transport.schedule((time) => {
          this.playClick(time, isAccent);
          this.currentBeat = (this.currentBeat + 1) % beats;
          if (this.currentBeat === 0) {
            this.currentMeasure++;
          }
        }, scheduledTime);
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
    onComplete?: () => void,
    onSectionComplete?: () => void
  ): Promise<void> {
    this.log('=== playSections called ===');
    this.log('Sections to play:', sections.length - startIndex);
    this.log('AudioContext time (now):', Tone.now());

    await this.initializeAudio();
    this.stop();

    this.currentSound = sound;
    this.onComplete = onComplete || null;
    this.onSectionComplete = onSectionComplete || null;

    // Create synth with current sound profile
    this.synth = this.createSynth(sound);
    this.synth.volume.value = Tone.gainToDb(volume);

    // CRITICAL: Schedule events in TRANSPORT TIME (starting from 0)
    // NOT AudioContext time. Transport.schedule() expects Transport timeline positions.
    // Transport.start() will be called at current AudioContext time, but events are
    // scheduled relative to Transport position 0.
    let currentTime = 0.1; // Small delay in Transport time
    this.log('Transport schedule start time:', currentTime.toFixed(3));

    for (let i = startIndex; i < sections.length; i++) {
      const section = sections[i];
      this.log(
        `Scheduling section ${i + 1}: ${section.name} - ${section.bpm}BPM - ${
          section.timeSignature.beats
        }/${section.timeSignature.noteValue} - ${section.measures} measures`
      );
      const nextTime = this.scheduleSection(section, currentTime);
      this.log(`Section ends at: ${nextTime.toFixed(3)}s`);
      
      // Schedule section completion callback (unless it's the last section)
      if (i < sections.length - 1 && this.onSectionComplete) {
        Tone.Transport.schedule(() => {
          this.log(`=== Section ${i + 1} complete ===`);
          if (this.onSectionComplete) {
            this.onSectionComplete();
          }
        }, nextTime);
      }
      
      currentTime = nextTime;
    }

    // Schedule completion callback
    if (this.onComplete) {
      this.log(`Scheduling completion callback at ${currentTime.toFixed(3)}s`);
      Tone.Transport.schedule(() => {
        this.log('=== Playback complete ===');
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }, currentTime);
    }

    // Start transport at current AudioContext time
    // Events scheduled above use Transport time (relative to position 0)
    this.log('Starting Transport at position: ' + Tone.Transport.position);
    this.log('Starting Transport at AudioContext time:', Tone.now().toFixed(3));
    Tone.Transport.start();
    this.log('Transport state:', Tone.Transport.state);
  }

  public stop(): void {
    this.log('=== stop() called ===');
    this.log('Transport state before stop:', Tone.Transport.state);
    this.log('Transport position before stop:', Tone.Transport.position);

    // CRITICAL: Stop and reset in correct order
    Tone.Transport.cancel(); // Cancel all scheduled events first
    Tone.Transport.stop(); // Stop the transport
    Tone.Transport.position = 0; // Reset position to beginning

    this.log('Transport state after stop:', Tone.Transport.state);
    this.log('Transport position after stop:', Tone.Transport.position);

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
    this.log('=== dispose() called ===');
    this.stop();
    // Don't dispose the Transport - it's global and shared
  }

  public enableDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
    console.log(`[Metronome] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
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

// Debug helper - expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).enableMetronomeDebug = (enabled: boolean = true) => {
    const metronome = getMetronome();
    metronome.enableDebugMode(enabled);
  };
}
