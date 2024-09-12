import { isValidationOptions, ValidationOptions } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

function getMessage(ruleName: string, validationArgs: object) {
  return i18nValidationMessage(`validation.rules.${ruleName}`, validationArgs);
}

export function I18nValidate(rule, ...args) {
  return function (dto: object, property: string) {
    const resourceName = dto.constructor.name
      .replace(/^Create|Update|Delete|Find|Receive|Ship|Move/, '')
      .replace(/Dto$/, '');
    const validationArgs: {
      resource: string;
      options?: (object | undefined)[];
    } = {
      resource: resourceName,
    };

    if (rule.name === 'IsEnum') {
      const firstArgument: [object | undefined] = args[0];
      if (firstArgument !== undefined) {
        validationArgs.options = Object.values(firstArgument);
      }
    }

    const lastArgument: [ValidationOptions | undefined] = args[args.length - 1];
    if (typeof lastArgument === 'object' && isValidationOptions(lastArgument)) {
      if (lastArgument.message === undefined) {
        lastArgument.message = getMessage(rule.name, validationArgs);
      }
    } else {
      args.push({
        message: getMessage(rule.name, validationArgs),
      });
    }
    return rule(...args)(dto, property);
  };
}
