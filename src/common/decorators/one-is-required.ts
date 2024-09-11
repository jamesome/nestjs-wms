import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'oneIsRequired', async: false })
export class OneIsRequiredConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const [firstProp, secondProp] = args.constraints;
    const obj = args.object as any;
    return !!(obj[firstProp] || obj[secondProp]);
  }

  defaultMessage(args: ValidationArguments) {
    const [firstProp, secondProp] = args.constraints;
    return `Either ${firstProp} or ${secondProp} must be provided`;
  }
}

export function OneIsRequired(
  prop1: string,
  prop2: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'oneIsRequired',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [prop1, prop2],
      validator: OneIsRequiredConstraint,
    });
  };
}
