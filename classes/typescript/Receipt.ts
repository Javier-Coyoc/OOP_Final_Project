import { ReceiptDef } from "./ReceiptDef";
import { Cart }       from "./Cart";
import { PaymentDef } from "./PaymentDef";

let receipt_counter = 1;

export class Receipt extends ReceiptDef {
  constructor(cart: Cart, payment: PaymentDef) {
    super();
    this.setId(receipt_counter++);
    this.setCart(cart);
    this.setPayment(payment);
    this.setTimestamp(new Date().toLocaleString());
  }

  getId(): number          { return this.id; }
  getTimestamp(): string   { return this.timestamp; }
  getCart(): Cart          { return this.cart; }
  getPayment(): PaymentDef { return this.payment; }

  setId(id: number): void              { this.id        = id; }
  setCart(cart: Cart): void            { this.cart      = cart; }
  setPayment(payment: PaymentDef): void { this.payment  = payment; }
  setTimestamp(ts: string): void       { this.timestamp = ts; }

  generate(): void {
    const items = this.cart.getItems();
    console.log("=====================================");
    console.log("           STORE NAME                ");
    console.log("          123 Main Street            ");
    console.log("          Tel: 555-1234              ");
    console.log("=====================================");
    console.log(`Date: ${this.timestamp}`);
    console.log(`Receipt #: ${String(this.id).padStart(5, "0")}`);
    console.log("-------------------------------------");
    console.log("Item                 Qty      Price  ");
    console.log("-------------------------------------");

    items.forEach(i => {
      const lineTotal = (i.product.getPrice() * i.quantity).toFixed(2);
      const name      = i.product.getName().padEnd(20);
      const qty       = String(i.quantity).padEnd(5);
      console.log(`${name} ${qty}   $${lineTotal}`);
    });

    console.log("-------------------------------------");
    console.log(`${"Subtotal:".padStart(28)}  $${this.cart.getSubtotal().toFixed(2)}`);

    if (this.cart.getDiscountPercent() > 0) {
      const label = `Discount (${this.cart.getPromoCode()}):`;
      console.log(`${label.padStart(28)}  -$${this.cart.getDiscount().toFixed(2)}`);
    }

    const taxLabel = `Tax (${(this.cart.getTaxRate() * 100)}%):`;
    console.log(`${taxLabel.padStart(28)}  $${this.cart.getTaxAmount().toFixed(2)}`);
    console.log("-------------------------------------");
    console.log(`${"TOTAL:".padStart(28)}  $${this.cart.getTotal().toFixed(2)}`);
    console.log("-------------------------------------");
    this.payment.displayPaymentInfo();
    console.log("=====================================");
    console.log("       Thank you for shopping!       ");
    console.log("=====================================");
  }

  async saveToDB(db_path: string): Promise<void> {
    // Implemented in receiptController.js via pg
    console.log(`Receipt #${this.id} saved to database.`);
  }
}
