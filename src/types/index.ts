export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export interface Section {
  id: string;
  name: string;
  bpm: number;
  timeSignature: TimeSignature;
  measures: number;
  accentPattern?: number[];
}

export interface Song {
  id: string;
  title: string;
  notes: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export type Theme = 'light' | 'dark' | 'system';

export type MetronomeSound = 'classic' | 'percussive';

export type Page = 'home' | 'song' | 'about';

export interface DeleteTarget {
  type: 'song' | 'section';
  id: string;
  songId?: string;
}
