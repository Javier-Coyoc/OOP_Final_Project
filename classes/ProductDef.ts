export abstract class ProductDef {
  protected id!: number;
  protected name!: string;
  protected sku!: string;
  protected price!: number;
  protected category!: string;

  abstract getId(): number;
  abstract getName(): string;
  abstract getSku(): string;
  abstract getPrice(): number;
  abstract getCategory(): string;

  abstract setName(name: string): void;
  abstract setSku(sku: string): void;
  abstract setPrice(price: number): void;
  abstract setCategory(category: string): void;
}
