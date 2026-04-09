#ifndef RECEIPT_H
#define RECEIPT_H

#include <string>
#include "Cart.h"
#include "Payment.h"
using namespace std;

class Receipt {
private:
    int      id;
    Cart     cart;
    Payment* payment;
    string   timestamp;

public:
    Receipt(Cart cart, Payment* payment);
    ~Receipt();

    int      getId();
    string   getTimestamp();
    Cart     getCart();
    Payment* getPayment();

    void generate();
};

#endif


