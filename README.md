# Time Loch 🎵

An advanced metronome Progressive Web App (PWA) designed for musicians working with complex song structures. Built specifically for the band **[Devon Loch](https://devonloch.com)** to rehearse progressive rock compositions with multiple sections, varying tempos, and diverse time signatures.

**Name Origin:** A wordplay between **Devon Loch** (band name) + **Time Lock** (locking tempo/rhythm) = **Time Loch**

## Overview

Time Loch structures songs into clearly defined, tempo-accurate sections, helping musicians rehearse transitions and practice entire arrangements with maximum rhythmic precision. Designed for rehearsal environments where the phone sits on the floor—minimal visual noise, fast one-hand interactions, and deterministic playback behavior.

## Features

### Core Functionality
- **Multi-Section Songs**: Create songs with unlimited sections, each with independent tempo, time signature, and duration
- **Sample-Accurate Timing**: Uses Tone.js Web Audio API with Transport scheduling for professional-grade accuracy
- **BPM Range**: 35-250 BPM (industry standard for metronomes)
- **Time Signatures**: Support for simple (4/4, 3/4), compound (6/8, 9/8), and odd meters (5/4, 7/8)
- **Accent Patterns**: First beat accent by default, with optional custom patterns
- **Deterministic Playback**: No loops, no resume, no partial sections—always predictable behavior
- **Song-Level Playback**: Play entire song from start to finish with automatic section transitions
- **Section-Level Playback**: Start from any section and play through to the end

### User Experience
- **Mobile-First Design**: Optimized for touch interactions with 44x44px minimum touch targets
- **One-Hand Operation**: All critical functions accessible with thumb on phone
- **Dark/Light Theme**: Persistent theme preference with system detection
- **Offline-First**: Full PWA functionality without internet connection
- **Touch Gestures**: Long-press (500ms) to delete, tap to select/play
- **Visual Feedback**: Toast notifications for all user actions
- **Accessibility**: WCAG AA compliant with semantic HTML, ARIA labels, keyboard navigation
- **Rehearsal-Safe**: Phone-on-floor usage pattern with clear visual hierarchy

### Data Management
- **Local Storage Persistence**: All songs and settings stored in browser localStorage
- **Two-Store Architecture**: Separate UI state (ephemeral) and App state (persistent) using Zustand
- **CRUD Operations**: Full create, read, update, delete for songs and sections
- **Immutable Playback**: No edits allowed while metronome is playing
- **Section Ordering**: Maintains strict order—never ambiguous

## Tech Stack

### Frontend
- **React 19.2.0** - Functional components with hooks
- **TypeScript (strict mode)** - Full type safety, no `any` types
- **Vite 7.2.4** - Fast build tool with Hot Module Replacement

### State Management
- **Zustand** - Lightweight state management with two stores:
  - **UI Store** (ephemeral): Playback state, navigation, dialogs
  - **App Store** (persistent): Songs, sections, theme, metronome settings
- **Persist Middleware** - localStorage with partialize for selective persistence

### Audio Engine
- **Tone.js** - Web Audio API wrapper for:
  - Sample-accurate timing via Transport.schedule()
  - Tempo changes and time signature handling
  - Multiple click sound profiles (classic, percussive)
  - Section scheduling and transitions

### UI & Styling
- **Tailwind CSS 4.1.18** - Utility-first styling with dark mode
- **shadcn/ui** - Copy-paste accessible component library
- **Sonner** - Toast notification system
- **Lucide React** - Icon library
- **next-themes** - Theme provider with system detection

### PWA
- **vite-plugin-pwa** - Service worker generation with Workbox
- **Offline caching** - Precache strategies for all assets
- **Install prompts** - iOS and Android support with custom icons

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or pnpm

### Installation

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Visit \`http://localhost:5173\` to see the app.

### Build for Production

\`\`\`bash
# Create production build
npm run build

# Preview production build
npm run preview
\`\`\`

## Usage

### Home Page
- **View Songs**: Scrollable list of all created songs
- **Create Song**: Tap the **+** floating action button
- **Open Song**: Tap any song card to view details
- **Delete Song**: Long-press (500ms) on song card → confirm deletion
- **About**: Info icon in header for band information

### Song Page
- **Edit Title**: Tap title to edit inline, auto-saves on blur
- **Edit Notes**: Tap notes textarea, auto-saves on blur
- **View Sections**: Ordered list showing BPM, time signature, measures
- **Add Section**: Tap **+ Add Section** button
- **Play Song**: Play button plays from first section through to end
- **Play Section**: Tap play icon on section to start from that section
- **Stop Playback**: Stop button appears during playback (disables all play buttons)
- **Delete Section**: Long-press (500ms) on section → confirm deletion

### Creating Sections
1. Tap **Add Section** on song page
2. Configure:
   - **Section name** (e.g., "Intro", "Verse 1")
   - **BPM** (35-250, validated)
   - **Time signature** (beats/measure, note value)
   - **Measures** (1-999, validated)
3. Tap **Create Section**

### Playback Model
- **Song-Level**: Plays all sections in order from start to finish
- **Section-Level**: Starts at selected section, plays through to song end
- **No Loops**: Playback never repeats, always stops at song end
- **No Resume**: Always starts from first measure of section
- **No Partial**: Never starts mid-section or mid-measure
- **Exclusive**: Only one playback active at a time

## Architecture

### Design Philosophy
1. **Minimal UI**: Distraction-free, rehearsal-focused interface
2. **Deterministic Behavior**: No implicit actions, no hidden state, no "magic"
3. **Audio Precision**: Timing accuracy over visual effects
4. **Explicit Control**: Users always know what will happen
5. **Composition over Inheritance**: Functional React patterns, avoid classes
6. **DRY & KISS**: Simple solutions, shared utilities, no repetition
7. **Mobile-First**: One-hand operation, large touch targets

### State Management (Zustand)

**Two-Store Separation:**

1. **UI Store** (Ephemeral - No Persistence)
   - Playback state: `isPlaying`, `currentSongId`, `currentSectionIndex`
   - Navigation: `currentPage`, `selectedSongId`
   - Dialogs: `isCreateSongDialogOpen`, `deleteTarget`
   - Actions: `startSongPlayback()`, `stopPlayback()`, `navigateTo()`

2. **App Store** (Persistent - localStorage)
   - Data: `songs[]` with nested `sections[]`
   - Preferences: `theme`, `metronomeVolume`, `metronomeSound`
   - Actions: `createSong()`, `updateSong()`, `deleteSong()`, `createSection()`
   - Migrations: Version-based schema updates

### Audio Engine (Tone.js)

**MetronomeEngine Class:**
- **Transport Scheduling**: Pre-schedules all sections upfront for seamless transitions
- **BPM Handling**: Dynamic tempo changes between sections via `Tone.Transport.bpm.value`
- **Accent Patterns**: First beat accented by default (velocity 1.0 vs 0.6)
- **Sound Profiles**: Classic (Synth) vs Percussive (MembraneSynth)
- **Completion Callback**: Triggers `stopPlayback()` when all sections finish

**Why Not Web Audio API Directly:**
- Too low-level for complex scheduling
- Tone.js provides Transport abstraction and sample-accurate timing
- Built-in BPM/tempo handling

### File Structure
```
src/
├── stores/
│   ├── useUIStore.ts      # Ephemeral state
│   ├── useAppStore.ts     # Persistent state
│   └── index.ts           # Barrel export
├── lib/
│   ├── metronome.ts       # Tone.js engine
│   ├── utils.ts           # cn() utility
│   ├── constants.ts       # LONG_PRESS_DURATION
│   └── validation.ts      # Form validators
├── hooks/
│   └── usePlaybackManager.ts  # React-Tone.js integration
├── components/
│   ├── ui/                # shadcn components
│   ├── ErrorBoundary.tsx  # Error catching
│   ├── SongList.tsx       # Home page list
│   ├── SectionList.tsx    # Song page list
│   ├── PlaybackControls.tsx
│   └── *Dialog.tsx        # Modals
├── pages/
│   ├── HomePage.tsx
│   ├── SongPage.tsx
│   └── AboutPage.tsx
└── types/
    └── index.ts           # Centralized types
```

## Testing

### Manual Testing Strategy
- **UI/UX**: Primary method for component interaction
- **Audio Accuracy**: Verify against reference metronome
- **Cross-Browser**: Chrome, Firefox, Safari (iOS)
- **Mobile Devices**: Real Android and iOS devices
- **Offline Mode**: Airplane mode verification

### Edge Cases to Test
- Empty song list (empty state rendering)
- Song with no sections (empty state rendering)
- Rapid play/stop (race conditions)
- BPM extremes (35 BPM, 250 BPM)
- Complex time signatures (7/8, 5/4, 6/8)
- Section transitions with tempo changes

### MetronomeTest Component
Located in `src/components/MetronomeTest.tsx` - validates:
- BPM extremes
- Various time signatures (4/4, 3/4, 6/8, 5/4, 7/8)
- Section transitions
- Accent patterns

## Accessibility (WCAG AA)

- **Semantic HTML5**: `<header>`, `<main>`, `<nav>`, `<section>` landmarks
- **ARIA Labels**: All buttons have descriptive labels
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Color Contrast**: Passes WCAG AA standards in both themes
- **Touch Targets**: Minimum 44x44px (iOS Human Interface Guidelines)
- **Screen Reader**: Compatible with VoiceOver and TalkBack
- **Focus Management**: Visible focus indicators on all interactive elements

## PWA Features

### Installation
- **iOS**: Add to Home Screen from Safari
- **Android**: Install prompt automatically appears
- **Desktop**: Install from Chrome/Edge address bar

### Offline Support
- **Service Worker**: Workbox-generated with precaching
- **Cache-First Strategy**: Assets loaded from cache when offline
- **Runtime Caching**: Google Fonts cached for 1 year
- **Fallback**: All core functionality works without network

### Assets
- **Icons**: 192x192, 512x512, 1024x1024 (maskable)
- **Splash Screen**: Custom splash.png for iOS
- **Manifest**: Full web app manifest with theme colors
- **Display Mode**: Standalone (hides browser chrome)

## Best Practices Implemented

### Code Quality
- **Composition over Inheritance**: Zero class inheritance, functional composition via hooks
- **DRY (Don't Repeat Yourself)**: Shared constants, validation utilities, reusable components
- **KISS (Keep It Simple)**: Minimal abstractions, direct store actions, simple routing
- **Modularity**: Pure functions, isolated concerns, clear boundaries
- **TypeScript Strict Mode**: No `any` types, full type safety
- **Immutable Updates**: Zustand state updates never mutate directly

### Metronome Best Practices
- **BPM Range**: 35-250 (industry standard)
- **Practice Technique**: Start slow (40-60 BPM below target), increase by 2-5 BPM increments
- **Accent Patterns**: First beat accented to identify measure boundaries
- **Time Signatures**: Proper handling of simple, compound, and odd meters
- **Sample Accuracy**: Tone.js Transport scheduling, never setTimeout/setInterval

### Security & Performance
- **No External Dependencies for Core Features**: All data stored locally
- **Error Boundary**: Catches React/Tone.js errors, prevents app crash
- **Bundle Size**: 609 KB (179 KB gzipped) - acceptable for audio library
- **Code Splitting**: Considered but not needed (single-page app, all features used)
- **Lighthouse Score**: Optimized for Performance, Accessibility, Best Practices, SEO

## Future Enhancements (Out of Scope v1)

- Export/import songs (JSON format)
- Cloud sync across devices
- Custom accent patterns per section
- Visual metronome (flashing screen)
- Count-in before playback (1-2 measures)
- Click track export as audio file
- Multiple sound packs (wood block, cowbell, etc.)
- Practice mode (repeat section N times)
- Tempo trainer (gradual BPM increase per loop)
- Subdivision display (8th notes, 16th notes)

## Contributing

This project follows conventional commits with emojis:
- `feat✨:` New feature
- `fix🐛:` Bug fix
- `refactor♻️:` Code restructuring
- `docs📝:` Documentation
- `style💄:` Formatting
- `chore🔧:` Maintenance

## License

MIT License

## Developer

Built with ❤️ by [Alessandro Annini](https://www.linkedin.com/in/alessandroannini/) for [Devon Loch](https://devonloch.com) band.

**Devon Loch** is a progressive rock band that creates complex musical compositions with varying tempos and time signatures.

- Website: [devonloch.com](https://devonloch.com)
- Facebook: [@devonlochband](https://facebook.com/devonlochband)
- Instagram: [@devonlochband](https://instagram.com/devonlochband)

## Version

**1.0.0** - December 2025
