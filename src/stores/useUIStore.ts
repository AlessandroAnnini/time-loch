import { create } from 'zustand';
import type { Page, DeleteTarget } from '@/types';

interface UIState {
  // Playback state
  isPlaying: boolean;
  currentSongId: string | null;
  currentSectionIndex: number;

  // Navigation
  currentPage: Page;
  selectedSongId: string | null;

  // Dialogs/Modals
  isCreateSongDialogOpen: boolean;
  isCreateSectionDialogOpen: boolean;
  isDeleteConfirmOpen: boolean;
  deleteTarget: DeleteTarget | null;

  // Actions - Playback
  setPlaybackState: (isPlaying: boolean) => void;
  startSongPlayback: (songId: string) => void;
  startSectionPlayback: (songId: string, sectionIndex: number) => void;
  advanceToNextSection: () => void;
  stopPlayback: () => void;

  // Actions - Navigation
  navigateTo: (page: Page, songId?: string) => void;
  setSelectedSong: (songId: string | null) => void;

  // Actions - Dialogs
  openCreateSongDialog: () => void;
  closeCreateSongDialog: () => void;
  openCreateSectionDialog: () => void;
  closeCreateSectionDialog: () => void;
  openDeleteConfirm: (target: DeleteTarget) => void;
  closeDeleteConfirm: () => void;
  openDeleteDialog: (
    type: 'song' | 'section',
    id: string,
    songId?: string
  ) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  isPlaying: false,
  currentSongId: null,
  currentSectionIndex: 0,
  currentPage: 'home',
  selectedSongId: null,
  isCreateSongDialogOpen: false,
  isCreateSectionDialogOpen: false,
  isDeleteConfirmOpen: false,
  deleteTarget: null,

  // Playback actions
  setPlaybackState: (isPlaying) => {
    set({ isPlaying });
  },

  startSongPlayback: (songId) => {
    set({
      isPlaying: true,
      currentSongId: songId,
      currentSectionIndex: 0,
    });
  },

  startSectionPlayback: (songId, sectionIndex) => {
    set({
      isPlaying: true,
      currentSongId: songId,
      currentSectionIndex: sectionIndex,
    });
  },

  advanceToNextSection: () => {
    set((state) => ({
      currentSectionIndex: state.currentSectionIndex + 1,
    }));
  },

  stopPlayback: () => {
    set({
      isPlaying: false,
      currentSongId: null,
      currentSectionIndex: 0,
    });
  },

  // Navigation actions
  navigateTo: (page, songId) => {
    set({
      currentPage: page,
      selectedSongId: songId ?? null,
    });
  },

  setSelectedSong: (songId) => {
    set({ selectedSongId: songId });
  },

  // Dialog actions
  openCreateSongDialog: () => {
    set({ isCreateSongDialogOpen: true });
  },

  closeCreateSongDialog: () => {
    set({ isCreateSongDialogOpen: false });
  },

  openCreateSectionDialog: () => {
    set({ isCreateSectionDialogOpen: true });
  },

  closeCreateSectionDialog: () => {
    set({ isCreateSectionDialogOpen: false });
  },

  openDeleteConfirm: (target) => {
    set({
      isDeleteConfirmOpen: true,
      deleteTarget: target,
    });
  },

  closeDeleteConfirm: () => {
    set({
      isDeleteConfirmOpen: false,
      deleteTarget: null,
    });
  },

  openDeleteDialog: (type, id, songId) => {
    set({
      isDeleteConfirmOpen: true,
      deleteTarget: { type, id, songId },
    });
  },
}));
