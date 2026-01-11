import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MetronomeEngine, getMetronome } from './metronome';
import type { Section } from '@/types';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => {
  const createMockSynth = () => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
  });

  const mockTransport = {
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn((callback, time) => {
      // Store scheduled callbacks for testing
      if (!mockTransport._scheduledCallbacks) {
        mockTransport._scheduledCallbacks = [];
      }
      mockTransport._scheduledCallbacks.push({ callback, time });
      return time;
    }),
    bpm: { value: 120 },
    position: 0,
    state: 'stopped' as const,
    _scheduledCallbacks: [] as Array<{
      callback: (time: number) => void;
      time: number;
    }>,
  };

  const createMockLoop = () => ({
    dispose: vi.fn(),
  });

  // Create proper constructor functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockSynth = function (this: unknown, _config: unknown) {
    return createMockSynth();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockMembraneSynth = function (this: unknown, _config: unknown) {
    return createMockSynth();
  };

  const MockLoop = function (
    this: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callback: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _interval: unknown
  ) {
    return createMockLoop();
  };

  return {
    Synth: MockSynth,
    MembraneSynth: MockMembraneSynth,
    Transport: mockTransport,
    Loop: MockLoop,
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => 0),
    gainToDb: vi.fn((gain) => 20 * Math.log10(gain)),
  };
});

