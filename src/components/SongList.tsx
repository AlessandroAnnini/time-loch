import { useAppStore, useUIStore } from '@/stores';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSongItemProps {
  song: {
    id: string;
    title: string;
    sections: unknown[];
    notes?: string;
  };
  isPlaying: boolean;
  onNavigate: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function SortableSongItem({
  song,
  isPlaying,
  onNavigate,
  onDelete,
}: SortableSongItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        border rounded-lg p-4 transition-all
        ${
          isPlaying
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-accent'
        }
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
      onClick={!isPlaying ? onNavigate : undefined}>
      <div className="flex items-start justify-between gap-4">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPlaying}
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{song.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{song.sections.length} sections</span>
            {song.notes && (
              <span className="truncate flex-1">{song.notes}</span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={onDelete}
          disabled={isPlaying}
          aria-label="Delete song">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SongList() {
  const songs = useAppStore((state) => state.songs);
  const reorderSongs = useAppStore((state) => state.reorderSongs);
  const navigateTo = useUIStore((state) => state.navigateTo);
  const openDeleteConfirm = useUIStore((state) => state.openDeleteConfirm);
  const isPlaying = useUIStore((state) => state.isPlaying);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex((song) => song.id === active.id);
      const newIndex = songs.findIndex((song) => song.id === over.id);
      const reorderedSongs = arrayMove(songs, oldIndex, newIndex);
      reorderSongs(reorderedSongs.map((song) => song.id));
    }
  };

  const handleDelete = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    openDeleteConfirm({ type: 'song', id: songId });
  };

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first song to start structuring your rehearsals with
          tempo-accurate sections.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}>
      <SortableContext
        items={songs.map((song) => song.id)}
        strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          {songs.map((song) => (
            <SortableSongItem
              key={song.id}
              song={song}
              isPlaying={isPlaying}
              onNavigate={() => navigateTo('song', song.id)}
              onDelete={(e) => handleDelete(e, song.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
