import LZString from 'lz-string';
import type { Song, Section } from '@/types';

/**
 * Maximum safe URL length across browsers (conservative estimate)
 * Most browsers support up to ~2MB, but we keep it conservative for compatibility
 */
export const MAX_URL_LENGTH = 8000;

/**
 * Type representing song data for sharing (without IDs)
 */
export type ShareableSongData = {
  title: string;
  notes: string;
  sections: Omit<Section, 'id'>[];
};

/**
 * Validates if an object matches the ShareableSongData structure
 *
 * @param data - Unknown data to validate
 * @returns True if data is valid shareable song data
 *
 * @example
 * const isValid = validateSharedSong(decodedData);
 * if (isValid) {
 *   // Safe to use as ShareableSongData
 * }
 */
export function validateSharedSong(data: unknown): data is ShareableSongData {
  if (!data || typeof data !== 'object') return false;

  const song = data as Partial<ShareableSongData>;

  // Check required string fields
  if (typeof song.title !== 'string') return false;
  if (typeof song.notes !== 'string') return false;

  // Check sections array
  if (!Array.isArray(song.sections)) return false;

  // Validate each section
  return song.sections.every((section) => {
    if (!section || typeof section !== 'object') return false;

    const hasValidName = typeof section.name === 'string';
    const hasValidBpm = typeof section.bpm === 'number' && section.bpm > 0;
    const hasValidMeasures =
      typeof section.measures === 'number' && section.measures > 0;

    // Validate time signature
    const ts = section.timeSignature;
    const hasValidTimeSignature =
      ts &&
      typeof ts === 'object' &&
      typeof ts.beats === 'number' &&
      ts.beats > 0 &&
      typeof ts.noteValue === 'number' &&
      ts.noteValue > 0;

    // Validate accent pattern (optional)
    const hasValidAccentPattern =
      section.accentPattern === undefined ||
      (Array.isArray(section.accentPattern) &&
        section.accentPattern.every((n) => typeof n === 'number'));

    return (
      hasValidName &&
      hasValidBpm &&
      hasValidMeasures &&
      hasValidTimeSignature &&
      hasValidAccentPattern
    );
  });
}

/**
 * Strips IDs from song and sections to prepare for sharing
 * Used internally by encodeSongToUrl
 *
 * @internal - Exported for testing only, use encodeSongToUrl instead
 * @param song - Song object with IDs
 * @returns Song data without id/createdAt/updatedAt fields
 */
export function stripSongIds(song: Song): ShareableSongData {
  return {
    title: song.title,
    notes: song.notes,
    sections: song.sections.map((section) => ({
      name: section.name,
      bpm: section.bpm,
      timeSignature: section.timeSignature,
      measures: section.measures,
      accentPattern: section.accentPattern,
    })),
  };
}

/**
 * Encodes a song to a compressed base64url string
 *
 * @param song - Song object to encode
 * @returns Compressed and encoded string
 * @throws Error if compression fails
 *
 * @example
 * const encoded = encodeSongToUrl(song);
 * const url = `${window.location.origin}/#share/${encoded}`;
 */
export function encodeSongToUrl(song: Song): string {
  try {
    // Strip IDs and timestamps - not needed for sharing
    const shareData = stripSongIds(song);

    // Convert to JSON
    const json = JSON.stringify(shareData);

    // Compress and encode using base64url (safe for URLs)
    const compressed = LZString.compressToEncodedURIComponent(json);

    return compressed;
  } catch (error) {
    throw new Error(
      `Failed to encode song: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decodes a compressed song string back to shareable song data
 *
 * @param encodedData - Compressed base64url string
 * @returns Decoded ShareableSongData or null if invalid
 *
 * @example
 * const songData = decodeSongFromUrl(hashData);
 * if (songData) {
 *   // Valid song data
 * } else {
 *   // Invalid or corrupted data
 * }
 */
export function decodeSongFromUrl(encodedData: string): ShareableSongData | null {
  try {
    // Decompress
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);

    if (!decompressed) {
      return null;
    }

    // Parse JSON
    const parsed = JSON.parse(decompressed);

    // Validate structure
    if (!validateSharedSong(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    // Invalid data - return null instead of throwing
    return null;
  }
}

/**
 * Generates a complete shareable URL for a song
 *
 * @param song - Song object to share
 * @returns Full URL with encoded song data in hash
 * @throws Error if encoding fails
 *
 * @example
 * const shareUrl = generateShareableUrl(song);
 * navigator.clipboard.writeText(shareUrl);
 */
export function generateShareableUrl(song: Song): string {
  const encoded = encodeSongToUrl(song);
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}#share/${encoded}`;

  return shareUrl;
}

/**
 * Checks if a URL exceeds safe length limits
 *
 * @param url - URL string to check
 * @returns True if URL is too long
 *
 * @example
 * if (isUrlTooLong(shareUrl)) {
 *   console.warn('URL may not work in all browsers');
 * }
 */
export function isUrlTooLong(url: string): boolean {
  return url.length > MAX_URL_LENGTH;
}

/**
 * Generates a unique title for imported songs to avoid duplicates
 *
 * @param title - Original title
 * @param existingTitles - Array of titles already in use
 * @returns Unique title with suffix if needed (e.g., "Song Title (2)")
 *
 * @example
 * const newTitle = generateUniqueTitle("My Song", ["My Song", "My Song (2)"]);
 * // Returns: "My Song (3)"
 */
export function generateUniqueTitle(
  title: string,
  existingTitles: string[]
): string {
  let uniqueTitle = title;
  let counter = 2;

  while (existingTitles.includes(uniqueTitle)) {
    uniqueTitle = `${title} (${counter})`;
    counter++;
  }

  return uniqueTitle;
}
