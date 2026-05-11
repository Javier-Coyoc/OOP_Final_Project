import { Product } from "./Product";

export interface CartItem {
  product: Product;
  quantity: number;
}

export abstract class CartDef {
  protected items!: CartItem[];
  protected promo_code!: string;
  protected tax_rate!: number;
  protected discount_percent!: number;

  abstract addItem(product: Product, qty: number): void;
  abstract removeItem(product_id: number): void;
  abstract applyPromoCode(code: string): boolean;
  abstract clear(): void;

  abstract getItems(): CartItem[];
  abstract getPromoCode(): string;
  abstract getTaxRate(): number;
  abstract getDiscountPercent(): number;
  abstract getSubtotal(): number;
  abstract getDiscount(): number;
  abstract getTaxAmount(): number;
  abstract getTotal(): number;

  abstract setTaxRate(rate: number): void;
}
