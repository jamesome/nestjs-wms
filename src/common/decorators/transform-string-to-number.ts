import { Transform } from 'class-transformer';

export function TransformStringToNumber() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value);
    }

    return value;
  });
}
