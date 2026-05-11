"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const ProductDef_1 = require("./ProductDef");
class Product extends ProductDef_1.ProductDef {
    constructor(id, name, sku, price, category) {
        super();
        this.setId(id);
        this.setName(name);
        this.setSku(sku);
        this.setPrice(price);
        this.setCategory(category);
    }
    getId() { return this.id; }
    getName() { return this.name; }
    getSku() { return this.sku; }
    getPrice() { return this.price; }
    getCategory() { return this.category; }
    setId(id) { this.id = id; }
    setName(name) { this.name = name; }
    setSku(sku) { this.sku = sku; }
    setPrice(price) { this.price = price; }
    setCategory(category) { this.category = category; }
}
exports.Product = Product;
