import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// args 중에 하나는 반드시 필요
@ValidatorConstraint({ name: 'oneIsRequired ', async: false })
export class OneIsRequired implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments) {
    const [prop1, prop2] = args.constraints;
    const object = args.object as any;
    return object[prop1] || object[prop2];
  }

  defaultMessage(args: ValidationArguments) {
    const [prop1, prop2] = args.constraints;
    return `Either ${prop1} or ${prop2} must be provided`;
  }
}
