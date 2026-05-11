import { PaymentDef } from "./PaymentDef";

export class CashPayment extends PaymentDef {
  private change_due: number = 0;

  constructor(amount: number) {
    super();
    this.setAmount(amount);
  }

  getAmount(): number        { return this.amount; }
  setAmount(amount: number): void { this.amount = amount; }
  getChangeDue(): number     { return this.change_due; }

  calculateChange(total: number): number {
    this.change_due = this.amount - total;
    if (this.change_due < 0) {
      this.change_due = 0;
      return 0;
    }
    return this.change_due;
  }

  processPayment(): boolean {
    return true;
  }

  displayPaymentInfo(): void {
    console.log(`Cash Tendered: $${this.amount.toFixed(2)}`);
    console.log(`Change Due:    $${this.change_due.toFixed(2)}`);
  }
}
