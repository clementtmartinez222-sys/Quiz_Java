import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const requiredTrimmed: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { required: true };

export function maxUtf8Bytes(maxBytes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value !== 'string') return null;
    const actualBytes = new TextEncoder().encode(control.value).length;
    return actualBytes <= maxBytes
      ? null
      : { maxUtf8Bytes: { requiredLength: maxBytes, actualLength: actualBytes } };
  };
}
