"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const CartDef_1 = require("./CartDef");
const PROMO_CODES = {
    "SAVE10": 0.10,
    "SAVE20": 0.20,
    "WELCOME": 0.05,
    "HOLIDAY": 0.15
};
class Cart extends CartDef_1.CartDef {
    constructor() {
        super();
        this.items = [];
        this.promo_code = "";
        this.tax_rate = 0.07;
        this.discount_percent = 0.0;
    }
    addItem(product, qty) {
        const existing = this.items.find(i => i.product.getId() === product.getId());
        if (existing) {
            existing.quantity += qty;
        }
        else {
            this.items.push({ product, quantity: qty });
        }
    }
    removeItem(product_id) {
        this.items = this.items.filter(i => i.product.getId() !== product_id);
    }
    applyPromoCode(code) {
        if (PROMO_CODES[code] !== undefined) {
            this.promo_code = code;
            this.discount_percent = PROMO_CODES[code];
            return true;
        }
        return false;
    }
    clear() {
        this.items = [];
        this.promo_code = "";
        this.discount_percent = 0.0;
    }
    getItems() { return this.items; }
    getPromoCode() { return this.promo_code; }
    getTaxRate() { return this.tax_rate; }
    getDiscountPercent() { return this.discount_percent; }
    getSubtotal() {
        return this.items.reduce((sum, i) => sum + i.product.getPrice() * i.quantity, 0);
    }
    getDiscount() {
        return this.getSubtotal() * this.discount_percent;
    }
    getTaxAmount() {
        return (this.getSubtotal() - this.getDiscount()) * this.tax_rate;
    }
    getTotal() {
        return this.getSubtotal() - this.getDiscount() + this.getTaxAmount();
    }
    setTaxRate(rate) { this.tax_rate = rate; }
}
exports.Cart = Cart;
