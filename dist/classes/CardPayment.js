"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardPayment = void 0;
const PaymentDef_1 = require("./PaymentDef");
class CardPayment extends PaymentDef_1.PaymentDef {
    constructor(amount, last4, cardType) {
        super();
        this.setAmount(amount);
        this.last4 = last4;
        this.cardType = cardType;
    }
    getAmount() { return this.amount; }
    setAmount(amount) { this.amount = amount; }
    getLast4() { return this.last4; }
    getCardType() { return this.cardType; }
    setLast4(last4) { this.last4 = last4; }
    setCardType(cardType) { this.cardType = cardType; }
    processPayment() {
        return true; // simulated approval
    }
    displayPaymentInfo() {
        console.log(`Card Type:   ${this.cardType}`);
        console.log(`Card Number: **** **** **** ${this.last4}`);
        console.log(`Amount:      $${this.amount.toFixed(2)}`);
    }
}
exports.CardPayment = CardPayment;
