import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './useUIStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      isPlaying: false,
      currentSongId: null,
      currentSectionIndex: 0,
      currentMeasureInSection: 0,
      currentPage: 'home',
      selectedSongId: null,
      isCreateSongDialogOpen: false,
      isCreateSectionDialogOpen: false,
      isEditSectionDialogOpen: false,
      editSectionId: null,
      isDeleteConfirmOpen: false,
      deleteTarget: null,
    });
  });

  describe('Playback State', () => {
    it('should set playback state', () => {
      const { setPlaybackState } = useUIStore.getState();

      setPlaybackState(true);
      expect(useUIStore.getState().isPlaying).toBe(true);

      setPlaybackState(false);
      expect(useUIStore.getState().isPlaying).toBe(false);
    });

    it('should start song playback with initial state', () => {
      const { startSongPlayback } = useUIStore.getState();

      startSongPlayback('song-123');

      const state = useUIStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentSongId).toBe('song-123');
      expect(state.currentSectionIndex).toBe(0);
      expect(state.currentMeasureInSection).toBe(1);
    });

    it('should start section playback at specific index', () => {
      const { startSectionPlayback } = useUIStore.getState();

      startSectionPlayback('song-456', 2);

      const state = useUIStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentSongId).toBe('song-456');
      expect(state.currentSectionIndex).toBe(2);
      expect(state.currentMeasureInSection).toBe(1);
    });

    it('should advance to next section and reset measure', () => {
      const { startSongPlayback, advanceToNextSection } = useUIStore.getState();

      startSongPlayback('song-789');
      useUIStore.setState({ currentMeasureInSection: 5 });

      advanceToNextSection();

      const state = useUIStore.getState();
      expect(state.currentSectionIndex).toBe(1);
      expect(state.currentMeasureInSection).toBe(1);
    });

    it('should set current measure', () => {
      const { setCurrentMeasure } = useUIStore.getState();

      setCurrentMeasure(3);
      expect(useUIStore.getState().currentMeasureInSection).toBe(3);

      setCurrentMeasure(7);
      expect(useUIStore.getState().currentMeasureInSection).toBe(7);
    });

    it('should stop playback and reset state', () => {
      const { startSongPlayback, setCurrentMeasure, stopPlayback } =
        useUIStore.getState();

      startSongPlayback('song-abc');
      setCurrentMeasure(4);

      stopPlayback();

      const state = useUIStore.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.currentSongId).toBeNull();
      expect(state.currentSectionIndex).toBe(0);
      expect(state.currentMeasureInSection).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should navigate to different pages', () => {
      const { navigateTo } = useUIStore.getState();

      navigateTo('song', 'song-123');
      let state = useUIStore.getState();
      expect(state.currentPage).toBe('song');
      expect(state.selectedSongId).toBe('song-123');

      navigateTo('home');
      state = useUIStore.getState();
      expect(state.currentPage).toBe('home');
      expect(state.selectedSongId).toBeNull();

      navigateTo('about');
      state = useUIStore.getState();
      expect(state.currentPage).toBe('about');
    });

    it('should set selected song id', () => {
      const { setSelectedSong } = useUIStore.getState();

      setSelectedSong('song-xyz');
      expect(useUIStore.getState().selectedSongId).toBe('song-xyz');

      setSelectedSong(null);
      expect(useUIStore.getState().selectedSongId).toBeNull();
    });
  });

  describe('Dialog Management - Create Song', () => {
    it('should open create song dialog', () => {
      const { openCreateSongDialog } = useUIStore.getState();

      openCreateSongDialog();
      expect(useUIStore.getState().isCreateSongDialogOpen).toBe(true);
    });

    it('should close create song dialog', () => {
      const { openCreateSongDialog, closeCreateSongDialog } =
        useUIStore.getState();

      openCreateSongDialog();
      closeCreateSongDialog();
      expect(useUIStore.getState().isCreateSongDialogOpen).toBe(false);
    });
  });

  describe('Dialog Management - Create Section', () => {
    it('should open create section dialog', () => {
      const { openCreateSectionDialog } = useUIStore.getState();

      openCreateSectionDialog();
      expect(useUIStore.getState().isCreateSectionDialogOpen).toBe(true);
    });

    it('should close create section dialog', () => {
      const { openCreateSectionDialog, closeCreateSectionDialog } =
        useUIStore.getState();

      openCreateSectionDialog();
      closeCreateSectionDialog();
      expect(useUIStore.getState().isCreateSectionDialogOpen).toBe(false);
    });
  });

  describe('Dialog Management - Edit Section', () => {
    it('should open edit section dialog with section id', () => {
      const { openEditSectionDialog } = useUIStore.getState();

      openEditSectionDialog('section-123');

      const state = useUIStore.getState();
      expect(state.isEditSectionDialogOpen).toBe(true);
      expect(state.editSectionId).toBe('section-123');
    });

    it('should close edit section dialog and clear section id', () => {
      const { openEditSectionDialog, closeEditSectionDialog } =
        useUIStore.getState();

      openEditSectionDialog('section-456');
      closeEditSectionDialog();

      const state = useUIStore.getState();
      expect(state.isEditSectionDialogOpen).toBe(false);
      expect(state.editSectionId).toBeNull();
    });

    it('should handle opening edit dialog multiple times', () => {
      const { openEditSectionDialog } = useUIStore.getState();

      openEditSectionDialog('section-first');
      expect(useUIStore.getState().editSectionId).toBe('section-first');

      openEditSectionDialog('section-second');
      expect(useUIStore.getState().editSectionId).toBe('section-second');
    });
  });

  describe('Dialog Management - Delete Confirm', () => {
    it('should open delete confirm dialog with song target', () => {
      const { openDeleteConfirm } = useUIStore.getState();

      openDeleteConfirm({ type: 'song', id: 'song-123' });

      const state = useUIStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(true);
      expect(state.deleteTarget).toEqual({ type: 'song', id: 'song-123' });
    });

    it('should open delete confirm dialog with section target', () => {
      const { openDeleteConfirm } = useUIStore.getState();

      openDeleteConfirm({
        type: 'section',
        id: 'section-456',
        songId: 'song-789',
      });

      const state = useUIStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(true);
      expect(state.deleteTarget).toEqual({
        type: 'section',
        id: 'section-456',
        songId: 'song-789',
      });
    });

    it('should close delete confirm dialog and clear target', () => {
      const { openDeleteConfirm, closeDeleteConfirm } = useUIStore.getState();

      openDeleteConfirm({ type: 'song', id: 'song-123' });
      closeDeleteConfirm();

      const state = useUIStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(false);
      expect(state.deleteTarget).toBeNull();
    });

    it('should open delete dialog using convenience method', () => {
      const { openDeleteDialog } = useUIStore.getState();

      openDeleteDialog('section', 'section-abc', 'song-xyz');

      const state = useUIStore.getState();
      expect(state.isDeleteConfirmOpen).toBe(true);
      expect(state.deleteTarget).toEqual({
        type: 'section',
        id: 'section-abc',
        songId: 'song-xyz',
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle playback during section editing', () => {
      const { startSongPlayback, openEditSectionDialog } =
        useUIStore.getState();

      // Start playback
      startSongPlayback('song-123');
      expect(useUIStore.getState().isPlaying).toBe(true);

      // Try to open edit dialog (UI should prevent this, but state allows it)
      openEditSectionDialog('section-456');

      const state = useUIStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.isEditSectionDialogOpen).toBe(true);
    });

    it('should maintain measure count across dialog operations', () => {
      const {
        startSectionPlayback,
        setCurrentMeasure,
        openEditSectionDialog,
        closeEditSectionDialog,
      } = useUIStore.getState();

      startSectionPlayback('song-123', 1);
      setCurrentMeasure(5);

      openEditSectionDialog('section-789');
      closeEditSectionDialog();

      // Measure count should remain unchanged
      expect(useUIStore.getState().currentMeasureInSection).toBe(5);
    });

    it('should handle navigation during playback', () => {
      const { startSongPlayback, navigateTo } = useUIStore.getState();

      startSongPlayback('song-123');
      navigateTo('about');

      const state = useUIStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentPage).toBe('about');
    });
  });
});