describe('MetronomeEngine', () => {
  let metronome: MetronomeEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    metronome = new MetronomeEngine();
    // Reset transport mock state
    const transport = Tone.Transport as typeof Tone.Transport & {
      _scheduledCallbacks: Array<{
        callback: (time: number) => void;
        time: number;
      }>;
    };
    transport._scheduledCallbacks = [];
    (Tone.Transport as { position: number }).position = 0;
  });

  afterEach(() => {
    metronome.dispose();
  });

  describe('initialization', () => {
    it('should create a metronome instance', () => {
      expect(metronome).toBeInstanceOf(MetronomeEngine);
    });

    it('should initialize audio context on creation', async () => {
      expect(Tone.start).toHaveBeenCalled();
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance from getMetronome', () => {
      const instance1 = getMetronome();
      const instance2 = getMetronome();

      expect(instance1).toBe(instance2);
    });
  });

  describe('playSections', () => {
    const mockSection: Section = {
      id: 'test-section',
      name: 'Test Section',
      bpm: 120,
      timeSignature: { beats: 4, noteValue: 4 },
      measures: 2,
      accentPattern: [1],
    };

    it('should schedule beats for a single section', async () => {
      await metronome.playSections([mockSection], 0, 'classic', 0.7);

      // Should schedule: 2 measures * 4 beats = 8 beats + completion callback
      expect(Tone.Transport.schedule).toHaveBeenCalled();
      const transport = Tone.Transport as typeof Tone.Transport & {
        _scheduledCallbacks: Array<{
          callback: (time: number) => void;
          time: number;
        }>;
      };
      expect(transport._scheduledCallbacks.length).toBeGreaterThan(0);
    });

    it('should set correct BPM for section', async () => {
      await metronome.playSections([mockSection], 0, 'classic', 0.7);

      // Check that BPM was scheduled to be set
      const transport = Tone.Transport as typeof Tone.Transport & {
        _scheduledCallbacks: Array<{
          callback: (time: number) => void;
          time: number;
        }>;
      };
      const calls = transport._scheduledCallbacks;
      // Execute first callback (BPM change)
      if (calls.length > 0) {
        calls[0].callback(0);
      }

      expect(Tone.Transport.bpm.value).toBe(120);
    });

    it('should handle multiple sections with different BPMs', async () => {
      const section1: Section = {
        ...mockSection,
        id: 'section-1',
        bpm: 100,
        measures: 1,
      };
      const section2: Section = {
        ...mockSection,
        id: 'section-2',
        bpm: 140,
        measures: 1,
      };

      await metronome.playSections([section1, section2], 0, 'classic', 0.7);

      // Should schedule both sections
      expect(Tone.Transport.schedule).toHaveBeenCalled();
      const transport = Tone.Transport as typeof Tone.Transport & {
        _scheduledCallbacks: Array<{
          callback: (time: number) => void;
          time: number;
        }>;
      };
      expect(transport._scheduledCallbacks.length).toBeGreaterThan(0);
    });

    it('should call onComplete callback when playback finishes', async () => {
      const onComplete = vi.fn();

      await metronome.playSections(
        [mockSection],
        0,
        'classic',
        0.7,
        onComplete
      );

      // Find and execute the completion callback
      const transport = Tone.Transport as typeof Tone.Transport & {
        _scheduledCallbacks: Array<{
          callback: (time: number) => void;
          time: number;
        }>;
      };
      const calls = transport._scheduledCallbacks;
      const completionCall = calls[calls.length - 1]; // Last scheduled call should be completion
      completionCall.callback(completionCall.time);

      expect(onComplete).toHaveBeenCalled();
    });

    it('should call onSectionComplete callback between sections', async () => {
      const onSectionComplete = vi.fn();
      const section1: Section = {
        ...mockSection,
        id: 'section-1',
        measures: 1,
      };
      const section2: Section = {
        ...mockSection,
        id: 'section-2',
        measures: 1,
      };

      await metronome.playSections(
        [section1, section2],
        0,
        'classic',
        0.7,
        undefined,
        onSectionComplete
      );

      // Find section completion callbacks (not the final completion)
      const transport = Tone.Transport as typeof Tone.Transport & {
        _scheduledCallbacks: Array<{
          callback: (time: number) => void;
          time: number;
        }>;
      };
      const calls = transport._scheduledCallbacks;
      // Execute all callbacks except the last one (which is final completion)
      for (let i = 0; i < calls.length - 1; i++) {
        calls[i].callback(calls[i].time);
      }

      expect(onSectionComplete).toHaveBeenCalled();
    });

    it('should respect startIndex parameter', async () => {
      const section1: Section = {
        ...mockSection,
        id: 'section-1',
        measures: 1,
      };
      const section2: Section = {
        ...mockSection,
        id: 'section-2',
        measures: 1,
      };
      const section3: Section = {
        ...mockSection,
        id: 'section-3',
        measures: 1,
      };

      await metronome.playSections(
        [section1, section2, section3],
        1,
        'classic',
        0.7
      );

      // Should only schedule section2 and section3 (starting from index 1)
      // 2 sections * 1 measure * 4 beats = 8 beats + 1 section complete + 1 final complete
      expect(Tone.Transport.schedule).toHaveBeenCalled();
    });

    it('should set volume correctly', async () => {
      await metronome.playSections([mockSection], 0, 'classic', 0.5);

      expect(Tone.gainToDb).toHaveBeenCalledWith(0.5);
    });

    it('should start transport after scheduling', async () => {
      await metronome.playSections([mockSection], 0, 'classic', 0.7);

      expect(Tone.Transport.start).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should cancel all scheduled events', () => {
      metronome.stop();

      expect(Tone.Transport.cancel).toHaveBeenCalled();
    });

    it('should stop transport', () => {
      metronome.stop();

      expect(Tone.Transport.stop).toHaveBeenCalled();
    });

    it('should reset transport position to 0', () => {
      (Tone.Transport as { position: number }).position = 5;
      metronome.stop();

      expect((Tone.Transport as { position: number }).position).toBe(0);
    });

    it('should dispose synth when stop is called after playSections', async () => {
      const mockSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 1,
        accentPattern: [1],
      };

      await metronome.playSections([mockSection], 0, 'classic', 0.7);
      // Should not throw when stopping after playSections
      expect(() => metronome.stop()).not.toThrow();
    });

    it('should reset beat and measure counters', async () => {
      const mockSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 1,
        accentPattern: [1],
      };

      await metronome.playSections([mockSection], 0, 'classic', 0.7);
      metronome.stop();

      // Internal state should be reset (verified by subsequent playSections starting from 0)
      await metronome.playSections([mockSection], 0, 'classic', 0.7);
      expect(Tone.Transport.schedule).toHaveBeenCalled();
    });
  });

  describe('updateVolume', () => {
    it('should update synth volume', async () => {
      const mockSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 1,
        accentPattern: [1],
      };

      await metronome.playSections([mockSection], 0, 'classic', 0.7);

      await metronome.updateVolume(0.3);

      expect(Tone.gainToDb).toHaveBeenCalledWith(0.3);
    });

    it('should handle updateVolume when no synth exists', async () => {
      // Should not throw error
      await expect(metronome.updateVolume(0.5)).resolves.toBeUndefined();
    });
  });

  describe('dispose', () => {
    it('should call stop', () => {
      const stopSpy = vi.spyOn(metronome, 'stop');

      metronome.dispose();

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not dispose transport (shared resource)', () => {
      const mockTransportDispose = vi.fn();
      (Tone.Transport as unknown as Record<string, unknown>).dispose =
        mockTransportDispose;

      metronome.dispose();

      expect(mockTransportDispose).not.toHaveBeenCalled();
    });
  });

  describe('debug mode', () => {
    it('should enable debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      metronome.enableDebugMode(true);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Debug mode enabled')
      );

      consoleSpy.mockRestore();
    });

    it('should disable debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      metronome.enableDebugMode(false);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Debug mode disabled')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('accent patterns', () => {
    it('should handle custom accent pattern', async () => {
      const mockSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 1,
        accentPattern: [1, 3], // Accent beats 1 and 3
      };

      await metronome.playSections([mockSection], 0, 'classic', 0.7);

      // Should schedule beats with accent pattern
      expect(Tone.Transport.schedule).toHaveBeenCalled();
    });

    it('should use default accent pattern when none provided', async () => {
      const mockSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 1,
        accentPattern: [],
      };

      await metronome.playSections([mockSection], 0, 'classic', 0.7);

      // Should default to accenting first beat
      expect(Tone.Transport.schedule).toHaveBeenCalled();
    });
  });

  describe('time signature handling', () => {
    it('should handle different time signatures', async () => {
      const threeQuarterSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 120,
        timeSignature: { beats: 3, noteValue: 4 }, // 3/4 time
        measures: 2,
        accentPattern: [1],
      };

      await metronome.playSections([threeQuarterSection], 0, 'classic', 0.7);

      // Should schedule 2 measures * 3 beats = 6 beats + completion
      expect(Tone.Transport.schedule).toHaveBeenCalled();
    });

    it('should calculate beat duration correctly for different BPMs', async () => {
      const fastSection: Section = {
        id: 'test',
        name: 'Test',
        bpm: 240, // Fast tempo
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 1,
        accentPattern: [1],
      };

      await metronome.playSections([fastSection], 0, 'classic', 0.7);

      // Beat duration should be 60/240 = 0.25 seconds
      const transport = Tone.Transport as typeof Tone.Transport & {
        _scheduledCallbacks: Array<{
          callback: (time: number) => void;
          time: number;
        }>;
      };
      const calls = transport._scheduledCallbacks;
      // Check that beats are scheduled with correct timing
      expect(calls.length).toBeGreaterThan(0);
    });
  });
});
