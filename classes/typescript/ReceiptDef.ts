import { Cart }       from "./Cart";
import { PaymentDef } from "./PaymentDef";

export abstract class ReceiptDef {
  protected id!: number;
  protected cart!: Cart;
  protected payment!: PaymentDef;
  protected timestamp!: string;

  abstract getId(): number;
  abstract getTimestamp(): string;
  abstract getCart(): Cart;
  abstract getPayment(): PaymentDef;

  abstract generate(): void;
  abstract saveToDB(db_path: string): Promise<void>;
}
