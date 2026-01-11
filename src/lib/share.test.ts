import { describe, it, expect, beforeEach } from 'vitest';
import type { Song } from '@/types';
import {
  validateSharedSong,
  stripSongIds,
  encodeSongToUrl,
  decodeSongFromUrl,
  generateShareableUrl,
  isUrlTooLong,
  generateUniqueTitle,
  MAX_URL_LENGTH,
} from './share';

describe('share utilities', () => {
  let mockSong: Song;

  beforeEach(() => {
    mockSong = {
      id: 'test-id-123',
      title: 'Test Song',
      notes: 'Test notes',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: [
        {
          id: 'section-1',
          name: 'Intro',
          bpm: 120,
          timeSignature: { beats: 4, noteValue: 4 },
          measures: 8,
        },
        {
          id: 'section-2',
          name: 'Verse',
          bpm: 120,
          timeSignature: { beats: 4, noteValue: 4 },
          measures: 16,
          accentPattern: [1, 0, 0, 0],
        },
      ],
    };
  });

  describe('validateSharedSong', () => {
    it('should validate a correct song object', () => {
      expect(validateSharedSong(mockSong)).toBe(true);
    });

    it('should reject non-object values', () => {
      expect(validateSharedSong(null)).toBe(false);
      expect(validateSharedSong(undefined)).toBe(false);
      expect(validateSharedSong('string')).toBe(false);
      expect(validateSharedSong(123)).toBe(false);
    });

    it('should reject objects missing required fields', () => {
      expect(validateSharedSong({ title: 'Test' })).toBe(false);
      expect(validateSharedSong({ notes: 'Test' })).toBe(false);
      expect(validateSharedSong({ sections: [] })).toBe(false);
    });

    it('should reject songs with invalid title type', () => {
      const invalid = { ...mockSong, title: 123 };
      expect(validateSharedSong(invalid)).toBe(false);
    });

    it('should reject songs with invalid notes type', () => {
      const invalid = { ...mockSong, notes: null };
      expect(validateSharedSong(invalid)).toBe(false);
    });

    it('should reject songs with non-array sections', () => {
      const invalid = { ...mockSong, sections: 'not an array' };
      expect(validateSharedSong(invalid)).toBe(false);
    });

    it('should reject sections with invalid bpm', () => {
      const invalid = {
        ...mockSong,
        sections: [{ ...mockSong.sections[0], bpm: 0 }],
      };
      expect(validateSharedSong(invalid)).toBe(false);
    });

    it('should reject sections with invalid measures', () => {
      const invalid = {
        ...mockSong,
        sections: [{ ...mockSong.sections[0], measures: -1 }],
      };
      expect(validateSharedSong(invalid)).toBe(false);
    });

    it('should reject sections with invalid time signature', () => {
      const invalid = {
        ...mockSong,
        sections: [
          { ...mockSong.sections[0], timeSignature: { beats: 0, noteValue: 4 } },
        ],
      };
      expect(validateSharedSong(invalid)).toBe(false);
    });

    it('should accept sections without accent pattern', () => {
      const valid = {
        ...mockSong,
        sections: [
          {
            name: 'Test',
            bpm: 120,
            timeSignature: { beats: 4, noteValue: 4 },
            measures: 8,
          },
        ],
      };
      expect(validateSharedSong(valid)).toBe(true);
    });

    it('should reject sections with invalid accent pattern', () => {
      const invalid = {
        ...mockSong,
        sections: [
          { ...mockSong.sections[0], accentPattern: ['invalid'] as unknown[] },
        ],
      };
      expect(validateSharedSong(invalid)).toBe(false);
    });
  });

  describe('stripSongIds', () => {
    it('should remove id, createdAt, and updatedAt from song', () => {
      const stripped = stripSongIds(mockSong);

      expect(stripped).not.toHaveProperty('id');
      expect(stripped).not.toHaveProperty('createdAt');
      expect(stripped).not.toHaveProperty('updatedAt');
    });

    it('should preserve title and notes', () => {
      const stripped = stripSongIds(mockSong);

      expect(stripped.title).toBe(mockSong.title);
      expect(stripped.notes).toBe(mockSong.notes);
    });

    it('should remove id from sections', () => {
      const stripped = stripSongIds(mockSong);

      stripped.sections.forEach((section) => {
        expect(section).not.toHaveProperty('id');
      });
    });

    it('should preserve section data', () => {
      const stripped = stripSongIds(mockSong);

      expect(stripped.sections[0].name).toBe(mockSong.sections[0].name);
      expect(stripped.sections[0].bpm).toBe(mockSong.sections[0].bpm);
      expect(stripped.sections[0].measures).toBe(mockSong.sections[0].measures);
      expect(stripped.sections[0].timeSignature).toEqual(
        mockSong.sections[0].timeSignature
      );
    });

    it('should preserve optional accent pattern', () => {
      const stripped = stripSongIds(mockSong);

      expect(stripped.sections[1].accentPattern).toEqual(
        mockSong.sections[1].accentPattern
      );
    });
  });

  describe('encodeSongToUrl and decodeSongFromUrl', () => {
    it('should encode and decode a song correctly', () => {
      const encoded = encodeSongToUrl(mockSong);
      const decoded = decodeSongFromUrl(encoded);

      expect(decoded).toBeTruthy();
      expect(decoded?.title).toBe(mockSong.title);
      expect(decoded?.notes).toBe(mockSong.notes);
      expect(decoded?.sections.length).toBe(mockSong.sections.length);
    });

    it('should handle empty notes', () => {
      const songWithEmptyNotes = { ...mockSong, notes: '' };
      const encoded = encodeSongToUrl(songWithEmptyNotes);
      const decoded = decodeSongFromUrl(encoded);

      expect(decoded?.notes).toBe('');
    });

    it('should handle special characters in title and notes', () => {
      const specialSong = {
        ...mockSong,
        title: 'Song with "quotes" & <special> chars',
        notes: 'Notes with émojis 🎵 and symbols ♪♫',
      };

      const encoded = encodeSongToUrl(specialSong);
      const decoded = decodeSongFromUrl(encoded);

      expect(decoded?.title).toBe(specialSong.title);
      expect(decoded?.notes).toBe(specialSong.notes);
    });

    it('should handle songs with many sections', () => {
      const largeSong = {
        ...mockSong,
        sections: Array.from({ length: 20 }, (_, i) => ({
          id: `section-${i}`,
          name: `Section ${i}`,
          bpm: 120 + i,
          timeSignature: { beats: 4, noteValue: 4 },
          measures: 8,
          accentPattern: [1, 0, 0, 0],
        })),
      };

      const encoded = encodeSongToUrl(largeSong);
      const decoded = decodeSongFromUrl(encoded);

      expect(decoded?.sections.length).toBe(20);
    });

    it('should return null for invalid encoded data', () => {
      expect(decodeSongFromUrl('invalid-data')).toBeNull();
      expect(decodeSongFromUrl('')).toBeNull();
      expect(decodeSongFromUrl('garbage!@#$%')).toBeNull();
    });

    it('should return null for valid encoding but invalid song structure', () => {
      // Test with a valid base64 string that decodes to invalid song structure
      // This hardcoded string represents compressed data with an invalid structure
      const decoded = decodeSongFromUrl('NobQxg5gTghgdgZwPYgFwEYA0ByBGAFgJ');
      expect(decoded).toBeNull();
    });

    it('should produce different encodings for different songs', () => {
      const song1 = { ...mockSong, title: 'Song 1' };
      const song2 = { ...mockSong, title: 'Song 2' };

      const encoded1 = encodeSongToUrl(song1);
      const encoded2 = encodeSongToUrl(song2);

      expect(encoded1).not.toBe(encoded2);
    });

    it('should strip IDs during encoding', () => {
      const encoded = encodeSongToUrl(mockSong);
      const decoded = decodeSongFromUrl(encoded);

      expect(decoded).not.toHaveProperty('id');
      expect(decoded).not.toHaveProperty('createdAt');
      expect(decoded).not.toHaveProperty('updatedAt');
    });
  });

  describe('generateShareableUrl', () => {
    it('should generate a valid URL with hash', () => {
      const url = generateShareableUrl(mockSong);

      expect(url).toContain('#share/');
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should include encoded song data', () => {
      const url = generateShareableUrl(mockSong);
      const hashPart = url.split('#share/')[1];

      expect(hashPart).toBeTruthy();
      expect(hashPart.length).toBeGreaterThan(0);
    });

    it('should produce decodable URLs', () => {
      const url = generateShareableUrl(mockSong);
      const hashPart = url.split('#share/')[1];
      const decoded = decodeSongFromUrl(hashPart);

      expect(decoded?.title).toBe(mockSong.title);
    });
  });

  describe('isUrlTooLong', () => {
    it('should return false for short URLs', () => {
      const shortUrl = 'https://example.com/#share/abc123';
      expect(isUrlTooLong(shortUrl)).toBe(false);
    });

    it('should return false for URLs at max length', () => {
      const url = 'https://example.com/' + 'a'.repeat(MAX_URL_LENGTH - 22);
      expect(isUrlTooLong(url)).toBe(false);
    });

    it('should return true for URLs exceeding max length', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(MAX_URL_LENGTH);
      expect(isUrlTooLong(longUrl)).toBe(true);
    });
  });

  describe('generateUniqueTitle', () => {
    it('should return original title if no duplicates', () => {
      const result = generateUniqueTitle('My Song', ['Other Song']);
      expect(result).toBe('My Song');
    });

    it('should append (2) for first duplicate', () => {
      const result = generateUniqueTitle('My Song', ['My Song']);
      expect(result).toBe('My Song (2)');
    });

    it('should append (3) for second duplicate', () => {
      const result = generateUniqueTitle('My Song', ['My Song', 'My Song (2)']);
      expect(result).toBe('My Song (3)');
    });

    it('should find next available number', () => {
      const result = generateUniqueTitle('My Song', [
        'My Song',
        'My Song (2)',
        'My Song (3)',
        'My Song (4)',
      ]);
      expect(result).toBe('My Song (5)');
    });

    it('should handle gaps in numbering', () => {
      const result = generateUniqueTitle('My Song', ['My Song', 'My Song (3)']);
      expect(result).toBe('My Song (2)');
    });

    it('should handle empty existing titles array', () => {
      const result = generateUniqueTitle('My Song', []);
      expect(result).toBe('My Song');
    });
  });
});
