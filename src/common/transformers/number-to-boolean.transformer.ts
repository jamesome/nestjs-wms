import { ValueTransformer } from 'typeorm';

export class NumberToBooleanTransformer implements ValueTransformer {
  to(value: boolean): number {
    return value ? 1 : 0;
  }

  from(value: number): boolean {
    return !!value;
  }
}
