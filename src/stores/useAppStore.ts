import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Song, Section, Theme, MetronomeSound } from '@/types';

interface AppState {
  // Data
  songs: Song[];

  // Preferences
  theme: Theme;
  metronomeVolume: number;
  metronomeSound: MetronomeSound;

  // Actions - Songs
  createSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSong: (id: string, updates: Partial<Omit<Song, 'id' | 'createdAt'>>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;

  // Actions - Sections
  createSection: (songId: string, section: Omit<Section, 'id'>) => void;
  updateSection: (
    songId: string,
    sectionId: string,
    updates: Partial<Omit<Section, 'id'>>
  ) => void;
  deleteSection: (songId: string, sectionId: string) => void;
  reorderSections: (songId: string, sectionIds: string[]) => void;

  // Actions - Preferences
  setTheme: (theme: Theme) => void;
  setMetronomeVolume: (volume: number) => void;
  setMetronomeSound: (sound: MetronomeSound) => void;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      songs: [],
      theme: 'system',
      metronomeVolume: 0.7,
      metronomeSound: 'classic',

      // Song actions
      createSong: (song) => {
        const newSong: Song = {
          ...song,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          songs: [...state.songs, newSong],
        }));
      },

      updateSong: (id, updates) => {
        set((state) => ({
          songs: state.songs.map((song) =>
            song.id === id
              ? { ...song, ...updates, updatedAt: Date.now() }
              : song
          ),
        }));
      },

      deleteSong: (id) => {
        set((state) => ({
          songs: state.songs.filter((song) => song.id !== id),
        }));
      },

      getSong: (id) => {
        return get().songs.find((song) => song.id === id);
      },

      // Section actions
      createSection: (songId, section) => {
        const newSection: Section = {
          ...section,
          id: generateId(),
        };
        set((state) => ({
          songs: state.songs.map((song) =>
            song.id === songId
              ? {
                  ...song,
                  sections: [...song.sections, newSection],
                  updatedAt: Date.now(),
                }
              : song
          ),
        }));
      },

      updateSection: (songId, sectionId, updates) => {
        set((state) => ({
          songs: state.songs.map((song) =>
            song.id === songId
              ? {
                  ...song,
                  sections: song.sections.map((section) =>
                    section.id === sectionId
                      ? { ...section, ...updates }
                      : section
                  ),
                  updatedAt: Date.now(),
                }
              : song
          ),
        }));
      },

      deleteSection: (songId, sectionId) => {
        set((state) => ({
          songs: state.songs.map((song) =>
            song.id === songId
              ? {
                  ...song,
                  sections: song.sections.filter(
                    (section) => section.id !== sectionId
                  ),
                  updatedAt: Date.now(),
                }
              : song
          ),
        }));
      },

      reorderSections: (songId, sectionIds) => {
        set((state) => ({
          songs: state.songs.map((song) => {
            if (song.id !== songId) return song;

            const sectionMap = new Map(
              song.sections.map((section) => [section.id, section])
            );
            const reorderedSections = sectionIds
              .map((id) => sectionMap.get(id))
              .filter((section): section is Section => section !== undefined);

            return {
              ...song,
              sections: reorderedSections,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      // Preference actions
      setTheme: (theme) => {
        set({ theme });
      },

      setMetronomeVolume: (volume) => {
        set({ metronomeVolume: Math.max(0, Math.min(1, volume)) });
      },

      setMetronomeSound: (sound) => {
        set({ metronomeSound: sound });
      },
    }),
    {
      name: 'time-loch-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        songs: state.songs,
        theme: state.theme,
        metronomeVolume: state.metronomeVolume,
        metronomeSound: state.metronomeSound,
      }),
      version: 1,
    }
  )
);
