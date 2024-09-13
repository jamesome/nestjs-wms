import { Transaction } from 'src/modules/transaction/entities/transaction.entity';

export function createTransaction(
  overrides: Partial<Transaction> = {},
): Transaction {
  const transaction = new Transaction();

  Object.assign(transaction, overrides);

  return transaction;
}
