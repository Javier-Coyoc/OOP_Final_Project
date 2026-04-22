#ifndef CARDPAYMENT_H
#define CARDPAYMENT_H

#include <string>
#include "Payment.h"
using namespace std;

class CardPayment : public Payment {
private:
    string last4;
    string cardType;

public:
    CardPayment(float amount, string last4, string cardType);
    ~CardPayment();

    string getLast4();
    string getCardType();

    void setLast4(string last4);
    void setCardType(string cardType);

    bool processPayment();
    void displayPaymentInfo();
};

#endif
