import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import {
  validateRequired,
  validateRange,
  validateBPM,
  validateMeasures,
} from './validation';

describe('validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(validateRequired('test', 'Field')).toBe(true);
      expect(validateRequired('  test  ', 'Field')).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return false for empty strings', () => {
      expect(validateRequired('', 'Field')).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Field is required.',
      });
    });

    it('should return false for whitespace-only strings', () => {
      expect(validateRequired('   ', 'Field')).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Field is required.',
      });
    });

    it('should use correct field name in error message', () => {
      validateRequired('', 'Song Title');
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Song Title is required.',
      });
    });
  });

  describe('validateRange', () => {
    it('should return true for values within range', () => {
      expect(validateRange(50, 'Value', 0, 100)).toBe(true);
      expect(validateRange(0, 'Value', 0, 100)).toBe(true);
      expect(validateRange(100, 'Value', 0, 100)).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return false for values below minimum', () => {
      expect(validateRange(-1, 'Value', 0, 100)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Value must be between 0 and 100.',
      });
    });

    it('should return false for values above maximum', () => {
      expect(validateRange(101, 'Value', 0, 100)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Value must be between 0 and 100.',
      });
    });

    it('should use correct field name and range in error message', () => {
      validateRange(300, 'BPM', 35, 250);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'BPM must be between 35 and 250.',
      });
    });
  });

  describe('validateBPM', () => {
    it('should return true for valid BPM values (35-250)', () => {
      expect(validateBPM(35)).toBe(true);
      expect(validateBPM(120)).toBe(true);
      expect(validateBPM(250)).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return false for BPM below 35', () => {
      expect(validateBPM(34)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'BPM must be between 35 and 250.',
      });
    });

    it('should return false for BPM above 250', () => {
      expect(validateBPM(251)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'BPM must be between 35 and 250.',
      });
    });

    it('should accept decimal BPM values', () => {
      expect(validateBPM(120.5)).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('validateMeasures', () => {
    it('should return true for valid measure counts (1-999)', () => {
      expect(validateMeasures(1)).toBe(true);
      expect(validateMeasures(16)).toBe(true);
      expect(validateMeasures(999)).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return false for measures below 1', () => {
      expect(validateMeasures(0)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Measures must be between 1 and 999.',
      });
    });

    it('should return false for measures above 999', () => {
      expect(validateMeasures(1000)).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Validation Error', {
        description: 'Measures must be between 1 and 999.',
      });
    });

    it('should accept integer measure values only', () => {
      expect(validateMeasures(8)).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
