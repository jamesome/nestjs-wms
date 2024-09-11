import { registerDecorator, ValidationOptions } from 'class-validator';

export function MaxDaysFromNow(
  days: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxDaysFromNow',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!(value instanceof Date)) {
            value = new Date(value);
          }

          const today = new Date();
          const maxDate = new Date();
          maxDate.setDate(today.getDate() - days);

          return value > maxDate;
        },
        // defaultMessage(args: ValidationArguments) {
        //   return '';
        // },
      },
    });
  };
}
