import { useState } from 'react';

/**
 * Hook for inline editing functionality
 * Manages editing state and provides save/cancel handlers
 *
 * @param initialValue - The initial value to edit
 * @param onSave - Callback when save is triggered
 * @returns Object with editing state and handler functions
 *
 * @example
 * const titleEdit = useInlineEdit(song.title, (value) => {
 *   updateSong(song.id, { title: value });
 * });
 *
 * // In JSX:
 * {titleEdit.isEditing ? (
 *   <Input
 *     value={titleEdit.value}
 *     onChange={(e) => titleEdit.setValue(e.target.value)}
 *     onKeyDown={(e) => {
 *       if (e.key === 'Enter') titleEdit.handleSave();
 *       if (e.key === 'Escape') titleEdit.handleCancel();
 *     }}
 *   />
 * ) : (
 *   <div onClick={titleEdit.startEditing}>{song.title}</div>
 * )}
 */
export function useInlineEdit(
  initialValue: string,
  onSave: (value: string) => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const startEditing = () => {
    setValue(initialValue);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = value.trim();

    // Only save if value has changed and is not empty
    if (trimmedValue && trimmedValue !== initialValue) {
      onSave(trimmedValue);
    } else if (!trimmedValue) {
      // Reset to initial value if empty
      setValue(initialValue);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  return {
    isEditing,
    value,
    setValue,
    startEditing,
    handleSave,
    handleCancel,
  };
}
