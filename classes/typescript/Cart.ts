import { CartDef, CartItem } from "./CartDef";
import { Product } from "./Product";

const PROMO_CODES: { [key: string]: number } = {
  "SAVE10":  0.10,
  "SAVE20":  0.20,
  "WELCOME": 0.05,
  "HOLIDAY": 0.15
};

export class Cart extends CartDef {
  constructor() {
    super();
    this.items            = [];
    this.promo_code       = "";
    this.tax_rate         = 0.07;
    this.discount_percent = 0.0;
  }

  addItem(product: Product, qty: number): void {
    const existing = this.items.find(i => i.product.getId() === product.getId());
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({ product, quantity: qty });
    }
  }

  removeItem(product_id: number): void {
    this.items = this.items.filter(i => i.product.getId() !== product_id);
  }

  applyPromoCode(code: string): boolean {
    if (PROMO_CODES[code] !== undefined) {
      this.promo_code       = code;
      this.discount_percent = PROMO_CODES[code];
      return true;
    }
    return false;
  }

  clear(): void {
    this.items            = [];
    this.promo_code       = "";
    this.discount_percent = 0.0;
  }

  getItems(): CartItem[]    { return this.items; }
  getPromoCode(): string    { return this.promo_code; }
  getTaxRate(): number      { return this.tax_rate; }
  getDiscountPercent(): number { return this.discount_percent; }

  getSubtotal(): number {
    return this.items.reduce((sum, i) => sum + i.product.getPrice() * i.quantity, 0);
  }

  getDiscount(): number {
    return this.getSubtotal() * this.discount_percent;
  }

  getTaxAmount(): number {
    return (this.getSubtotal() - this.getDiscount()) * this.tax_rate;
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getTaxAmount();
  }

  setTaxRate(rate: number): void { this.tax_rate = rate; }
}
