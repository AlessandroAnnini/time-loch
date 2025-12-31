# Time Loch Development Notebook

## Project Overview

**Time Loch** is an advanced metronome PWA for the band Devon Loch. It structures songs into tempo-accurate sections for rehearsal.

**Name Origin:**

- **Devon Loch** (band name) + **Time Lock** (locking tempo/rhythm) = **Time Loch**

---

## Tech Stack

- **TypeScript** + **React** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (state management)
- **Tone.js** (sample-accurate audio timing)
- **PWA** (offline-first, installable)

---

## Core Concepts

### Song

- Container for ordered sections and rehearsal notes
- Has title, notes, creation/update timestamps
- Represents full musical structure

### Section

- Musically meaningful, indivisible part (intro, verse, chorus, bridge)
- Properties:
  - Name
  - Tempo (BPM)
  - Time signature (beats/measure, note value)
  - Duration (fixed number of measures)
  - Accent pattern (optional)
- **Always starts from first measure** (no partial playback)

---

## Playback Model

**Critical:** Only one playback active at any time. Deterministic, non-ambiguous behavior.

### Song-Level Playback

- **Triggered by:** Song Play button
- **Behavior:**
  - Starts from first section
  - Plays all sections in order
  - Uses each section's tempo/meter/duration
  - Never resumes or starts mid-section
  - Stops after last section
- **Purpose:** Full song rehearsal

### Section-Level Playback

- **Triggered by:** Section Play button
- **Behavior:**
  - Starts from first measure of selected section
  - Continues through that section and all following sections
  - Never loops, never resumes, never partial
  - Stops at end of song
- **Purpose:** Practice specific entry points

### Stop Behavior

- Global Stop button shown during playback
- Immediately halts any playback
- Resets metronome state
- While playing: all play buttons disabled, only Stop available

---

## Metronome Best Practices

### BPM Standards

- Range: 35-250 BPM (industry standard)
- Beginners: 60-80 BPM for accuracy
- Practice: start 40-60 BPM, increase by 2-5 BPM
- Timing: 60 BPM = 1 beat/second, 120 BPM = 2 beats/second

### Time Signatures

**Simple time:**

- Top number = beats per measure
- Bottom number = note value (2=half, 4=quarter, 8=eighth)
- Examples: 4/4, 3/4, 2/4

**Compound time:**

- Divide top by 3 for actual beats
- Examples: 6/8 = 2 beats, 9/8 = 3 beats
- Beat = dotted quarter

**Odd time:**

- Examples: 5/4, 7/8

### Accent Patterns

- First beat typically accented (strong beat)
- Helps identify measure boundaries
- Essential for compound time
- Visual + audio feedback

### Practice Techniques

- Master at slow tempo (perfect accuracy first)
- Increase only after 5 consecutive clean runs
- Use subdivisions for slower tempos
- Test internal timing with muted bars

---

## PWA Implementation

### Required Files

**manifest.json** (minimal):

```json
{
  "name": "Time Loch",
  "short_name": "Time Loch",
  "display": "standalone",
  "start_url": ".",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**sw.js** (service worker):

- Can start empty
- Add caching strategy later for offline assets

**HTML meta tags:**

```html
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="manifest" href="manifest.json" />
<link rel="icon" href="icon.png" />
<link rel="apple-touch-icon" href="icon.png" />
```

**Service worker registration:**

```javascript
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
```

---

## Zustand Store Architecture

### Store Separation Strategy

**Two stores for separation of concerns:**

1. **UI Store** (non-persisted) - Ephemeral state
2. **App Store** (persisted) - Long-term data

---

### UI Store (useUIStore.ts)

**Purpose:** Transient UI interactions, playback control, navigation, dialogs

**State Structure:**

```typescript
interface UIState {
  // Playback state
  isPlaying: boolean;
  currentSongId: string | null;
  currentSectionIndex: number;

  // Navigation
  currentPage: 'home' | 'song' | 'about';
  selectedSongId: string | null;

  // Dialogs/Modals
  isCreateSongDialogOpen: boolean;
  isCreateSectionDialogOpen: boolean;
  isDeleteConfirmOpen: boolean;
  deleteTarget: { type: 'song' | 'section'; id: string } | null;

  // Actions
  setPlaybackState: (isPlaying: boolean) => void;
  startSongPlayback: (songId: string) => void;
  startSectionPlayback: (songId: string, sectionIndex: number) => void;
  stopPlayback: () => void;
  navigateTo: (page: string) => void;
  setSelectedSong: (songId: string | null) => void;
  openDialog: (dialog: string) => void;
  closeDialog: (dialog: string) => void;
  setDeleteTarget: (target: UIState['deleteTarget']) => void;
}
```

**Characteristics:**

- No persistence middleware
- Fast, reactive updates
- Cleared on page reload (intentional)
- Controls metronome via Tone.js (not stored in state)

---

### App Store (useAppStore.ts)

**Purpose:** Songs, sections, user preferences, persistent data

**Data Types:**

```typescript
interface Section {
  id: string;
  name: string;
  bpm: number;
  timeSignature: { beats: number; noteValue: number };
  measures: number;
  accentPattern?: number[]; // which beats to accent (1-indexed)
}

