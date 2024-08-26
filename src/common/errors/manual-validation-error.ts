interface ErrorDetails {
  value?: number | string | null;
  error?: string;
  key: string;
  property: string;
  index?: number;
}

export class ManualValidationError extends Error {
  public key!: string;
  public extra?: ErrorDetails;

  constructor(message: string, extra?: ErrorDetails) {
    super(message);

    this.name = 'ManualValidationError';
    this.extra = extra;
  }
}
