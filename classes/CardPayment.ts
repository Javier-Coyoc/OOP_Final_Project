import { PaymentDef } from "./PaymentDef";

export class CardPayment extends PaymentDef {
  private last4: string;
  private cardType: string;

  constructor(amount: number, last4: string, cardType: string) {
    super();
    this.setAmount(amount);
    this.last4    = last4;
    this.cardType = cardType;
  }

  getAmount(): number             { return this.amount; }
  setAmount(amount: number): void { this.amount   = amount; }
  getLast4(): string              { return this.last4; }
  getCardType(): string           { return this.cardType; }
  setLast4(last4: string): void       { this.last4    = last4; }
  setCardType(cardType: string): void { this.cardType = cardType; }

  processPayment(): boolean {
    return true; // simulated approval
  }

  displayPaymentInfo(): void {
    console.log(`Card Type:   ${this.cardType}`);
    console.log(`Card Number: **** **** **** ${this.last4}`);
    console.log(`Amount:      $${this.amount.toFixed(2)}`);
  }
}