interface Song {
  id: string;
  title: string;
  notes: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

interface AppState {
  // Data
  songs: Song[];

  // Preferences
  theme: 'light' | 'dark' | 'system';
  metronomeVolume: number; // 0-1
  metronomeSound: 'classic' | 'percussive';

  // Actions - Songs
  createSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;

  // Actions - Sections
  createSection: (songId: string, section: Omit<Section, 'id'>) => void;
  updateSection: (
    songId: string,
    sectionId: string,
    updates: Partial<Section>
  ) => void;
  deleteSection: (songId: string, sectionId: string) => void;
  reorderSections: (songId: string, sectionIds: string[]) => void;

  // Actions - Preferences
  setTheme: (theme: AppState['theme']) => void;
  setMetronomeVolume: (volume: number) => void;
  setMetronomeSound: (sound: AppState['metronomeSound']) => void;
}
```

**Persistence Configuration:**

```typescript
persist(
  (set, get) => ({
    /* state */
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
    migrate: (persistedState, version) => {
      // Handle version migrations
      return persistedState;
    },
  }
);
```

---

## Zustand Best Practices

1. **TypeScript syntax:** `create<State>()(...)` with middleware
2. **Composition:** Small, focused stores
3. **Minimal state:** Only what needs persist/share
4. **Immutable updates:** `set((state) => ({ ...state, newValue }))`
5. **Selector optimization:** Use `useShallow` for multiple picks
6. **Actions in store:** Keep logic close to state
7. **Partialize:** Only persist necessary fields (exclude functions, computed)
8. **Hydration:** Check `hasHydrated()` for initial load
9. **Separation:** UI (ephemeral) vs App (persistent)
10. **Devtools:** Enable in development with `devtools` middleware

---

## Tone.js Integration

### Key Concepts

**Sample-Accurate Timing:**

- Use `Tone.Transport` for scheduling
- `Tone.Loop` or `Tone.Part` for repeated events
- Never use `setTimeout` or `setInterval` for audio

**Metronome Implementation Pattern:**

```typescript
// Create synth/sampler for click sound
const clickSynth = new Tone.MembraneSynth().toDestination();

// Schedule beats
const loop = new Tone.Loop((time) => {
  // Accent first beat
  const velocity = isFirstBeat ? 1.0 : 0.6;
  clickSynth.triggerAttackRelease('C4', '16n', time, velocity);
}, '4n'); // quarter note interval

// Control
Tone.Transport.bpm.value = 120;
loop.start(0);
Tone.Transport.start();
```

**Section Transitions:**

- Pre-calculate section durations in seconds
- Schedule all sections upfront using `Tone.Transport.schedule()`
- Handle tempo changes between sections seamlessly

---

## Design Philosophy

1. **Minimal, distraction-free UI**
2. **One-hand mobile operation**
3. **Clear hierarchy:** Tempo → Meter → Structure
4. **Audio precision > visual effects**
5. **Explicit, deterministic control**
6. **No implicit behavior, no hidden state, no "magic"**
7. **Rehearsal-safe interactions** (phone on floor usage)

---

## Pages & UX

### Home Page

- List of all songs
- Tap song → open Song Page
- Long-press song → delete (with confirmation)
- Action button to create new song
- Theme toggle

### Song Page

- Song title (editable)
- Song notes (editable textarea)
- Ordered list of sections with:
  - Section name
  - BPM display
  - Time signature display
  - Measures count
  - Section Play button
- Long-press section → delete (with confirmation)
- Action button to add new section
- Global Play/Stop control at top
- Back to Home navigation

### About Page

- Devon Loch band information
- Links to website/social media
- Application information
- Developer attribution
- Version info

---

## File Structure

```
time-loch/
├── public/
│   ├── icon.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── stores/
│   │   ├── useUIStore.ts      # Non-persisted UI state
│   │   ├── useAppStore.ts     # Persisted application state
│   │   └── index.ts           # Export all stores
│   ├── lib/
│   │   ├── metronome.ts       # Tone.js metronome logic
│   │   └── utils.ts           # Utilities
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── theme-provider.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── SongList.tsx
│   │   ├── SectionList.tsx
│   │   ├── CreateSongDialog.tsx
│   │   ├── CreateSectionDialog.tsx
│   │   └── DeleteConfirmDialog.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SongPage.tsx
│   │   └── AboutPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── components.json
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Implementation Strategy

### Progressive Development

1. Implement in logical stages
2. Pause after each component to verify
3. Confirm scope before beginning
4. Small → Medium → Large changes

### Code Quality

- **KISS:** Simplest solution that works
- **DRY:** Don't repeat logic
- **Composition over Inheritance**
- **Modularity:** Pure functions, avoid OOP wrappers
- Small, focused functions
- Descriptive names
- Error handling + early returns
- Delete unused code immediately

### Commit Strategy

- Review git diff before commit
- Atomic commits (one logical unit)
- Conventional Commits format:
  - `feat✨:` new feature
  - `fix🐛:` bug fix
  - `refactor♻️:` restructuring
  - `docs📝:` documentation
  - `style💄:` formatting
  - `chore🔧:` maintenance

---

## Technical Decisions

### State Management

- **Zustand over Redux:** Simpler, less boilerplate, no providers
- **Zustand over Context:** Better performance, centralized actions
- **Two stores:** Clear separation UI vs App state
- **Persist middleware:** Offline-first, localStorage

### Audio Engine

- **Tone.js:** Sample-accurate timing, scheduling, transport control
- **Why not Web Audio API directly:** Too low-level, timing complexity
- **Sound profiles:** Multiple click sounds for user preference

### UI Framework

- **shadcn/ui:** Copy-paste components, full control, TypeScript
- **Tailwind CSS:** Utility-first, mobile-responsive, dark mode
- **Why not component library:** Avoid bundle bloat, maintain control

### Routing

- **Client-side state routing:** Single page, Zustand controls navigation
- **Why not React Router:** Overkill for 3 pages, PWA benefits

---

## Key Constraints

1. **No partial section playback** - Always from first measure
2. **No looping** - Play through once, then stop
3. **No resume** - Always restart from beginning
4. **One playback at a time** - Exclusive playback lock
5. **Immutable sections during playback** - No edits while playing
6. **Mobile-first** - Optimize for small screens, touch targets
7. **Offline-first** - Full functionality without network

---

## Development Checklist

### Phase 1: Foundation

- [ ] Set up Vite + TypeScript + React
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui components
- [ ] Create basic file structure
- [ ] Set up PWA (manifest, service worker)

### Phase 2: State Management

- [ ] Create UI Store (useUIStore)
- [ ] Create App Store (useAppStore)
- [ ] Implement persistence middleware
- [ ] Add devtools middleware
- [ ] Test hydration

### Phase 3: Metronome Engine

- [ ] Initialize Tone.js
- [ ] Create metronome class/module
- [ ] Implement click sounds (classic, percussive)
- [ ] Handle tempo changes
- [ ] Handle time signatures
- [ ] Implement accent patterns
- [ ] Section scheduling and transitions

### Phase 4: UI Components

- [ ] Theme provider + toggle
- [ ] Song list component
- [ ] Section list component
- [ ] Create song dialog
- [ ] Create section dialog
- [ ] Delete confirmation dialog
- [ ] Playback controls (Play/Stop)

### Phase 5: Pages

- [ ] Home page
- [ ] Song page
- [ ] About page
- [ ] Navigation logic

### Phase 6: Interactions

- [ ] Tap to select
- [ ] Long-press to delete
- [ ] Playback controls
- [ ] Form validations
- [ ] Error handling

### Phase 7: Polish

- [ ] Responsive design
- [ ] Touch target sizing
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility (ARIA labels)
- [ ] Performance optimization

### Phase 8: PWA

- [ ] Service worker caching
- [ ] Offline functionality
- [ ] Install prompt
- [ ] App icons
- [ ] Splash screen

---

## Testing Strategy

- **Manual testing:** Primary method for UI/UX
- **Audio testing:** Verify timing accuracy with reference metronome
- **Cross-browser:** Chrome, Firefox, Safari (iOS)
- **Mobile testing:** Real devices (Android, iOS)
- **Offline testing:** Airplane mode verification
- **Edge cases:**
  - Empty song list
  - Song with no sections
  - Rapid play/stop
  - Section tempo extremes (35-250 BPM)
  - Complex time signatures (7/8, 5/4, 6/8)

---

## Future Enhancements (Out of Scope v1)

- Export/import songs (JSON)
- Share songs between devices
- Sync across devices (cloud)
- Custom accent patterns per section
- Visual metronome (flashing)
- Count-in before playback
- Click track export (audio file)
- Multiple metronome sound packs
- Practice mode (repeat section N times)
- Tempo trainer (gradual BPM increase)

---

## Reference Links

- [Zustand Docs](https://zustand.docs.pmnd.rs/)
- [Tone.js Docs](https://tonejs.github.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

## Notes for LLM

- **Always check project.md** for core requirements
- **Follow progressive development** - implement in stages
- **Use conventional commits** with emojis
- **Prefer composition over inheritance**
- **Keep state minimal** - only persist what's needed
- **Tone.js is the audio source of truth** - not React state
- **TypeScript strict mode** - no `any` types
- **Mobile-first design** - test on small screens
- **Deterministic playback** - no ambiguity in behavior
- **Immutable updates** - always use Zustand `set` correctly
- **Section ordering matters** - preserve order in array
- **No magic** - explicit, predictable behavior always
