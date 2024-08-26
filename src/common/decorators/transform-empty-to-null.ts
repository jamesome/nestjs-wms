import { Transform } from 'class-transformer';

export function TransformEmptyToNull() {
  return Transform(({ value }) => {
    if (value !== null && typeof value === 'string' && value.trim() === '') {
      return null;
    }

    return value;
  });
}
