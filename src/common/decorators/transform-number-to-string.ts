import { Transform } from 'class-transformer';

export function TransformNumberToString() {
  return Transform(({ value }) => {
    if (typeof value === 'number') {
      return String(value);
    }

    return value;
  });
}
