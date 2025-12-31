import { useState } from 'react';

/**
 * Hook for inline editing functionality
 * Manages editing state and provides save/cancel handlers
 *
 * @param initialValue - The initial value to edit
 * @param onSave - Callback when save is triggered
 * @param options - Optional configuration
 * @param options.allowEmpty - Whether to allow saving empty values (default: false)
 * @returns Object with editing state and handler functions
 *
 * @example
 * const titleEdit = useInlineEdit(song.title, (value) => {
 *   updateSong(song.id, { title: value });
 * });
 *
 * const notesEdit = useInlineEdit(song.notes, (value) => {
 *   updateSong(song.id, { notes: value });
 * }, { allowEmpty: true });
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
  onSave: (value: string) => void,
  options?: { allowEmpty?: boolean }
) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const allowEmpty = options?.allowEmpty ?? false;

  const startEditing = () => {
    setValue(initialValue);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = value.trim();

    // If empty values are allowed, save regardless
    if (allowEmpty) {
      if (trimmedValue !== initialValue) {
        onSave(trimmedValue);
      }
    } else {
      // Only save if value has changed and is not empty
      if (trimmedValue && trimmedValue !== initialValue) {
        onSave(trimmedValue);
      } else if (!trimmedValue) {
        // Reset to initial value if empty
        setValue(initialValue);
      }
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
