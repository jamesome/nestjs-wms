import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// endDate - startData 차이
// EX) @IsWithinMaxRange('startDate', 30)
export function IsWithinMaxRange(
  startDateProperty: string,
  maxDays: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWithinMaxRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(endDate: Date, args: ValidationArguments) {
          const startDate = (args.object as any)[startDateProperty];
          const diffInTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffInDays = diffInTime / (1000 * 3600 * 24);

          return diffInDays <= maxDays;
        },
      },
      constraints: [startDateProperty, maxDays], // {constraints.0}, {constraints.1}
    });
  };
}
