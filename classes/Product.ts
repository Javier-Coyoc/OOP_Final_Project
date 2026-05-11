import { ProductDef } from "./ProductDef";

export class Product extends ProductDef {
  constructor(id: number, name: string, sku: string, price: number, category: string) {
    super();
    this.setId(id);
    this.setName(name);
    this.setSku(sku);
    this.setPrice(price);
    this.setCategory(category);
  }

  getId(): number       { return this.id; }
  getName(): string     { return this.name; }
  getSku(): string      { return this.sku; }
  getPrice(): number    { return this.price; }
  getCategory(): string { return this.category; }

  setId(id: number): void             { this.id       = id; }
  setName(name: string): void         { this.name     = name; }
  setSku(sku: string): void           { this.sku      = sku; }
  setPrice(price: number): void       { this.price    = price; }
  setCategory(category: string): void { this.category = category; }
}
