import { toast } from 'sonner';

/**
 * Validates that a string is not empty after trimming
 * Shows error toast if validation fails
 */
export function validateRequired(
  value: string,
  fieldName: string
): value is string {
  if (!value.trim()) {
    toast.error('Validation Error', {
      description: `${fieldName} is required.`,
    });
    return false;
  }
  return true;
}

/**
 * Validates that a number is within a range
 * Shows error toast if validation fails
 */
export function validateRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): boolean {
  if (value < min || value > max) {
    toast.error('Validation Error', {
      description: `${fieldName} must be between ${min} and ${max}.`,
    });
    return false;
  }
  return true;
}

/**
 * Validates BPM value (35-250)
 */
export function validateBPM(bpm: number): boolean {
  return validateRange(bpm, 'BPM', 35, 250);
}

/**
 * Validates measures count (1-999)
 */
export function validateMeasures(measures: number): boolean {
  return validateRange(measures, 'Measures', 1, 999);
}
