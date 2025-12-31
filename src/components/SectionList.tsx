import { Music, Play, Trash2, GripVertical, Edit2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useUIStore } from '@/stores/useUIStore';
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

interface SortableSectionItemProps {
  section: {
    id: string;
    name: string;
    bpm: number;
    timeSignature: { beats: number; noteValue: number };
    measures: number;
  };
  index: number;
  songId: string;
  isPlaying: boolean;
  isCurrentlyPlaying: boolean;
  currentMeasure: number;
  onPlay: (e: React.MouseEvent, index: number) => void;
  onEdit: (e: React.MouseEvent, sectionId: string) => void;
  onDelete: (e: React.MouseEvent, sectionId: string) => void;
}

function SortableSectionItem({
  section,
  index,
  isPlaying,
  isCurrentlyPlaying,
  currentMeasure,
  onPlay,
  onEdit,
  onDelete,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
        isCurrentlyPlaying ? 'bg-primary/20 border-primary' : 'bg-card'
      } ${isPlaying && !isCurrentlyPlaying ? 'opacity-50' : ''} ${
        isDragging ? 'opacity-50 z-50' : ''
      }`}>
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

      <button
        onClick={(e) => onPlay(e, index)}
        disabled={isPlaying}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shrink-0 hover:bg-primary/90 transition-colors"
        aria-label={`Play ${section.name}`}>
        <Play className="h-5 w-5 fill-current" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{section.name}</div>
        <div className="text-sm text-muted-foreground">
          {section.bpm} BPM • {section.timeSignature.beats}/
          {section.timeSignature.noteValue} • {section.measures}{' '}
          {section.measures === 1 ? 'measure' : 'measures'}
        </div>
      </div>

      {isCurrentlyPlaying && currentMeasure > 0 && (
        <div className="flex items-center justify-center px-4">
          <div className="text-3xl font-bold leading-tight text-center">
            {currentMeasure}/{section.measures}
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
        onClick={(e) => onEdit(e, section.id)}
        disabled={isPlaying}
        aria-label="Edit section">
        <Edit2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        onClick={(e) => onDelete(e, section.id)}
        disabled={isPlaying}
        aria-label="Delete section">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface SectionListProps {
  songId: string;
}

export function SectionList({ songId }: SectionListProps) {
  const songs = useAppStore((state) => state.songs);
  const reorderSections = useAppStore((state) => state.reorderSections);
  const isPlaying = useUIStore((state) => state.isPlaying);
  const currentSongId = useUIStore((state) => state.currentSongId);
  const currentSectionIndex = useUIStore((state) => state.currentSectionIndex);
  const currentMeasureInSection = useUIStore(
    (state) => state.currentMeasureInSection
  );
  const openDeleteDialog = useUIStore((state) => state.openDeleteDialog);
  const openEditSectionDialog = useUIStore(
    (state) => state.openEditSectionDialog
  );
  const startSectionPlayback = useUIStore(
    (state) => state.startSectionPlayback
  );

  const song = songs.find((s) => s.id === songId);
  const sections = song?.sections || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(
        (section) => section.id === active.id
      );
      const newIndex = sections.findIndex((section) => section.id === over.id);
      const reorderedSections = arrayMove(sections, oldIndex, newIndex);
      reorderSections(
        songId,
        reorderedSections.map((section) => section.id)
      );
    }
  };

  const handlePlay = (e: React.MouseEvent, sectionIndex: number) => {
    e.stopPropagation();
    if (!isPlaying) {
      startSectionPlayback(songId, sectionIndex);
    }
  };

  const handleEdit = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    openEditSectionDialog(sectionId);
  };

  const handleDelete = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    openDeleteDialog('section', sectionId, songId);
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Music className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No sections yet. Tap the + button to add sections.
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
        items={sections.map((section) => section.id)}
        strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              index={index}
              songId={songId}
              isPlaying={isPlaying}
              isCurrentlyPlaying={
                isPlaying &&
                currentSongId === songId &&
                currentSectionIndex === index
              }
              currentMeasure={currentMeasureInSection}
              onPlay={handlePlay}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
