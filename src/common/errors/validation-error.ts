interface constraints {
  key: string;
  value: string;
}
interface ErrorDetails {
  rule?: string;
  value?: string | null;
  property?: string;
  children?: any[];
  constraints?: constraints;
}

export class ValidationError extends Error {
  public key!: string;
  public extra?: ErrorDetails;

  constructor(message: string, extra?: ErrorDetails) {
    super(message);

    this.name = 'ValidationError';
    this.extra = extra;
  }
}
