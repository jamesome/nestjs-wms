import { Expose } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateItemSerialDto {
  @MaxLength(50, {
    message: i18nValidationMessage('validation.rules.MAX_LENGTH', {
      message: 'item_serial.serial_no',
    }),
  })
  @Expose({ name: 'serial_no' })
  serialNo!: string;
}
