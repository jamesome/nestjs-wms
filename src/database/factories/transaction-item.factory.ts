// factories/transaction-item.factory.ts

import { TransactionItem } from 'src/modules/transaction-item/entities/transaction-item.entity';

export function createTransactionItem(
  overrides: Partial<TransactionItem> = {},
): TransactionItem {
  const transactionItem = new TransactionItem();

  Object.assign(transactionItem, overrides);
  return transactionItem;
}
