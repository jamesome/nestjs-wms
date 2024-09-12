import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const MAX_DATE_RANGE = 'maxDateRange';

export function maxDateRange(
  date1: Date,
  date2: Date,
  maxDays: number,
): boolean {
  const diffInTime = Math.abs(date1.getTime() - date2.getTime());
  const diffInDays = diffInTime / (1000 * 3600 * 24);
  return diffInDays <= maxDays;
}

export function MaxDateRange(
  property: string,
  maxDays: number,
  validationOtions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: MAX_DATE_RANGE,
      constraints: [property, maxDays],
      validator: {
        validate: (value, args): boolean =>
          maxDateRange(
            value,
            (args?.object || {})[args?.constraints[0]],
            args?.constraints[1],
          ),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            'The period between $property and $constraint1 cannot exceed $constraint2 days.',
          validationOtions,
        ),
      },
    },
    validationOtions,
  );
}
