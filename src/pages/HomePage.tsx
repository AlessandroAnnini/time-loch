import { Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongList } from '@/components/SongList';
import { CreateSongDialog } from '@/components/CreateSongDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ModeToggle } from '@/components/mode-toggle';
import { useUIStore } from '@/stores/useUIStore';

export function HomePage() {
  const openCreateSongDialog = useUIStore((state) => state.openCreateSongDialog);
  const navigateTo = useUIStore((state) => state.navigateTo);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <h1 className="text-xl font-bold">Time Loch</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo('about')}
              aria-label="About"
            >
              <Info className="h-5 w-5" />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <SongList />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={openCreateSongDialog}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          aria-label="Create new song"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <CreateSongDialog />
      <DeleteConfirmDialog />
    </div>
  );
}
