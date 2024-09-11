import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { I18nValidate } from 'src/common/decorators/i18n-validate.decorator';
import { Category, InputType, SlipStatus } from 'src/modules/enum';

export class CreateTransactionDto {
  @I18nValidate(IsNotEmpty)
  transactionGroupId!: number;

  @I18nValidate(IsNotEmpty)
  slipNumber!: string;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsEnum, Category)
  category!: Category;

  @I18nValidate(IsNotEmpty)
  @I18nValidate(IsEnum, InputType)
  inputType!: InputType;

  @I18nValidate(IsNotEmpty)
  // @I18nValidate(IsEnum, SlipStatus)
  status!: SlipStatus | SlipStatus[];

  createWorker!: string;

  @IsOptional()
  completedAt?: Date | null = null;

  @IsOptional()
  isHold?: boolean;
}
