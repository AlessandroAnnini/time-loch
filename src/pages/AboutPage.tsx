import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useUIStore } from '@/stores/useUIStore';

export function AboutPage() {
  const navigateTo = useUIStore((state) => state.navigateTo);

  return (
        <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60" role="banner">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('home')}
            aria-label="Back to songs list"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">About</h1>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 max-w-2xl" role="main">
        <div className="space-y-8">
          {/* Band Information */}
          <section aria-labelledby="band-heading">
            <h2 id="band-heading" className="text-2xl font-bold">Devon Loch</h2>
                        <p className="text-muted-foreground">
              Time Loch is a metronome application designed for Devon Loch,
              a progressive rock band that creates complex musical compositions
              with varying tempos and time signatures.
            </p>
            <nav aria-label="Devon Loch links">
              <div className="flex flex-col gap-2">
                <a
                  href="https://devonloch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  Website
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://facebook.com/devonlochband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  Facebook
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://instagram.com/devonlochband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  Instagram
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </nav>
          </section>

          {/* Application Information */}
          <section aria-labelledby="app-heading">
            <h2 id="app-heading" className="text-2xl font-bold">Time Loch</h2>
            <p className="text-muted-foreground">
              Time Loch is a Progressive Web App (PWA) metronome designed
              specifically for musicians who work with complex song structures.
              It allows you to create songs with multiple sections, each with
              its own tempo, time signature, and duration.
            </p>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Features</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Multiple sections per song with different tempos</li>
                <li>
                  Support for various time signatures (3/4, 4/4, 5/4, 6/8, 7/8,
                  etc.)
                </li>
                <li>Sample-accurate audio timing using Tone.js</li>
                <li>Progressive Web App - works offline</li>
                <li>Dark/Light theme support</li>
                <li>Mobile-first responsive design</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          </section>

          {/* Developer Attribution */}
          <section aria-labelledby="developer-heading">
            <h2 id="developer-heading" className="text-2xl font-bold">Developer</h2>
            <p className="text-muted-foreground">
              Developed with ❤️ for Devon Loch
            </p>
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, Zustand, Tone.js, and Tailwind CSS
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
