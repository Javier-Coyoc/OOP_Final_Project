"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashPayment = void 0;
const PaymentDef_1 = require("./PaymentDef");
class CashPayment extends PaymentDef_1.PaymentDef {
    constructor(amount) {
        super();
        this.change_due = 0;
        this.setAmount(amount);
    }
    getAmount() { return this.amount; }
    setAmount(amount) { this.amount = amount; }
    getChangeDue() { return this.change_due; }
    calculateChange(total) {
        this.change_due = this.amount - total;
        if (this.change_due < 0) {
            this.change_due = 0;
            return 0;
        }
        return this.change_due;
    }
    processPayment() {
        return true;
    }
    displayPaymentInfo() {
        console.log(`Cash Tendered: $${this.amount.toFixed(2)}`);
        console.log(`Change Due:    $${this.change_due.toFixed(2)}`);
    }
}
exports.CashPayment = CashPayment;
