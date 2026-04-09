#include "Receipt.h"
#include <iostream>
#include <iomanip>
#include <ctime>

static int receipt_counter = 1;

Receipt::Receipt(Cart cart, Payment* payment) {
    this->cart    = cart;
    this->payment = payment;
    this->id      = receipt_counter++;

    // Generate timestamp
    time_t now = time(0);
    char buf[32];
    strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", localtime(&now));
    this->timestamp = string(buf);
}

Receipt::~Receipt() {}

// Getters
int      Receipt::getId()        { return id; }
string   Receipt::getTimestamp() { return timestamp; }
Cart     Receipt::getCart()      { return cart; }
Payment* Receipt::getPayment()   { return payment; }

void Receipt::generate() {
    cout << fixed << setprecision(2);
    cout << "=====================================" << endl;
    cout << "           STORE NAME                " << endl;
    cout << "          123 Main Street            " << endl;
    cout << "          Tel: 555-1234              " << endl;
    cout << "=====================================" << endl;
    cout << "Date: " << timestamp << endl;
    cout << "Receipt #: " << setw(5) << setfill('0') << id << setfill(' ') << endl;
    cout << "-------------------------------------" << endl;
    cout << left << setw(20) << "Item"
         << setw(5)  << "Qty"
         << right << setw(8) << "Price" << endl;
    cout << "-------------------------------------" << endl;

    vector<CartItem> items = cart.getItems();
    for (int i = 0; i < (int)items.size(); i++) {
        float line_total = items[i].product.getPrice() * items[i].quantity;
        cout << left  << setw(20) << items[i].product.getName()
             << setw(5)           << items[i].quantity
             << right << setw(7)  << "$" << line_total << endl;
    }

    cout << "-------------------------------------" << endl;
    cout << right << setw(28) << "Subtotal: " << "$" << cart.getSubtotal() << endl;

    if (cart.getDiscountPercent() > 0) {
        cout << setw(28) << "Discount (" + cart.getPromoCode() + "): "
             << "-$" << cart.getDiscount() << endl;
    }

    cout << setw(28) << "Tax (" << (cart.getTaxRate() * 100) << "%): "
         << "$" << cart.getTaxAmount() << endl;
    cout << "-------------------------------------" << endl;
    cout << setw(28) << "TOTAL: " << "$" << cart.getTotal() << endl;
    cout << "-------------------------------------" << endl;

    // Payment info via polymorphism
    payment->displayPaymentInfo();

    cout << "=====================================" << endl;
    cout << "       Thank you for shopping!       " << endl;
    cout << "=====================================" << endl;
}
