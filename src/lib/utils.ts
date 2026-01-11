import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique ID string
 * Uses timestamp and random characters for uniqueness
 *
 * @returns Unique ID string in format: timestamp-randomchars
 *
 * @example
 * const id = generateId();
 * // Returns: "1704067200000-abc123z"
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
