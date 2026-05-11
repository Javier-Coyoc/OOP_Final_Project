export abstract class PaymentDef {
  protected amount!: number;

  abstract getAmount(): number;
  abstract setAmount(amount: number): void;
  abstract processPayment(): boolean;
  abstract displayPaymentInfo(): void;
}
