import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import type { Song, Section } from '@/types';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      songs: [],
      theme: 'system',
      metronomeVolume: 0.7,
      metronomeSound: 'classic',
    });
  });

  describe('Song Management', () => {
    it('should create a new song with generated id and timestamps', () => {
      const { createSong } = useAppStore.getState();

      createSong({
        title: 'Test Song',
        notes: 'Test notes',
        sections: [],
      });

      const songs = useAppStore.getState().songs;
      expect(songs).toHaveLength(1);
      expect(songs[0]).toMatchObject({
        title: 'Test Song',
        notes: 'Test notes',
        sections: [],
      });
      expect(songs[0].id).toBeDefined();
      expect(songs[0].createdAt).toBeDefined();
      expect(songs[0].updatedAt).toBeDefined();
    });

    it('should update a song and modify updatedAt timestamp', async () => {
      const { createSong, updateSong } = useAppStore.getState();

      createSong({ title: 'Original', notes: '', sections: [] });
      const songs = useAppStore.getState().songs;
      const songId = songs[0].id;
      const originalUpdatedAt = songs[0].updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      updateSong(songId, { title: 'Updated' });
      const updatedSong = useAppStore.getState().songs[0];

      expect(updatedSong.title).toBe('Updated');
      expect(updatedSong.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it('should delete a song by id', () => {
      const { createSong, deleteSong } = useAppStore.getState();

      createSong({ title: 'Song 1', notes: '', sections: [] });
      createSong({ title: 'Song 2', notes: '', sections: [] });

      const songs = useAppStore.getState().songs;
      expect(songs).toHaveLength(2);

      deleteSong(songs[0].id);

      const remainingSongs = useAppStore.getState().songs;
      expect(remainingSongs).toHaveLength(1);
      expect(remainingSongs[0].title).toBe('Song 2');
    });

    it('should get a song by id', () => {
      const { createSong, getSong } = useAppStore.getState();

      createSong({ title: 'Find Me', notes: '', sections: [] });
      const songId = useAppStore.getState().songs[0].id;

      const foundSong = getSong(songId);

      expect(foundSong).toBeDefined();
      expect(foundSong?.title).toBe('Find Me');
    });

    it('should return undefined when getting non-existent song', () => {
      const { getSong } = useAppStore.getState();

      const foundSong = getSong('non-existent-id');

      expect(foundSong).toBeUndefined();
    });

    it('should reorder songs by id array', () => {
      const { createSong, reorderSongs } = useAppStore.getState();

      createSong({ title: 'Song A', notes: '', sections: [] });
      createSong({ title: 'Song B', notes: '', sections: [] });
      createSong({ title: 'Song C', notes: '', sections: [] });

      const songs = useAppStore.getState().songs;
      const [songA, songB, songC] = songs;

      reorderSongs([songC.id, songA.id, songB.id]);

      const reorderedSongs = useAppStore.getState().songs;
      expect(reorderedSongs[0].title).toBe('Song C');
      expect(reorderedSongs[1].title).toBe('Song A');
      expect(reorderedSongs[2].title).toBe('Song B');
    });

    it('should handle reordering with missing ids by filtering them out', () => {
      const { createSong, reorderSongs } = useAppStore.getState();

      createSong({ title: 'Song A', notes: '', sections: [] });
      createSong({ title: 'Song B', notes: '', sections: [] });

      const songs = useAppStore.getState().songs;
      const [songA, songB] = songs;

      reorderSongs([songB.id, 'non-existent', songA.id]);

      const reorderedSongs = useAppStore.getState().songs;
      expect(reorderedSongs).toHaveLength(2);
      expect(reorderedSongs[0].title).toBe('Song B');
      expect(reorderedSongs[1].title).toBe('Song A');
    });
  });

  describe('Section Management', () => {
    let songId: string;

    beforeEach(() => {
      const { createSong } = useAppStore.getState();
      createSong({ title: 'Test Song', notes: '', sections: [] });
      songId = useAppStore.getState().songs[0].id;
    });

    it('should create a new section with generated id', () => {
      const { createSection } = useAppStore.getState();

      createSection(songId, {
        name: 'Verse',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 4,
        accentPattern: [1],
      });

      const song = useAppStore.getState().songs[0];
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0]).toMatchObject({
        name: 'Verse',
        bpm: 120,
        measures: 4,
      });
      expect(song.sections[0].id).toBeDefined();
    });

    it('should update a section by id', () => {
      const { createSection, updateSection } = useAppStore.getState();

      createSection(songId, {
        name: 'Verse',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 4,
        accentPattern: [1],
      });

      const sectionId = useAppStore.getState().songs[0].sections[0].id;
      updateSection(songId, sectionId, { name: 'Chorus', bpm: 140 });

      const section = useAppStore.getState().songs[0].sections[0];
      expect(section.name).toBe('Chorus');
      expect(section.bpm).toBe(140);
      expect(section.measures).toBe(4); // unchanged
    });

    it('should delete a section by id', () => {
      const { createSection, deleteSection } = useAppStore.getState();

      createSection(songId, {
        name: 'Intro',
        bpm: 100,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 2,
        accentPattern: [1],
      });
      createSection(songId, {
        name: 'Verse',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 4,
        accentPattern: [1],
      });

      const sections = useAppStore.getState().songs[0].sections;
      expect(sections).toHaveLength(2);

      deleteSection(songId, sections[0].id);

      const remainingSections = useAppStore.getState().songs[0].sections;
      expect(remainingSections).toHaveLength(1);
      expect(remainingSections[0].name).toBe('Verse');
    });

    it('should reorder sections by id array', () => {
      const { createSection, reorderSections } = useAppStore.getState();

      createSection(songId, {
        name: 'Section A',
        bpm: 100,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 2,
        accentPattern: [1],
      });
      createSection(songId, {
        name: 'Section B',
        bpm: 110,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 2,
        accentPattern: [1],
      });
      createSection(songId, {
        name: 'Section C',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 2,
        accentPattern: [1],
      });

      const sections = useAppStore.getState().songs[0].sections;
      const [secA, secB, secC] = sections;

      reorderSections(songId, [secC.id, secA.id, secB.id]);

      const reorderedSections = useAppStore.getState().songs[0].sections;
      expect(reorderedSections[0].name).toBe('Section C');
      expect(reorderedSections[1].name).toBe('Section A');
      expect(reorderedSections[2].name).toBe('Section B');
    });

    it('should handle reordering sections with missing ids', () => {
      const { createSection, reorderSections } = useAppStore.getState();

      createSection(songId, {
        name: 'Section A',
        bpm: 100,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 2,
        accentPattern: [1],
      });
      createSection(songId, {
        name: 'Section B',
        bpm: 110,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 2,
        accentPattern: [1],
      });

      const sections = useAppStore.getState().songs[0].sections;
      const [secA, secB] = sections;

      reorderSections(songId, [secB.id, 'non-existent', secA.id]);

      const reorderedSections = useAppStore.getState().songs[0].sections;
      expect(reorderedSections).toHaveLength(2);
      expect(reorderedSections[0].name).toBe('Section B');
      expect(reorderedSections[1].name).toBe('Section A');
    });

    it('should not affect other songs when managing sections', () => {
      const { createSong, createSection } = useAppStore.getState();

      createSong({ title: 'Other Song', notes: '', sections: [] });

      createSection(songId, {
        name: 'Verse',
        bpm: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        measures: 4,
        accentPattern: [1],
      });

      const songs = useAppStore.getState().songs;
      expect(songs[0].sections).toHaveLength(1);
      expect(songs[1].sections).toHaveLength(0);
    });
  });

  describe('Preferences', () => {
    it('should set theme preference', () => {
      const { setTheme } = useAppStore.getState();

      setTheme('dark');
      expect(useAppStore.getState().theme).toBe('dark');

      setTheme('light');
      expect(useAppStore.getState().theme).toBe('light');
    });

    it('should set metronome volume and clamp to 0-1 range', () => {
      const { setMetronomeVolume } = useAppStore.getState();

      setMetronomeVolume(0.5);
      expect(useAppStore.getState().metronomeVolume).toBe(0.5);

      setMetronomeVolume(1.5);
      expect(useAppStore.getState().metronomeVolume).toBe(1);

      setMetronomeVolume(-0.5);
      expect(useAppStore.getState().metronomeVolume).toBe(0);
    });

    it('should set metronome sound', () => {
      const { setMetronomeSound } = useAppStore.getState();

      setMetronomeSound('percussive');
      expect(useAppStore.getState().metronomeSound).toBe('percussive');

      setMetronomeSound('classic');
      expect(useAppStore.getState().metronomeSound).toBe('classic');
    });
  });
});
