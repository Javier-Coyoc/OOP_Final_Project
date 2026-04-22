#include "Cart.h"
#include <iostream>

// Known promo codes — code : discount percent
static const string PROMO_CODES[]    = { "SAVE10", "SAVE20", "WELCOME", "HOLIDAY" };
static const float  PROMO_DISCOUNTS[] = {  0.10f,    0.20f,    0.05f,    0.15f   };
static const int    PROMO_COUNT       = 4;

Cart::Cart() {
    promo_code       = "";
    tax_rate         = 0.07f;
    discount_percent = 0.0f;
}

Cart::~Cart() {}

void Cart::addItem(Product p, int qty) {
    // If product already in cart, increase quantity
    for (int i = 0; i < (int)items.size(); i++) {
        if (items[i].product.getId() == p.getId()) {
            items[i].quantity += qty;
            return;
        }
    }
    CartItem item = {p, qty};
    items.push_back(item);
}

void Cart::removeItem(int product_id) {
    for (int i = 0; i < (int)items.size(); i++) {
        if (items[i].product.getId() == product_id) {
            items.erase(items.begin() + i);
            return;
        }
    }
}

bool Cart::applyPromoCode(string code) {
    for (int i = 0; i < PROMO_COUNT; i++) {
        if (PROMO_CODES[i] == code) {
            promo_code       = code;
            discount_percent = PROMO_DISCOUNTS[i];
            cout << "Promo code applied: " << code << " (" << (discount_percent * 100) << "% off)" << endl;
            return true;
        }
    }
    cout << "Invalid promo code: " << code << endl;
    return false;
}

void Cart::clear() {
    items.clear();
    promo_code       = "";
    discount_percent = 0.0f;
}

// Getters
vector<CartItem> Cart::getItems()           { return items; }
string           Cart::getPromoCode()       { return promo_code; }
float            Cart::getTaxRate()         { return tax_rate; }
float            Cart::getDiscountPercent() { return discount_percent; }

float Cart::getSubtotal() {
    float total = 0.0f;
    for (int i = 0; i < items.size(); i++) {
        total += items[i].product.getPrice() * items[i].quantity;
    }
    return total;
}

float Cart::getDiscount() {
    return getSubtotal() * discount_percent;
}

float Cart::getTaxAmount() {
    return (getSubtotal() - getDiscount()) * tax_rate;
}

float Cart::getTotal() {
    return getSubtotal() - getDiscount() + getTaxAmount();
}

// Setter
void Cart::setTaxRate(float rate) { tax_rate = rate; }
