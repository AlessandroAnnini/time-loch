import { ArrowLeft, ExternalLink, Github, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useUIStore } from '@/stores/useUIStore';

export function AboutPage() {
  const navigateTo = useUIStore((state) => state.navigateTo);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
        role="banner">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('home')}
            aria-label="Back to songs list">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold ml-2">About</h1>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 max-w-2xl" role="main">
        <div className="space-y-10">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img
                src="/splash.png"
                alt="Time Loch"
                className="max-h-150 w-full max-w-md object-contain rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Time Loch</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A metronome app designed for musicians who practice with complex
                song structures. Define your song once, then focus on playing -
                Time Loch handles the tempo changes, time signatures, and
                section transitions automatically.
              </p>
            </div>
          </div>

          {/* Band Information */}
          <section aria-labelledby="band-heading" className="space-y-4">
            <h2 id="band-heading" className="text-2xl font-bold">
              Devon Loch
            </h2>
            <nav aria-label="Devon Loch links">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="https://devonloch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Website
                </a>
                <a
                  href="https://facebook.com/devonlochband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Facebook
                </a>
                <a
                  href="https://instagram.com/devonlochband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Instagram
                </a>
              </div>
            </nav>
          </section>

          {/* Key Features */}
          <section aria-labelledby="features-heading" className="space-y-4">
            <h2 id="features-heading" className="text-2xl font-bold">
              What Makes It Special
            </h2>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <h3 className="font-semibold">🎼 Section-Based Design</h3>
                <p className="text-sm text-muted-foreground">
                  Create songs with unlimited sections, each with its own BPM,
                  time signature, and measure count. Perfect for prog rock,
                  jazz, and complex arrangements.
                </p>
              </div>
              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <h3 className="font-semibold">⚡ Sample-Accurate Timing</h3>
                <p className="text-sm text-muted-foreground">
                  Powered by Tone.js Web Audio API with Transport scheduling.
                  Professional-grade accuracy that musicians can trust.
                </p>
              </div>
              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <h3 className="font-semibold">📱 Rehearsal-Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Mobile-first PWA that works offline. Real-time measure counter
                  with bold text readable from your music stand. One-hand
                  operation while playing.
                </p>
              </div>
              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <h3 className="font-semibold">🎯 Deterministic Playback</h3>
                <p className="text-sm text-muted-foreground">
                  No loops, no resume, no surprises. It does exactly what you
                  expect, every time. Drag to reorder sections, edit anytime.
                </p>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section
            aria-labelledby="tech-heading"
            className="space-y-3 bg-muted/50 rounded-lg p-6">
            <h2 id="tech-heading" className="text-xl font-bold">
              Built With
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'React 19',
                'TypeScript',
                'Zustand',
                'Tone.js',
                'Tailwind CSS',
                'shadcn/ui',
                'Vite',
                'Vitest',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-background border rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Developer & Links */}
          <section aria-labelledby="developer-heading" className="space-y-4">
            <h2 id="developer-heading" className="text-2xl font-bold">
              Open Source
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              Crafted with passion by{' '}
              <span className="font-semibold text-foreground">
                Alessandro Annini
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://github.com/AlessandroAnnini/time-loch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium">
                <Github className="h-5 w-5" aria-hidden="true" />
                View on GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/alessandroannini/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium">
                <ExternalLink className="h-5 w-5" aria-hidden="true" />
                LinkedIn Profile
              </a>
            </div>
            <p className="text-sm text-muted-foreground text-center pt-4">
              MIT License • Free and open source forever
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
