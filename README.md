# Time Loch 🎵

A Progressive Web App (PWA) metronome designed for musicians working with complex song structures. Built specifically for Devon Loch band to practice compositions with multiple sections, varying tempos, and diverse time signatures.

## Features

### Core Functionality
- **Multi-Section Songs**: Create songs with unlimited sections, each with independent settings
- **Flexible Tempo Control**: BPM range from 35 to 250 for any playing style
- **Advanced Time Signatures**: Support for common and odd meters (3/4, 4/4, 5/4, 6/8, 7/8, etc.)
- **Precise Audio Timing**: Sample-accurate playback using Tone.js Web Audio API
- **Section Playback**: Play individual sections or entire songs seamlessly

### User Experience
- **Mobile-First Design**: Optimized for touch interactions and small screens
- **Dark/Light Theme**: Persistent theme preference with system detection
- **Offline Support**: Full PWA functionality works without internet
- **Touch Gestures**: Long-press to delete, tap to select
- **Visual Feedback**: Toast notifications for all actions
- **Accessibility**: WCAG compliant with ARIA labels and keyboard navigation

### Data Management
- **Local Storage**: All songs persist in browser localStorage
- **CRUD Operations**: Create, read, update, delete songs and sections
- **Auto-Save**: Changes saved immediately on blur
- **Section Reordering**: Organize sections in any order

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript** - Type safety
- **Vite 7.2.4** - Build tool with HMR
- **Zustand** - State management with persistence
- **Tone.js** - Web Audio API wrapper for accurate timing
- **Tailwind CSS 4.1.18** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Sonner** - Toast notifications
- **vite-plugin-pwa** - PWA capabilities with Workbox

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

### Creating Songs
1. Click the **+** floating action button on the home page
2. Enter song title and optional notes
3. Click **Create** to save

### Adding Sections
1. Open a song by tapping it
2. Click **Add Section** button
3. Configure: section name, BPM (35-250), time signature, measures
4. Click **Create Section**

### Playback
- **Play Song**: Use the Play button at the top of the song page
- **Play Section**: Tap the play icon on any section
- **Stop**: Click the Stop button during playback

### Deleting Items
- **Long-press** (500ms) on any song or section to trigger delete confirmation

## Architecture

### State Management
- **App Store** (Persistent): Songs, theme, metronome settings
- **UI Store** (Ephemeral): Playback state, navigation, dialogs

### Audio Engine
The MetronomeEngine uses Tone.js for sample-accurate timing with Transport.schedule()

## Testing

Use the MetronomeTest component to validate BPM extremes, time signatures, and accuracy.

## Accessibility

- Semantic HTML5 landmarks
- ARIA labels on all interactive elements
- Keyboard navigation support
- WCAG AA color contrast
- Touch targets ≥ 44x44px

## PWA Features

- Installable on iOS/Android
- Offline capable with service worker
- Custom splash screen and icons

## License

MIT License

## Credits

Built with ❤️ for [Devon Loch](https://devonloch.com)
